import React from "react";
import { X, ExternalLink, Shield, Check } from "lucide-react";
import {
    getClassificationColorClasses,
    getNucleotideColorClass,
} from "../utils/coloring-utils";

export default function VariantComparisonModal({
    comparisonVariant,
    onClose,
}) {
    if (!comparisonVariant || !comparisonVariant.evo2Result) return null;

    const agreement =
        comparisonVariant.classification.toLowerCase() ===
        comparisonVariant.evo2Result.prediction.toLowerCase();

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "1rem",
            }}
        >
            <div
                style={{
                    maxHeight: "90vh",
                    width: "100%",
                    maxWidth: "900px",
                    overflowY: "auto",
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        borderBottom: "1px solid rgba(60,79,61,0.1)",
                        padding: "1.2rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "linear-gradient(90deg,#f8faf8,#eef3ee)",
                    }}
                >
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#3c4f3d" }}>
                        Variant Analysis Comparison
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "0.3rem",
                            borderRadius: "50%",
                            transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.background = "rgba(158,238,170,0.3)")
                        }
                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <X style={{ width: "20px", height: "20px", color: "#3c4f3d" }} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: "1.5rem" }}>
                    {/* Variant Info */}
                    <div
                        style={{
                            borderRadius: "8px",
                            border: "1px solid rgba(60,79,61,0.1)",
                            background: "rgba(233,238,234,0.3)",
                            padding: "1rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <h4
                            style={{
                                marginBottom: "0.75rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#3c4f3d",
                            }}
                        >
                            Variant Information
                        </h4>
                        <div
                            style={{
                                display: "grid",
                                gap: "1rem",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            }}
                        >
                            {/* Column 1 */}
                            <div>
                                <div style={{ display: "flex", marginBottom: "0.5rem" }}>
                                    <span
                                        style={{ width: "70px", fontSize: "0.75rem", color: "#3c4f3daa" }}
                                    >
                                        Position:
                                    </span>
                                    <span style={{ fontSize: "0.75rem" }}>
                                        {comparisonVariant.location}
                                    </span>
                                </div>
                                <div style={{ display: "flex" }}>
                                    <span
                                        style={{ width: "70px", fontSize: "0.75rem", color: "#3c4f3daa" }}
                                    >
                                        Type:
                                    </span>
                                    <span style={{ fontSize: "0.75rem" }}>
                                        {comparisonVariant.variation_type}
                                    </span>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div>
                                <div style={{ display: "flex", marginBottom: "0.5rem" }}>
                                    <span
                                        style={{ width: "70px", fontSize: "0.75rem", color: "#3c4f3daa" }}
                                    >
                                        Variant:
                                    </span>
                                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                        {(() => {
                                            const match = comparisonVariant.title.match(/(\w)>(\w)/);
                                            if (match && match.length === 3) {
                                                const [, ref, alt] = match;
                                                return (
                                                    <>
                                                        <span className={getNucleotideColorClass(ref)}>{ref}</span>
                                                        <span>{">"}</span>
                                                        <span className={getNucleotideColorClass(alt)}>{alt}</span>
                                                    </>
                                                );
                                            }
                                            return comparisonVariant.title;
                                        })()}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span
                                        style={{ width: "70px", fontSize: "0.75rem", color: "#3c4f3daa" }}
                                    >
                                        ClinVar ID:
                                    </span>
                                    <a
                                        href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${comparisonVariant.clinvar_id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#de8246",
                                            textDecoration: "none",
                                        }}
                                        onMouseOver={(e) =>
                                            (e.currentTarget.style.textDecoration = "underline")
                                        }
                                        onMouseOut={(e) =>
                                            (e.currentTarget.style.textDecoration = "none")
                                        }
                                    >
                                        {comparisonVariant.clinvar_id}
                                    </a>
                                    <ExternalLink
                                        style={{
                                            marginLeft: "4px",
                                            width: "12px",
                                            height: "12px",
                                            color: "#de8246",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison */}
                    <div>
                        <h4
                            style={{
                                marginBottom: "0.75rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#3c4f3d",
                            }}
                        >
                            Analysis Comparison
                        </h4>
                        <div
                            style={{
                                borderRadius: "8px",
                                border: "1px solid rgba(60,79,61,0.1)",
                                background: "#fff",
                                padding: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gap: "1rem",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                }}
                            >
                                {/* ClinVar */}
                                <div
                                    style={{
                                        borderRadius: "8px",
                                        background: "rgba(233,238,234,0.5)",
                                        padding: "1rem",
                                    }}
                                >
                                    <h5
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#3c4f3d",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                background: "rgba(60,79,61,0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "50%",
                                                    background: "#3c4f3d",
                                                }}
                                            ></span>
                                        </span>
                                        ClinVar Assessment
                                    </h5>
                                    <div>
                                        <div
                                            className={getClassificationColorClasses(
                                                comparisonVariant.classification
                                            )}
                                            style={{
                                                borderRadius: "6px",
                                                padding: "0.25rem 0.5rem",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                display: "inline-block",
                                            }}
                                        >
                                            {comparisonVariant.classification || "Unknown significance"}
                                        </div>
                                    </div>
                                </div>

                                {/* Evo2 */}
                                <div
                                    style={{
                                        borderRadius: "8px",
                                        background: "rgba(233,238,234,0.5)",
                                        padding: "1rem",
                                    }}
                                >
                                    <h5
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#3c4f3d",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                background: "rgba(60,79,61,0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "50%",
                                                    background: "#de8246",
                                                }}
                                            ></span>
                                        </span>
                                        Evo2 Prediction
                                    </h5>
                                    <div>
                                        <div
                                            className={getClassificationColorClasses(
                                                comparisonVariant.evo2Result.prediction
                                            )}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                borderRadius: "6px",
                                                padding: "0.25rem 0.5rem",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            <Shield style={{ width: "12px", height: "12px" }} />
                                            {comparisonVariant.evo2Result.prediction}
                                        </div>
                                    </div>

                                    {/* Delta */}
                                    <div style={{ marginTop: "0.75rem" }}>
                                        <div style={{ fontSize: "0.75rem", color: "#3c4f3daa" }}>
                                            Delta Likelihood Score:
                                        </div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                            {comparisonVariant.evo2Result.delta_score.toFixed(6)}
                                        </div>
                                        <div style={{ fontSize: "0.7rem", color: "#3c4f3d99" }}>
                                            {comparisonVariant.evo2Result.delta_score < 0
                                                ? "Negative score indicates loss of function"
                                                : "Positive score indicated gain/neutral function"}
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div style={{ marginTop: "0.75rem" }}>
                                        <div style={{ fontSize: "0.75rem", color: "#3c4f3daa" }}>
                                            Confidence:
                                        </div>
                                        <div
                                            style={{
                                                marginTop: "0.25rem",
                                                height: "8px",
                                                width: "100%",
                                                borderRadius: "999px",
                                                background: "rgba(233,238,234,0.8)",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "8px",
                                                    borderRadius: "999px",
                                                    background: comparisonVariant.evo2Result.prediction.includes(
                                                        "pathogenic"
                                                    )
                                                        ? "red"
                                                        : "green",
                                                    width: `${Math.min(
                                                        100,
                                                        comparisonVariant.evo2Result
                                                            .classification_confidence * 100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div
                                            style={{
                                                marginTop: "0.25rem",
                                                fontSize: "0.7rem",
                                                textAlign: "right",
                                                color: "#3c4f3d99",
                                            }}
                                        >
                                            {Math.round(
                                                comparisonVariant.evo2Result
                                                    .classification_confidence * 100
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Agreement */}
                            <div
                                style={{
                                    marginTop: "1rem",
                                    borderRadius: "8px",
                                    background: "rgba(233,238,234,0.2)",
                                    padding: "0.75rem",
                                    fontSize: "0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <span
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        background: agreement ? "#d1fae5" : "#fef3c7",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {agreement ? (
                                        <Check style={{ width: "12px", height: "12px", color: "green" }} />
                                    ) : (
                                        <span style={{ color: "#d97706", fontWeight: "bold" }}>!</span>
                                    )}
                                </span>
                                <span style={{ fontWeight: 500, color: "#3c4f3d" }}>
                                    {agreement
                                        ? "Evo2 prediction agrees with ClinVar classification"
                                        : "Evo2 prediction differs from ClinVar classification"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        borderTop: "1px solid rgba(60,79,61,0.1)",
                        background: "rgba(233,238,234,0.3)",
                        padding: "1rem",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            cursor: "pointer",
                            border: "1px solid rgba(60,79,61,0.2)",
                            background: "#fff",
                            color: "#3c4f3d",
                            padding: "0.4rem 1rem",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.background = "rgba(233,238,234,0.7)")
                        }
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
