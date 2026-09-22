import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Code2,
  Layers,
  Atom,
  Braces,
  Globe,
  Terminal,
  GitBranch,
  PenTool,
  ShoppingBag,
  Coffee,
  MousePointer2,
  CircleCheck,
  Sparkle,
  Sparkles,
  Share2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// A trimmed, "wanted skills only" list - easy to add/remove, one flat array
// used everywhere (marquee + physics, mobile + desktop). Colors are the
// reference site's solid fills, pulled via computed-style inspection.
// ---------------------------------------------------------------------------
const PILLS = [
  { label: "Frontend Developer", color: "163, 217, 255", icon: Code2 },
  { label: "Full-Stack Developer", color: "255, 137, 74", icon: Layers },
  { label: "React", color: "217, 201, 255", icon: Atom },
  { label: "JavaScript", color: "253, 207, 0", icon: Braces },
  { label: "UI / UX Design", color: "251, 207, 232", icon: PenTool },
  { label: "WordPress", color: "90, 219, 165", icon: Globe },
  { label: "Python", color: "217, 249, 157", icon: Terminal },
  { label: "Git", color: "163, 217, 255", icon: GitBranch },
  { label: "Shopify Expert", color: "255, 137, 74", icon: ShoppingBag },
];

// Icon-only accent circles - now part of the marquee itself (not physics-only)
// so they scroll inline with the pills, the way the reference intersperses them.
const BADGES = [
  { icon: Coffee, color: "217, 201, 255", size: 44 },
  { icon: MousePointer2, color: "255, 137, 74", size: 40 },
  { icon: CircleCheck, color: "163, 217, 255", size: 42 },
  { icon: Sparkle, color: "253, 207, 0", size: 36 },
  { icon: Sparkles, color: "244, 244, 245", size: 40 },
  { icon: Share2, color: "24, 24, 27", size: 40, invert: true },
];

// Interleave badges through the pills (roughly one badge every 3 pills) so
// the marquee reads as one rhythmic strip, not "pills, then badges after".
function buildTrack() {
  const track = [];
  let bi = 0;
  PILLS.forEach((p, i) => {
    track.push({ ...p, kind: "pill", key: `pill-${p.label}` });
    if ((i + 1) % 3 === 0 && bi < BADGES.length) {
      track.push({ ...BADGES[bi], kind: "badge", key: `badge-${bi}` });
      bi += 1;
    }
  });
  while (bi < BADGES.length) {
    track.push({ ...BADGES[bi], kind: "badge", key: `badge-${bi}` });
    bi += 1;
  }
  return track;
}
const TRACK = buildTrack();
const MARQUEE_DURATION_S = 26; // must match the `marquee-left` keyframe duration below

export default function MarqueeToPhysics() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mode, setMode] = useState("marquee");
  const [reducedMotion, setReducedMotion] = useState(false);
  // Tracked once, in render, and reused for marquee, physics-init AND the
  // physics render - previously the "shrink on small screens" factor only
  // existed inside tryInit()'s math (used for collision sizing) while the
  // badge's actual on-screen style always used the full `p.size`, and pills
  // had no small-screen shrink at all. That's why the marquee looked bigger
  // than what dropped: the two modes were reading from different sources of
  // truth. Now there's exactly one.
  const [smallScreen, setSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 480 : false
  );
  const rootRef = useRef(null);
  const rowRef = useRef(null);
  const stageRef = useRef(null);
  const bodiesRef = useRef([]);
  const elsRef = useRef([]);
  const pillRefs = useRef([]);
  const capturedRef = useRef({});
  // Apple's "velocity handoff": a gesture (or here, an ambient motion) that
  // gets interrupted should hand its momentum to whatever takes over, not
  // reset to a standstill. Right before freezing the marquee we measure how
  // fast it was actually moving and carry that speed into each chip's
  // initial fall velocity, so the strip visibly keeps drifting left as it
  // drops instead of just stopping dead and dropping straight down.
  const marqueeVxRef = useRef(0);
  const zCounterRef = useRef(1);
  const dragRef = useRef({ active: null, lastPos: null, lastTime: 0, vx: 0, vy: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Same breakpoint used everywhere sizing is decided (marquee, physics
  // init, physics render), so rotating a phone or resizing never leaves one
  // mode reading a stale size.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    setSmallScreen(mq.matches);
    const onChange = (e) => setSmallScreen(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // The one place badge diameter is computed - marquee, physics init and
  // physics render all call this instead of each doing their own math.
  const badgeSize = useCallback(
    (p) => (smallScreen ? Math.round(p.size * 0.72) : p.size),
    [smallScreen]
  );

  // Trigger: capture each pill's REAL current position before switching modes
  useEffect(() => {
    function onScroll() {
      if (mode !== "marquee" || !rootRef.current) return;
      const top = rootRef.current.getBoundingClientRect().top;
      if (top <= 0) {
        const stageRect = rootRef.current.getBoundingClientRect();
        const positions = {};
        TRACK.forEach((p) => {
          if (!p.label) return;
          const candidates = rootRef.current.querySelectorAll(`[data-label="${CSS.escape(p.label)}"]`);
          const visibleEl = Array.from(candidates).find((el) => el.offsetParent !== null);
          if (visibleEl) {
            const r = visibleEl.getBoundingClientRect();
            positions[p.label] = {
              x: r.left - stageRect.left,
              y: r.top - stageRect.top,
              w: r.width,
              h: r.height,
            };
          }
        });
        capturedRef.current = positions;

        // Measure the strip's actual speed right before freezing it: the
        // track is rendered twice back-to-back and the keyframe scrolls
        // exactly one copy's width over MARQUEE_DURATION_S, so
        // (rendered width / 2) / duration is its true px/s.
        if (rowRef.current) {
          const trackWidthPx = rowRef.current.scrollWidth / 2;
          const speedPxPerSec = trackWidthPx / MARQUEE_DURATION_S;
          marqueeVxRef.current = -(speedPxPerSec / 60); // px per dt-unit (dt=1 @ 60fps), moving left
        }

        setMode("physics");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  // Physics init - retries until the stage actually has real dimensions.
  // No rotation, no rigid-body tumbling - just a clean, predictable fall
  // with gentle non-overlapping separation, matched to real elapsed time
  // so the speed is identical on a 60Hz laptop and a 120Hz phone.
  useEffect(() => {
    if (mode !== "physics") return;
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
      bodiesRef.current = TRACK.map((p, i) => {
        const captured = p.label ? capturedRef.current[p.label] : null;
        const bSize = p.kind === "badge" ? badgeSize(p) : null;
        const w = captured ? captured.w : p.kind === "badge" ? bSize : 90 + p.label.length * 6;
        const h = captured ? captured.h : p.kind === "badge" ? bSize : 36;
        return {
          ...p,
          x: captured ? captured.x : 40 + Math.random() * Math.max(1, W - (w + 40)),
          y: captured ? captured.y : -80 - Math.random() * 500,
          // Carry over the marquee's real scroll speed (with a touch of per-
          // chip variance) instead of resetting to near-zero, so the strip
          // reads as one continuous motion rather than a hard stop-then-drop.
          vx: marqueeVxRef.current + (Math.random() - 0.5) * 0.5,
          vy: 0,
          w,
          h,
          dragging: false,
          z: i + 1,
        };
      });
      zCounterRef.current = bodiesRef.current.length + 1;

      const GRAVITY = 0.22; // px per ms^2-ish, scaled by dt below - tuned for a brisk, satisfying fall
      const MAX_FALL_SPEED = 13;
      const FRICTION = 0.985;
      const REST = 0.24;

      function step(ts) {
        if (lastTs == null) lastTs = ts;
        // dt = 1 at a perfect 60fps frame; keeps speed identical across refresh rates
        const dt = Math.min((ts - lastTs) / (1000 / 60), 3);
        lastTs = ts;

        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const list = bodiesRef.current;

        list.forEach((b) => {
          if (b.dragging) return;
          b.vy = Math.min(b.vy + GRAVITY * dt, MAX_FALL_SPEED);
          b.vx *= Math.pow(FRICTION, dt);
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          if (b.y + b.h > h) {
            b.y = h - b.h;
            b.vy = -Math.abs(b.vy) * REST;
            if (Math.abs(b.vy) < 0.5) b.vy = 0;
          }
          if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * REST; }
          if (b.x + b.w > w) { b.x = w - b.w; b.vx = -Math.abs(b.vx) * REST; }
        });

        // Gentle, capped separation - keeps pills readable and non-overlapping,
        // no single-frame jumps even when densely packed.
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b2 = list[j];
            const dx = (b2.x + b2.w / 2) - (a.x + a.w / 2);
            const dy = (b2.y + b2.h / 2) - (a.y + a.h / 2);
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = (a.w + b2.w) / 4;
            if (dist < minDist) {
              const overlap = Math.min(((minDist - dist) / 2) * 0.15 * dt, 1.5);
              const nx = dx / dist, ny = dy / dist;
              if (!a.dragging) { a.x -= nx * overlap; a.y -= ny * overlap; }
              if (!b2.dragging) { b2.x += nx * overlap; b2.y += ny * overlap; }
            }
          }
        }

        list.forEach((b, i) => {
          const el = elsRef.current[i];
          if (el) el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
        });

        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    tryInit();
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, [mode, badgeSize]);

  const getPoint = useCallback((e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  const onPointerDown = useCallback((e, index) => {
    e.preventDefault();
    const body = bodiesRef.current[index];
    if (!body) return;
    body.dragging = true;
    zCounterRef.current += 1;
    body.z = zCounterRef.current;
    const el = elsRef.current[index];
    if (el) el.style.zIndex = body.z;
    dragRef.current.active = body;
    const p = getPoint(e);
    dragRef.current.lastPos = p;
    dragRef.current.lastTime = performance.now();
  }, [getPoint]);

  const onPointerMove = useCallback((e) => {
    const body = dragRef.current.active;
    if (!body) return;
    if (e.cancelable) e.preventDefault();
    const p = getPoint(e);
    const now = performance.now();
    const dt = Math.max(now - dragRef.current.lastTime, 1);
    dragRef.current.vx = dragRef.current.vx * 0.5 + ((p.x - dragRef.current.lastPos.x) / dt * 16) * 0.5;
    dragRef.current.vy = dragRef.current.vy * 0.5 + ((p.y - dragRef.current.lastPos.y) / dt * 16) * 0.5;
    body.x = p.x - body.w / 2;
    body.y = p.y - body.h / 2;
    dragRef.current.lastPos = p;
    dragRef.current.lastTime = now;
  }, [getPoint]);

  function onPointerUp() {
    const body = dragRef.current.active;
    if (!body) return;
    body.dragging = false;
    body.vx = dragRef.current.vx;
    body.vy = dragRef.current.vy;
    dragRef.current.active = null;
  }

  useEffect(() => {
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [onPointerMove]);

  // Attach touchstart NATIVELY (bypassing React's passive synthetic event)
  // so preventDefault() actually works and the browser doesn't hijack the
  // gesture as a page scroll before the drag can start.
  useEffect(() => {
    if (mode !== "physics") return;
    const handlers = [];
    TRACK.forEach((p, i) => {
      const el = pillRefs.current[i];
      if (!el) return;
      const handler = (e) => onPointerDown(e, i);
      el.addEventListener("touchstart", handler, { passive: false });
      handlers.push({ el, handler });
    });
    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener("touchstart", handler));
    };
  }, [mode, onPointerDown]);

  // Solid-fill surface, matched to the reference: same vivid background in
  // both themes. Only the text/icon color adapts - near-black in light mode,
  // a soft zinc gradient in dark mode so it stays legible without turning
  // the chip into a glow.
  const surface = useCallback((rgb, opts = {}) => {
    if (opts.invert) {
      return {
        background: "rgb(24, 24, 27)",
        color: isDark ? "#e4e4e7" : "#fafafa",
        boxShadow: "0 10px 22px -8px rgba(0,0,0,0.4)",
      };
    }
    return {
      background: `rgb(${rgb})`,
      color: isDark ? "#3f3f46" : "#0a0a0a",
      boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 10px 20px -8px rgba(0,0,0,0.18)",
    };
  }, [isDark]);

  // Dark-mode label text gets a subtle zinc gradient instead of flat color;
  // the icon (sibling element) keeps the solid `surface().color` above.
  const labelStyle = isDark
    ? {
        backgroundImage: "linear-gradient(135deg, #52525b, #18181b)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }
    : {};

  const pillFont = {
    fontFamily: '"Geist Mono", ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
  };

  const PillContent = ({ Icon, label }) => (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap uppercase">
      <span style={labelStyle}>{label}</span>
      {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2.25} />}
    </span>
  );

  // Single source of truth for how a pill/badge looks, used by BOTH the
  // marquee and the physics render below. Previously each mode kept its own
  // copy of these class strings; editing one and not the other is exactly
  // how they drifted out of sync and ended up different sizes. Now there is
  // only one place to change.
  const PILL_BASE_CLASS = "px-2.5 py-1 sm:px-5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-medium shrink-0 transition-colors duration-500";
  const BADGE_BASE_CLASS = "rounded-full flex items-center justify-center shrink-0 transition-colors duration-500";

  const itemClassName = useCallback((p, extra = "") => {
    const base = p.kind === "badge" ? BADGE_BASE_CLASS : PILL_BASE_CLASS;
    return extra ? `${base} ${extra}` : base;
  }, []);

  const itemStyle = useCallback((p) => ({
    ...surface(p.color, { invert: p.invert }),
    ...(p.kind === "pill" ? pillFont : {}),
    ...(p.kind === "badge" ? { width: badgeSize(p), height: badgeSize(p) } : {}),
  }), [surface, badgeSize]);

  const marqueeAnim = reducedMotion ? {} : { animation: "marquee-left 26s linear infinite" };

  return (
    <div ref={rootRef} className="absolute inset-0 w-full h-full overflow-hidden transition-colors duration-500">
      {mode === "marquee" && (
        <div className="absolute top-0 left-0 w-full flex flex-col gap-4 py-6">
          <div
            ref={rowRef}
            className="flex items-center gap-3 sm:gap-4 whitespace-nowrap will-change-transform"
            style={marqueeAnim}
          >
            {[...TRACK, ...TRACK].map((p, i) => (
              <span
                key={`${p.key}-${i}`}
                data-label={i < TRACK.length ? p.label : undefined}
                className={itemClassName(p)}
                style={itemStyle(p)}
              >
                {p.kind === "badge" ? (
                  <p.icon className="w-1/2 h-1/2" strokeWidth={2.25} />
                ) : (
                  <PillContent Icon={p.icon} label={p.label} />
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {mode === "physics" && (
        <div ref={stageRef} className="absolute inset-0">
          {TRACK.map((p, i) => (
            <div
              key={p.key}
              ref={(el) => {
                elsRef.current[i] = el;
                pillRefs.current[i] = el;
              }}
              onMouseDown={(e) => onPointerDown(e, i)}
              className={itemClassName(p, "absolute top-0 left-0 cursor-grab active:cursor-grabbing select-none")}
              style={{
                ...itemStyle(p),
                touchAction: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "transparent",
                willChange: "transform",
              }}
            >
              {p.kind === "badge" ? (
                <p.icon className="w-1/2 h-1/2" strokeWidth={2.25} />
              ) : (
                <PillContent Icon={p.icon} label={p.label} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}