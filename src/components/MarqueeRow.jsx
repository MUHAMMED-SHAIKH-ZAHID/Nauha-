import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";

function MarqueeRow({ text, speed = 60, className = "" }) {
  const x = useMotionValue(0);
  const rowRef = useRef(null);

  useAnimationFrame((t, delta) => {
    if (!rowRef.current) return;
    const rowWidth = rowRef.current.scrollWidth / 2; // half, since content is duplicated
    let next = x.get() - (speed * delta) / 1000;
    if (next <= -rowWidth) next += rowWidth; // seamless wrap
    x.set(next);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <motion.div ref={rowRef} style={{ x }} className={`flex ${className}`}>
        {[0, 1].map((i) => (
          <h2
            key={i}
            className="font-display font-bold uppercase text-[clamp(4rem,14vw,12rem)] leading-none pr-8 shrink-0"
          >
            {text}
          </h2>
        ))}
      </motion.div>
    </div>
  );
}

export default function TextMarqueeSection() {
  return (
    <section className="w-full overflow-hidden py-6 bg-[#fffdf9] dark:bg-black transition-colors duration-500 text-black dark:text-white">
      <MarqueeRow text="FRONTEND DEVELOPER · " speed={550} />
      <MarqueeRow text="UI / UX DESIGNER · " speed={150} className="mt-2" />
    </section>
  );
}