import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    analyzeVariantWithAPI
} from "../utils/genome-api";
import {
    getClassificationColorClasses,
    getNucleotideColorClass,
} from "../utils/coloring-utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Zap, BarChart2 } from "lucide-react";

const VariantAnalysis = forwardRef(
    (
        {
            gene,
            genomeId,
            chromosome,
            clinvarVariants = [],
            referenceSequence,
            sequencePosition,
            geneBounds,
        },
        ref
    ) => {
        const [variantPosition, setVariantPosition] = useState(
            geneBounds?.min?.toString() || ""
        );
        const [variantReference, setVariantReference] = useState("");
        const [variantAlternative, setVariantAlternative] = useState("");
        const [variantResult, setVariantResult] = useState(null);
        const [isAnalyzing, setIsAnalyzing] = useState(false);
        const [variantError, setVariantError] = useState(null);
        const alternativeInputRef = useRef(null);

        useImperativeHandle(ref, () => ({
            focusAlternativeInput: () => {
                if (alternativeInputRef.current) {
                    alternativeInputRef.current.focus();
                }
            },
        }));

        useEffect(() => {
            if (sequencePosition && referenceSequence) {
                setVariantPosition(String(sequencePosition));
                setVariantReference(referenceSequence);
            }
        }, [sequencePosition, referenceSequence]);

        const handlePositionChange = (e) => {
            setVariantPosition(e.target.value);
            setVariantReference("");
        };

        const handleVariantSubmit = async (pos, alt) => {
            const position = parseInt(pos);
            if (isNaN(position)) {
                setVariantError("Please enter a valid position number");
                return;
            }

            const validNucleotides = /^[ATGC]$/;
            if (!validNucleotides.test(alt)) {
                setVariantError("Nucleotides must be A, C, G or T");
                return;
            }

            setIsAnalyzing(true);
            setVariantError(null);

            try {
                const data = await analyzeVariantWithAPI({
                    position,
                    alternative: alt,
                    genomeId,
                    chromosome,
                });
                setVariantResult(data);
            } catch (err) {
                console.error(err);
                setVariantError("Failed to analyze variant");
            } finally {
                setIsAnalyzing(false);
            }
        };

        return (
            <Card className="rounded-2xl border border-blue-100 bg-white shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 py-4 px-6">
                    <CardTitle className="text-lg font-semibold text-blue-700 tracking-tight">
                        Variant Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <p className="text-sm text-blue-600/80">
                        Predict the impact of genetic variants using the Evo2 deep learning
                        model.
                    </p>

                    {/* Input Section */}
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-blue-600 mb-1">
                                Position
                            </label>
                            <Input
                                value={variantPosition}
                                onChange={handlePositionChange}
                                className="h-9 w-36 border-blue-200 focus:border-blue-400 focus:ring-blue-300 text-sm rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-blue-600 mb-1">
                                Alternative (variant)
                            </label>
                            <Input
                                ref={alternativeInputRef}
                                value={variantAlternative}
                                onChange={(e) =>
                                    setVariantAlternative(e.target.value.toUpperCase())
                                }
                                placeholder="e.g., T"
                                maxLength={1}
                                className="h-9 w-36 border-blue-200 focus:border-blue-400 focus:ring-blue-300 text-sm rounded-lg"
                            />
                        </div>

                        {variantReference && (
                            <div className="mb-2 flex items-center gap-2 text-sm text-blue-700">
                                <span className="font-medium">Substitution:</span>
                                <span
                                    className={`font-bold ${getNucleotideColorClass(
                                        variantReference
                                    )}`}
                                >
                                    {variantReference}
                                </span>
                                <span>→</span>
                                <span
                                    className={`font-bold ${getNucleotideColorClass(
                                        variantAlternative
                                    )}`}
                                >
                                    {variantAlternative || "?"}
                                </span>
                            </div>
                        )}

                        <Button
                            disabled={isAnalyzing || !variantPosition || !variantAlternative}
                            onClick={() =>
                                handleVariantSubmit(
                                    variantPosition.replaceAll(",", ""),
                                    variantAlternative
                                )
                            }
                            className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 shadow-md"
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Variant"
                            )}
                        </Button>
                    </div>

                    {/* Known Variant Detection */}
                    {variantPosition &&
                        clinvarVariants
                            .filter(
                                (variant) =>
                                    variant?.variation_type
                                        ?.toLowerCase()
                                        .includes("single nucleotide") &&
                                    parseInt(variant?.location?.replaceAll(",", "")) ===
                                    parseInt(variantPosition.replaceAll(",", ""))
                            )
                            .map((matchedVariant) => {
                                const refAltMatch = matchedVariant.title.match(/(\w)>(\w)/);
                                let ref = null;
                                let alt = null;
                                if (refAltMatch && refAltMatch.length === 3) {
                                    ref = refAltMatch[1];
                                    alt = refAltMatch[2];
                                }
                                if (!ref || !alt) return null;

                                return (
                                    <div
                                        key={matchedVariant.clinvar_id}
                                        className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm space-y-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-semibold text-blue-800">
                                                Known Variant Detected
                                            </h4>
                                            <span className="text-xs text-blue-600">
                                                Position: {matchedVariant.location}
                                            </span>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <div className="text-xs font-medium text-blue-600/70">
                                                    Variant Details
                                                </div>
                                                <div className="text-sm">{matchedVariant.title}</div>
                                                <div className="mt-1 text-sm">
                                                    {gene?.symbol} {variantPosition}{" "}
                                                    <span className="font-mono">
                                                        <span className={getNucleotideColorClass(ref)}>
                                                            {ref}
                                                        </span>
                                                        {">"}
                                                        <span className={getNucleotideColorClass(alt)}>
                                                            {alt}
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs text-blue-600/70">
                                                    ClinVar classification:
                                                    <span
                                                        className={`ml-1 rounded-md px-2 py-0.5 ${getClassificationColorClasses(
                                                            matchedVariant.classification
                                                        )}`}
                                                    >
                                                        {matchedVariant.classification || "Unknown"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center">
                                                <Button
                                                    disabled={isAnalyzing}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setVariantAlternative(alt);
                                                        handleVariantSubmit(
                                                            variantPosition.replaceAll(",", ""),
                                                            alt
                                                        );
                                                    }}
                                                    className="border-blue-300 bg-white hover:bg-blue-100 text-blue-700 h-8 px-3 rounded-lg shadow-sm"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
                                                            Analyzing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="h-4 w-4 mr-1" />
                                                            Analyze this Variant
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })[0]}

                    {/* Error */}
                    {variantError && (
                        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                            {variantError}
                        </div>
                    )}

                    {/* Analysis Result */}
                    {variantResult && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm space-y-3">
                            <h4 className="text-sm font-semibold text-blue-800">
                                Analysis Result
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <div>
                                        <div className="text-xs text-blue-600/70">Variant</div>
                                        <div className="text-sm">
                                            {gene?.symbol} {variantResult.position}{" "}
                                            <span className="font-mono">
                                                {variantResult.reference}
                                                {">"}
                                                {variantResult.alternative}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-xs text-blue-600/70">
                                            Delta likelihood score
                                        </div>
                                        <div className="text-sm font-medium">
                                            {variantResult.delta_score.toFixed(6)}
                                        </div>
                                        <div className="text-xs text-blue-500/60">
                                            Negative score indicates loss of function
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-blue-600/70">Prediction</div>
                                    <div
                                        className={`inline-block rounded-lg px-3 py-1 text-xs font-medium ${getClassificationColorClasses(
                                            variantResult.prediction
                                        )}`}
                                    >
                                        {variantResult.prediction}
                                    </div>
                                    <div className="mt-3">
                                        <div className="text-xs text-blue-600/70">Confidence</div>
                                        <div className="mt-1 h-2 w-full rounded-full bg-blue-100">
                                            <div
                                                className={`h-2 rounded-full ${variantResult.prediction.includes("pathogenic")
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                    }`}
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        variantResult.classification_confidence * 100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-right text-xs text-blue-600/60">
                                            {Math.round(
                                                variantResult.classification_confidence * 100
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }
);

export default VariantAnalysis;
