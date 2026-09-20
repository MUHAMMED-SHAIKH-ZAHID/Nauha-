import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";

const rowOne = [
  { label: "Frontend Developer", color: "56, 138, 221" },
  { label: "Full-Stack Developer", color: "216, 90, 48" },
  { label: "React", color: "127, 119, 221" },
  { label: "JavaScript", color: "186, 117, 23" },
  { label: "HTML", color: "29, 158, 117" },
  { label: "CSS", color: "212, 83, 126" },
  { label: "Git", color: "56, 138, 221" },
];

const rowTwo = [
  { label: "UI / UX Design", color: "29, 158, 117" },
  { label: "Shopify Expert", color: "186, 117, 23" },
  { label: "WooCommerce", color: "212, 83, 126" },
  { label: "WordPress", color: "127, 119, 221" },
  { label: "Python", color: "216, 90, 48" },
  { label: "Django", color: "56, 138, 221" },
  { label: "PHP", color: "29, 158, 117" },
  { label: "MySQL", color: "186, 117, 23" },
];

const allPills = [...rowOne, ...rowTwo];

export default function MarqueeToPhysics() {
  const { theme } = useTheme();
  const [mode, setMode] = useState("marquee");
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const bodiesRef = useRef([]);
  const rafRef = useRef(null);
  const capturedRef = useRef({});
  const dragRef = useRef({ active: null, lastPos: null, lastTime: 0, vx: 0, vy: 0 });

  // Trigger: capture each pill's REAL current position before switching modes,
  // so physics picks up exactly where the marquee left off - no teleport
  useEffect(() => {
    function onScroll() {
      if (mode !== "marquee" || !rootRef.current) return;
      const top = rootRef.current.getBoundingClientRect().top;
      if (top <= 0) {
        const stageRect = rootRef.current.getBoundingClientRect();
        const positions = {};
        allPills.forEach((p) => {
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
        setMode("physics");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  useEffect(() => {
    if (mode !== "physics" || !stageRef.current) return;
    const stage = stageRef.current;
    const W = stage.clientWidth;

    bodiesRef.current = allPills.map((p, i) => {
      const captured = capturedRef.current[p.label];
      return {
        ...p,
        x: captured ? captured.x : 60 + Math.random() * Math.max(1, W - 220),
        y: captured ? captured.y : -80 - Math.random() * 400,
        vx: captured ? -20 : (Math.random() - 0.5) * 0.6, // small residual drift matching marquee direction
        vy: 0,
        w: captured ? captured.w : 110 + p.label.length * 8,
        h: captured ? captured.h : 46,
        rot: 0,
        dragging: false,
        el: null,
      };
    });

    const GRAVITY = 0.16;
    const MAX_FALL_SPEED = 9;
    const FRICTION = 0.985;
    const REST = 0.22;

    function step() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const list = bodiesRef.current;

      list.forEach((b) => {
        if (b.dragging) return;
        b.vy = Math.min(b.vy + GRAVITY, MAX_FALL_SPEED);
        b.vx *= FRICTION;
        b.x += b.vx;
        b.y += b.vy;

        if (b.y + b.h > h) {
          b.y = h - b.h;
          b.vy = -Math.abs(b.vy) * REST;
          if (Math.abs(b.vy) < 0.5) b.vy = 0;
        }
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * REST; }
        if (b.x + b.w > w) { b.x = w - b.w; b.vx = -Math.abs(b.vx) * REST; }
      });

      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i], b = list[j];
          const dx = (b.x + b.w / 2) - (a.x + a.w / 2);
          const dy = (b.y + b.h / 2) - (a.y + a.h / 2);
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = (a.w + b.w) / 4;
          if (dist < minDist) {
            const overlap = ((minDist - dist) / 2) * 0.3;
            const nx = dx / dist, ny = dy / dist;
            if (!a.dragging) { a.x -= nx * overlap; a.y -= ny * overlap; }
            if (!b.dragging) { b.x += nx * overlap; b.y += ny * overlap; }
          }
        }
      }

      list.forEach((b) => {
        if (b.el) b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode]);

  const getPoint = useCallback((e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  function onPointerDown(e, body) {
    e.preventDefault();
    body.dragging = true;
    dragRef.current.active = body;
    const p = getPoint(e);
    dragRef.current.lastPos = p;
    dragRef.current.lastTime = performance.now();
  }

  const onPointerMove = useCallback((e) => {
    const body = dragRef.current.active;
    if (!body) return;
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

  const glassPill = (rgb) => ({
    background: theme === "dark" ? `rgba(${rgb}, 0.22)` : `rgba(${rgb}, 0.14)`,
    border: theme === "dark" ? `1px solid rgba(${rgb}, 0.45)` : `1px solid rgba(${rgb}, 0.3)`,
    color: theme === "dark" ? "#fff" : `rgb(${rgb})`,
    backdropFilter: "blur(10px) saturate(160%)",
    WebkitBackdropFilter: "blur(10px) saturate(160%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
  });

  return (
    <div ref={rootRef} className="absolute inset-0 w-full h-full overflow-hidden transition-colors duration-500">
      {mode === "marquee" && (
        <div className="absolute top-0 left-0 w-full flex flex-col gap-4 py-6">
          <div className="flex md:hidden gap-4 whitespace-nowrap animate-[marquee-left_22s_linear_infinite]">
            {[...rowOne, ...rowOne].map((p, i) => (
              <span key={i} data-label={p.label} className="px-5 py-2.5 rounded-full text-sm font-medium shrink-0 transition-colors duration-500" style={glassPill(p.color)}>{p.label}</span>
            ))}
          </div>
          <div className="flex md:hidden gap-4 whitespace-nowrap animate-[marquee-right_26s_linear_infinite]">
            {[...rowTwo, ...rowTwo].map((p, i) => (
              <span key={i} data-label={p.label} className="px-5 py-2.5 rounded-full text-sm font-medium shrink-0 transition-colors duration-500" style={glassPill(p.color)}>{p.label}</span>
            ))}
          </div>
          <div className="hidden md:flex gap-4 whitespace-nowrap animate-[marquee-left_32s_linear_infinite]">
            {[...allPills, ...allPills].map((p, i) => (
              <span key={i} data-label={p.label} className="px-5 py-2.5 rounded-full text-sm font-medium shrink-0 transition-colors duration-500" style={glassPill(p.color)}>{p.label}</span>
            ))}
          </div>
        </div>
      )}

      {mode === "physics" && (
        <div ref={stageRef} className="absolute inset-0 touch-none">
          {allPills.map((p, i) => (
            <div
              key={p.label}
              ref={(el) => { if (bodiesRef.current[i]) bodiesRef.current[i].el = el; }}
              onMouseDown={(e) => onPointerDown(e, bodiesRef.current[i])}
              onTouchStart={(e) => onPointerDown(e, bodiesRef.current[i])}
              className="absolute top-0 left-0 px-5 py-2.5 rounded-full text-sm font-medium cursor-grab active:cursor-grabbing select-none transition-colors duration-500"
              style={{ ...glassPill(p.color), touchAction: "none" }}
            >
              {p.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}