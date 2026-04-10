import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ExternalLink } from "lucide-react";

export function GeneInformation({ gene, geneDetail, geneBounds }) {
    return (
        <Card className="gap-0 border border-blue-200 bg-white py-0 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
            <CardHeader className="pt-5 pb-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                <CardTitle className="text-base font-semibold text-blue-800 tracking-wide">
                    Gene Information
                </CardTitle>
            </CardHeader>

            <CardContent className="pb-6 px-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <InfoRow label="Symbol:" value={gene.symbol} />
                        <InfoRow label="Name:" value={gene.name} />
                        {gene.description && gene.description !== gene.name && (
                            <InfoRow label="Description:" value={gene.description} />
                        )}
                        <InfoRow label="Chromosome:" value={gene.chrom} />
                        {geneBounds && (
                            <InfoRow
                                label="Position:"
                                value={
                                    <>
                                        {Math.min(geneBounds.min, geneBounds.max).toLocaleString()} -{" "}
                                        {Math.max(geneBounds.min, geneBounds.max).toLocaleString()} (
                                        {Math.abs(geneBounds.max - geneBounds.min + 1).toLocaleString()} bp)
                                        {geneDetail?.genomicinfo?.[0]?.strand === "-" && (
                                            <span className="italic text-sm text-blue-600 ml-1">
                                                (reverse strand)
                                            </span>
                                        )}
                                    </>
                                }
                            />
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {gene.gene_id && (
                            <div className="flex items-center gap-2">
                                <span className="w-28 text-xs font-medium text-blue-600">Gene ID:</span>
                                <a
                                    href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-700 font-medium hover:underline"
                                >
                                    {gene.gene_id}
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        )}

                        {geneDetail?.organism && (
                            <InfoRow
                                label="Organism:"
                                value={
                                    <>
                                        {geneDetail.organism.scientificname}{" "}
                                        {geneDetail.organism.commonname && (
                                            <span className="text-blue-600 font-semibold">
                                                ({geneDetail.organism.commonname})
                                            </span>
                                        )}
                                    </>
                                }
                            />
                        )}

                        {geneDetail?.summary && (
                            <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-900 leading-relaxed shadow-inner">
                                <h3 className="mb-2 font-semibold tracking-wide">Summary:</h3>
                                <p>{geneDetail.summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper component for label + value pairs
function InfoRow({ label, value }) {
    return (
        <div className="flex items-start gap-2">
            <span className="w-28 min-w-[7rem] text-xs font-semibold text-blue-700">{label}</span>
            <span className="text-xs text-blue-900">{value}</span>
        </div>
    );
}
