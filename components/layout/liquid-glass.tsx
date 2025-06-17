"use client";

import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState, useEffect } from "react";

// Preset configurations
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
    frost: 0.05
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
    frost: 0
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
    frost: 0
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
    frost: 0
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

  // SVG data URI state
  const [dataUri, setDataUri] = useState<string>("");

  // Position state for the glass element
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Build displacement image
  const buildDisplacementImage = () => {
    if (!debugRef.current) return;

    const border = Math.min(config.width, config.height) * (config.border * 0.5);
    const svgContent = `
      <svg class="displacement-image" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
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
        <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="black"></rect>
        <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#red)" />
        <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#blue)" style="mix-blend-mode: ${config.blend}" />
        <rect x="${border}" y="${border}" width="${config.width - border * 2}" height="${config.height - border * 2}" rx="${config.radius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha}" style="filter:blur(${config.blur}px)" />
      </svg>
    `;

    // Create SVG element and serialize it
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgContent;
    const svgEl = tempDiv.querySelector('svg');

    if (svgEl) {
      const serialized = new XMLSerializer().serializeToString(svgEl);
      const encoded = encodeURIComponent(serialized);
      const uri = `data:image/svg+xml,${encoded}`;
      setDataUri(uri);

      // Update debug display
      debugRef.current.innerHTML = svgContent;
    }
  };

  // Update CSS variables and filter attributes
  useEffect(() => {
    buildDisplacementImage();

    // Update CSS variables
    if (glassRef.current) {
      glassRef.current.style.setProperty('--width', `${config.width}px`);
      glassRef.current.style.setProperty('--height', `${config.height}px`);
      glassRef.current.style.setProperty('--radius', `${config.radius}px`);
      glassRef.current.style.setProperty('--frost', config.frost.toString());
    }

    // Update filter attributes
    const feDisplacementMap = document.querySelector('feDisplacementMap');
    const redChannel = document.querySelector('#redchannel');
    const greenChannel = document.querySelector('#greenchannel');
    const blueChannel = document.querySelector('#bluechannel');
    const feGaussianBlur = document.querySelector('feGaussianBlur');
    const feImage = document.querySelector('feImage');

    if (feDisplacementMap) {
      feDisplacementMap.setAttribute('scale', config.scale.toString());
      feDisplacementMap.setAttribute('xChannelSelector', config.x);
      feDisplacementMap.setAttribute('yChannelSelector', config.y);
    }

    if (redChannel) {
      redChannel.setAttribute('scale', (config.scale + config.r).toString());
      redChannel.setAttribute('xChannelSelector', config.x);
      redChannel.setAttribute('yChannelSelector', config.y);
    }

    if (greenChannel) {
      greenChannel.setAttribute('scale', (config.scale + config.g).toString());
      greenChannel.setAttribute('xChannelSelector', config.x);
      greenChannel.setAttribute('yChannelSelector', config.y);
    }

    if (blueChannel) {
      blueChannel.setAttribute('scale', (config.scale + config.b).toString());
      blueChannel.setAttribute('xChannelSelector', config.x);
      blueChannel.setAttribute('yChannelSelector', config.y);
    }

    if (feGaussianBlur) {
      feGaussianBlur.setAttribute('stdDeviation', config.displace.toString());
    }

    if (feImage && dataUri) {
      feImage.setAttribute('href', dataUri);
    }

    // Set document theme
    document.documentElement.dataset.theme = config.theme;
  }, [config, dataUri]);

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
      {/* Background animated elements */}
      {/* <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-xl"
            style={{
              width: Math.random() * 400 + 200,
              height: Math.random() * 400 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div> */}

      {/* Main content */}
      <div ref={constraintsRef} className="relative h-screen p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Liquid Glass Interface
          </h1>
          <Badge variant="secondary" className="backdrop-blur-sm bg-white/10">
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
            background: `rgba(${config.theme === 'light' ? '255, 255, 255' : '0, 0, 0'}, ${config.frost})`,
            opacity: 1,
            position: 'absolute',
            zIndex: 999999,
            backdropFilter: 'url(#filter)'
          }}
          drag
          dragMomentum={false}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          whileDrag={{ scale: 1.02 }}
          dragTransition={{
            power: 0,
            timeConstant: 100,
            modifyTarget: target => Math.round(target / 5) * 5
          }}
        >
          <div className="nav-wrap w-full h-full overflow-hidden" style={{ borderRadius: 'inherit' }}>
            <nav className={`w-full h-full flex items-center justify-center p-2 ${config.icons ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transition: 'opacity 0.26s ease-out' }}>
              <img src="https://assets.codepen.io/605876/finder.png" alt="App icon" className="w-[60px] aspect-square" />
              <img src="https://assets.codepen.io/605876/launch-control.png" alt="App icon" className="w-[60px] aspect-square" />
              <img src="https://assets.codepen.io/605876/safari.png" alt="App icon" className="w-[60px] aspect-square" />
              <img src="https://assets.codepen.io/605876/calendar.png" alt="App icon" className="w-[60px] aspect-square" />
            </nav>
          </div>

          {/* SVG Filter */}
          <svg className="filter absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="filter" colorInterpolationFilters="sRGB">
                <feImage x="0" y="0" width="100%" height="100%" result="map"></feImage>
                <feDisplacementMap in="SourceGraphic" in2="map" id="redchannel" xChannelSelector={config.x} yChannelSelector={config.y} scale={config.scale + config.r} result="dispRed" />
                <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
                <feDisplacementMap in="SourceGraphic" in2="map" id="greenchannel" xChannelSelector={config.x} yChannelSelector={config.y} scale={config.scale + config.g} result="dispGreen" />
                <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
                <feDisplacementMap in="SourceGraphic" in2="map" id="bluechannel" xChannelSelector={config.x} yChannelSelector={config.y} scale={config.scale + config.b} result="dispBlue" />
                <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
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
          className="config-panel fixed bottom-8 right-8 w-[300px] z-[999999]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-xl bg-black/20 border border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex justify-between items-center">
                Configuration
                <Badge variant="outline" className="ml-2">Liquid Glass</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                  <TabsTrigger value="advanced" disabled={config.preset !== 'free'}>Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset">Mode</Label>
                    <Select value={config.preset} onValueChange={handlePresetChange}>
                      <SelectTrigger id="preset">
                        <SelectValue placeholder="Select preset" />
                      </SelectTrigger>
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
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debug"
                      checked={config.debug}
                      onCheckedChange={(checked) => handleConfigChange('debug', checked)}
                    />
                    <Label htmlFor="debug">Debug View</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="icons"
                      checked={config.icons}
                      onCheckedChange={(checked) => handleConfigChange('icons', checked)}
                    />
                    <Label htmlFor="icons">Show Icons</Label>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width: {config.width}px</Label>
                    <Slider
                      id="width"
                      min={80}
                      max={500}
                      step={1}
                      value={[config.width]}
                      onValueChange={([value]) => handleConfigChange('width', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height: {config.height}px</Label>
                    <Slider
                      id="height"
                      min={80}
                      max={500}
                      step={1}
                      value={[config.height]}
                      onValueChange={([value]) => handleConfigChange('height', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Radius: {config.radius}px</Label>
                    <Slider
                      id="radius"
                      min={0}
                      max={100}
                      step={1}
                      value={[config.radius]}
                      onValueChange={([value]) => handleConfigChange('radius', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displace">Blur: {config.displace}</Label>
                    <Slider
                      id="displace"
                      min={0}
                      max={5}
                      step={0.1}
                      value={[config.displace]}
                      onValueChange={([value]) => handleConfigChange('displace', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scale">Scale: {config.scale}</Label>
                    <Slider
                      id="scale"
                      min={-500}
                      max={500}
                      step={10}
                      value={[config.scale]}
                      onValueChange={([value]) => handleConfigChange('scale', value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/20"
                onClick={() => handlePresetChange('dock')}
              >
                Reset to Default
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Floating action button */}
      <motion.div
        className="fixed bottom-8 left-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
      >
        <Button
          size="lg"
          className="rounded-full w-16 h-16 backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 hover:scale-110 transition-transform"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.div>
        </Button>
      </motion.div>

      {/* Global CSS */}
      <style jsx global>{`
        .effect {
          box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.15) inset,
                        0 0 10px 4px rgba(255, 255, 255, 0.1) inset,
                        0px 4px 16px rgba(17, 17, 26, 0.05),
                        0px 8px 24px rgba(17, 17, 26, 0.05),
                        0px 16px 56px rgba(17, 17, 26, 0.05),
                        0px 4px 16px rgba(17, 17, 26, 0.05) inset,
                        0px 8px 24px rgba(17, 17, 26, 0.05) inset,
                        0px 16px 56px rgba(17, 17, 26, 0.05) inset;
        }

        .placeholder {
          width: 336px;
          height: 96px;
          max-width: 100%;
          position: relative;
          margin-bottom: 200px;
        }

        .displacement-debug .label {
          position: absolute;
          left: 50%;
          top: calc(100% + 0.2rem);
        }
      `}</style>
    </div>
  );
};