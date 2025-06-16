"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

// Presets for different glass styles
const presets = {
  dock: {
    width: 336,
    height: 96,
    radius: 16,
    border: 0.07,
    alpha: 0.93,
    lightness: 50,
    blur: 11,
    displace: 0.2,
    scale: -180,
    r: 0,
    g: 10,
    b: 20,
    icons: true,
  },
  pill: {
    width: 200,
    height: 80,
    radius: 40,
    border: 0.07,
    alpha: 0.93,
    lightness: 50,
    blur: 11,
    displace: 0,
    scale: -180,
    r: 0,
    g: 10,
    b: 20,
    icons: false,
  },
  bubble: {
    width: 140,
    height: 140,
    radius: 70,
    border: 0.07,
    alpha: 0.93,
    lightness: 50,
    blur: 11,
    displace: 0,
    scale: -180,
    r: 0,
    g: 10,
    b: 20,
    icons: false,
  },
  free: {
    width: 140,
    height: 280,
    radius: 80,
    border: 0.15,
    alpha: 0.74,
    lightness: 60,
    blur: 10,
    displace: 0,
    scale: -300,
    r: 0,
    g: 10,
    b: 20,
    icons: false,
  },
};

const LiquidGlassEffect = () => {
  const [config, setConfig] = useState(presets.dock);
  const [preset, setPreset] = useState("dock");

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    setConfig(presets[newPreset as keyof typeof presets]);
  };

  const displacementImage = useMemo(() => {
    const border = Math.min(config.width, config.height) * (config.border * 0.5);
    const svg = `
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
        <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#blue)" style="mix-blend-mode: difference" />
        <rect x="${border}" y="${border}" width="${config.width - border * 2}" height="${config.height - border * 2}" rx="${config.radius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha})" style="filter:blur(${config.blur}px)" />
      </svg>
    `;
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml,${encoded}`;
  }, [config]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--output-blur",
      `${config.displace}px`
    );
  }, [config.displace]);

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        className="effect absolute top-1/4 left-1/4 cursor-grab"
        style={{
          width: config.width,
          height: config.height,
          borderRadius: config.radius,
          backdropFilter: `url(#filter)`,
          WebkitBackdropFilter: `url(#filter)`,
        }}
      >
        <div
          className="nav-wrap"
          style={{ display: config.icons ? "flex" : "none" }}
        >
          <nav className="flex justify-center items-center gap-4 p-4">
            <img
              src="https://assets.codepen.io/605876/finder.png"
              className="w-12 h-12"
            />
            <img
              src="https://assets.codepen.io/605876/launch-control.png"
              className="w-12 h-12"
            />
            <img
              src="https://assets.codepen.io/605876/safari.png"
              className="w-12 h-12"
            />
            <img
              src="https://assets.codepen.io/605876/calendar.png"
              className="w-12 h-12"
            />
          </nav>
        </div>
      </motion.div>

      <svg className="filter absolute w-0 h-0">
        <defs>
          <filter id="filter" colorInterpolationFilters="sRGB">
            <feImage
              x="0"
              y="0"
              width="100%"
              height="100%"
              href={displacementImage}
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              id="redchannel"
              scale={config.scale + config.r}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              id="greenchannel"
              scale={config.scale + config.g}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              id="bluechannel"
              scale={config.scale + config.b}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur in="output" stdDeviation={config.displace} />
          </filter>
        </defs>
      </svg>

      <div className="fixed bottom-4 right-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Customize Liquid Glass</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preset-select" className="text-right">
                  Mode
                </Label>
                <Select onValueChange={handlePresetChange} value={preset}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dock">Dock</SelectItem>
                    <SelectItem value="pill">Pill</SelectItem>
                    <SelectItem value="bubble">Bubble</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {preset === "free" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="width-slider" className="text-right">
                      Width
                    </Label>
                    <Slider
                      id="width-slider"
                      min={80}
                      max={500}
                      step={1}
                      value={[config.width]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, width: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="height-slider" className="text-right">
                      Height
                    </Label>
                    <Slider
                      id="height-slider"
                      min={80}
                      max={500}
                      step={1}
                      value={[config.height]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, height: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="radius-slider" className="text-right">
                      Radius
                    </Label>
                    <Slider
                      id="radius-slider"
                      min={0}
                      max={250}
                      step={1}
                      value={[config.radius]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, radius: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="border-slider" className="text-right">
                      Border
                    </Label>
                    <Slider
                      id="border-slider"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[config.border]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, border: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alpha-slider" className="text-right">
                      Alpha
                    </Label>
                    <Slider
                      id="alpha-slider"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[config.alpha]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, alpha: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lightness-slider" className="text-right">
                      Lightness
                    </Label>
                    <Slider
                      id="lightness-slider"
                      min={0}
                      max={100}
                      step={1}
                      value={[config.lightness]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, lightness: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="blur-slider" className="text-right">
                      Input Blur
                    </Label>
                    <Slider
                      id="blur-slider"
                      min={0}
                      max={20}
                      step={1}
                      value={[config.blur]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, blur: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="displace-slider" className="text-right">
                      Output Blur
                    </Label>
                    <Slider
                      id="displace-slider"
                      min={0}
                      max={5}
                      step={0.1}
                      value={[config.displace]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, displace: val })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="scale-slider" className="text-right">
                      Scale
                    </Label>
                    <Slider
                      id="scale-slider"
                      min={-1000}
                      max={1000}
                      step={1}
                      value={[config.scale]}
                      onValueChange={([val]) =>
                        setConfig({ ...config, scale: val })
                      }
                      className="col-span-3"
                    />
                  </div>

                  <h4 className="col-span-4 text-center font-semibold mt-4">
                    Chromatic Aberration
                  </h4>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="red-slider" className="text-right">
                      Red
                    </Label>
                    <Slider
                      id="red-slider"
                      min={-100}
                      max={100}
                      step={1}
                      value={[config.r]}
                      onValueChange={([val]) => setConfig({ ...config, r: val })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="green-slider" className="text-right">
                      Green
                    </Label>
                    <Slider
                      id="green-slider"
                      min={-100}
                      max={100}
                      step={1}
                      value={[config.g]}
                      onValueChange={([val]) => setConfig({ ...config, g: val })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="blue-slider" className="text-right">
                      Blue
                    </Label>
                    <Slider
                      id="blue-slider"
                      min={-100}
                      max={100}
                      step={1}
                      value={[config.b]}
                      onValueChange={([val]) => setConfig({ ...config, b: val })}
                      className="col-span-3"
                    />
                  </div>

                  <div className="flex items-center space-x-2 col-span-4 justify-center mt-4">
                    <Switch
                      id="icons-switch"
                      checked={config.icons}
                      onCheckedChange={(val) =>
                        setConfig({ ...config, icons: val })
                      }
                    />
                    <Label htmlFor="icons-switch">Show Icons</Label>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default LiquidGlassEffect;