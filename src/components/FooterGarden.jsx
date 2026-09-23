import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const LANTANA_COLORWAYS = [
  [["#f7c93a", "#fbe08a"], ["#ef9b3a", "#f4bd77"], ["#e0577a", "#ec89a3"]],
  [["#f4d23a", "#f9e585"], ["#e8722f", "#f0996a"], ["#d43a3a", "#e26e6e"]],
  [["#f5e9c9", "#ffffff"], ["#e88fae", "#f2b3c9"], ["#b98fd1", "#d3b3e6"]],
];
const SUNFLOWER_COLORWAYS = [["#d68a1a", "#f6c94a"], ["#b5432a", "#e0793f"], ["#e0c23a", "#f7ecb0"]];
const HIBISCUS_COLORWAYS = [["#c0233f", "#ec6b83"], ["#d9457a", "#f5a3bc"], ["#e8722f", "#f7b06a"], ["#a83fc0", "#d090e6"]];
const COSMOS_COLORWAYS = [["#e88fae", "#f7d4e0"], ["#a878c9", "#dcc2ec"], ["#f2f0e8", "#ffffff"]];
const ROSE_COLORWAYS = [["#c0233f", "#e8708a"], ["#d9457a", "#f2a3ba"], ["#e8722f", "#f5ae6f"]];
const LILY_COLORWAYS = [["#f5e9d8", "#ffffff", "#c0233f"], ["#e88fae", "#f7d4e0", null], ["#e8722f", "#f7b06a", null]];
const PEONY_COLORWAYS = [["#e88fae", "#f7d4e0"], ["#f5e9d8", "#ffffff"], ["#d9457a", "#f2a3ba"]];
const SPECIES = ["lantana", "sunflower", "hibiscus", "cosmos", "cornflower", "rose", "lily", "peony"];

function hexA(hex, a) {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
}
function bezierPoint(t, x0, y0, cx, cy, x2, y2) {
  const mt = 1 - t;
  return { x: mt * mt * x0 + 2 * mt * t * cx + t * t * x2, y: mt * mt * y0 + 2 * mt * t * cy + t * t * y2 };
}

// Small equalizer bars instead of a static emoji - a real visual metaphor
// for "this plays sound," and when it's actually playing, the bars visibly
// animate (Apple Design §13: the visual must fire in the same frame as the
// actual state, not just an icon swap that could drift out of sync).
function SoundWaves({ playing, reduceMotion }) {
  const bars = [0, 1, 2];
  return (
    <span className="flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
      {bars.map((i) => (
        <motion.span
          key={i}
          className="w-[2.5px] rounded-full bg-current"
          animate={
            playing && !reduceMotion
              ? { height: ["30%", "100%", "45%", "80%", "30%"] }
              : { height: "35%" }
          }
          transition={
            playing && !reduceMotion
              ? { duration: 0.9 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

// Discoverable, theme-matched liquid-glass sound toggle - replaces the old
// bare emoji circle entirely. See the mapped-changes list from the previous
// message for exactly which Apple Design principle each piece answers.
function SoundToggle({ soundOn, setSoundOn, audioRef, theme }) {
  const reduceMotion = useReducedMotion();
  const [hasNoticed, setHasNoticed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExpanded(true), 900);
    const t2 = setTimeout(() => setExpanded(false), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function toggleSound() {
    setHasNoticed(true);
    setSoundOn((prev) => {
      const next = !prev;
      if (audioRef.current) {
        if (next) audioRef.current.play().catch(() => {});
        else audioRef.current.pause();
      }
      return next;
    });
  }

  // Consolidated into ONE effect (was two separate ones fighting over the
  // same audio element) - re-loads and resumes playback when theme swaps
  // the track, but only if sound was already on.
  useEffect(() => {
    if (soundOn && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [theme, soundOn, audioRef]);

  const glass = {
    background: theme === "dark"
      ? "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))"
      : "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.7)",
    boxShadow: theme === "dark"
      ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 18px rgba(0,0,0,0.35)"
      : "inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 18px rgba(0,0,0,0.1)",
    color: theme === "dark" ? "#fff" : "#2a2015",
  };

  return (
    <motion.button
      type="button"
      onClick={toggleSound}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute ambient garden sound" : "Play ambient garden sound"}
      layout
      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
      whileTap={reduceMotion ? {} : { scale: 0.92 }}
      className="absolute top-3 right-3 z-20 flex items-center gap-2 h-9 rounded-full overflow-hidden"
      style={{ ...glass, paddingLeft: 10, paddingRight: 10 }}
    >
      {!hasNoticed && !reduceMotion && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{ border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.25)"}` }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.35, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <SoundWaves playing={soundOn} reduceMotion={reduceMotion} />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="text-[11px] font-medium whitespace-nowrap overflow-hidden"
          >
            {soundOn ? "Sound on" : "Ambient sound"}
          </motion.span>
        )}
      </AnimatePresence>

      <span className="sr-only" role="status" aria-live="polite">
        {soundOn ? "Ambient garden sound is now playing" : "Ambient garden sound is muted"}
      </span>
    </motion.button>
  );
}

export default function FooterGarden() {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const [textHidden, setTextHidden] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [hiddenMsgVisible, setHiddenMsgVisible] = useState(false);
  const audioRef = useRef(null);
  const hasInteractedRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(true);
  const hiddenTabRef = useRef(typeof document !== "undefined" ? document.hidden : false);

  const stateRef = useRef({
    themeMix: theme === "dark" ? 1 : 0,
    mouseX: -999, mouseY: -999, mouseDown: false,
    windGust: 0, gustTimer: 0,
    lastScrollY: typeof window !== "undefined" ? window.scrollY : 0,
    clouds: [
      { baseX: 0.08, y: 0.12, s: 0.9, speed: 0.005 },
      { baseX: 0.28, y: 0.2, s: 0.7, speed: 0.007 },
      { baseX: 0.48, y: 0.08, s: 1, speed: 0.004 },
      { baseX: 0.63, y: 0.17, s: 0.6, speed: 0.006 },
      { baseX: 0.78, y: 0.1, s: 0.85, speed: 0.0045 },
      { baseX: 0.92, y: 0.22, s: 0.65, speed: 0.0055 },
    ],
    birds: [], birdTimer: 0, pollen: [], stars: [], starsInit: false,
    shootingStar: null, shootTimer: 0, rain: null, rainTimer: 0, rainbowAlpha: 0,
    critter: null, critterTimer: 0, walkers: [], walkersInit: false,
    ducks: [], ducksInit: false,
    flowers: [], fireflies: [], bees: [],
    lastSpawn: 0, plantedCount: 0, msgShown: false, maxFlowers: 40,
  });

  const GROUND_RATIO = 0.58;
  const FIREFLY_THRESHOLD = 10;
  const MAX_FIREFLIES = 5;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning. Thanks for stopping by." : hour < 18 ? "Good afternoon. Thanks for stopping by." : "Good evening. Thanks for stopping by.";
  const month = new Date().getMonth();
  const isWinterish = month === 11 || month === 0 || month === 1;

  const getPoint = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }, []);

  function hideTextPermanently() {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setTextHidden(true);
    }
  }

  function softPetal(ctx, cx, cy, angle, len, wid, colorDark, colorLight, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + (Math.random() - 0.5) * 0.06);
    const grad = ctx.createLinearGradient(0, 0, 0, -len);
    grad.addColorStop(0, hexA(colorDark, 0.85 * alpha));
    grad.addColorStop(0.6, hexA(colorLight, 0.9 * alpha));
    grad.addColorStop(1, hexA(colorLight, 0.5 * alpha));
    ctx.fillStyle = grad;
    const p = new Path2D();
    p.moveTo(0, 0);
    p.bezierCurveTo(-wid * 0.6, -len * 0.35, -wid * 0.5, -len * 0.85, 0, -len);
    p.bezierCurveTo(wid * 0.5, -len * 0.85, wid * 0.6, -len * 0.35, 0, 0);
    ctx.fill(p);
    ctx.restore();
    if (Math.random() < 0.12) {
      ctx.fillStyle = `rgba(255,255,255,${0.75 * alpha})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * len * 0.6, cy + Math.sin(angle) * len * 0.6, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function groundShadow(ctx, x, y, w, alpha) {
    ctx.fillStyle = `rgba(30,25,15,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, w, w * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStemAndLeaf(ctx, x, y, growT, fade, sway, stemH) {
    const stemLen = stemH * growT;
    const cxCtrl = x + sway * 0.5, cyCtrl = y - stemLen * 0.55;
    const topX = x + sway, topY = y - stemLen;
    const grad = ctx.createLinearGradient(x, y, topX, topY);
    grad.addColorStop(0, `rgba(50,90,42,${0.95 * fade})`);
    grad.addColorStop(1, `rgba(100,155,75,${0.9 * fade})`);
    ctx.strokeStyle = grad;
    ctx.lineCap = "round";
    for (let w = 3; w >= 1; w--) {
      ctx.lineWidth = w * (0.35 + 0.35 * growT);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(cxCtrl, cyCtrl, topX, topY);
      ctx.stroke();
    }
    if (stemLen > 14) {
      const leafT = Math.min((stemLen - 14) / 16, 1);
      const ly = y - stemLen * 0.42;
      const lx = x + sway * 0.42;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(-0.7);
      ctx.fillStyle = `rgba(85,145,65,${0.88 * fade * leafT})`;
      const lp = new Path2D();
      lp.moveTo(0, 0);
      lp.bezierCurveTo(7 * leafT, -3.6 * leafT, 16 * leafT, -2.2 * leafT, 20 * leafT, 0);
      lp.bezierCurveTo(16 * leafT, 2.2 * leafT, 7 * leafT, 3.6 * leafT, 0, 0);
      ctx.fill(lp);
      ctx.restore();
    }
    return { topX, topY, cxCtrl, cyCtrl };
  }

  function drawLantana(ctx, cx, cy, bloomT, fade, cw, scale = 1) {
    [{ r: 0, c: cw[0] }, { r: 5 * bloomT * scale, c: cw[1] }, { r: 9 * bloomT * scale, c: cw[2] }].forEach((ring, ri) => {
      const count = ri === 0 ? 1 : 5 + ri * 3;
      for (let i = 0; i < count; i++) {
        const a = ((Math.PI * 2) / count) * i + ri * 0.3;
        const px = cx + Math.cos(a) * ring.r, py = cy + Math.sin(a) * ring.r;
        for (let k = 0; k < 5; k++) softPetal(ctx, px, py, ((Math.PI * 2) / 5) * k, 2.8 * bloomT * scale, 1.9 * bloomT * scale, ring.c[0], ring.c[1], bloomT * fade);
      }
    });
  }
  function drawSunflower(ctx, cx, cy, bloomT, fade, colors, scale = 1) {
    for (let i = 0; i < 21; i++) softPetal(ctx, cx, cy, ((Math.PI * 2) / 21) * i, 22 * bloomT * scale, 7 * bloomT * scale, colors[0], colors[1], bloomT * fade);
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10 * bloomT * scale);
    cg.addColorStop(0, hexA("#6b4420", 0.95 * bloomT * fade));
    cg.addColorStop(1, hexA("#3f2a12", 0.95 * bloomT * fade));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(cx, cy, 10 * bloomT * scale, 0, Math.PI * 2); ctx.fill();
  }
  function drawHibiscus(ctx, cx, cy, bloomT, fade, colors, scale = 1) {
    for (let i = 0; i < 5; i++) {
      const a = ((Math.PI * 2) / 5) * i;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 0, -20 * bloomT * scale);
      g.addColorStop(0, hexA(colors[0], 0.9 * bloomT * fade));
      g.addColorStop(1, hexA(colors[1], 0.95 * bloomT * fade));
      ctx.fillStyle = g;
      const p = new Path2D();
      p.moveTo(0, 0);
      p.bezierCurveTo(-11 * bloomT * scale, -6 * bloomT * scale, -8 * bloomT * scale, -19 * bloomT * scale, 0, -20 * bloomT * scale);
      p.bezierCurveTo(8 * bloomT * scale, -19 * bloomT * scale, 11 * bloomT * scale, -6 * bloomT * scale, 0, 0);
      ctx.fill(p); ctx.restore();
    }
    ctx.strokeStyle = hexA("#7a3010", 0.9 * bloomT * fade);
    ctx.lineWidth = 1.3 * bloomT * scale;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 17 * bloomT * scale); ctx.stroke();
  }
  function drawCosmos(ctx, cx, cy, bloomT, fade, colors, scale = 1) {
    for (let i = 0; i < 8; i++) softPetal(ctx, cx, cy, ((Math.PI * 2) / 8) * i, 13 * bloomT * scale, 3.5 * bloomT * scale, colors[0], colors[1], bloomT * fade);
    ctx.fillStyle = hexA("#c9922f", 0.95 * bloomT * fade);
    ctx.beginPath(); ctx.arc(cx, cy, 3 * bloomT * scale, 0, Math.PI * 2); ctx.fill();
  }
  function drawCornflower(ctx, cx, cy, bloomT, fade, scale = 1) {
    for (let i = 0; i < 10; i++) softPetal(ctx, cx, cy, ((Math.PI * 2) / 10) * i, 13 * bloomT * scale, 3.5 * bloomT * scale, "#3f6fd0", "#7fa5f0", bloomT * fade);
    ctx.fillStyle = hexA("#f2d13a", 0.95 * bloomT * fade);
    ctx.beginPath(); ctx.arc(cx, cy, 3.5 * bloomT * scale, 0, Math.PI * 2); ctx.fill();
  }
  function drawRose(ctx, cx, cy, bloomT, fade, colors, scale = 1) {
    for (let ring = 3; ring >= 0; ring--) {
      const count = 4 + ring * 2, r = ring * 2.6 * bloomT * scale;
      for (let i = 0; i < count; i++) {
        const a = ((Math.PI * 2) / count) * i + ring * 0.4;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        ctx.save(); ctx.translate(px, py); ctx.rotate(a);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 * bloomT * scale);
        g.addColorStop(0, hexA(colors[0], 0.9 * bloomT * fade));
        g.addColorStop(1, hexA(colors[1], 0.85 * bloomT * fade));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(0, 0, 5 * bloomT * scale, 6.5 * bloomT * scale, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  }
  function drawLily(ctx, cx, cy, bloomT, fade, colors, scale = 1) {
    for (let i = 0; i < 6; i++) {
      const a = ((Math.PI * 2) / 6) * i;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 0, -19 * bloomT * scale);
      g.addColorStop(0, hexA(colors[0], 0.9 * bloomT * fade));
      g.addColorStop(1, hexA(colors[1], 0.92 * bloomT * fade));
      ctx.fillStyle = g;
      const p = new Path2D();
      p.moveTo(0, 0);
      p.bezierCurveTo(-3.5 * bloomT * scale, -9 * bloomT * scale, -2.5 * bloomT * scale, -17 * bloomT * scale, 0, -19 * bloomT * scale);
      p.bezierCurveTo(2.5 * bloomT * scale, -17 * bloomT * scale, 3.5 * bloomT * scale, -9 * bloomT * scale, 0, 0);
      ctx.fill(p);
      if (colors[2]) {
        ctx.fillStyle = hexA(colors[2], 0.6 * bloomT * fade);
        for (let s = 0; s < 4; s++) { ctx.beginPath(); ctx.arc(0, -7 * bloomT * scale - s * 2.5 * bloomT * scale, 0.6 * bloomT * scale, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
    }
    ctx.fillStyle = hexA("#8a5a1a", 0.9 * bloomT * fade);
    ctx.beginPath(); ctx.arc(cx, cy, 1.8 * bloomT * scale, 0, Math.PI * 2); ctx.fill();
  }
  function drawPeony(ctx, cx, cy, bloomT, fade, colors, scale = 1) {
    for (let ring = 0; ring < 4; ring++) {
      const count = 6 + ring * 3, r = ring * 3.5 * bloomT * scale;
      for (let i = 0; i < count; i++) {
        const a = ((Math.PI * 2) / count) * i + ring * 0.3;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        softPetal(ctx, px, py, a, 6 * bloomT * scale, 4.5 * bloomT * scale, colors[0], colors[1], bloomT * fade * (1 - ring * 0.08));
      }
    }
  }
  function drawFlowerByType(ctx, type, x, y, bloomT, fade, colorway, scale = 1) {
    if (type === "lantana") drawLantana(ctx, x, y, bloomT, fade, colorway, scale);
    else if (type === "sunflower") drawSunflower(ctx, x, y, bloomT, fade, colorway, scale);
    else if (type === "hibiscus") drawHibiscus(ctx, x, y, bloomT, fade, colorway, scale);
    else if (type === "cosmos") drawCosmos(ctx, x, y, bloomT, fade, colorway, scale);
    else if (type === "cornflower") drawCornflower(ctx, x, y, bloomT, fade, scale);
    else if (type === "rose") drawRose(ctx, x, y, bloomT, fade, colorway, scale);
    else if (type === "lily") drawLily(ctx, x, y, bloomT, fade, colorway, scale);
    else drawPeony(ctx, x, y, bloomT, fade, colorway, scale);
  }
  function pickColorway(type) {
    if (type === "lantana") return LANTANA_COLORWAYS[Math.floor(Math.random() * LANTANA_COLORWAYS.length)];
    if (type === "sunflower") return SUNFLOWER_COLORWAYS[Math.floor(Math.random() * SUNFLOWER_COLORWAYS.length)];
    if (type === "hibiscus") return HIBISCUS_COLORWAYS[Math.floor(Math.random() * HIBISCUS_COLORWAYS.length)];
    if (type === "cosmos") return COSMOS_COLORWAYS[Math.floor(Math.random() * COSMOS_COLORWAYS.length)];
    if (type === "rose") return ROSE_COLORWAYS[Math.floor(Math.random() * ROSE_COLORWAYS.length)];
    if (type === "lily") return LILY_COLORWAYS[Math.floor(Math.random() * LILY_COLORWAYS.length)];
    if (type === "peony") return PEONY_COLORWAYS[Math.floor(Math.random() * PEONY_COLORWAYS.length)];
    return null;
  }

  function spawnFlower(x, y) {
    const s = stateRef.current;
    const type = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const r = Math.random();
    const bloomCount = r < 0.6 ? 1 : r < 0.85 ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 6);
    s.flowers.push({
      x, y, born: performance.now(),
      stemH: 38 + Math.random() * 26,
      swayAmp: 4 + Math.random() * 4,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.0007 + Math.random() * 0.0004,
      type, colorway: pickColorway(type), bloomCount,
      fadeOutStart: null,
    });
    s.plantedCount++;
    if (s.plantedCount >= 30 && !s.msgShown) {
      s.msgShown = true;
      setHiddenMsgVisible(true);
      setTimeout(() => setHiddenMsgVisible(false), 4000);
    }
  }

  // Pause the whole scene when it's off-screen or the tab is backgrounded -
  // matches the same fix already applied to HangingBadge/ContactSection.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    function onVisibility() {
      hiddenTabRef.current = document.hidden;
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;
    let rafId;

    function isInPond(x, y, rect) {
      const groundY = rect.height * GROUND_RATIO;
      const px = rect.width * 0.14, py = groundY + 20, rx = 92, ry = 30;
      const nx = (x - px) / rx, ny = (y - py) / ry;
      return nx * nx + ny * ny <= 1;
    }

    function seedInitialFlowers(rect) {
      if (s.flowers.length > 0) return;
      const groundY = rect.height * GROUND_RATIO;
      const groundH = rect.height - groundY;
      let attempts = 0;
      while (s.flowers.length < 30 && attempts < 180) {
        attempts++;
        const x = 20 + Math.random() * (rect.width - 40);
        const y = groundY + 15 + Math.random() * (groundH - 25);
        if (isInPond(x, y, rect)) continue;
        spawnFlower(x, y);
        s.flowers[s.flowers.length - 1].born = performance.now() - 700 - Math.random() * 1500;
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.maxFlowers =
        rect.width < 640 ? 50 :
        rect.width < 1024 ? 160 :
        rect.width < 1600 ? 280 :
        240;
      // Bug fix: pollen/stars/ducks/walkers previously initialized ONCE and
      // never reset, so after a resize they stayed frozen at old absolute
      // pixel positions while the pond (which recomputes from live `rect`
      // every frame) visually moved - a duck could end up outside the pond
      // entirely. Resetting these flags here forces a clean re-init at the
      // new size, same as everything else in the scene already does.
      s.pollen = [];
      s.starsInit = false;
      s.ducksInit = false;
      s.walkersInit = false;
      seedInitialFlowers(rect);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onMove(e) {
      hideTextPermanently();
      const p = getPoint(e.touches ? e.touches[0] : e);
      s.mouseX = p.x; s.mouseY = p.y;
      const now = performance.now();
      if (now - s.lastSpawn < 150) return;
      const rect = canvas.getBoundingClientRect();
      if (p.y < rect.height * GROUND_RATIO) return;
      if (isInPond(p.x, p.y, rect)) return;
      s.lastSpawn = now;
      spawnFlower(p.x, p.y);
    }
    function onLeave() { s.mouseX = -999; s.mouseY = -999; s.mouseDown = false; }
    function onDown() { s.mouseDown = true; }
    function onUp() { s.mouseDown = false; }
    function onTouchStart() { hideTextPermanently(); }

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchend", onUp);

    function onScroll() {
      const delta = Math.abs(window.scrollY - s.lastScrollY);
      s.lastScrollY = window.scrollY;
      if (!reduceMotion && delta > 15) s.windGust = Math.min(1, s.windGust + delta / 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function initPollen(rect) {
      s.pollen = [];
      for (let i = 0; i < 16; i++) s.pollen.push({ x: Math.random() * rect.width, y: Math.random() * rect.height * GROUND_RATIO, phase: Math.random() * 10, speed: 0.15 + Math.random() * 0.15 });
    }
    function initStars(rect) {
      s.stars = [];
      for (let i = 0; i < 70; i++) s.stars.push({ x: Math.random() * rect.width, y: Math.random() * rect.height * GROUND_RATIO, phase: Math.random() * Math.PI * 2, speed: 0.001 + Math.random() * 0.002 });
    }
    function initWalkers(rect, groundY) {
      s.walkers = [
        { x: rect.width * 0.28, y: groundY - 6, speed: 0.18, phase: 0, jog: false, scale: 2.2 },
        { x: rect.width * 0.42, y: groundY - 4, speed: -0.12, phase: 2, jog: true, scale: 2.4 },
        { x: rect.width * 0.6, y: groundY - 7, speed: 0.1, phase: 4, jog: false, scale: 2 },
        { x: rect.width * 0.75, y: groundY - 5, speed: -0.16, phase: 1, jog: true, scale: 2.3 },
        { x: rect.width * 0.9, y: groundY - 6, speed: 0.13, phase: 3, jog: false, scale: 2.1 },
      ];
      s.walkersInit = true;
    }
    function drawWalker(w, now) {
      const sc = w.scale;
      const stride = Math.sin(now * (w.jog ? 0.02 : 0.012) + w.phase);
      ctx.strokeStyle = "rgba(35,30,25,0.65)"; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(w.x, w.y - 4 * sc); ctx.lineTo(w.x, w.y - 1 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w.x, w.y - 1 * sc); ctx.lineTo(w.x - 1.5 * stride * sc, w.y + 2 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w.x, w.y - 1 * sc); ctx.lineTo(w.x + 1.5 * stride * sc, w.y + 2 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w.x, w.y - 3 * sc); ctx.lineTo(w.x - 2 * stride * sc, w.y - 1.5 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w.x, w.y - 3 * sc); ctx.lineTo(w.x + 2 * stride * sc, w.y - 1.5 * sc); ctx.stroke();
      ctx.fillStyle = "rgba(35,30,25,0.65)";
      ctx.beginPath(); ctx.arc(w.x, w.y - 5 * sc, 1.3 * sc, 0, Math.PI * 2); ctx.fill();
    }
    function initDucks(rect, groundY) {
      const px = rect.width * 0.14, py = groundY + 20;
      s.ducks = [
        { baseX: px - 25, baseY: py - 5, phase: 0, speed: 0.15 },
        { baseX: px + 10, baseY: py + 6, phase: 2, speed: 0.1 },
        { baseX: px - 5, baseY: py - 10, phase: 4, speed: 0.12 },
      ];
      s.ducksInit = true;
    }
    function drawDuck(d, now) {
      const bob = Math.sin(now * 0.0015 * d.speed * 10 + d.phase) * 2;
      const drift = Math.cos(now * 0.0006 + d.phase) * 8;
      const x = d.baseX + drift, y = d.baseY + bob;
      ctx.fillStyle = "rgba(60,50,40,0.8)";
      ctx.beginPath(); ctx.ellipse(x, y, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 4, y - 2, 2.2, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(220,150,40,0.9)";
      ctx.beginPath(); ctx.moveTo(x + 6, y - 2); ctx.lineTo(x + 8.5, y - 1.6); ctx.lineTo(x + 6, y - 1); ctx.closePath(); ctx.fill();
    }
    function drawCloud(cx, cy, scale, alpha) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      [[0, 0, 18], [16, -6, 14], [-16, -4, 13], [30, 2, 10], [-30, 3, 10]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
    function drawTree(x, groundY, scale) {
      ctx.fillStyle = "rgba(70,50,30,0.7)";
      ctx.fillRect(x - 1.5 * scale, groundY - 14 * scale, 3 * scale, 14 * scale);
      ctx.fillStyle = "rgba(60,110,55,0.75)";
      ctx.beginPath(); ctx.arc(x, groundY - 18 * scale, 10 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - 6 * scale, groundY - 14 * scale, 7 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 6 * scale, groundY - 14 * scale, 7 * scale, 0, Math.PI * 2); ctx.fill();
    }
    function drawPond(rect, groundY, now, alpha) {
      const px = rect.width * 0.14, py = groundY + 20, pw = 85, ph = 26;
      ctx.fillStyle = `rgba(120,170,190,${0.55 * alpha})`;
      ctx.beginPath(); ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 3; i++) {
        const wobble = Math.sin(now * 0.001 + i) * 3;
        ctx.strokeStyle = `rgba(255,255,255,${0.25 * alpha})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(px + wobble, py, pw * 0.6 - i * 14, ph * 0.5 - i * 4, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }

    function drawSky(rect, now) {
      const target = theme === "dark" ? 1 : 0;
      s.themeMix += (target - s.themeMix) * 0.03;
      const dayTop = [191, 227, 245], dayBot = [253, 238, 203];
      const nightTop = [10, 14, 34], nightBot = [28, 37, 64];
      const topC = dayTop.map((v, i) => Math.round(v + (nightTop[i] - v) * s.themeMix));
      const botC = dayBot.map((v, i) => Math.round(v + (nightBot[i] - v) * s.themeMix));
      const g = ctx.createLinearGradient(0, 0, 0, rect.height * GROUND_RATIO);
      g.addColorStop(0, `rgb(${topC.join(",")})`);
      g.addColorStop(1, `rgb(${botC.join(",")})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, rect.width, rect.height * GROUND_RATIO);

      if (s.themeMix < 0.5) {
        const sunX = rect.width * 0.85, sunY = rect.height * 0.14;
        const rg = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 55);
        rg.addColorStop(0, `rgba(255,235,170,${0.65 * (1 - s.themeMix * 2)})`);
        rg.addColorStop(1, "rgba(255,235,170,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(sunX, sunY, 55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,233,168,${1 - s.themeMix * 2})`;
        ctx.beginPath(); ctx.arc(sunX, sunY, 16, 0, Math.PI * 2); ctx.fill();

        if (!reduceMotion) {
          if (now - s.gustTimer > 9000 + Math.random() * 5000) { s.gustTimer = now; s.windGust = Math.max(s.windGust, 0.7); }
          s.windGust *= 0.985;
        } else {
          s.windGust = 0;
        }

        s.clouds.forEach((c) => {
          const speed = reduceMotion ? 0 : c.speed;
          let cx = ((c.baseX * rect.width + now * speed + s.windGust * 40) % (rect.width + 120)) - 60;
          const cy = rect.height * c.y;
          const dx = s.mouseX - cx, dy = s.mouseY - cy, dist = Math.hypot(dx, dy);
          let px = 0, py = 0;
          if (!reduceMotion && dist < 70 && dist > 0) { const f = (70 - dist) / 70; px = -(dx / dist) * f * 30; py = -(dy / dist) * f * 15; }
          drawCloud(cx + px, cy + py, c.s, 0.9 * (1 - s.themeMix));
        });

        if (!reduceMotion) {
          s.pollen.forEach((p) => {
            p.y -= p.speed; p.x += Math.sin(now * 0.001 + p.phase) * 0.3;
            if (p.y < 0) { p.y = rect.height * GROUND_RATIO; p.x = Math.random() * rect.width; }
            ctx.fillStyle = "rgba(255,250,220,0.5)";
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2); ctx.fill();
          });

          if (now - s.birdTimer > 4500 + Math.random() * 3500) {
            s.birdTimer = now;
            s.birds.push({ x: -20, y: rect.height * (0.08 + Math.random() * 0.2), speed: 0.6 + Math.random() * 0.4, flapPhase: Math.random() * 10, bobPhase: Math.random() * 10 });
          }
          s.birds = s.birds.filter((b) => b.x < rect.width + 30);
          s.birds.forEach((b) => {
            b.x += b.speed;
            const y = b.y + Math.sin(now * 0.002 + b.bobPhase) * 6;
            const flap = Math.sin(now * 0.02 + b.flapPhase) * 8;
            ctx.strokeStyle = "rgba(60,50,40,0.75)"; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(b.x - 7, y + flap * 0.3); ctx.quadraticCurveTo(b.x, y - flap, b.x + 7, y + flap * 0.3); ctx.stroke();
          });

          if (now - s.rainTimer > 16000 + Math.random() * 9000 && !s.rain) {
            s.rainTimer = now;
            s.rain = { life: 0, drops: Array.from({ length: 55 }, () => ({ x: Math.random() * rect.width, y: Math.random() * rect.height * GROUND_RATIO, speed: 6 + Math.random() * 3 })) };
          }
          if (s.rain) {
            s.rain.life++;
            ctx.strokeStyle = "rgba(150,180,210,0.5)"; ctx.lineWidth = 1;
            s.rain.drops.forEach((d) => {
              d.y += d.speed;
              if (d.y > rect.height * GROUND_RATIO) { d.y = 0; d.x = Math.random() * rect.width; }
              ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + 8); ctx.stroke();
            });
            if (s.rain.life > 180) { s.rain = null; s.rainbowAlpha = 1; }
          }
          if (s.rainbowAlpha > 0) {
            s.rainbowAlpha -= 0.003;
            ["rgba(255,0,0,", "rgba(255,165,0,", "rgba(255,255,0,", "rgba(0,180,0,", "rgba(0,0,255,", "rgba(120,0,180,"].forEach((c, i) => {
              ctx.strokeStyle = c + 0.35 * s.rainbowAlpha + ")"; ctx.lineWidth = 6;
              ctx.beginPath(); ctx.arc(rect.width * 0.3, rect.height * GROUND_RATIO, 110 - i * 6, Math.PI, Math.PI * 1.6); ctx.stroke();
            });
          }
        }
      }

      if (s.themeMix > 0.15) {
        if (!s.starsInit) { initStars(rect); s.starsInit = true; }
        const moonX = rect.width * 0.82, moonY = rect.height * 0.13;
        const mg = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 42);
        mg.addColorStop(0, `rgba(230,230,255,${0.5 * s.themeMix})`);
        mg.addColorStop(1, "rgba(230,230,255,0)");
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(moonX, moonY, 42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(242,240,232,${s.themeMix})`;
        ctx.beginPath(); ctx.arc(moonX, moonY, 15, 0, Math.PI * 2); ctx.fill();

        s.stars.forEach((st) => {
          const tw = reduceMotion ? 0.7 : 0.4 + 0.6 * Math.abs(Math.sin(now * st.speed + st.phase));
          ctx.fillStyle = `rgba(255,255,255,${tw * s.themeMix})`;
          ctx.beginPath(); ctx.arc(st.x, st.y, 1.1, 0, Math.PI * 2); ctx.fill();
        });

        if (!reduceMotion) {
          if (now - s.shootTimer > 5500 + Math.random() * 4500 && !s.shootingStar) {
            s.shootTimer = now;
            s.shootingStar = { x: Math.random() * rect.width * 0.5, y: Math.random() * rect.height * 0.2, vx: 5, vy: 2.5, life: 0 };
          }
          if (s.shootingStar) {
            s.shootingStar.x += s.shootingStar.vx; s.shootingStar.y += s.shootingStar.vy; s.shootingStar.life++;
            ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 1 - s.shootingStar.life / 20)})`; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(s.shootingStar.x, s.shootingStar.y); ctx.lineTo(s.shootingStar.x - 16, s.shootingStar.y - 8); ctx.stroke();
            if (s.shootingStar.life > 20) s.shootingStar = null;
          }
        }
      }
    }

    function drawParkGround(rect, now) {
      const groundY = rect.height * GROUND_RATIO;
      ctx.fillStyle = isWinterish ? (s.themeMix > 0.5 ? "#1a1f22" : "#e9edee") : s.themeMix > 0.5 ? "#0d1a10" : "#d9c98a";
      ctx.fillRect(0, groundY, rect.width, rect.height - groundY);
      const bladeColor = isWinterish
        ? (s.themeMix > 0.5 ? "rgba(200,210,215,0.6)" : "rgba(150,165,155,0.7)")
        : (s.themeMix > 0.5 ? "rgba(40,70,45,0.8)" : "rgba(90,150,70,0.85)");
      ctx.strokeStyle = bladeColor; ctx.lineWidth = 1.4;
      for (let x = 0; x < rect.width; x += 6) {
        const gust = s.windGust * 10;
        const h = 6 + Math.sin(x * 0.3) * 3 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.quadraticCurveTo(x + 2 + gust, groundY - h * 0.6, x + Math.sin(x) * 2 + gust, groundY - h);
        ctx.stroke();
      }

      const dayAlpha = 1 - s.themeMix * 0.6;
      drawPond(rect, groundY, now, dayAlpha);

      if (!s.ducksInit) initDucks(rect, groundY);
      if (dayAlpha > 0.3) s.ducks.forEach((d) => drawDuck(d, reduceMotion ? 0 : now));

      [0.3, 0.42, 0.56, 0.68, 0.82, 0.94].forEach((fx, i) =>
        drawTree(rect.width * fx, groundY + 6, (1.6 + (i % 3) * 0.25) * (0.8 + dayAlpha * 0.2))
      );

      if (!s.walkersInit) initWalkers(rect, groundY);
      if (!reduceMotion) {
        s.walkers.forEach((w) => {
          w.x += w.speed;
          if (w.x < 0) w.x = rect.width;
          if (w.x > rect.width) w.x = 0;
          drawWalker(w, now);
        });
      } else {
        s.walkers.forEach((w) => drawWalker(w, 0));
      }

      if (!reduceMotion) {
        if (!s.critter && now - s.critterTimer > 11000 + Math.random() * 8000) { s.critterTimer = now; s.critter = { x: -20, y: groundY - 6, life: 0 }; }
        if (s.critter) {
          s.critter.x += 1.2; s.critter.life++;
          const hop = Math.abs(Math.sin(s.critter.life * 0.15)) * 6;
          ctx.fillStyle = s.themeMix > 0.5 ? "rgba(200,200,200,0.7)" : "rgba(120,90,70,0.85)";
          ctx.beginPath(); ctx.ellipse(s.critter.x, s.critter.y - hop, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
          if (s.critter.x > rect.width + 20) s.critter = null;
        }
      }
    }

    function drawFirefly(f, now) {
      const pulse = reduceMotion ? 0.7 : 0.4 + 0.6 * Math.abs(Math.sin(now * 0.003 + f.phase));
      ctx.fillStyle = `rgba(220,255,140,${pulse * 0.9})`;
      ctx.beginPath(); ctx.arc(f.x, f.y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    function drawBee(b) {
      ctx.fillStyle = "rgba(40,30,10,0.85)";
      ctx.beginPath(); ctx.ellipse(b.x, b.y, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    }

    function step() {
      // Skip all simulation work while off-screen/backgrounded, but keep
      // scheduling frames so it resumes instantly once visible again.
      if (hiddenTabRef.current || !inView) {
        rafId = requestAnimationFrame(step);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const now = performance.now();
      drawSky(rect, now);
      if (s.pollen.length === 0 && !reduceMotion) initPollen(rect);
      drawParkGround(rect, now);

      if (s.flowers.length > s.maxFlowers) {
        const excess = s.flowers.length - s.maxFlowers;
        for (let i = 0; i < excess; i++) if (!s.flowers[i].fadeOutStart) s.flowers[i].fadeOutStart = now;
      }
      s.flowers = s.flowers.filter((f) => !(f.fadeOutStart && now - f.fadeOutStart > 900));

      if (!reduceMotion) {
        if (s.themeMix < 0.5 && s.flowers.length >= 6 && s.bees.length < 2 && Math.random() < 0.005) {
          s.bees.push({ x: Math.random() * rect.width, y: rect.height * 0.9, target: null });
        }
        s.bees.forEach((b) => {
          if (!b.target || Math.hypot(b.target.x - b.x, b.target.y - b.y) < 4) {
            const t = s.flowers[Math.floor(Math.random() * s.flowers.length)];
            if (t) b.target = { x: t.x, y: t.y - t.stemH * 0.9 };
          }
          if (b.target) { b.x += (b.target.x - b.x) * 0.03; b.y += (b.target.y - b.y) * 0.03; }
          drawBee(b);
        });

        if (s.themeMix > 0.5 && s.flowers.length >= FIREFLY_THRESHOLD && s.fireflies.length < MAX_FIREFLIES && Math.random() < 0.008) {
          s.fireflies.push({ x: Math.random() * rect.width, y: rect.height * GROUND_RATIO * 0.5 + Math.random() * rect.height * GROUND_RATIO * 0.4, angle: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.2, phase: Math.random() * 10, turnPhase: Math.random() * 10 });
        }
        if (s.themeMix < 0.3) s.fireflies = [];
        s.fireflies.forEach((f) => {
          f.turnPhase += 0.01; f.angle += Math.sin(f.turnPhase) * 0.04;
          f.x += Math.cos(f.angle) * f.speed; f.y += Math.sin(f.angle) * f.speed * 0.5;
          if (f.x < 0) f.x = rect.width; if (f.x > rect.width) f.x = 0;
          if (f.y < rect.height * GROUND_RATIO * 0.4) f.y = rect.height * GROUND_RATIO * 0.4;
          if (f.y > rect.height * GROUND_RATIO) f.y = rect.height * GROUND_RATIO;
          drawFirefly(f, now);
        });
      }

      s.flowers.forEach((f) => {
        const growSpeed = s.mouseDown && Math.hypot(s.mouseX - f.x, s.mouseY - f.y) < 40 ? 2.2 : 1;
        const t = (now - f.born) * growSpeed;
        const growT = reduceMotion ? 1 : Math.min(t / 700, 1);
        const fade = f.fadeOutStart ? Math.max(0, 1 - (now - f.fadeOutStart) / 900) : 1;
        const sway = reduceMotion ? 0 : Math.sin(now * f.swaySpeed + f.swayPhase) * f.swayAmp * growT + s.windGust * 6;
        groundShadow(ctx, f.x, f.y, 6 * growT, 0.12 * fade);
        const { topX, topY, cxCtrl, cyCtrl } = drawStemAndLeaf(ctx, f.x, f.y, growT, fade, sway, f.stemH);
        if (growT > 0.5) {
          const bloomT = Math.min((growT - 0.5) / 0.5, 1);
          if (f.bloomCount === 1) {
            drawFlowerByType(ctx, f.type, topX, topY, bloomT, fade, f.colorway, 1);
          } else {
            for (let i = 0; i < f.bloomCount; i++) {
              const tt = 0.35 + (i / (f.bloomCount - 1)) * 0.65;
              const pt = bezierPoint(tt, f.x, f.y, cxCtrl, cyCtrl, topX, topY);
              const side = i % 2 === 0 ? -1 : 1;
              drawFlowerByType(ctx, f.type, pt.x + side * 4, pt.y, bloomT, fade, f.colorway, 0.6);
            }
          }
        }
      });

      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchend", onUp);
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme, getPoint, reduceMotion, inView]);

  return (
    <div id="playground" className="relative w-full h-[380px] sm:h-[460px] rounded-t-3xl overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      <audio
        ref={audioRef}
        loop
        src={theme === "dark" ? "/audio/ambient-garden-night.mp3" : "/audio/ambient-garden-day.mp3"}
      />

      <SoundToggle soundOn={soundOn} setSoundOn={setSoundOn} audioRef={audioRef} theme={theme} />

      <div
        className="absolute inset-0 z-10 flex flex-col items-center pt-8 sm:pt-10 px-4 text-center pointer-events-none transition-opacity duration-500"
        style={{ opacity: textHidden ? 0 : 1 }}
      >
        <p className="font-thin-serif italic text-xl sm:text-2xl mb-1" style={{ color: "#2a2015" }}>{greeting}</p>
        <p className="text-xs sm:text-sm" style={{ color: "#5a4d3a" }}>Move your cursor near the ground. Hold to grow faster.</p>
        <p className="text-xs mt-2 transition-opacity duration-1000" style={{ color: "#5a4d3a", opacity: hiddenMsgVisible ? 1 : 0 }}>
          You've planted quite a garden.
        </p>
      </div>
    </div>
  );
}