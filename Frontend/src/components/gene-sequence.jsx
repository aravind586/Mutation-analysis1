import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "./ui/card"; 
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { getNucleotideColorClass } from "../utils/coloring-utils";

export function GeneSequence({
    geneBounds,
    geneDetail,
    startPosition,
    endPosition,
    onStartPositionChange,
    onEndPositionChange,
    sequenceData,
    sequenceRange,
    isLoading,
    error,
    onSequenceLoadRequest,
    onSequenceClick,
    maxViewRange,
}) {
    const [sliderValues, setSliderValues] = useState({ start: 60, end: 70 });
    const [isDraggingStart, setIsDraggingStart] = useState(false);
    const [isDraggingEnd, setIsDraggingEnd] = useState(false);
    const [isDraggingRange, setIsDraggingRange] = useState(false);
    const sliderRef = useRef(null);
    const dragStartX = useRef(null);
    const [hoverPosition, setHoverPosition] = useState(null);
    const [mousePosition, setMousePosition] = useState(null);

    const currentRangeSize = useMemo(() => {
        const start = parseInt(startPosition);
        const end = parseInt(endPosition);
        return isNaN(start) || isNaN(end) || end < start ? 0 : end - start + 1;
    }, [startPosition, endPosition]);

    useEffect(() => {
        if (!geneBounds) return;

        const minBound = Math.min(geneBounds.min, geneBounds.max);
        const maxBound = Math.max(geneBounds.min, geneBounds.max);
        const totalSize = maxBound - minBound;

        const startNum = parseInt(startPosition);
        const endNum = parseInt(endPosition);

        if (isNaN(startNum) || isNaN(endNum) || totalSize <= 0) {
            setSliderValues({ start: 0, end: 100 });
            return;
        }

        const startPercent = ((startNum - minBound) / totalSize) * 100;
        const endPercent = ((endNum - minBound) / totalSize) * 100;

        setSliderValues({
            start: Math.max(0, Math.min(startPercent, 100)),
            end: Math.max(0, Math.min(endPercent, 100)),
        });
    }, [startPosition, endPosition, geneBounds]);

    useEffect(() => {
        function handleMouseMove(e) {
            if (!isDraggingStart && !isDraggingEnd && !isDraggingRange) return;
            if (!sliderRef.current || !geneBounds) return;

            const sliderRect = sliderRef.current.getBoundingClientRect();
            const relativeX = e.clientX - sliderRect.left;
            const sliderWidth = sliderRect.width;
            let newPercent = (relativeX / sliderWidth) * 100;
            newPercent = Math.max(0, Math.min(newPercent, 100));

            const minBound = Math.min(geneBounds.min, geneBounds.max);
            const maxBound = Math.max(geneBounds.min, geneBounds.max);
            const geneSize = maxBound - minBound;

            const newPosition = Math.round(minBound + (geneSize * newPercent) / 100);
            const currentStartNum = parseInt(startPosition);
            const currentEndNum = parseInt(endPosition);

            if (isDraggingStart) {
                if (!isNaN(currentEndNum)) {
                    if (currentEndNum - newPosition + 1 > maxViewRange) {
                        onStartPositionChange(String(currentEndNum - maxViewRange + 1));
                    } else if (newPosition < currentEndNum) {
                        onStartPositionChange(String(newPosition));
                    }
                }
            } else if (isDraggingEnd) {
                if (!isNaN(currentStartNum)) {
                    if (newPosition - currentStartNum + 1 > maxViewRange) {
                        onEndPositionChange(String(currentStartNum + maxViewRange - 1));
                    } else if (newPosition > currentStartNum) {
                        onEndPositionChange(String(newPosition));
                    }
                }
            } else if (isDraggingRange) {
                if (!dragStartX.current) return;
                const pixelsPerBase = sliderWidth / geneSize;
                const dragDeltaPixels = relativeX - dragStartX.current.x;
                const dragDeltaBases = Math.round(dragDeltaPixels / pixelsPerBase);

                let newStart = dragStartX.current.startPos + dragDeltaBases;
                let newEnd = dragStartX.current.endPos + dragDeltaBases;
                const rangeSize = dragStartX.current.endPos - dragStartX.current.startPos;

                if (newStart < minBound) {
                    newStart = minBound;
                    newEnd = minBound + rangeSize;
                }
                if (newEnd > maxBound) {
                    newEnd = maxBound;
                    newStart = maxBound - rangeSize;
                }

                onStartPositionChange(String(newStart));
                onEndPositionChange(String(newEnd));
            }
        }

        function handleMouseUp() {
            if ((isDraggingStart || isDraggingEnd || isDraggingRange) && startPosition && endPosition) {
                onSequenceLoadRequest();
            }
            setIsDraggingStart(false);
            setIsDraggingEnd(false);
            setIsDraggingRange(false);
            dragStartX.current = null;
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [
        isDraggingStart,
        isDraggingEnd,
        isDraggingRange,
        geneBounds,
        startPosition,
        endPosition,
        onStartPositionChange,
        onEndPositionChange,
        maxViewRange,
        onSequenceLoadRequest,
    ]);

    const handleMouseDown = useCallback((e, handle) => {
        e.preventDefault();
        if (handle === "start") setIsDraggingStart(true);
        else setIsDraggingEnd(true);
    }, []);

    const handleRangeMouseDown = useCallback(
        (e) => {
            e.preventDefault();
            if (!sliderRef.current) return;

            const startNum = parseInt(startPosition);
            const endNum = parseInt(endPosition);
            if (isNaN(startNum) || isNaN(endNum)) return;

            setIsDraggingRange(true);
            const sliderRect = sliderRef.current.getBoundingClientRect();
            const relativeX = e.clientX - sliderRect.left;
            dragStartX.current = {
                x: relativeX,
                startPos: startNum,
                endPos: endNum,
            };
        },
        [startPosition, endPosition]
    );

    const formattedSequence = useMemo(() => {
        if (!sequenceData || !sequenceRange) return null;

        const start = sequenceRange.start;
        const BASES_PER_LINE = 200;
        const lines = [];

        for (let i = 0; i < sequenceData.length; i += BASES_PER_LINE) {
            const lineStartPos = start + i;
            const chunk = sequenceData.substring(i, i + BASES_PER_LINE);
            const colorizedChars = [];

            for (let j = 0; j < chunk.length; j++) {
                const nucleotide = chunk[j] || "";
                const nucleotidePosition = lineStartPos + j;
                const color = getNucleotideColorClass(nucleotide);
                colorizedChars.push(
                    <span
                        key={j}
                        onClick={() => onSequenceClick(nucleotidePosition, nucleotide)}
                        onMouseEnter={(e) => {
                            setHoverPosition(nucleotidePosition);
                            setMousePosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => {
                            setHoverPosition(null);
                            setMousePosition(null);
                        }}
                        className={`${color} group relative cursor-pointer select-none`}
                    >
                        {nucleotide}
                    </span>
                );
            }

            lines.push(
                <div key={i} className="flex select-none">
                    <div className="mr-3 w-24 text-right text-gray-400 font-mono select-text">
                        {lineStartPos.toLocaleString()}
                    </div>
                    <div className="flex-1 tracking-widest font-mono">{colorizedChars}</div>
                </div>
            );
        }
        return lines;
    }, [sequenceData, sequenceRange, onSequenceClick]);

    return (
        <Card className="gap-0 border border-blue-200 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pt-4 pb-3 px-6 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 rounded-t-2xl">
                <CardTitle className="text-base font-semibold text-blue-800 tracking-wide">
                    Gene Sequence
                </CardTitle>
            </CardHeader>

            <CardContent className="pb-6 px-6">
                {geneBounds && (
                    <div className="mb-6 flex flex-col">
                        <div className="mb-3 flex flex-col items-center justify-between text-xs font-mono text-blue-700 sm:flex-row">
                            <span className="flex items-center gap-1">
                                <p className="sm:hidden font-semibold">From:</p>
                                <p>{Math.min(geneBounds.min, geneBounds.max).toLocaleString()}</p>
                            </span>
                            <span className="font-semibold">
                                Selected: {parseInt(startPosition || "0").toLocaleString()} -{" "}
                                {parseInt(endPosition || "0").toLocaleString()} ({currentRangeSize.toLocaleString()} bp)
                            </span>
                            <span className="flex items-center gap-1">
                                <p className="sm:hidden font-semibold">To:</p>
                                <p>{Math.max(geneBounds.min, geneBounds.max).toLocaleString()}</p>
                            </span>
                        </div>

                        {/* Slider */}
                        <div className="relative h-6 w-full cursor-pointer select-none">
                            <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-blue-100"></div>

                            <div
                                ref={sliderRef}
                                className="absolute top-1/2 h-2 -translate-y-1/2 cursor-grab rounded-full bg-blue-600 active:cursor-grabbing"
                                style={{
                                    left: `${sliderValues.start}%`,
                                    width: `${sliderValues.end - sliderValues.start}%`,
                                }}
                                onMouseDown={handleRangeMouseDown}
                            ></div>

                            {/* Start handle */}
                            <div
                                className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-blue-700 bg-white shadow-md active:cursor-grabbing"
                                style={{ left: `${sliderValues.start}%` }}
                                onMouseDown={(e) => handleMouseDown(e, "start")}
                            >
                                <div className="h-3 w-1 rounded-full bg-blue-700"></div>
                            </div>

                            {/* End handle */}
                            <div
                                className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-blue-700 bg-white shadow-md active:cursor-grabbing"
                                style={{ left: `${sliderValues.end}%` }}
                                onMouseDown={(e) => handleMouseDown(e, "end")}
                            >
                                <div className="h-3 w-1 rounded-full bg-blue-700"></div>
                            </div>
                        </div>

                        {/* Position controls */}
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-blue-600">Start:</span>
                                <Input
                                    value={startPosition}
                                    onChange={(e) => onStartPositionChange(e.target.value)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="h-8 w-28 border border-blue-300 text-sm text-blue-700 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                            </div>

                            <Button
                                size="sm"
                                disabled={isLoading}
                                onClick={onSequenceLoadRequest}
                                className="h-8 w-full sm:w-auto bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
                            >
                                {isLoading ? "Loading..." : "Load sequence"}
                            </Button>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-blue-600">End:</span>
                                <Input
                                    value={endPosition}
                                    onChange={(e) => onEndPositionChange(e.target.value)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="h-8 w-28 border border-blue-300 text-sm text-blue-700 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between text-xs font-mono text-blue-700">
                    <span>
                        {geneDetail?.genomicinfo?.[0]?.strand === "+"
                            ? "Forward strand (5' → 3')"
                            : geneDetail?.genomicinfo?.[0]?.strand === "-"
                                ? "Reverse strand (3' ← 5')"
                                : "Strand information not available"}
                    </span>
                    <span>Maximum window size: {maxViewRange.toLocaleString()} bp</span>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 font-semibold">
                        {error}
                    </div>
                )}

                <div className="max-h-64 overflow-auto rounded-md bg-blue-50 p-4 font-mono text-sm text-blue-900 select-text">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-300 border-t-blue-700"></div>
                        </div>
                    ) : sequenceData ? (
                        <pre>{formattedSequence}</pre>
                    ) : (
                        <p className="text-center text-blue-600">No sequence data loaded.</p>
                    )}
                </div>

                {hoverPosition !== null && mousePosition !== null && (
                    <div
                        className="pointer-events-none fixed z-50 rounded-md bg-blue-900 px-3 py-1 text-xs text-white shadow-lg"
                        style={{
                            top: mousePosition.y - 35,
                            left: mousePosition.x,
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Position: {hoverPosition.toLocaleString()}
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-mono text-blue-800">
                    {[
                        { base: "A", color: "bg-red-500" },
                        { base: "T", color: "bg-blue-600" },
                        { base: "G", color: "bg-green-600" },
                        { base: "C", color: "bg-amber-600" },
                    ].map(({ base, color }) => (
                        <div key={base} className="flex items-center gap-1">
                            <div className={`${color} h-4 w-4 rounded-full shadow-md`}></div>
                            <span>{base}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
