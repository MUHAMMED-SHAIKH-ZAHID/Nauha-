import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import portraitImg from "../assets/Images/nilu_4x.webp";

const SEGMENTS = 9;
const ROPE_LENGTH = 280;
const GRAVITY = 0.45;
const DAMPING = 0.85; // lower = kills bounce/oscillation much faster after release
const CONSTRAINT_ITER = 30;

export default function HangingBadge() {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const ropeMainRef = useRef(null);
  const ropeTwistRef = useRef(null);
  const cardRef = useRef(null);
  const stateRef = useRef({
    points: [], anchorX: 0, anchorY: 0, dragging: false,
    startPointer: null, movedDist: 0, vx: 0, vy: 0,
    lastScrollY: typeof window !== "undefined" ? window.scrollY : 0,
    scrollForce: 0,
  });

  const getPoint = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const s = stateRef.current;
    let rafId;

    function initRope() {
      const rect = container.getBoundingClientRect();
      s.anchorX = rect.width / 2;
      s.anchorY = 0;
      s.points = [];
      const segLen = ROPE_LENGTH / SEGMENTS;
      for (let i = 0; i <= SEGMENTS; i++) {
        const y = s.anchorY + segLen * i;
        s.points.push({ x: s.anchorX, y, oldX: s.anchorX, oldY: y, pinned: i === 0 });
      }
    }
    initRope();

    const ro = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dx = rect.width / 2 - s.anchorX;
      s.anchorX = rect.width / 2;
      if (!s.dragging) s.points.forEach((p) => { p.x += dx; p.oldX += dx; });
    });
    ro.observe(container);

    // Real scroll velocity drives the sway - fast scroll = a stronger, more
    // random-feeling push, exactly like a real object reacting to motion,
    // instead of a fixed predictable idle animation
    function onScroll() {
      const delta = window.scrollY - s.lastScrollY;
      s.lastScrollY = window.scrollY;
      s.scrollForce += delta * 0.001;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function onDown(e) {
      e.preventDefault();
      const p = getPoint(e);
      s.dragging = true;
      s.startPointer = p;
      s.movedDist = 0;
      cardRef.current.style.cursor = "grabbing";
    }
    function onMove(e) {
      if (!s.dragging) return;
      if (e.cancelable) e.preventDefault();
      const p = getPoint(e);
      const last = s.points[s.points.length - 1];
      s.vx = p.x - last.x;
      s.vy = p.y - last.y;
      last.x = p.x;
      last.y = p.y;
      s.movedDist = Math.hypot(p.x - s.startPointer.x, p.y - s.startPointer.y);
    }
    function onUp() {
      if (!s.dragging) return;
      s.dragging = false;
      cardRef.current.style.cursor = "grab";
      const last = s.points[s.points.length - 1];
      // Much lower carry-over than before - it settles like a real weighted
      // object instead of continuing to swing energetically
      last.oldX = last.x - s.vx * 0.6;
      last.oldY = last.y - s.vy * 0.6;
    }

    cardRef.current.addEventListener("mousedown", onDown);
    cardRef.current.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    function step() {
      const points = s.points;

      // Apply the scroll-driven force to a mid-rope point, then let it decay
      if (!s.dragging && Math.abs(s.scrollForce) > 0.01) {
        const mid = points[Math.floor(points.length * 0.6)];
        mid.x += s.scrollForce;
        s.scrollForce *= 0.85;
      }

      points.forEach((p, i) => {
        if (p.pinned) return;
        if (s.dragging && i === points.length - 1) return;
        const vx = (p.x - p.oldX) * DAMPING;
        const vy = (p.y - p.oldY) * DAMPING;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + GRAVITY;
      });

      const segLen = ROPE_LENGTH / SEGMENTS;
      for (let iter = 0; iter < CONSTRAINT_ITER; iter++) {
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i], b = points[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = (dist - segLen) / dist;
          const offX = dx * 0.5 * diff, offY = dy * 0.5 * diff;
          if (!a.pinned) { a.x += offX; a.y += offY; }
          if (!(b.pinned || (s.dragging && i + 1 === points.length - 1))) { b.x -= offX; b.y -= offY; }
        }
        points[0].x = s.anchorX;
        points[0].y = s.anchorY;
      }

      let dMain = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const midX = (points[i - 1].x + points[i].x) / 2;
        const midY = (points[i - 1].y + points[i].y) / 2;
        dMain += ` Q ${points[i - 1].x} ${points[i - 1].y} ${midX} ${midY}`;
      }
      ropeMainRef.current.setAttribute("d", dMain);

      // Twist highlight kept - this was the one rope detail you specifically liked
      let dTwist = "";
      points.forEach((p, i) => {
        const prev = points[Math.max(0, i - 1)];
        const next = points[Math.min(points.length - 1, i + 1)];
        const dx = next.x - prev.x, dy = next.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const twist = Math.sin(i * 1.1) * 3;
        dTwist += (i === 0 ? "M" : " L") + ` ${p.x + nx * twist} ${p.y + ny * twist}`;
      });
      ropeTwistRef.current.setAttribute("d", dTwist);

      const last = points[points.length - 1];
      const prev = points[points.length - 2];
      const angle = Math.atan2(last.x - prev.x, last.y - prev.y) * (180 / Math.PI);
      const clampedAngle = Math.max(-25, Math.min(25, angle));
      cardRef.current.style.transform = `translate(${last.x}px, ${last.y}px) translate(-50%, 0) rotate(${clampedAngle}deg)`;

      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cardRef.current?.removeEventListener("mousedown", onDown);
      cardRef.current?.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [getPoint]);

  const dark = theme === "dark";

  return (
    <div ref={containerRef} className="relative w-full h-[540px] sm:h-[580px] select-none" style={{ touchAction: "none" }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <path ref={ropeMainRef} fill="none" stroke={dark ? "#2b2b2b" : "#4a4a4a"} strokeWidth="9" strokeLinecap="round" />
        <path ref={ropeTwistRef} fill="none" stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)"} strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      <div
        ref={cardRef}
        className="absolute top-0 left-0 w-[230px] sm:w-[260px] rounded-2xl overflow-hidden shadow-2xl cursor-grab"
        style={{
          background: dark ? "#161616" : "#fbfbf9",
          border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
          transformOrigin: "top center",
          willChange: "transform",
        }}
      >
        {/* Grommet ring where the strap threads through the card - the real connection point */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-20"
          style={{
            background: dark ? "#0a0a0a" : "#eee",
            border: `2px solid ${dark ? "#555" : "#bbb"}`,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
          }}
        />

        <div className="relative z-10 h-2 w-full mt-6" style={{ background: "#3f6fd0" }} />

        <div className="relative z-10 px-4 pt-4">
          <div className="rounded-lg overflow-hidden" style={{ border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)" }}>
            <img src={portraitImg} alt="Nauha" className="w-full h-[230px] object-cover object-top" draggable={false} />
          </div>
        </div>

        <div className="relative z-10 px-4 pt-3 pb-5 text-center">
          <p className="font-display font-bold uppercase text-black dark:text-white text-base leading-tight">Nauha</p>
          <p className="text-xs uppercase tracking-wide text-black/60 dark:text-white/60 mt-0.5">Software Engineer</p>
        </div>

        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 45%, transparent 60%)" }}
        />
      </div>
    </div>
  );
}