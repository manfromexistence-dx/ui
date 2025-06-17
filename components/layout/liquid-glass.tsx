"use client";

import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState, useEffect } from "react";

// Preset configurations including chromatic aberration values
const presets = {
  dock: {
    width: 336,
    height: 96,
    radius: 16,
    border: 0.07,
    lightness: 50,
    alpha: 0.93,
    blur: 11,
    displace: 0.2,
    scale: -180,
    blend: "difference",
    x: "R",
    y: "B",
    r: 0,
    g: 10,
    b: 20,
    icons: true,
    frost: 0.05,
    chromaticAberrationEnabled: true,
  },
  pill: {
    width: 200,
    height: 80,
    radius: 40,
    border: 0.07,
    lightness: 50,
    alpha: 0.93,
    blur: 11,
    displace: 0,
    scale: -180,
    blend: "difference",
    x: "R",
    y: "B",
    r: 0,
    g: 10,
    b: 20,
    icons: false,
    frost: 0,
    chromaticAberrationEnabled: true,
  },
  bubble: {
    radius: 70,
    width: 140,
    height: 140,
    border: 0.07,
    lightness: 50,
    alpha: 0.93,
    blur: 11,
    displace: 0,
    scale: -180,
    blend: "difference",
    x: "R",
    y: "B",
    r: 0,
    g: 10,
    b: 20,
    icons: false,
    frost: 0,
    chromaticAberrationEnabled: true,
  },
  free: {
    width: 140,
    height: 280,
    radius: 80,
    border: 0.15,
    lightness: 60,
    alpha: 0.74,
    blur: 10,
    displace: 0,
    scale: -300,
    blend: "difference",
    x: "R",
    y: "B",
    r: 0,
    g: 10,
    b: 20,
    icons: false,
    frost: 0,
    chromaticAberrationEnabled: true,
  }
};

// Configuration type
interface LiquidGlassConfig {
  width: number;
  height: number;
  radius: number;
  border: number;
  lightness: number;
  alpha: number;
  blur: number;
  displace: number;
  scale: number;
  blend: string;
  x: string;
  y: string;
  r: number;
  g: number;
  b: number;
  icons: boolean;
  frost: number;
  theme: string;
  debug: boolean;
  preset: string;
  chromaticAberrationEnabled: boolean;
}

export const LiquidGlass = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);

  // Initial configuration
  const [config, setConfig] = useState<LiquidGlassConfig>({
    ...presets.dock,
    theme: "system",
    debug: false,
    preset: "dock"
  });

  // Position state for the glass element
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Pure function to generate SVG content and data URI
  const buildDisplacementImage = (currentConfig: LiquidGlassConfig) => {
    const { width, height, border, radius, blend, lightness, alpha, blur } = currentConfig;
    const borderValue = Math.min(width, height) * (border * 0.5);
    const svgContent = `
      <svg class="displacement-image" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
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
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"></rect>
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#red)" />
        <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#blue)" style="mix-blend-mode: ${blend}" />
        <rect x="${borderValue}" y="${borderValue}" width="${width - borderValue * 2}" height="${height - borderValue * 2}" rx="${radius}" fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)" />
      </svg>
    `;
    const encoded = encodeURIComponent(svgContent);
    const uri = `data:image/svg+xml,${encoded}`;
    return { uri, svgContent };
  };

  // Update CSS variables and filter attributes
  useEffect(() => {
    const { uri, svgContent } = buildDisplacementImage(config);

    // Update feImage href for the filter
    const feImage = document.querySelector('#displacement-map-image');
    if (feImage) {
      feImage.setAttribute('href', uri);
    }

    // Update debug view
    if (debugRef.current) {
        debugRef.current.innerHTML = svgContent;
    }

    // Update CSS variables
    if (glassRef.current) {
      glassRef.current.style.setProperty('--width', `${config.width}px`);
      glassRef.current.style.setProperty('--height', `${config.height}px`);
      glassRef.current.style.setProperty('--radius', `${config.radius}px`);
      glassRef.current.style.setProperty('--frost', config.frost.toString());
    }

    // Set document theme
    document.documentElement.dataset.theme = config.theme;
  }, [config]);

  // Handle preset change
  const handlePresetChange = (value: string) => {
    if (value in presets) {
      setConfig(prev => ({
        ...prev,
        ...presets[value as keyof typeof presets],
        preset: value
      }));
    }
  };

  // Handle configuration change
  const handleConfigChange = (key: keyof LiquidGlassConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Position the glass element on initial load
  useEffect(() => {
    const placeholderEl = document.querySelector('.dock-placeholder');
    if (placeholderEl && glassRef.current) {
      const rect = placeholderEl.getBoundingClientRect();
      x.set(rect.left);
      y.set(rect.top);
    }
  }, [x, y]);

  return (
    <div className="min-h-screen">
      <div ref={constraintsRef} className="relative h-screen p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Liquid Glass Interface
          </h1>
          <Badge variant="secondary" className="backdrop-blur-sm bg-secondary/50">
            Drag the glass element • Try different presets
          </Badge>
        </motion.div>

        {/* Dock placeholder */}
        <div className="placeholder relative mx-auto">
          <div className="dock-placeholder w-[336px] h-[96px] rounded-[16px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Glass element */}
        <motion.div
          ref={glassRef}
          className="effect"
          style={{
            x,
            y,
            width: `${config.width}px`,
            height: `${config.height}px`,
            borderRadius: `${config.radius}px`,
            background: `hsla(var(--card) / ${config.frost})`,
            opacity: 1,
            position: 'absolute',
            zIndex: 999999,
            backdropFilter: 'url(#chromatic-filter)'
          }}
          drag
          dragMomentum={false}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          whileDrag={{ scale: 1.02 }}
        >
          <div className="nav-wrap w-full h-full overflow-hidden" style={{ borderRadius: 'inherit' }}>
            <AnimatePresence>
                {config.icons && (
                    <motion.nav
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center p-2"
                    >
                        <img src="https://assets.codepen.io/605876/finder.png" alt="App icon" className="w-[60px] aspect-square" />
                        <img src="https://assets.codepen.io/605876/launch-control.png" alt="App icon" className="w-[60px] aspect-square" />
                        <img src="https://assets.codepen.io/605876/safari.png" alt="App icon" className="w-[60px] aspect-square" />
                        <img src="https://assets.codepen.io/605876/calendar.png" alt="App icon" className="w-[60px] aspect-square" />
                    </motion.nav>
                )}
            </AnimatePresence>
          </div>

          {/* SVG Filter Definition */}
          <svg className="filter absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="chromatic-filter" colorInterpolationFilters="sRGB">
                <feImage id="displacement-map-image" x="0" y="0" width="100%" height="100%" result="map" />
                
                <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector={config.x} yChannelSelector={config.y} scale={config.chromaticAberrationEnabled ? config.scale + config.r : config.scale} result="dispRed" />
                <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
                
                <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector={config.x} yChannelSelector={config.y} scale={config.chromaticAberrationEnabled ? config.scale + config.g : config.scale} result="dispGreen" />
                <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />

                <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector={config.x} yChannelSelector={config.y} scale={config.chromaticAberrationEnabled ? config.scale + config.b : config.scale} result="dispBlue" />
                <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />

                <feBlend in="red" in2="green" mode="screen" result="rg" />
                <feBlend in="rg" in2="blue" mode="screen" result="output" />
                <feGaussianBlur in="output" stdDeviation={config.displace} />
              </filter>
            </defs>
          </svg>

          {/* Debug View */}
          <div
            ref={debugRef}
            className="displacement-debug pointer-events-none absolute inset-0 w-full h-full"
            style={{
              opacity: config.debug ? 1 : 0,
              transform: config.debug ? 'translateY(calc(100% + 1rem))' : 'translateY(calc(200% + 1rem)) scale(0.8)',
              transition: 'transform 0.26s ease-out, opacity 0.26s ease-out'
            }}
          ></div>
        </motion.div>

        {/* Configuration Panel */}
        <motion.div
          className="config-panel fixed bottom-8 right-8 w-[320px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-center text-card-foreground">
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4 w-full">
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                  <TabsTrigger value="advanced" disabled={config.preset !== 'free'}>Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="presets" className="space-y-4 text-card-foreground">
                  {/* Preset Controls */}
                  <div className="space-y-2">
                    <Label htmlFor="preset">Mode</Label>
                    <Select value={config.preset} onValueChange={handlePresetChange}>
                      <SelectTrigger id="preset"><SelectValue placeholder="Select preset" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dock">Dock</SelectItem>
                        <SelectItem value="pill">Pill</SelectItem>
                        <SelectItem value="bubble">Bubble</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={config.theme} onValueChange={(value) => handleConfigChange('theme', value)}>
                      <SelectTrigger id="theme"><SelectValue placeholder="Select theme" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="debug" checked={config.debug} onCheckedChange={(checked) => handleConfigChange('debug', checked)} />
                    <Label htmlFor="debug">Debug View</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="icons" checked={config.icons} onCheckedChange={(checked) => handleConfigChange('icons', checked)} />
                    <Label htmlFor="icons">Show Icons</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="chromatic-toggle" checked={config.chromaticAberrationEnabled} onCheckedChange={(checked) => handleConfigChange('chromaticAberrationEnabled', checked)} />
                    <Label htmlFor="chromatic-toggle">Enable Chromatic Effect</Label>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4 text-card-foreground">
                  {/* Advanced Controls */}
                  <div className="space-y-2">
                    <Label htmlFor="width">Width: {config.width}px</Label>
                    <Slider id="width" min={80} max={500} step={1} value={[config.width]} onValueChange={([value]) => handleConfigChange('width', value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height: {config.height}px</Label>
                    <Slider id="height" min={80} max={500} step={1} value={[config.height]} onValueChange={([value]) => handleConfigChange('height', value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius">Radius: {config.radius}px</Label>
                    <Slider id="radius" min={0} max={250} step={1} value={[config.radius]} onValueChange={([value]) => handleConfigChange('radius', value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displace">Blur: {config.displace}</Label>
                    <Slider id="displace" min={0} max={10} step={0.1} value={[config.displace]} onValueChange={([value]) => handleConfigChange('displace', value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scale">Scale: {config.scale}</Label>
                    <Slider id="scale" min={-500} max={500} step={10} value={[config.scale]} onValueChange={([value]) => handleConfigChange('scale', value)} />
                  </div>
                  
                  {/* Chromatic Aberration Controls */}
                  <div className="space-y-4 pt-4 mt-4 border-t border-border">
                      <Label className="text-sm font-medium">Chromatic Aberration</Label>
                      <div className="space-y-2">
                          <Label htmlFor="red">Red: {config.r}</Label>
                          <Slider id="red" min={-100} max={100} step={1} value={[config.r]} onValueChange={([value]) => handleConfigChange('r', value)} disabled={!config.chromaticAberrationEnabled} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="green">Green: {config.g}</Label>
                          <Slider id="green" min={-100} max={100} step={1} value={[config.g]} onValueChange={([value]) => handleConfigChange('g', value)} disabled={!config.chromaticAberrationEnabled} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="blue">Blue: {config.b}</Label>
                          <Slider id="blue" min={-100} max={100} step={1} value={[config.b]} onValueChange={([value]) => handleConfigChange('b', value)} disabled={!config.chromaticAberrationEnabled} />
                      </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handlePresetChange('dock')}>
                Reset to Default
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Global CSS */}
      <style jsx global>{`
        body {
          background-color: hsl(var(--background));
          background-image:
            radial-gradient(at 27% 37%, hsl(var(--primary)) 0px, transparent 50%),
            radial-gradient(at 97% 21%, hsl(var(--secondary)) 0px, transparent 50%),
            radial-gradient(at 52% 99%, hsl(var(--destructive)) 0px, transparent 50%),
            radial-gradient(at 10% 29%, hsl(var(--primary) / 0.5) 0px, transparent 50%),
            radial-gradient(at 97% 96%, hsl(var(--secondary) / 0.5) 0px, transparent 50%),
            radial-gradient(at 33% 50%, hsl(var(--ring)) 0px, transparent 50%),
            radial-gradient(at 79% 53%, hsl(var(--accent)) 0px, transparent 50%);
        }
        .effect {
          box-shadow: 0 0 2px 1px hsl(var(--primary) / 0.1) inset,
                      0 0 10px 4px hsl(var(--primary) / 0.05) inset,
                      0px 4px 16px hsl(var(--foreground) / 0.05),
                      0px 8px 24px hsl(var(--foreground) / 0.05),
                      0px 16px 56px hsl(var(--foreground) / 0.05);
        }
        .placeholder {
          width: 336px;
          height: 96px;
          max-width: 100%;
          position: relative;
          margin-bottom: 200px;
        }
      `}</style>
    </div>
  );
};