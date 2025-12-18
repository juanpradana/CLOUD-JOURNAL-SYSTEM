import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface MotionGlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const MotionGlassCard: React.FC<MotionGlassCardProps> = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      className={cn(
        "backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
