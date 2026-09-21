import { useEffect, useRef, useCallback } from "react";
import { MessageCircle, FileText } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="11" x2="8" y2="17" />
      <circle cx="8" cy="7.2" r="0.4" fill="currentColor" />
      <path d="M12 17v-3.5c0-1.4 1-2.3 2.2-2.3s2 .9 2 2.3V17" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" />
    </svg>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
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
export default function ContactSection() {
  const { theme } = useTheme();
  const stageRef = useRef(null);
  const bodiesRef = useRef([]);
  const elsRef = useRef([]);
  const dragRef = useRef({ active: null, lastPos: null, startPos: null, lastTime: 0, vx: 0, vy: 0, movedDist: 0 });
  const lastTapRef = useRef({});

  function handleCopyEmail() {
    navigator.clipboard.writeText("fathimanauhap03@gmail.com");
  }

  useEffect(() => {
    let cancelled = false;
    let rafId;

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
        x: 10 + Math.random() * Math.max(1, W - 70),
        y: -60 - i * 50,
        vx: (Math.random() - 0.5) * 1,
        vy: 0,
        angle: (Math.random() - 0.5) * 30,
        angularVel: (Math.random() - 0.5) * 2.5,
        size: 52,
        dragging: false,
        hovering: false,
      }));

      const GRAVITY = 0.16;
      const MAX_FALL_SPEED = 9;
      const FRICTION = 0.985;
      const ANGULAR_FRICTION = 0.96;
      const REST = 0.3;

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
          b.angle += b.angularVel;
          b.angularVel *= ANGULAR_FRICTION;

          if (b.y + b.size > h) {
            b.y = h - b.size;
            b.vy = -Math.abs(b.vy) * REST;
            b.angularVel += (Math.random() - 0.5) * 1.5;
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
              const overlap = Math.min(((minDist - dist) / 2) * 0.2, 1.5);
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
          el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg) scale(${scale})`;
          el.style.zIndex = active ? 30 : 10;
          el.style.boxShadow = active ? "0 10px 24px rgba(0,0,0,0.22)" : "0 3px 10px rgba(0,0,0,0.08)";
          el.style.borderColor = active
            ? theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"
            : theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
        });

        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }
    tryInit();
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, [theme]);

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

  // The actual "remove from drag on release" fix - explicitly clears every
  // drag-related flag the instant the pointer/finger lifts, no matter how
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
    window.addEventListener("touchcancel", releaseActiveBody); // covers interrupted gestures too
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

  function handleTouchEndForTap(index, href) {
    if (dragRef.current.movedDist > 8) {
      lastTapRef.current[index] = 0;
      return;
    }
    const now = Date.now();
    if (now - (lastTapRef.current[index] || 0) < 350) {
      window.open(href, "_blank", "noopener,noreferrer");
      lastTapRef.current[index] = 0;
    } else {
      lastTapRef.current[index] = now;
    }
  }

  return (
    <div className="relative px-4 py-16">
      <div
        className="relative rounded-3xl px-6 py-10 sm:py-14 text-center max-w-3xl mx-auto transition-colors duration-500"
        style={{ background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#f2f2f0" }}
      >
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-black dark:text-white mb-6">
          Looking for the right <span className="italic font-thin-serif">project</span> to build.
        </h2>
        <button
          onClick={handleCopyEmail}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
          style={{
            background: "#fff",
            color: "#111",
            border: theme === "dark" ? "none" : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          fathimanauhap03@gmail.com
        </button>

        {/* Bigger box on mobile (needs more room per your fling test), much
            shorter on larger screens where the row doesn't need as much height */}
        <div
          ref={stageRef}
          aria-label="Draggable contact links"
          className="relative mt-8 h-[260px] sm:h-[120px] w-full"
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
                // Only clear hover if not actively dragging this same body
                if (bodiesRef.current[i] && dragRef.current.active !== bodiesRef.current[i]) {
                  bodiesRef.current[i].hovering = false;
                }
              }}
              onClick={(e) => e.preventDefault()}
              onDoubleClick={() => window.open(ic.href, "_blank", "noopener,noreferrer")}
              onTouchEnd={() => handleTouchEndForTap(i, ic.href)}
              aria-label={ic.label}
              title={ic.label}
              className="absolute top-0 left-0 rounded-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
              style={{
                width: 52,
                height: 52,
                touchAction: "none",
                background: theme === "dark" ? "#1c1c1c" : "#fff",
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
                color: theme === "dark" ? "#fff" : "#111",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
              }}
            >
              <ic.Icon size={20} strokeWidth={1.8} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}