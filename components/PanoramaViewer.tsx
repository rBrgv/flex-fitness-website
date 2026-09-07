"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    pannellum?: {
      viewer: (
        elementId: string,
        config: Record<string, unknown>
      ) => { destroy: () => void };
    };
  }
}

export function PanoramaViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    function init() {
      if (cancelled || !window.pannellum || !containerRef.current) return;
      viewerRef.current?.destroy();
      viewerRef.current = window.pannellum.viewer(containerRef.current.id, {
        type: "equirectangular",
        panorama: src,
        autoLoad: true,
        compass: false,
        showZoomCtrl: true,
        hfov: 110,
      });
    }

    if (window.pannellum) {
      init();
    } else {
      const check = setInterval(() => {
        if (window.pannellum) {
          clearInterval(check);
          init();
        }
      }, 100);
      return () => {
        cancelled = true;
        clearInterval(check);
      };
    }

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
    };
  }, [src]);

  return <div id="pannellum-viewer" ref={containerRef} className="h-full w-full" />;
}
