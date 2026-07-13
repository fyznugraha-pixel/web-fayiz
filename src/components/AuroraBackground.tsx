"use client";

import { motion } from "framer-motion";
import React, { ReactNode } from "react";

export const AuroraBackground = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <main className={`relative flex flex-col min-h-screen bg-slate-50 dark:bg-[#070713] text-slate-900 dark:text-white transition-bg ${className || ""}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`
            absolute -inset-[10px] opacity-60
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,#38bdf8_10%,#818cf8_30%,#f472b6_50%,#34d399_70%,#38bdf8_90%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px]
            after:content-[""] after:absolute after:inset-0 
            after:[background-image:var(--white-gradient),var(--aurora)] 
            dark:after:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-overlay dark:after:mix-blend-difference
            pointer-events-none absolute -inset-[10px] opacity-60 will-change-transform`
          }
        ></div>
      </div>
      {children}
    </main>
  );
};
