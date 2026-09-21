import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const PETAL_COUNT = 12;

export default function DahliaHover({ size = 90 }) {
  const { theme } = useTheme();

  const petalColor = theme === "dark" ? "#f2b155" : "#d8752f"; // warm gold/amber, matches your site palette
  const innerColor = theme === "dark" ? "#fddca0" : "#f4a83c";
  const centerColor = theme === "dark" ? "#5a3312" : "#7a3f10";

  const petals = Array.from({ length: PETAL_COUNT });

  return (
    <motion.div
      className="relative inline-block"
      style={{ width: size, height: size }}
      initial="rest"
      whileHover="bloom"
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* Outer ring of petals */}
        {petals.map((_, i) => {
          const angle = (360 / PETAL_COUNT) * i;
          return (
            <motion.g
              key={`outer-${i}`}
              style={{ originX: "100px", originY: "100px" }}
              variants={{
                rest: { rotate: angle, scale: 1 },
                bloom: { rotate: angle + 4, scale: 1.12 },
              }}
              transition={{ duration: 0.5, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
            >
              <ellipse cx="100" cy="55" rx="14" ry="34" fill={petalColor} opacity="0.9" />
            </motion.g>
          );
        })}

        {/* Inner ring of petals, offset, smaller, brighter */}
        {petals.slice(0, 8).map((_, i) => {
          const angle = (360 / 8) * i + 15;
          return (
            <motion.g
              key={`inner-${i}`}
              style={{ originX: "100px", originY: "100px" }}
              variants={{
                rest: { rotate: angle, scale: 1 },
                bloom: { rotate: angle - 6, scale: 1.2 },
              }}
              transition={{ duration: 0.45, delay: 0.08 + i * 0.02, ease: [0.22, 1, 0.36, 1] }}
            >
              <ellipse cx="100" cy="68" rx="9" ry="22" fill={innerColor} opacity="0.95" />
            </motion.g>
          );
        })}

        {/* Center */}
        <motion.circle
          cx="100"
          cy="100"
          r="14"
          fill={centerColor}
          variants={{ rest: { scale: 1 }, bloom: { scale: 1.15 } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}