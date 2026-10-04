// Adapted from https://ui.aceternity.com/components/card-hover-effect
// Same shared layout hover surface; gallery content replaces demo descriptions.
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
export function GalleryHoverEffect({
  items,
  renderItem,
}: {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="works-grid" id="works">
      {items.map((item) => (
        <article
          key={item.id}
          className="hover-item group"
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(item.id)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setHovered(null);
          }}
        >
          <AnimatePresence>
            {hovered === item.id && (
              <motion.span
                className="hover-surface"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="work-card">{renderItem(item)}</div>
        </article>
      ))}
    </div>
  );
}
