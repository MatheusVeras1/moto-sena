"use client";

import { MotionConfig } from "motion/react";

/**
 * Faz todas as animações do Motion respeitarem a preferência de
 * "reduzir movimento" do sistema do visitante.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
