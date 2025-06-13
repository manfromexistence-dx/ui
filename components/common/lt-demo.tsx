"use client";

import { lt, lta, preloadCurrentLocale } from "@/lib/utils";
import { useEffect, useState } from "react";

// Client-side component with proper initialization
export function LtDemo() {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [asyncValues, setAsyncValues] = useState<Record<string, string>>({});

  // Load locale data on component mount
  useEffect(() => {
    setMounted(true);

    // Preload the locale data for synchronous lt() calls
    preloadCurrentLocale().then(() => {
      setLoaded(true);

      // Example of async locale fetching - good for SSR or guaranteed fresh data
      const loadAsyncExamples = async () => {
        const homeValue = await lta("home", "Home Default");
        const aboutValue = await lta("about", "About Default");
        const headlineValue = await lta("headline", "Headline Default");
        const descriptionValue = await lta("now-description", "Now Description Default");

        setAsyncValues({
          home: homeValue,
          about: aboutValue,
          headline: headlineValue,
          "now-description": descriptionValue,
        });
      };

      loadAsyncExamples();
    });
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold">lt() Function Demo</h3>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h3 className="font-semibold">
        lt() Function Demo {!loaded && "(Loading...)"}{" "}
      </h3>

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Client-Side Usage (Synchronous)</h4>
          <div className="space-y-2 text-sm pl-2">
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("home")</code>
              <p className="mt-1">→ {lt("home")}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("about")</code>
              <p className="mt-1">→ {lt("about")}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("headline")</code>
              <p className="mt-1">→ {lt("headline")}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("now-description")</code>
              <p className="mt-1">→ {lt("now-description")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-medium">Server-Compatible Usage (Async)</h4>
          <div className="space-y-2 text-sm pl-2">
            <div>
              <code className="bg-muted px-2 py-1 rounded">await lta("home")</code>
              <p className="mt-1">→ {asyncValues.home || "Loading..."}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">await lta("about")</code>
              <p className="mt-1">→ {asyncValues.about || "Loading..."}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">await lta("headline")</code>
              <p className="mt-1">→ {asyncValues.headline || "Loading..."}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">await lta("now-description")</code>
              <p className="mt-1">→ {asyncValues["now-description"] || "Loading..."}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-2 bg-muted/50 rounded text-xs">
          <div>
            Current locale:{" "}
            {typeof window !== "undefined"
              ? window.location.pathname.split("/")[1] || "en"
              : "unknown"}
          </div>
        </div>
      </div>
    </div>
  );
}
