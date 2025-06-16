    const generateCodeSnippet = () => {
        return `"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const smoothStep = (a: number, b: number, t: number): number => {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)
}

const length = (x: number, y: number): number => {
    return Math.sqrt(x * x + y * y)
}

const roundedRectSDF = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): number => {
    const qx = Math.abs(x) - width + radius
    const qy = Math.abs(y) - height + radius
    return (
    Math.min(Math.max(qx, qy), 0) +
    length(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
    )
}

interface UV {
    x: number
    y: number
}

export const LiquidGlass = ({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(1)
    const [height, setHeight] = useState(1)

    useEffect(() => {
    const element = containerRef.current
    if (!element) return

    setWidth(element.offsetWidth)
    setHeight(element.offsetHeight)

    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
        const { width, height } = entries[0].contentRect
        setWidth(width)
        setHeight(height)
        }
    })

    resizeObserver.observe(element)

    return () => {
        resizeObserver.disconnect()
    }
    }, [])

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const feImageRef = useRef<SVGFEImageElement | null>(null)
    const feDisplacementMapRef = useRef<SVGFEDisplacementMapElement | null>(null)

    const filterId = useRef(
    "liquid-glass-" + Math.random().toString(36).slice(2, 11)
    )

    const [distortWidth, setDistortWidth] = useState(${distortWidth.toFixed(2)});
    const [distortHeight, setDistortHeight] = useState(${distortHeight.toFixed(2)});
    const [distortRadius, setDistortRadius] = useState(${distortRadius.toFixed(2)});
    const [smoothStepEdge, setSmoothStepEdge] = useState(${smoothStepEdge.toFixed(2)});
    const [distanceOffset, setDistanceOffset] = useState(${distanceOffset.toFixed(2)});

    const updateShader = useCallback(() => {
    if (
        !canvasRef.current ||
        !feImageRef.current ||
        !feDisplacementMapRef.current ||
        width <= 1 ||
        height <= 1
    )
        return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const canvasDPI = 1
    const w = Math.floor(width * canvasDPI)
    const h = Math.floor(height * canvasDPI)
    if (w <= 0 || h <= 0) return;

    canvas.width = w;
    canvas.height = h;

    const data = new Uint8ClampedArray(w * h * 4)
    let maxScale = 0
    const rawValues: number[] = []

    const fragment = (uv: UV) => {
        const ix = uv.x - 0.5
        const iy = uv.y - 0.5
        const distanceToEdge = roundedRectSDF(
        ix,
        iy,
        distortWidth,
        distortHeight,
        distortRadius
        )
        const displacement = smoothStep(
        smoothStepEdge,
        0,
        distanceToEdge - distanceOffset
        )
        const scaled = smoothStep(0, 1, displacement)
        return { x: ix * scaled + 0.5, y: iy * scaled + 0.5 }
    }

    for (let i = 0; i < w * h; i++) {
        const x = i % w
        const y = Math.floor(i / w)
        const pos = fragment({ x: x / w, y: y / h })
        const dx = pos.x * w - x
        const dy = pos.y * h - y
        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
        rawValues.push(dx, dy)
    }

    maxScale *= 0.5

    let dataIndex = 0
    let rawValueIndex = 0
    for (let i = 0; i < w * h; i++) {
        const r = rawValues[rawValueIndex++] / maxScale + 0.5
        const g = rawValues[rawValueIndex++] / maxScale + 0.5
        data[dataIndex++] = r * 255
        data[dataIndex++] = g * 255
        data[dataIndex++] = 0
        data[dataIndex++] = 255
    }

    context.putImageData(new ImageData(data, w, h), 0, 0)

    feImageRef.current.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        canvas.toDataURL()
    )
    feDisplacementMapRef.current.setAttribute(
        "scale",
        (maxScale / canvasDPI).toString()
    )
    }, [
    width,
    height,
    distortWidth,
    distortHeight,
    distortRadius,
    smoothStepEdge,
    distanceOffset,
    ])

    useEffect(() => {
    updateShader()
    }, [updateShader])

    return (
    <>
        <svg
        width="0"
        height="0"
        style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: -1,
        }}
        >
        <defs>
            <filter
            id={filterId.current}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width={width}
            height={height}
            >
            <feImage
                ref={feImageRef}
                width={width}
                height={height}
                result={filterId.current + "_map"}
            />
            <feDisplacementMap
                ref={feDisplacementMapRef}
                in="SourceGraphic"
                in2={filterId.current + "_map"}
                xChannelSelector="R"
                yChannelSelector="G"
                scale="0"
            />
            </filter>
        </defs>
        </svg>

        <div
        ref={containerRef}
        style={{
            filter:
            "url(#" + filterId.current + ") blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1)",
            boxShadow:
            "0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15)",
        }}
        className={cn(
            "flex h-64 w-64 items-center justify-center rounded-full border",
            className
        )}
        {...props}
        >
        {children}
        </div>

        <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "none" }}
        />
    </>
    )
    }`};

    const generateBrowserConsoleCodeSnippet = () => {
        return `(function () {
    "use strict";

    if (window.liquidGlass) {
        window.liquidGlass.destroy();
    }

    function smoothStep(a, b, t) {
        t = Math.max(0, Math.min(1, (t - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function length(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function roundedRectSDF(x, y, width, height, radius) {
        const qx = Math.abs(x) - width + radius;
        const qy = Math.abs(y) - height + radius;
        return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
    }

    function texture(x, y) {
        return { type: "t", x, y };
    }

    function generateId() {
        return "liquid-glass-" + Math.random().toString(36).substr(2, 9);
    }

    class Shader {
        constructor(options = {}) {
            this.width = options.width || 100;
            this.height = options.height || 100;
            this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
            this.canvasDPI = 1;
            this.id = generateId();
            this.offset = 10;
            this.mouse = { x: 0, y: 0 };
            this.mouseUsed = false;
            this.createElement();
            this.setupEventListeners();
            this.updateShader();
        }

        createElement() {
            this.container = document.createElement("div");
            this.container.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: " + this.width + "px; height: " + this.height + "px; overflow: hidden; border-radius: 150px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15); cursor: grab; backdrop-filter: url(#" + this.id + "_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1); z-index: 9999; pointer-events: auto;";
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            this.svg.setAttribute("width", "0");
            this.svg.setAttribute("height", "0");
            this.svg.style.cssText = "position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9998;";
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            filter.setAttribute("id", this.id + "_filter");
            filter.setAttribute("filterUnits", "userSpaceOnUse");
            filter.setAttribute("colorInterpolationFilters", "sRGB");
            filter.setAttribute("x", "0");
            filter.setAttribute("y", "0");
            filter.setAttribute("width", this.width.toString());
            filter.setAttribute("height", this.height.toString());
            this.feImage = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
            this.feImage.setAttribute("id", this.id + "_map");
            this.feImage.setAttribute("width", this.width.toString());
            this.feImage.setAttribute("height", this.height.toString());
            this.feDisplacementMap = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
            this.feDisplacementMap.setAttribute("in", "SourceGraphic");
            this.feDisplacementMap.setAttribute("in2", this.id + "_map");
            this.feDisplacementMap.setAttribute("xChannelSelector", "R");
            this.feDisplacementMap.setAttribute("yChannelSelector", "G");
            filter.appendChild(this.feImage);
            filter.appendChild(this.feDisplacementMap);
            defs.appendChild(filter);
            this.svg.appendChild(defs);
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width * this.canvasDPI;
            this.canvas.height = this.height * this.canvasDPI;
            this.canvas.style.display = "none";
            this.context = this.canvas.getContext("2d");
        }

        constrainPosition(x, y) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const minX = this.offset;
            const maxX = viewportWidth - this.width - this.offset;
            const minY = this.offset;
            const maxY = viewportHeight - this.height - this.offset;
            const constrainedX = Math.max(minX, Math.min(maxX, x));
            const constrainedY = Math.max(minY, Math.min(maxY, y));
            return { x: constrainedX, y: constrainedY };
        }

        setupEventListeners() {
            let isDragging = false;
            let startX, startY, initialX, initialY;
            this.container.addEventListener("mousedown", (e) => {
                isDragging = true;
                this.container.style.cursor = "grabbing";
                startX = e.clientX;
                startY = e.clientY;
                const rect = this.container.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
                e.preventDefault();
            });
            document.addEventListener("mousemove", (e) => {
                if (isDragging) {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newX = initialX + deltaX;
                    const newY = initialY + deltaY;
                    const constrained = this.constrainPosition(newX, newY);
                    this.container.style.left = constrained.x + "px";
                    this.container.style.top = constrained.y + "px";
                    this.container.style.transform = "none";
                }
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / rect.width;
                this.mouse.y = (e.clientY - rect.top) / rect.height;
                if (this.mouseUsed) {
                    this.updateShader();
                }
            });
            document.addEventListener("mouseup", () => {
                isDragging = false;
                this.container.style.cursor = "grab";
            });
            window.addEventListener("resize", () => {
                const rect = this.container.getBoundingClientRect();
                const constrained = this.constrainPosition(rect.left, rect.top);
                if (rect.left !== constrained.x || rect.top !== constrained.y) {
                    this.container.style.left = constrained.x + "px";
                    this.container.style.top = constrained.y + "px";
                    this.container.style.transform = "none";
                }
            });
        }

        updateShader() {
            const mouseProxy = new Proxy(this.mouse, {
                get: (target, prop) => {
                    this.mouseUsed = true;
                    return target[prop];
                }
            });
            this.mouseUsed = false;
            const w = this.width * this.canvasDPI;
            const h = this.height * this.canvasDPI;
            const data = new Uint8ClampedArray(w * h * 4);
            let maxScale = 0;
            const rawValues = [];
            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor(i / 4 / w);
                const pos = this.fragment({ x: x / w, y: y / h }, mouseProxy);
                const dx = pos.x * w - x;
                const dy = pos.y * h - y;
                maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
                rawValues.push(dx, dy);
            }
            maxScale *= 0.5;
            let index = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = rawValues[index++] / maxScale + 0.5;
                const g = rawValues[index++] / maxScale + 0.5;
                data[i] = r * 255;
                data[i + 1] = g * 255;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }
            this.context.putImageData(new ImageData(data, w, h), 0, 0);
            this.feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.canvas.toDataURL());
            this.feDisplacementMap.setAttribute("scale", (maxScale / this.canvasDPI).toString());
        }

        appendTo(parent) {
            parent.appendChild(this.svg);
            parent.appendChild(this.container);
        }

        destroy() {
            this.svg.remove();
            this.container.remove();
            this.canvas.remove();
        }
    }

    function createLiquidGlass() {
        const shader = new Shader({
            width: 300,
            height: 200,
            fragment: (uv, mouse) => {
                const ix = uv.x - 0.5;
                const iy = uv.y - 0.5;
                const distanceToEdge = roundedRectSDF(ix, iy, ${distortWidth.toFixed(2)}, ${distortHeight.toFixed(2)}, ${distortRadius.toFixed(2)});
                const displacement = smoothStep(${smoothStepEdge.toFixed(2)}, 0, distanceToEdge - ${distanceOffset.toFixed(2)});
                const scaled = smoothStep(0, 1, displacement);
                return texture(ix * scaled + 0.5, iy * scaled + 0.5);
            }
        });
        shader.appendTo(document.body);
        window.liquidGlass = shader;
    }
    createLiquidGlass();
    })();`};


                            <TabsContent value="shadcn" className="overflow-y-auto">
                            <div className="space-y-4 p-4">
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard(`npx shadcn-ui@latest add "https://dx-ui.vercel.app/r/liquid-glass.json"`, 'command')} className="absolute top-1/2 translate-y-[-50%] right-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary-foreground hover:text-primary">
                                        {copiedStates.command ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                    <pre className="border whitespace-pre-wrap rounded-md p-4 text-sm overflow-x-auto py-2 bg-primary-foreground">
                                        <code>{`npx shadcn-ui@latest add "https://dx-ui.vercel.app/r/liquid-glass.json"`}</code>
                                    </pre>
                                </div>
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard(generateCodeSnippet(), 'shadcn')} className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary-foreground hover:text-primary">
                                        {copiedStates.shadcn ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                    <pre className="whitespace-pre-wrap rounded-md p-4 bg-primary-foreground text-sm overflow-x-auto border">
                                        <code>{generateCodeSnippet()}</code>
                                    </pre>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="console" className="overflow-y-auto">
                            <div className="p-4">
                                <div className="relative">
                                    <button onClick={() => handleCopyToClipboard(generateBrowserConsoleCodeSnippet(), 'console')} className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary-foreground hover:text-primary">
                                        {copiedStates.console ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                    <pre className="whitespace-pre-wrap rounded-md p-4 bg-primary-foreground text-sm overflow-x-auto border">
                                        <code>{generateBrowserConsoleCodeSnippet()}</code>
                                    </pre>
                                </div>
                            </div>
                        </TabsContent>