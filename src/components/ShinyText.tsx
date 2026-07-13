"use client";

import React from "react";
import { motion } from "framer-motion";

export const ShinyText = ({
  text,
  className,
  theme = "cyan",
}: {
  text: string;
  className?: string;
  theme?: "cyan" | "pink";
}) => {
  const gradient =
    theme === "pink"
      ? "bg-[linear-gradient(110deg,#be185d,45%,#ffffff,55%,#be185d)] drop-shadow-[0_0_15px_rgba(254,9,121,0.8)]"
      : "bg-[linear-gradient(110deg,#0891b2,45%,#ffffff,55%,#0891b2)] drop-shadow-[0_0_15px_rgba(0,242,254,0.8)]";

  return (
    <motion.div
      initial={{ backgroundPosition: "200% center" }}
      animate={{ backgroundPosition: "-200% center" }}
      transition={{
        repeat: Infinity,
        duration: 6,
        ease: "linear",
      }}
      className={`inline-block ${gradient} bg-[length:200%_100%] bg-clip-text text-transparent ${
        className || ""
      }`}
    >
      {text}
    </motion.div>
  );
};
