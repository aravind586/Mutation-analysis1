import {
    analyzeVariantWithAPI,
} from "../utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    BarChart2,
    ExternalLink,
    RefreshCw,
    Search,
    Shield,
    Zap,
} from "lucide-react";
import { getClassificationColorClasses } from "../utils/coloring-utils";

export default function KnownVariants({
    refreshVariants,
    showComparison,
    updateClinvarVariant,
    clinvarVariants,
    isLoadingClinvar,
    clinvarError,
    genomeId,
    gene,
}) {
    const analyzeVariant = async (variant) => {
        console.log("hi")
        let variantDetails = null;
        const position = variant.location
            ? parseInt(variant.location.replaceAll(",", ""))
            : null;

        const refAltMatch = variant.title.match(/(\w)>(\w)/);

        if (refAltMatch && refAltMatch.length === 3) {
            variantDetails = {
                position,
                reference: refAltMatch[1],
                alternative: refAltMatch[2],
            };
        }

        if (
            !variantDetails ||
            !variantDetails.position ||
            !variantDetails.reference ||
            !variantDetails.alternative
        ) {
            {
            console.warn("Variant details missing", variantDetails);
            return;
        }

        }

        updateClinvarVariant(variant.clinvar_id, {
            ...variant,
            isAnalyzing: true,
        });

        try {
            const data = await analyzeVariantWithAPI({
                position: variantDetails.position,
                alternative: variantDetails.alternative,
                genomeId: genomeId,
                chromosome: gene.chrom,
            });
            console.log("API returned data:", data);
            
            const updatedVariant = {
                ...variant,
                isAnalyzing: false,
                evo2Result: data,
            };

            updateClinvarVariant(variant.clinvar_id, updatedVariant);

            showComparison(updatedVariant);
        } catch (error) {
            updateClinvarVariant(variant.clinvar_id, {
                ...variant,
                isAnalyzing: false,
                evo2Error: error instanceof Error ? error.message : "Analysis failed",
            });
        }
    };

    return (
        <Card className="bg-white shadow-lg rounded-lg border border-green-100">
            <CardHeader className="flex items-center justify-between pt-6 pb-3 px-6 border-b border-green-200">
                <CardTitle className="text-lg font-semibold text-green-800 tracking-wide">
                    Known Variants in Gene from ClinVar
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshVariants}
                    disabled={isLoadingClinvar}
                    className="flex items-center gap-1 text-green-700 hover:bg-green-100 disabled:opacity-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </CardHeader>

            <CardContent className="px-6 py-4">
                {clinvarError && (
                    <div className="mb-5 rounded-md bg-red-50 border border-red-300 p-3 text-sm text-red-700 font-medium">
                        {clinvarError}
                    </div>
                )}

                {isLoadingClinvar ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                    </div>
                ) : clinvarVariants.length > 0 ? (
                    <div className="max-h-[384px] overflow-y-auto rounded-md border border-green-100 shadow-inner">
                        <Table>
                            <TableHeader className="sticky top-0 bg-green-50 shadow-sm z-10">
                                <TableRow>
                                    {["Variant", "Type", "Clinical Significance", "Actions"].map(
                                        (title) => (
                                            <TableHead
                                                key={title}
                                                className="py-3 px-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wide"
                                            >
                                                {title}
                                            </TableHead>
                                        ),
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clinvarVariants.map((variant) => (
                                    <TableRow
                                        key={variant.clinvar_id}
                                        className="border-b border-green-100 hover:bg-green-50 transition-colors"
                                    >
                                        <TableCell className="py-3 px-4">
                                            <p className="text-sm font-medium text-green-900">
                                                {variant.title}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-green-700 font-light">
                                                <span>Location: {variant.location}</span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="flex items-center gap-1 px-0 text-green-600 hover:text-green-800"
                                                    onClick={() =>
                                                        window.open(
                                                            `https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvar_id}`,
                                                            "_blank",
                                                        )
                                                    }
                                                >
                                                    View in ClinVar <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 px-4 text-sm text-green-800 font-medium">
                                            {variant.variation_type}
                                        </TableCell>

                                        <TableCell className="py-3 px-4 text-sm">
                                            <div
                                                className={`inline-block rounded-md px-3 py-1 font-medium ${getClassificationColorClasses(
                                                    variant.classification,
                                                )}`}
                                            >
                                                {variant.classification || "Unknown"}
                                            </div>
                                            {variant.evo2Result && (
                                                <div className="mt-2 flex items-center gap-2 rounded-md px-3 py-1 font-semibold text-sm text-white bg-green-700 shadow-md">
                                                    <Shield className="h-4 w-4" />
                                                    <span>Evo2: {variant.evo2Result.prediction}</span>
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="py-3 px-4 text-sm">
                                            <div className="flex flex-col items-end gap-2">
                                                {variant.variation_type
                                                    .toLowerCase()
                                                    .includes("single nucleotide") ? (
                                                    !variant.evo2Result ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex items-center gap-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                                            disabled={variant.isAnalyzing}
                                                            onClick={() => analyzeVariant(variant)}
                                                        >
                                                            {variant.isAnalyzing ? (
                                                                <>
                                                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-300 border-t-green-700"></span>
                                                                    Analyzing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Zap className="h-4 w-4" />
                                                                    Analyze with Evo2
                                                                </>
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex items-center gap-2 border-green-400 bg-green-100 text-green-800 hover:bg-green-200"
                                                            onClick={() => showComparison(variant)}
                                                        >
                                                            <BarChart2 className="h-4 w-4" />
                                                            Compare Results
                                                        </Button>
                                                    )
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-green-300">
                        <Search className="h-12 w-12 opacity-60" />
                        <p className="max-w-sm text-base font-light leading-relaxed">
                            No ClinVar variants found for this gene.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
