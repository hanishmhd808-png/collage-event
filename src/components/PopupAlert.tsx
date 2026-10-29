"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, AlertTriangle, Info, ArrowRight } from "lucide-react";

export interface PopupAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  badge?: string;
  type?: "info" | "success" | "warning" | "alert" | "action";
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  children?: React.ReactNode;
}

export default function PopupAlert({
  isOpen,
  onClose,
  title,
  message,
  badge = "EVENTORA Alert",
  type = "info",
  primaryAction,
  secondaryAction,
  children,
}: PopupAlertProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case "alert":
        return <Sparkles className="w-6 h-6 text-blue-400" />;
      default:
        return <Info className="w-6 h-6 text-violet-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg glass-dark border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            style={{
              background: "rgba(13, 14, 24, 0.96)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(10, 132, 255, 0.15)",
            }}
          >
            {/* Top Accent Gradient Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, #0a84ff, #bf5af2, #32d2e8)",
              }}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{ background: "rgba(255, 255, 255, 0.05)" }}
                >
                  {getIcon()}
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/70 mb-1 border border-white/10">
                    {badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {title}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
              {message}
            </p>

            {/* Optional Custom Content */}
            {children && <div className="mb-6">{children}</div>}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (secondaryAction?.onClick) secondaryAction.onClick();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl glass border border-white/15 text-white/70 hover:text-white text-sm font-semibold transition-all hover:bg-white/10 text-center"
              >
                {secondaryAction?.label || "Dismiss"}
              </button>

              {primaryAction && (
                <button
                  type="button"
                  onClick={() => {
                    primaryAction.onClick();
                    onClose();
                  }}
                  className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {primaryAction.label}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
