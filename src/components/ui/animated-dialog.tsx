// Visual motion adapted from https://ui.aceternity.com/components/animated-modal
// Native dialog supplies focus trapping, Escape, and modal semantics.
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { IconX } from "@tabler/icons-react";
export function AnimatedDialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const d = ref.current;
    if (open) {
      d?.showModal();
      const prior = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        d?.querySelector("video")?.pause();
        d?.close();
        document.body.style.overflow = prior;
      };
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="viewer"
      aria-labelledby="detail-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      {open && (
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
          <div className="dialog-top">
            <span>作品与制作资料</span>
            <button onClick={onClose} aria-label="关闭作品详情">
              <IconX size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      )}
    </dialog>
  );
}
