// app/components/LiquidGlass.tsx

"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { motion, useWillChange } from "framer-motion";

// Import shadcn-ui components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

// Define the type for our configuration state
type Config = {
  preset: "dock" | "pill" | "bubble" | "free";
  theme: "system" | "light" | "dark";
  top: boolean;
  icons: boolean;
  scale: number;
  radius: number;
  border: number;
  lightness: number;
  displace: number;
  blend:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"
    | "plus-darker"
    | "plus-lighter";
  x: "R" | "G" | "B";
  y: "R" | "G" | "B";
  alpha: number;
  blur: number;
  r: number;
  g: number;
  b: number;
  width: number;
  height: number;
  frost: number;
};

// Base and preset configurations
const base = {
  icons: false,
  scale: -180,
  radius: 16,
  border: 0.07,
  lightness: 50,
  displace: 0,
  blend: "difference" as Config["blend"],
  x: "R" as Config["x"],
  y: "B" as Config["y"],
  alpha: 0.93,
  blur: 11,
  r: 0,
  g: 10,
  b: 20,
  frost: 0,
  top: false,
};

const presets: Record<Config["preset"], Partial<Config>> = {
  dock: {
    ...base,
    width: 336,
    height: 96,
    displace: 0.2,
    icons: true,
    frost: 0.05,
  },
  pill: {
    ...base,
    width: 200,
    height: 80,
    radius: 40,
  },
  bubble: {
    ...base,
    radius: 70,
    width: 140,
    height: 140,
  },
  free: {
    ...base,
    width: 140,
    height: 280,
    radius: 80,
    border: 0.15,
    alpha: 0.74,
    lightness: 60,
    blur: 10,
    scale: -300,
  },
};

const initialConfig: Config = {
  ...presets.dock,
  preset: "dock",
  theme: "system",
} as Config;

/**
 * Main component that renders the draggable element and its controls.
 */
export function LiquidGlass() {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const willChange = useWillChange();

  // Generate the SVG for the displacement map filter as a data URI
  const displacementImageUri = useMemo(() => {
    const { width, height, radius, border, lightness, alpha, blur, blend } =
      config;
    const borderPx = Math.min(width, height) * (border * 0.5);

    const svgString = `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#red)" />
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#blue)" style="mix-blend-mode: ${blend}" />
        <rect x="${borderPx}" y="${borderPx}" width="${width - borderPx * 2}" height="${height - borderPx * 2}" rx="${radius}" fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)" />
      </svg>`;

    const encoded = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encoded}`;
  }, [
    config.width,
    config.height,
    config.radius,
    config.border,
    config.lightness,
    config.alpha,
    config.blur,
    config.blend,
  ]);
  
  // Update global theme attribute when it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", config.theme);
  }, [config.theme]);

  // Set mounted state after initial render to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePresetChange = (newPreset: Config["preset"]) => {
    setConfig((prev) => ({
      ...prev,
      ...presets[newPreset],
      preset: newPreset,
    }));
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  // Matrix for feColorMatrix to introduce chromatic aberration by manipulating the displacement map itself
  const matrix = useMemo(() => {
    const s = (val: number) => (val / 1000).toString();
    const r = s(config.r);
    const g = s(config.g);
    const b = s(config.b);
    return `${1+r} 0 0 0 0  0 ${1+g} 0 0 0  0 0 ${1+b} 0 0  0 0 0 1 0`;
  }, [config.r, config.g, config.b]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
      <Configurator
        config={config}
        setConfig={setConfig}
        onPresetChange={handlePresetChange}
      />

      <div
        ref={containerRef}
        className="relative flex h-[80vh] min-h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-slate-100 p-4 dark:bg-slate-900/80"
      >
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute text-sm text-slate-500 dark:text-slate-400">
          Drag the element
        </div>

        <svg className="absolute h-0 w-0">
          <defs>
            <filter id="glass-filter">
              <feGaussianBlur in="SourceGraphic" stdDeviation={config.displace} />
              <feImage
                href={displacementImageUri}
                result="displacementMap"
                width={config.width}
                height={config.height}
              />
              {/* This matrix manipulates the displacement map itself to create aberration */}
              <feColorMatrix in="displacementMap" type="matrix" values={matrix} result="aberratedMap" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="aberratedMap"
                scale={config.scale}
                xChannelSelector={config.x}
                yChannelSelector={config.y}
              />
            </filter>
          </defs>
        </svg>

        <motion.div
          drag
          dragConstraints={containerRef}
          dragMomentum={false}
          className="relative z-10 cursor-grab active:cursor-grabbing"
          style={{
            willChange,
            backdropFilter: `blur(${config.frost * 25}px)`,
            filter: 'url(#glass-filter)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          }}
          animate={{
            width: config.width,
            height: config.height,
            borderRadius: config.radius,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        >
          {config.icons && (
            <div className="flex h-full items-center justify-center gap-4 text-white">
              <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2"/></svg>
              <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12h20v2H2z"/></svg>
              <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 22h20z"/></svg>
            </div>
           )}
        </motion.div>
      </div>
    </div>
  );
}

function Configurator({
  config,
  setConfig,
  onPresetChange,
}: {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onPresetChange: (preset: Config["preset"]) => void;
}) {
  const isFreeMode = config.preset === "free";
  const setConfigValue =
    <K extends keyof Config>(key: K) =>
    (value: Config[K]) => {
      setConfig((c) => ({ ...c, [key]: value }));
    };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Preset</Label>
          <Select value={config.preset} onValueChange={onPresetChange}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="dock">Dock</SelectItem>
              <SelectItem value="pill">Pill</SelectItem>
              <SelectItem value="bubble">Bubble</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Theme</Label>
          <Select value={config.theme} onValueChange={setConfigValue("theme")}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Accordion type="single" collapsible className="w-full" disabled={!isFreeMode} defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className={!isFreeMode ? "text-muted-foreground" : ""}>Settings</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <ControlSlider label="Width (px)" value={config.width} min={80} max={500} step={1} onChange={setConfigValue("width")}/>
              <ControlSlider label="Height (px)" value={config.height} min={80} max={500} step={1} onChange={setConfigValue("height")} />
              <ControlSlider label="Radius (px)" value={config.radius} min={0} max={250} step={1} onChange={setConfigValue("radius")} />
              <ControlSlider label="Frost" value={config.frost} min={0} max={1} step={0.01} onChange={setConfigValue("frost")} />
              <ControlSlider label="Border" value={config.border} min={0} max={1} step={0.01} onChange={setConfigValue("border")} />
              <ControlSlider label="Alpha" value={config.alpha} min={0} max={1} step={0.01} onChange={setConfigValue("alpha")} />
              <ControlSlider label="Lightness" value={config.lightness} min={0} max={100} step={1} onChange={setConfigValue("lightness")} />
              <ControlSlider label="Input Blur" value={config.blur} min={0} max={20} step={1} onChange={setConfigValue("blur")} />
              <ControlSlider label="Output Blur" value={config.displace} min={0} max={20} step={0.1} onChange={setConfigValue("displace")} />
              <ControlSlider label="Scale" value={config.scale} min={-1000} max={1000} step={1} onChange={setConfigValue("scale")} />
              
              <div className="space-y-2 !mt-6">
                <Label>Blend Mode</Label>
                <Select value={config.blend} onValueChange={setConfigValue("blend")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity", "plus-darker", "plus-lighter"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 !mt-6">
                <Label>Displacement Channels</Label>
                <div className="grid grid-cols-2 gap-4">
                   <Select value={config.x} onValueChange={setConfigValue("x")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R">Red</SelectItem>
                      <SelectItem value="G">Green</SelectItem>
                      <SelectItem value="B">Blue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={config.y} onValueChange={setConfigValue("y")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R">Red</SelectItem>
                      <SelectItem value="G">Green</SelectItem>
                      <SelectItem value="B">Blue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full pl-2 border-l mt-6 !mb-2">
                <AccordionItem value="chromatic">
                  <AccordionTrigger>Chromatic Aberration</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <ControlSlider label="Red Offset" value={config.r} min={-100} max={100} step={1} onChange={setConfigValue("r")} />
                    <ControlSlider label="Green Offset" value={config.g} min={-100} max={100} step={1} onChange={setConfigValue("g")} />
                    <ControlSlider label="Blue Offset" value={config.b} min={-100} max={100} step={1} onChange={setConfigValue("b")} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function ControlSlider({
  label, value, onChange, min, max, step,
}: {
  label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      <Slider value={[value]} onValueChange={([val]) => onChange(val)} min={min} max={max} step={step} />
    </div>
  );
}