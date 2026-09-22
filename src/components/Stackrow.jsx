import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// Note: lucide-react dropped its brand/logo icons (Figma, Github, Slack,
// etc.) a while back - importing them now throws exactly the
// "does not provide an export named 'Figma'" error you hit. Everything
// below is a plain, generic lucide icon (the same ones already used
// elsewhere in this project, so they're confirmed to exist in your
// installed version) standing in for each tool, not an attempt at the
// brand's literal logo.
import {
  PenTool,
  GitBranch,
  Terminal,
  Sparkles,
  MessageCircle,
  Braces,
  Layers,
  Code2,
} from "lucide-react";

// Re-inspected muhid.de's "My stack" row properly this time - my first pass
// hovered it with a single teleported cursor position and read the style
// back over the network, which was fast enough to catch it before the
// spring had actually moved anything, so I concluded (wrongly) that nothing
// happens. Redid it with a real, gradual hover and read the live inline
// transform matrix mid-animation. Here's what's actually there:
//
//   - The HOVERED icon drops straight down ~42px (translateY only, no
//     scale - the "bigger" look in a screenshot is their separate custom
//     cursor rendering on top of it, not the icon itself growing).
//   - Its immediate neighbor on each side slides away ~27px.
//   - The next icon out on each side slides away ~11px.
//   - Anything further than that doesn't move at all.
//   - The hovered icon's z-index is NOT boosted, so it visually tucks
//     behind the icons to its right as it drops - it's built to duck out
//     of the way, not to pop to the front.
//
// That's the real "moving far, buttery smooth" effect - a symmetric,
// distance-based ripple, not a static row. Rebuilt below with those exact
// measured offsets, driven by spring physics (not a linear tween) so it
// settles the way the original does instead of snapping to each value.

const TOOLS = [
  { name: "Figma", icon: PenTool, bg: "#0ACF83" },
  { name: "GitHub", icon: GitBranch, bg: "#171515" },
  { name: "VS Code", icon: Terminal, bg: "#007ACC" },
  { name: "Framer", icon: Sparkles, bg: "#0055FF" },
  { name: "Slack", icon: MessageCircle, bg: "#611F69" },
  { name: "ChatGPT", icon: Braces, bg: "#10A37F" },
  { name: "Linear", icon: Layers, bg: "#5E6AD2" },
  { name: "Design", icon: Code2, bg: "#F45B69" },
];

const ITEM_SIZE = 40;
const OVERLAP = 12; // px each item overlaps the previous one at rest
const SPRING = { type: "spring", stiffness: 380, damping: 26, mass: 0.8 };

// Measured directly off the live site's inline transform, mid-hover.
const DROP_Y = 42; // the hovered icon itself
const PUSH_1 = 27; // its immediate neighbor, each side
const PUSH_2 = 11; // one further out, each side

export default function StackRow({ tools = TOOLS, label = "My stack", showLabel = true }) {
  const [hovered, setHovered] = useState(null); // index or null
  const [started, setStarted] = useState(false);
  const rootRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Same one-shot "animate in only once it's actually on screen" pattern
  // used in the contact section, so the row doesn't fire its entrance
  // stagger while it's still off-screen on load.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduceMotion || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // Distance-based falloff, matched to the real measured offsets: the
  // hovered icon drops down in place (z-index untouched, so it tucks behind
  // the icons ahead of it rather than jumping to the front), its neighbor
  // on each side slides away 27px, the next one out slides away 11px, and
  // anything further stays put.
  function stateFor(i) {
    const z = tools.length - i;
    if (hovered === null || reduceMotion) {
      return { y: 0, x: 0, z };
    }
    const d = i - hovered;
    const ad = Math.abs(d);
    if (ad === 0) return { y: DROP_Y, x: 0, z };
    if (ad === 1) return { y: 0, x: d > 0 ? PUSH_1 : -PUSH_1, z };
    if (ad === 2) return { y: 0, x: d > 0 ? PUSH_2 : -PUSH_2, z };
    return { y: 0, x: 0, z };
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-3">
      {/* Suppressed when embedded inside a labeled row elsewhere (e.g. the
          same "Services / Experience / Education" grid this drops into on
          the About page) so there's never a duplicate "stack" label. */}
      {showLabel && (
        <motion.p
          initial={started || reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="text-xs font-medium italic text-neutral-400 dark:text-neutral-500"
        >
          {label}
        </motion.p>
      )}

      {/* Top padding still reserves room for the tooltip that rises above
          the icons even with no text label above them. */}
      <div className="flex items-center" style={{ paddingTop: 28 }}>
        {tools.map((tool, i) => {
          const s = stateFor(i);
          const isHovered = hovered === i;
          return (
            // The hover handlers live on THIS outer wrapper, which never
            // moves - it's the fixed hit-area at the icon's original grid
            // slot. If they lived on the inner motion.div instead, the
            // moment the icon dropped down out from under the cursor it
            // would stop being "hovered", spring back up under the cursor,
            // get re-hovered, drop again... an infinite flicker. Keeping the
            // hoverable area stationary while only the visual icon inside it
            // animates is what the real site is doing to avoid exactly that.
            <div
              key={tool.name}
              className="relative"
              style={{ marginLeft: i === 0 ? 0 : -OVERLAP, zIndex: s.z }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
              tabIndex={0}
              aria-label={tool.name}
              aria-describedby={isHovered ? `stack-tip-${i}` : undefined}
            >
              <motion.div
                initial={started || reduceMotion ? false : { opacity: 0, y: 14, scale: 0.6 }}
                animate={{ opacity: 1, x: s.x, y: s.y, scale: 1 }}
                transition={{ ...SPRING, delay: started ? 0 : i * 0.045 }}
              >
                <div
                  className="grid place-items-center rounded-full shadow-sm ring-2 ring-white dark:ring-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
                  style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    background: tool.bg,
                    color: "#fff",
                    boxShadow: isHovered
                      ? "0 12px 20px -6px rgba(0,0,0,0.35)"
                      : "0 2px 6px rgba(0,0,0,0.12)",
                  }}
                >
                  <tool.icon size={18} strokeWidth={2} />
                </div>
              </motion.div>

              <AnimatePresence>
                {isHovered && !reduceMotion && (
                  <motion.span
                    id={`stack-tip-${i}`}
                    role="tooltip"
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={SPRING}
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap
                               rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900
                               text-[11px] font-medium px-2.5 py-1 shadow-lg"
                  >
                    {tool.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}