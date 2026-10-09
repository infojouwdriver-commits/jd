
"use client";

import React, { ReactNode, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContainerScrollProps {
  titleComponent?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface HeaderProps {
  translate: any;
  titleComponent?: ReactNode;
}

const Header = ({ translate, titleComponent }: HeaderProps) => {
  return (
    <motion.div style={{ y: translate }} className="mx-auto max-w-5xl text-center">
      {titleComponent}
    </motion.div>
  );
};

export function ContainerScroll({
  titleComponent,
  children,
  className,
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const translate = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), {
    stiffness: 120,
    damping: 20,
    mass: 0.5,
  });

  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 0.9]), {
    stiffness: 120,
    damping: 20,
    mass: 0.5,
  });

  const rotateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 18]), {
    stiffness: 120,
    damping: 20,
    mass: 0.5,
  });

  return (
    <div ref={containerRef} className={cn("relative flex min-h-[60rem] w-full items-center justify-center p-2 md:p-8", className)}>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center py-20">
        <Header translate={translate} titleComponent={titleComponent} />
        <motion.div
          style={{ scale, rotateX }}
          className="mt-10 w-full rounded-2xl border bg-background p-2 shadow-xl md:p-4"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default ContainerScroll;
