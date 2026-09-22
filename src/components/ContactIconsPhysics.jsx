import { useEffect, useRef, useCallback, useState } from "react";
import { MessageCircle, FileText, Copy, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Bug fix: these three custom SVGs spread `{...props}` straight onto <svg>,
// but `size={20}` isn't a real SVG attribute - only `width`/`height` are.
// So the `size` prop was silently doing nothing, and a bare <svg> with no
// width/height falls back to the browser default of 300x150px. Inside a
// 60px circle with no overflow clipping on the old markup, that's why the
// icon looked "not loaded" - it was rendering, just enormously oversized.
// Destructuring `size` and mapping it to width/height (the way lucide-react's
// own icons already do internally) fixes it at every screen size.
function LinkedinIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="11" x2="8" y2="17" />
      <circle cx="8" cy="7.2" r="0.4" fill="currentColor" />
      <path d="M12 17v-3.5c0-1.4 1-2.3 2.2-2.3s2 .9 2 2.3V17" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </svg>
  );
}

function InstagramIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" />
    </svg>
  );
}

function GithubIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 015 0c1.9-1.29 2.74-1.02 2.74-1.02.56 1.38.21 2.4.1 2.65.65.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.57.69.48A10 10 0 0012 2z" />
    </svg>
  );
}

const icons = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/YOUR-HANDLE/", Icon: LinkedinIcon },
  { label: "Instagram", href: "https://instagram.com/YOUR-HANDLE", Icon: InstagramIcon },
  { label: "GitHub", href: "https://github.com/YOUR-HANDLE", Icon: GithubIcon },
  { label: "WhatsApp", href: "https://wa.me/YOUR-NUMBER", Icon: MessageCircle },
  { label: "Resume", href: "/Resume_Nauha.pdf", Icon: FileText },
];

const CONTACT_EMAIL = "fathimanauhap03@gmail.com";
const CHIP_SIZE = 60;
const FLOOR_INSET = 22; // keeps resting icons off the card's rounded bottom edge

function usesReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ContactSection() {
  const { theme } = useTheme();
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const bodiesRef = useRef([]);
  const elsRef = useRef([]);
  const zCounterRef = useRef(1);
  const dragRef = useRef({ active: null, lastPos: null, startPos: null, lastTime: 0, vx: 0, vy: 0, movedDist: 0 });
  const lastTapRef = useRef({});
  const [copied, setCopied] = useState(false);
  const [reduceMotion] = useState(usesReducedMotion);

  // Read live inside the animation loop instead of being a dependency of the
  // init effect below - see the note next to that effect for why.
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  function handleCopyEmail() {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }

  // Runs once on mount, not on every theme toggle. The old version listed
  // `theme` as a dependency purely so the resting border/shadow colors
  // inside `step()` stayed current - but that also tore down and rebuilt
  // the whole simulation on every toggle, so every chip dropped from the
  // top again mid-conversation. `themeRef` above lets the loop read the
  // live theme without needing to restart.
  //
  // The physics itself is ported from the marquee-to-physics component:
  // real elapsed time (`dt`, from the rAF timestamp) instead of a fixed
  // per-frame increment, so the fall speed and drag feel identical on a
  // 60Hz laptop and a 120Hz phone rather than device-dependent.
  useEffect(() => {
    if (reduceMotion) {
      // Static, accessible fallback: lay the chips out in a plain row
      // immediately, no falling motion at all.
      const stage = stageRef.current;
      if (stage) {
        const W = stage.clientWidth || 300;
        const gap = 14;
        const totalW = icons.length * CHIP_SIZE + (icons.length - 1) * gap;
        let x = Math.max(0, (W - totalW) / 2);
        icons.forEach((_, i) => {
          const el = elsRef.current[i];
          if (el) el.style.transform = `translate3d(${x}px, ${stage.clientHeight - CHIP_SIZE - FLOOR_INSET}px, 0)`;
          x += CHIP_SIZE + gap;
        });
      }
      return;
    }

    let cancelled = false;
    let rafId;
    let lastTs = null;

    function tryInit() {
      if (cancelled) return;
      const stage = stageRef.current;
      if (!stage || stage.clientWidth === 0 || stage.clientHeight === 0) {
        rafId = requestAnimationFrame(tryInit);
        return;
      }
      const W = stage.clientWidth;

      bodiesRef.current = icons.map((ic, i) => ({
        ...ic,
        x: 10 + Math.random() * Math.max(1, W - (CHIP_SIZE + 20)),
        y: -60 - i * 55,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0,
        angle: (Math.random() - 0.5) * 30,
        angularVel: (Math.random() - 0.5) * 2,
        size: CHIP_SIZE,
        dragging: false,
        hovering: false,
        z: i + 1,
      }));
      zCounterRef.current = bodiesRef.current.length + 1;

      const GRAVITY = 0.22;
      const MAX_FALL_SPEED = 13;
      const FRICTION = 0.985;
      const ANGULAR_FRICTION = 0.96;
      const REST = 0.3;

      function step(ts) {
        if (lastTs == null) lastTs = ts;
        const dt = Math.min((ts - lastTs) / (1000 / 60), 3);
        lastTs = ts;

        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const floor = h - FLOOR_INSET;
        const list = bodiesRef.current;
        const dark = themeRef.current === "dark";

        list.forEach((b) => {
          if (b.dragging) return;
          b.vy = Math.min(b.vy + GRAVITY * dt, MAX_FALL_SPEED);
          b.vx *= Math.pow(FRICTION, dt);
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.angle += b.angularVel * dt;
          b.angularVel *= Math.pow(ANGULAR_FRICTION, dt);

          if (b.y + b.size > floor) {
            b.y = floor - b.size;
            b.vy = -Math.abs(b.vy) * REST;
            b.angularVel += (Math.random() - 0.5) * 1.2;
            if (Math.abs(b.vy) < 0.6) b.vy = 0;
          }
          if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * REST; }
          if (b.x + b.size > w) { b.x = w - b.size; b.vx = -Math.abs(b.vx) * REST; }
        });

        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j];
            const dx = (b.x + b.size / 2) - (a.x + a.size / 2);
            const dy = (b.y + b.size / 2) - (a.y + a.size / 2);
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = (a.size + b.size) / 2;
            if (dist < minDist) {
              const overlap = Math.min(((minDist - dist) / 2) * 0.2 * dt, 1.5);
              const nx = dx / dist, ny = dy / dist;
              if (!a.dragging) { a.x -= nx * overlap; a.y -= ny * overlap; }
              if (!b.dragging) { b.x += nx * overlap; b.y += ny * overlap; }
            }
          }
        }

        list.forEach((b, i) => {
          const el = elsRef.current[i];
          if (!el) return;
          const active = b.dragging || b.hovering;
          const scale = active ? 1.18 : 1;
          el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.angle}deg) scale(${scale})`;
          el.style.zIndex = b.z;
          el.style.boxShadow = active ? "0 10px 24px rgba(0,0,0,0.22)" : "0 3px 10px rgba(0,0,0,0.08)";
          el.style.borderColor = active
            ? dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"
            : dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
        });

        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }
    tryInit();
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, [reduceMotion]);

  const getPoint = useCallback((e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  const onPointerDown = useCallback((e, index) => {
    const body = bodiesRef.current[index];
    if (!body) return;
    body.dragging = true;
    body.hovering = true;
    zCounterRef.current += 1;
    body.z = zCounterRef.current;
    const p = getPoint(e);
    dragRef.current.active = body;
    dragRef.current.lastPos = p;
    dragRef.current.startPos = p;
    dragRef.current.lastTime = performance.now();
    dragRef.current.movedDist = 0;
  }, [getPoint]);

  const onPointerMove = useCallback((e) => {
    const body = dragRef.current.active;
    if (!body) return;
    if (e.cancelable) e.preventDefault();
    const p = getPoint(e);
    const now = performance.now();
    const dt = Math.max(now - dragRef.current.lastTime, 1);
    // Same velocity formula regardless of mouse or touch, boosted slightly so
    // the "throw" feels equally punchy on both desktop and mobile
    dragRef.current.vx = dragRef.current.vx * 0.5 + ((p.x - dragRef.current.lastPos.x) / dt * 18) * 0.5;
    dragRef.current.vy = dragRef.current.vy * 0.5 + ((p.y - dragRef.current.lastPos.y) / dt * 18) * 0.5;
    body.x = p.x - body.size / 2;
    body.y = p.y - body.size / 2;
    dragRef.current.movedDist = Math.hypot(p.x - dragRef.current.startPos.x, p.y - dragRef.current.startPos.y);
    dragRef.current.lastPos = p;
    dragRef.current.lastTime = now;
  }, [getPoint]);

  // Explicitly clears every drag-related flag the instant the pointer/finger
  // lifts, no matter how the gesture ended (mouseup, touchend, touchcancel).
  function releaseActiveBody() {
    const body = dragRef.current.active;
    if (!body) return;
    body.dragging = false;
    body.hovering = false;
    body.vx = dragRef.current.vx;
    body.vy = dragRef.current.vy;
    body.angularVel = dragRef.current.vx * 0.5;
    dragRef.current.active = null;
    dragRef.current.vx = 0;
    dragRef.current.vy = 0;
  }

  useEffect(() => {
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("mouseup", releaseActiveBody);
    window.addEventListener("touchend", releaseActiveBody);
    window.addEventListener("touchcancel", releaseActiveBody);
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("mouseup", releaseActiveBody);
      window.removeEventListener("touchend", releaseActiveBody);
      window.removeEventListener("touchcancel", releaseActiveBody);
    };
  }, [onPointerMove]);

  useEffect(() => {
    const handlers = [];
    icons.forEach((_, i) => {
      const el = elsRef.current[i];
      if (!el) return;
      const handler = (e) => onPointerDown(e, i);
      el.addEventListener("touchstart", handler, { passive: false });
      handlers.push({ el, handler });
    });
    return () => handlers.forEach(({ el, handler }) => el.removeEventListener("touchstart", handler));
  }, [onPointerDown]);

  // Double-click (desktop) / double-tap (mobile) is what actually navigates -
  // a single press is reserved for picking the chip up to drag, matching the
  // reference (its links are real target="_blank" anchors too).
  function openLink(href) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function handleTouchEndForTap(index, href) {
    if (dragRef.current.movedDist > 8) {
      lastTapRef.current[index] = 0;
      return;
    }
    const now = Date.now();
    if (now - (lastTapRef.current[index] || 0) < 350) {
      openLink(href);
      lastTapRef.current[index] = 0;
    } else {
      lastTapRef.current[index] = now;
    }
  }

  return (
    <div className="relative px-4 py-16">
      {/* The card is the fall's actual boundary now (`overflow-hidden`) -
          chips drop in from the card's own top edge and are clipped there,
          instead of spilling out over whatever sits above this section. */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:py-14 text-center max-w-3xl mx-auto transition-colors duration-500"
        style={{
          background: theme === "dark" ? "#151515" : "#f2f2f0",
          border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div className="relative z-10">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-black dark:text-white mb-6">
            Looking for the right <span className="italic font-thin-serif">project</span> to build.
          </h2>

          {/* Copy-to-clipboard email, with a visible affordance + confirmation */}
          <button
            onClick={handleCopyEmail}
            aria-label={copied ? "Email copied" : `Copy email address ${CONTACT_EMAIL}`}
            className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "#fff",
              color: "#111",
              border: theme === "dark" ? "none" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {CONTACT_EMAIL}
            <span className="grid place-items-center w-4 h-4 shrink-0">
              {copied ? <Check size={15} strokeWidth={2.3} /> : <Copy size={14} strokeWidth={2} className="opacity-60" />}
            </span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Email address copied to clipboard" : ""}
          </span>

          {/* Invisible spacer - reserves the resting room for the icons below
              the button so the card has the right height; the actual chips
              live in the full-card stage layered behind this content. */}
          <div className="mt-8 h-[220px] sm:h-[110px] w-full" aria-hidden="true" />
        </div>

        {/* Physics stage - covers the entire card (not just the area below
            the button), clipped by the card's own `overflow-hidden`, so
            chips visibly fall in from the card's top edge and can pass in
            front of the heading on the way down, the way the reference
            does it, rather than appearing already-settled. */}
        <div
          ref={stageRef}
          aria-label="Draggable contact links"
          className="absolute inset-0 z-20 pointer-events-none"
        >
          {icons.map((ic, i) => (
             <a
              key={ic.label}
              href={ic.href}
              target="_blank"
              rel="noopener noreferrer"
              ref={(el) => { elsRef.current[i] = el; }}
              onMouseDown={(e) => onPointerDown(e, i)}
              onMouseEnter={() => { if (bodiesRef.current[i]) bodiesRef.current[i].hovering = true; }}
              onMouseLeave={() => {
                if (bodiesRef.current[i] && dragRef.current.active !== bodiesRef.current[i]) {
                  bodiesRef.current[i].hovering = false;
                }
              }}
              onClick={(e) => e.preventDefault()}
              onDoubleClick={() => openLink(ic.href)}
              onTouchEnd={() => handleTouchEndForTap(i, ic.href)}
              aria-label={ic.label}
              title={ic.label}
              className="absolute top-0 left-0 rounded-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing pointer-events-auto"
              style={{
                width: CHIP_SIZE,
                height: CHIP_SIZE,
                touchAction: "none",
                background: theme === "dark" ? "#1c1c1c" : "#fff",
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
                color: theme === "dark" ? "#fff" : "#111",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                willChange: "transform",
              }}
            >
              <ic.Icon size={22} strokeWidth={1.8} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}