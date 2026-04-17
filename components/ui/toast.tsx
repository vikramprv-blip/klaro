"use client";

import { AnimatePresence, motion } from "framer-motion";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
};

export default function ToastStack({
  toasts,
}: {
  toasts: ToastItem[];
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="rounded-2xl border bg-white p-4 shadow-2xl"
          >
            <div className="text-sm font-semibold text-zinc-900">{toast.title}</div>
            {toast.description ? (
              <div className="mt-1 text-sm text-zinc-500">{toast.description}</div>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
