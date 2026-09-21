'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Presence } from '@chakra-ui/react';

export type RainShape = 'rain' | 'snow';

export interface RainProps {
  shape?: RainShape;
  color?: string;
  amount?: number;
  speed?: number;
  wind?: number;
  gust?: number;
  dropWidth?: number;
  dropLength?: number;
  opacity?: number;
  paused?: boolean;
  zIndex?: number;
  fullscreen?: boolean;
  vignette?: boolean;
  present?: boolean;
}

interface Particle {
  x: number;
  y: number;
  layer: number;
  jitter: number;
  phase: number;
}

const TAU = Math.PI * 2;

const MAX_PARTICLES = 1200;

const MAX_DPR = 2;

const MAX_FRAME = 0.05;

const LAYERS = [
  { scale: 0.55, alpha: 0.45 },
  { scale: 0.78, alpha: 0.7 },
  { scale: 1, alpha: 1 },
];

type Preset = Required<
  Omit<RainProps, 'shape' | 'paused' | 'zIndex' | 'fullscreen' | 'vignette' | 'present'>
>;

const TRANSITION_RATE = 3.2;

const VIGNETTE =
  'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(15,23,42,0) 0%, rgba(15,23,42,0.05) 45%, rgba(15,23,42,0.16) 75%, rgba(15,23,42,0.3) 100%)';

const PRESETS: Record<RainShape, Preset> = {
  rain: {
    color: '#c3dcff',
    amount: 180,
    speed: 880,
    wind: 150,
    gust: 0.35,
    dropWidth: 1.4,
    dropLength: 20,
    opacity: 0.5,
  },
  snow: {
    color: '#ffffff',
    amount: 130,
    speed: 70,
    wind: 45,
    gust: 0.6,
    dropWidth: 5,
    dropLength: 0,
    opacity: 0.85,
  },
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const Rain = ({
  shape = 'rain',
  paused = false,
  fullscreen = false,
  vignette = false,
  present = true,
  zIndex = fullscreen ? 900 : 2,
  ...overrides
}: RainProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(!fullscreen);
  const particlesRef = useRef<Particle[]>([]);
  const controlsRef = useRef<{ start: () => void; stop: () => void; settle: () => void } | null>(
    null
  );
  const configRef = useRef({ shape, paused, ...PRESETS[shape] });

  const preset = PRESETS[shape];
  const config = {
    shape,
    paused,
    color: overrides.color ?? preset.color,
    amount: Math.min(MAX_PARTICLES, Math.max(0, overrides.amount ?? preset.amount)),
    speed: overrides.speed ?? preset.speed,
    wind: overrides.wind ?? preset.wind,
    gust: overrides.gust ?? preset.gust,
    dropWidth: overrides.dropWidth ?? preset.dropWidth,
    dropLength: overrides.dropLength ?? preset.dropLength,
    opacity: overrides.opacity ?? preset.opacity,
  };

  configRef.current = config;

  useEffect(() => {
    if (!mounted) setMounted(true);
  }, [mounted]);

  useEffect(() => {
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let running = true;

    const seed = (particle: Particle, first: boolean) => {
      particle.x = Math.random() * width;
      particle.y = first ? Math.random() * height : -Math.random() * height * 0.25;
      particle.jitter = 0.7 + Math.random() * 0.6;
      particle.phase = Math.random() * TAU;
    };

    const live = {
      amount: configRef.current.amount,
      speed: configRef.current.speed,
      wind: configRef.current.wind,
      dropLength: configRef.current.dropLength,
      dropWidth: configRef.current.dropWidth,
      opacity: configRef.current.opacity,
    };

    const sync = (target: number) => {
      const particles = particlesRef.current;

      while (particles.length > target) particles.pop();

      while (particles.length < target) {
        const particle: Particle = {
          x: 0,
          y: 0,
          layer: particles.length % LAYERS.length,
          jitter: 1,
          phase: 0,
        };

        seed(particle, true);
        particles.push(particle);
      }
    };

    const settle = () => {
      const target = configRef.current;

      live.amount = target.amount;
      live.speed = target.speed;
      live.wind = target.wind;
      live.dropLength = target.dropLength;
      live.dropWidth = target.dropWidth;
      live.opacity = target.opacity;

      sync(live.amount);
    };

    const blend = (dt: number) => {
      const target = configRef.current;
      const k = Math.min(1, 1 - Math.exp(-dt * TRANSITION_RATE));

      live.amount += (target.amount - live.amount) * k;
      live.speed += (target.speed - live.speed) * k;
      live.wind += (target.wind - live.wind) * k;
      live.dropLength += (target.dropLength - live.dropLength) * k;
      live.dropWidth += (target.dropWidth - live.dropWidth) * k;
      live.opacity += (target.opacity - live.opacity) * k;

      sync(Math.round(live.amount));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      sync(Math.round(live.amount));
    };

    const draw = (dt: number) => {
      const { color, gust } = configRef.current;
      const { dropLength, dropWidth, opacity, speed, wind } = live;
      const isSnow = configRef.current.shape === 'snow';
      const particles = particlesRef.current;

      const windNow = wind * (1 + Math.sin(elapsed * 0.35) * gust);
      const margin = dropLength + 24;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineCap = 'round';

      for (let l = 0; l < LAYERS.length; l++) {
        const layer = LAYERS[l];
        const vx = windNow * layer.scale;
        const vy = speed * layer.scale;

        const magnitude = Math.hypot(vx, vy) || 1;
        const ux = vx / magnitude;
        const uy = vy / magnitude;

        const radius = (dropWidth * layer.scale) / 2;
        const sway = isSnow ? 14 * layer.scale : 0;

        context.globalAlpha = opacity * layer.alpha;
        context.lineWidth = dropWidth * layer.scale;
        context.beginPath();

        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          if (particle.layer !== l) continue;

          particle.x += vx * dt;
          particle.y += vy * dt;

          if (particle.y - margin > height) seed(particle, false);

          if (particle.x < -margin) particle.x += width + margin * 2;
          else if (particle.x > width + margin) particle.x -= width + margin * 2;

          if (isSnow) {
            const x = particle.x + Math.sin(elapsed * 0.8 + particle.phase) * sway;

            context.moveTo(x + radius, particle.y);
            context.arc(x, particle.y, radius, 0, TAU);
          } else {
            const length = dropLength * layer.scale * particle.jitter;

            context.moveTo(particle.x, particle.y);
            context.lineTo(particle.x - ux * length, particle.y - uy * length);
          }
        }

        if (isSnow) context.fill();
        else context.stroke();
      }

      context.globalAlpha = 1;
    };

    const step = (now: number) => {
      if (!running) return;

      const dt = Math.min((now - last) / 1000 || 0, MAX_FRAME);
      last = now;
      elapsed += dt;

      blend(dt);
      draw(dt);
      frame = window.requestAnimationFrame(step);
    };

    const start = () => {
      if (frame || configRef.current.paused) return;

      last = performance.now();
      frame = window.requestAnimationFrame(step);
    };

    const stop = () => {
      if (!frame) return;

      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const handleVisibility = () => (document.hidden ? stop() : start());

    resize();
    settle();

    if (prefersReducedMotion()) {
      draw(0);
      return () => {
        running = false;
      };
    }

    start();
    controlsRef.current = { start, stop, settle };

    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : null;

    observer?.observe(canvas);
    if (!observer) window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      running = false;
      controlsRef.current = null;
      stop();
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [canvas]);

  useEffect(() => {
    if (paused) controlsRef.current?.settle();
  }, [paused, config.amount]);

  useEffect(() => {
    if (paused) controlsRef.current?.stop();
    else controlsRef.current?.start();
  }, [paused]);

  const overlay = (
    <Presence
      present={present}
      lazyMount
      unmountOnExit
      animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
      animationDuration='slowest'
      animationTimingFunction='ease-out'
      position={fullscreen ? 'fixed' : 'absolute'}
      inset='0'
      overflow='hidden'
      borderRadius={fullscreen ? undefined : 'inherit'}
      pointerEvents='none'
      zIndex={zIndex}
      data-pw-id='pomodoro-rain'
      aria-hidden
    >
      <Presence
        present={vignette}
        lazyMount
        unmountOnExit
        animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
        animationDuration='slowest'
        data-pw-id='pomodoro-rain-vignette'
        position='absolute'
        inset='0'
        backgroundImage={VIGNETTE}
      />

      <canvas
        ref={setCanvas}
        style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}
      />
    </Presence>
  );

  if (!fullscreen) return overlay;

  return mounted ? createPortal(overlay, document.body) : null;
};
