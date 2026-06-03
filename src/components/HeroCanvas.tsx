'use client';

import { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipCanvas =
    prefersReduced ||
    (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 2);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigator.hardwareConcurrency <= 2
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let frameId = 0;
    let renderer: import('three').WebGLRenderer | null = null;
    let cancelled = false;
    let removeResize: (() => void) | undefined;

    const init = async () => {
      const THREE = await import('three');
      if (cancelled || !canvasRef.current) {
        return;
      }

      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;

      const webglRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer = webglRenderer;
      webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      webglRenderer.setClearColor(0x0d1117);
      webglRenderer.setSize(width, height);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        100,
      );
      camera.position.z = 5;

      const count = 300;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = Math.random() * 10 - 5;
        positions[i * 3 + 1] = Math.random() * 10 - 5;
        positions[i * 3 + 2] = Math.random() * -30;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
      );

      const material = new THREE.PointsMaterial({
        color: 0x39d353,
        size: 0.02,
        transparent: true,
        opacity: 0.6,
      });

      scene.add(new THREE.Points(geometry, material));

      const onResize = () => {
        const el = canvas.parentElement;
        const w = el?.clientWidth ?? window.innerWidth;
        const h = el?.clientHeight ?? window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        webglRenderer.setSize(w, h);
      };

      window.addEventListener('resize', onResize);
      removeResize = () => window.removeEventListener('resize', onResize);

      const animate = () => {
        if (cancelled) {
          return;
        }
        frameId = requestAnimationFrame(animate);

        const pos = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
          pos[i * 3 + 1] += 0.003;
          if (pos[i * 3 + 1] < -5) {
            pos[i * 3 + 1] = 5;
          }
        }
        geometry.attributes.position.needsUpdate = true;
        webglRenderer.render(scene, camera);
      };

      animate();
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      removeResize?.();
      renderer?.dispose();
    };
  }, []);

  if (skipCanvas) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      aria-hidden="true"
    />
  );
}
