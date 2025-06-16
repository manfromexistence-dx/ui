"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Copy, X, RotateCcw, Check } from "lucide-react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Helper functions (unchanged)
const smoothStep = (a: number, b: number, t: number): number => {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

const length = (x: number, y: number): number => {
    return Math.sqrt(x * x + y * y);
};

const roundedRectSDF = (x: number, y: number, width: number, height: number, radius: number): number => {
    const qx = Math.abs(x) - width + radius;
    const qy = Math.abs(y) - height + radius;
    return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
};

interface UV {
    x: number;
    y: number;
}

interface MousePosition {
    x: number;
    y: number;
}

interface LiquidGlassProps {
    offset?: number;
    className?: string;
}

// Updated initial settings to include chromatic values
const initialSettings = {
    distortWidth: 0.3,
    distortHeight: 0.2,
    distortRadius: 0.6,
    smoothStepEdge: 0.8,
    distanceOffset: 0.15,
    isChromaticEnabled: false,
    chromaticR: 0,
    chromaticG: 10,
    chromaticB: 20,
    outputBlur: 0.7,
};


export const LiquidGlassDemo = ({
    offset = 10,
    className
}: LiquidGlassProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);
    const [isCodeVisible, setIsCodeVisible] = useState(false);
    const [copiedStates, setCopiedStates] = useState({
        command: false,
        shadcn: false,
        console: false,
    });

    // SDF and Distortion states
    const [distortWidth, setDistortWidth] = useState(initialSettings.distortWidth);
    const [distortHeight, setDistortHeight] = useState(initialSettings.distortHeight);
    const [distortRadius, setDistortRadius] = useState(initialSettings.distortRadius);
    const [smoothStepEdge, setSmoothStepEdge] = useState(initialSettings.smoothStepEdge);
    const [distanceOffset, setDistanceOffset] = useState(initialSettings.distanceOffset);

    // New Chromatic Aberration states
    const [isChromaticEnabled, setIsChromaticEnabled] = useState(initialSettings.isChromaticEnabled);
    const [chromaticR, setChromaticR] = useState(initialSettings.chromaticR);
    const [chromaticG, setChromaticG] = useState(initialSettings.chromaticG);
    const [chromaticB, setChromaticB] = useState(initialSettings.chromaticB);
    const [outputBlur, setOutputBlur] = useState(initialSettings.outputBlur);


    useEffect(() => {
        if (containerRef.current) {
            setWidth(containerRef.current.offsetWidth);
            setHeight(containerRef.current.offsetHeight);
        }

        try {
            const storedSettings = localStorage.getItem("liquidGlassSettings");
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                setDistortWidth(settings.distortWidth ?? initialSettings.distortWidth);
                setDistortHeight(settings.distortHeight ?? initialSettings.distortHeight);
                setDistortRadius(settings.distortRadius ?? initialSettings.distortRadius);
                setSmoothStepEdge(settings.smoothStepEdge ?? initialSettings.smoothStepEdge);
                setDistanceOffset(settings.distanceOffset ?? initialSettings.distanceOffset);
                // Load chromatic settings from localStorage
                setIsChromaticEnabled(settings.isChromaticEnabled ?? initialSettings.isChromaticEnabled);
                setChromaticR(settings.chromaticR ?? initialSettings.chromaticR);
                setChromaticG(settings.chromaticG ?? initialSettings.chromaticG);
                setChromaticB(settings.chromaticB ?? initialSettings.chromaticB);
                setOutputBlur(settings.outputBlur ?? initialSettings.outputBlur);
            }
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
        }

    }, []);

    useEffect(() => {
        const settings = {
            distortWidth,
            distortHeight,
            distortRadius,
            smoothStepEdge,
            distanceOffset,
            isChromaticEnabled,
            chromaticR,
            chromaticG,
            chromaticB,
            outputBlur,
        };
        try {
            localStorage.setItem("liquidGlassSettings", JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, [distortWidth, distortHeight, distortRadius, smoothStepEdge, distanceOffset, isChromaticEnabled, chromaticR, chromaticG, chromaticB, outputBlur]);


    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const feImageRef = useRef<SVGFEImageElement | null>(null);

    // Refs for the new filter primitives
    const redChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
    const greenChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
    const blueChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
    const feGaussianBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);


    const mouse = useRef<MousePosition>({ x: 0, y: 0 });
    const mouseUsed = useRef(false);
    const filterId = useRef(`liquid-glass-${Math.random().toString(36).substr(2, 9)}`);

    const handleReset = () => {
        setDistortWidth(initialSettings.distortWidth);
        setDistortHeight(initialSettings.distortHeight);
        setDistortRadius(initialSettings.distortRadius);
        setSmoothStepEdge(initialSettings.smoothStepEdge);
        setDistanceOffset(initialSettings.distanceOffset);
        // Reset chromatic settings
        setIsChromaticEnabled(initialSettings.isChromaticEnabled);
        setChromaticR(initialSettings.chromaticR);
        setChromaticG(initialSettings.chromaticG);
        setChromaticB(initialSettings.chromaticB);
        setOutputBlur(initialSettings.outputBlur);

        try {
            localStorage.removeItem("liquidGlassSettings");
        } catch (error) {
            console.error("Failed to remove settings from localStorage", error);
        }
    };

    // Code snippet generation is omitted for brevity but would need to be updated as well

    const updateShader = useCallback(() => {
        if (!canvasRef.current || !feImageRef.current || !redChannelRef.current || !greenChannelRef.current || !blueChannelRef.current || !feGaussianBlurRef.current || width <= 1 || height <= 1) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const canvasDPI = 1;
        const w = Math.floor(width * canvasDPI);
        const h = Math.floor(height * canvasDPI);
        if (w <= 0 || h <= 0) return;

        canvas.width = w;
        canvas.height = h;

        const data = new Uint8ClampedArray(w * h * 4);
        let maxScale = 0;
        const rawValues: number[] = [];

        const fragment = (uv: UV) => {
            const ix = uv.x - 0.5;
            const iy = uv.y - 0.5;
            const distanceToEdge = roundedRectSDF(ix, iy, distortWidth, distortHeight, distortRadius);
            const displacement = smoothStep(smoothStepEdge, 0, distanceToEdge - distanceOffset);
            const scaled = smoothStep(0, 1, displacement);
            return { x: ix * scaled + 0.5, y: iy * scaled + 0.5 };
        };

        for (let i = 0; i < w * h; i++) {
            const x = i % w;
            const y = Math.floor(i / w);
            const pos = fragment({ x: x / w, y: y / h });
            const dx = pos.x * w - x;
            const dy = pos.y * h - y;
            maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
            rawValues.push(dx, dy);
        }

        maxScale *= 0.5;

        let dataIndex = 0;
        let rawValueIndex = 0;
        for (let i = 0; i < w * h; i++) {
            const r = rawValues[rawValueIndex++] / maxScale + 0.5;
            const g = rawValues[rawValueIndex++] / maxScale + 0.5;
            data[dataIndex++] = r * 255;
            data[dataIndex++] = g * 255;
            data[dataIndex++] = 0;
            data[dataIndex++] = 255;
        }

        context.putImageData(new ImageData(data, w, h), 0, 0);
        feImageRef.current.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL());

        const baseScale = maxScale / canvasDPI;

        const rScale = isChromaticEnabled ? baseScale + chromaticR : baseScale;
        const gScale = isChromaticEnabled ? baseScale + chromaticG : baseScale;
        const bScale = isChromaticEnabled ? baseScale + chromaticB : baseScale;

        redChannelRef.current.setAttribute("scale", rScale.toString());
        greenChannelRef.current.setAttribute("scale", gScale.toString());
        blueChannelRef.current.setAttribute("scale", bScale.toString());
        feGaussianBlurRef.current.setAttribute("stdDeviation", outputBlur.toString());


    }, [width, height, distortWidth, distortHeight, distortRadius, smoothStepEdge, distanceOffset, isChromaticEnabled, chromaticR, chromaticG, chromaticB, outputBlur]);

    useEffect(() => {
        updateShader();
    }, [updateShader]);


    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        updateShader();

        let isDragging = false;
        let startX = 0, startY = 0, initialX = 0, initialY = 0;

        const constrainPosition = (x: number, y: number) => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const minX = offset;
            const maxX = viewportWidth - width - offset;
            const minY = offset;
            const maxY = viewportHeight - height - offset;
            const constrainedX = Math.max(minX, Math.min(maxX, x));
            const constrainedY = Math.max(minY, Math.min(maxY, y));
            return { x: constrainedX, y: constrainedY };
        };

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            container.style.cursor = "grabbing";
            startX = e.clientX;
            startY = e.clientY;
            const rect = container.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            e.preventDefault();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const newX = initialX + deltaX;
                const newY = initialY + deltaY;
                const constrained = constrainPosition(newX, newY);

                container.style.left = `${constrained.x}px`;
                container.style.top = `${constrained.y}px`;
                container.style.transform = "none";
            }

            const rect = container.getBoundingClientRect();
            mouse.current.x = (e.clientX - rect.left) / rect.width;
            mouse.current.y = (e.clientY - rect.top) / rect.height;

            if (mouseUsed.current) {
                updateShader();
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            container.style.cursor = "grab";
        };

        const onResize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const constrained = constrainPosition(rect.left, rect.top);
            if (rect.left !== constrained.x || rect.top !== constrained.y) {
                containerRef.current.style.left = `${constrained.x}px`;
                containerRef.current.style.top = `${constrained.y}px`;
                containerRef.current.style.transform = "none";
            }
        };

        container.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        window.addEventListener("resize", onResize);

        return () => {
            container.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("resize", onResize);
        };
    }, [width, height, offset, updateShader]);

    return (
        <>
            {/* --- SVG Filter Definition --- */}
            <svg width="0" height="0" style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9998 }}>
                <defs>
                    <filter id={filterId.current} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB" x="0" y="0" width={width} height={height}>
                        {/* The displacement map image, generated from the canvas */}
                        <feImage
                            ref={feImageRef}
                            width={width}
                            height={height}
                            result="map"
                        />

                        {/* RED channel with strongest displacement */}
                        <feDisplacementMap
                            ref={redChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            xChannelSelector="R"
                            yChannelSelector="G"
                            scale={0}
                            result="dispRed"
                        />
                        <feColorMatrix
                            in="dispRed"
                            type="matrix"
                            values="1 0 0 0 0
                                    0 0 0 0 0
                                    0 0 0 0 0
                                    0 0 0 1 0"
                            result="red"
                        />

                        {/* GREEN channel (reference/least displaced) */}
                        <feDisplacementMap
                            ref={greenChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            xChannelSelector="R"
                            yChannelSelector="G"
                            scale={0}
                            result="dispGreen"
                        />
                        <feColorMatrix
                            in="dispGreen"
                            type="matrix"
                            values="0 0 0 0 0
                                    0 1 0 0 0
                                    0 0 0 0 0
                                    0 0 0 1 0"
                            result="green"
                        />

                        {/* BLUE channel with medium displacement */}
                        <feDisplacementMap
                            ref={blueChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            xChannelSelector="R"
                            yChannelSelector="G"
                            scale={0}
                            result="dispBlue"
                        />
                        <feColorMatrix
                            in="dispBlue"
                            type="matrix"
                            values="0 0 0 0 0
                                    0 0 0 0 0
                                    0 0 1 0 0
                                    0 0 0 1 0"
                            result="blue"
                        />

                        {/* Blend channels back together */}
                        <feBlend in="red" in2="green" mode="screen" result="rg" />
                        <feBlend in="rg" in2="blue" mode="screen" result="output" />

                        {/* Output blur */}
                        <feGaussianBlur ref={feGaussianBlurRef} in="output" stdDeviation={outputBlur} />
                    </filter>
                </defs>
            </svg>

            {/* --- Draggable Glass Element --- */}
            <div
                ref={containerRef}
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15)",
                    backdropFilter: `url(#${filterId.current}) contrast(1.2) brightness(1.05) saturate(1.1)`,
                    //  contrast(1.2) brightness(1.05) saturate(1.1)
                }}
                className={cn(
                    `pointer-events-auto flex h-32 w-64 cursor-grab overflow-hidden border rounded-full`,
                    className
                )}
            />

            {/* --- Hidden Canvas for generating the map --- */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ display: "none" }}
                className={cn(className)}
            />

            {/* --- Customizer UI --- */}
            <Collapsible
                className="fixed bottom-5 left-1/2 z-[10000] w-[350px] -translate-x-1/2"
            >
                <CollapsibleTrigger asChild>
                    <div className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-background/80 p-2 px-2.5 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold">Customize</h3>
                        <div className="flex items-center gap-2">
                            <Copy className="h-4 w-4 transition-colors hover:text-primary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCodeVisible(true); }} />
                            <ChevronsUpDown className="h-4 w-4 transition-colors hover:text-primary" />
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 flex-col gap-4 space-y-4 rounded-md border bg-background/80 p-4 backdrop-blur-sm">
                    {/* --- Distortion Controls --- */}
                    <div className="grid gap-2">
                        <Label htmlFor="distort-width">SDF Width: {distortWidth.toFixed(2)}</Label>
                        <Slider id="distort-width" min={0} max={0.5} step={0.01} value={[distortWidth]} onValueChange={(value) => setDistortWidth(value[0])} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="distort-height">SDF Height: {distortHeight.toFixed(2)}</Label>
                        <Slider id="distort-height" min={0} max={0.2} step={0.01} value={[distortHeight]} onValueChange={(value) => setDistortHeight(value[0])} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="distort-radius">SDF Radius: {distortRadius.toFixed(2)}</Label>
                        <Slider id="distort-radius" min={0.6} max={1} step={0.01} value={[distortRadius]} onValueChange={(value) => setDistortRadius(value[0])} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="smooth-step">Smooth Step Edge: {smoothStepEdge.toFixed(2)}</Label>
                        <Slider id="smooth-step" min={0} max={0.65} step={0.01} value={[smoothStepEdge]} onValueChange={(value) => setSmoothStepEdge(value[0])} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="distance-offset">Distance Offset: {distanceOffset.toFixed(2)}</Label>
                        <Slider id="distance-offset" min={-1} max={0.30} step={0.01} value={[distanceOffset]} onValueChange={(value) => setDistanceOffset(value[0])} />
                    </div>
                    {/* --- Chromatic Aberration Controls --- */}
                    <div className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="chromatic-enabled" className="text-base font-medium">Chromatic Effect</Label>
                            <Switch id="chromatic-enabled" checked={isChromaticEnabled} onCheckedChange={setIsChromaticEnabled} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chromatic-r" className={cn(!isChromaticEnabled && "text-muted-foreground")}>Red Channel: {chromaticR}</Label>
                            <Slider id="chromatic-r" min={-100} max={100} step={1} value={[chromaticR]} onValueChange={(value) => setChromaticR(value[0])} disabled={!isChromaticEnabled} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chromatic-g" className={cn(!isChromaticEnabled && "text-muted-foreground")}>Green Channel: {chromaticG}</Label>
                            <Slider id="chromatic-g" min={-100} max={100} step={1} value={[chromaticG]} onValueChange={(value) => setChromaticG(value[0])} disabled={!isChromaticEnabled} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chromatic-b" className={cn(!isChromaticEnabled && "text-muted-foreground")}>Blue Channel: {chromaticB}</Label>
                            <Slider id="chromatic-b" min={-100} max={100} step={1} value={[chromaticB]} onValueChange={(value) => setChromaticB(value[0])} disabled={!isChromaticEnabled} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="output-blur" className={cn(!isChromaticEnabled && "text-muted-foreground")}>Output Blur: {outputBlur.toFixed(1)}</Label>
                            <Slider id="output-blur" min={0} max={5} step={0.1} value={[outputBlur]} onValueChange={(value) => setOutputBlur(value[0])} disabled={!isChromaticEnabled} />
                        </div>
                    </div>


                    <button
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset to Defaults
                    </button>
                </CollapsibleContent>
            </Collapsible>

            {/* --- Code Snippet Modal (Unchanged for brevity) --- */}
            {isCodeVisible && (
                 <Tabs defaultValue="shadcn" className="fixed inset-0 z-[10001] flex items-center justify-center bg-background/50 p-4 backdrop-blur-sm">
                 <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border bg-background shadow-xl">
                     <div className="flex items-center justify-between border-b p-4">
                         <TabsList>
                             <TabsTrigger value="shadcn">Shadcn Code</TabsTrigger>
                             <TabsTrigger value="console">Browser Console Code</TabsTrigger>
                         </TabsList>
                         <button onClick={() => setIsCodeVisible(false)} className="rounded-md p-1 hover:bg-muted">
                             <X className="h-4 w-4" />
                         </button>
                     </div>
                     <TabsContent value="shadcn" className="overflow-y-auto">
                     </TabsContent>
                     <TabsContent value="console" className="overflow-y-auto">
                     </TabsContent>
                 </div>
             </Tabs>
            )}
        </>
    );
};