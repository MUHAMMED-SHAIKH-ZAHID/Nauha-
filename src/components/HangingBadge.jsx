import { useEffect, useRef, useCallback, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Mail, RotateCw, Check, Copy } from "lucide-react";
import portraitImg from "../assets/Images/bw-nilu.webp";

const SEGMENTS = 9;
const ROPE_LENGTH = 280;
const GRAVITY = 0.75;
const DAMPING = 0.9; // lower = kills bounce/oscillation much faster after release
const CONSTRAINT_ITER = 30;
const CLICK_THRESHOLD = 6; // px of movement that separates "a tap" (flip the badge) from "a drag"

const CONTACT_EMAIL = "fathimanauhap03@gmail.com";

// Warm, neutral accent - replaces the flat corporate blue. Fixed values,
// not theme ternaries, same "the badge itself looks the same regardless of
// theme" rule the rest of the site's cards follow.
const ACCENT = "linear-gradient(90deg, #e3a370, #c97f4c)";
const ACCENT_SOLID = "#c97f4c";

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

  // Real functionality, not just decoration: click (not drag) the badge and
  // it flips over like a real lanyard ID, revealing a "back of badge" side
  // with a working copy-email action. Dragging still works exactly as
  // before - the two gestures are told apart the same way ContactSection.jsx
  // tells a click from a drag (movement distance).
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopyEmail(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

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
      // Barely moved -> that was a tap, not a drag: flip the badge instead
      // of treating it as a physics release.
      if (s.movedDist < CLICK_THRESHOLD) {
        setFlipped((f) => !f);
      }
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
  const cardBg = dark ? "#161616" : "#fbfbf9";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)";

  return (
    <div ref={containerRef} className="relative w-full h-[540px] sm:h-[580px] select-none" style={{ touchAction: "none" }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <path ref={ropeMainRef} fill="none" stroke={dark ? "#2b2b2b" : "#4a4a4a"} strokeWidth="9" strokeLinecap="round" />
        <path ref={ropeTwistRef} fill="none" stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)"} strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      <div
        ref={cardRef}
        className="absolute top-0 left-0 w-[230px] sm:w-[260px] cursor-grab"
        style={{ transformOrigin: "top center", willChange: "transform" }}
      >
        {/* Lanyard clip - a webbing loop threaded through a metal swivel
            ring, sitting above the badge and visually taking over from the
            rope. This is the actual attachment point; the small punched
            hole on the card body below lines up underneath it. */}
        <div className="relative z-30 mx-auto w-8 -mb-2 pointer-events-none" aria-hidden="true">
          <div
            className="mx-auto w-9 h-4 rounded-t-full"
            style={{ background: dark ? "#3a3a3a" : "#cfcfcf", border: `1px solid ${dark ? "#555" : "#9a9a9a"}`, borderBottom: "none" }}
          />
          <div
            className="mx-auto -mt-1.5 w-4 h-4 rounded-full"
            style={{
              background: dark ? "#161616" : "#fbfbf9",
              border: `2px solid ${dark ? "#5c5c5c" : "#9a9a9a"}`,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* 3D flip stage: front (photo/name) and back (copy-email action)
            live as two faces of the same physical card. The rope physics
            above only ever touches cardRef's own transform (position +
            sway), so this inner rotateY doesn't fight it. */}
        <div style={{ perspective: 1400 }}>
          <div
            className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT FACE - normal document flow, so it's the one that
                actually establishes the card's height; the back face below
                just overlays that same box via absolute inset-0. No logos,
                no monogram, no barcode - just the photo, name and title. */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ backfaceVisibility: "hidden", background: cardBg, border: cardBorder, pointerEvents: flipped ? "none" : "auto" }}
              aria-hidden={flipped}
            >
              {/* punched hole, lines up with the clip above */}
              <div
                className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-20"
                style={{ background: dark ? "#0a0a0a" : "#e2e2e2", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)" }}
              />

              <div className="relative h-1.5 w-full" style={{ background: ACCENT }} />

              <div className="px-4 pt-4">
                <div className="rounded-lg overflow-hidden" style={{ border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)" }}>
                  <img
                    src={portraitImg}
                    alt="Nauha"
                    className="w-full h-[230px] object-cover object-top"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              </div>

              <div className="px-4 pt-3 pb-5 text-center">
                <p className="font-display font-bold uppercase text-black dark:text-white text-base leading-tight">Nauha</p>
                <p className="text-xs uppercase tracking-wide mt-0.5" style={{ color: ACCENT_SOLID }}>Software Engineer</p>
              </div>

              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 45%, transparent 60%)" }}
              />
            </div>

            {/* BACK FACE - one real action: copy the email. Only tabbable/
                clickable once flipped. */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: cardBg,
                border: cardBorder,
                pointerEvents: flipped ? "auto" : "none",
              }}
              aria-hidden={!flipped}
            >
              <div className="h-1.5 w-full shrink-0" style={{ background: ACCENT }} />

              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-5">
                <div
                  className="grid place-items-center w-11 h-11 rounded-full"
                  style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: ACCENT_SOLID }}
                  aria-hidden="true"
                >
                  <Mail size={18} strokeWidth={1.8} />
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)" }}>
                    Get in touch
                  </p>
                  <p className="text-[13px] font-medium mt-1" style={{ color: dark ? "#fff" : "#111" }}>{CONTACT_EMAIL}</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  tabIndex={flipped ? 0 : -1}
                  aria-label={copied ? "Email copied" : `Copy email address ${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-transform hover:scale-[1.04] active:scale-[0.96]"
                  style={{ background: ACCENT, color: "#fff", boxShadow: "0 6px 16px rgba(201,127,76,0.35)" }}
                >
                  {copied ? "Copied" : "Copy email"}
                  <span className="grid place-items-center w-3.5 h-3.5 shrink-0">
                    {copied ? <Check size={13} strokeWidth={2.4} /> : <Copy size={12} strokeWidth={2.2} className="opacity-90" />}
                  </span>
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {copied ? "Email address copied to clipboard" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explicit, keyboard-reachable flip control - the physics drag is
            inherently mouse/touch only, so this is the one part of the
            badge a keyboard or screen-reader user can actually operate. */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          aria-label={flipped ? "Show badge front" : "Flip badge to see contact info"}
          className="absolute -bottom-2 -right-2 z-40 grid place-items-center w-8 h-8 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
          style={{ background: ACCENT, color: "#fff" }}
        >
          <RotateCw size={14} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}