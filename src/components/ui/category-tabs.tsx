// Selected-pill motion adapted from https://ui.aceternity.com/components/tabs
import { motion } from "motion/react";
export function CategoryTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { name: string; count: number }[];
  active: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="category-tabs" aria-label="作品分类">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          className="category-button"
          aria-pressed={active === tab.name}
          onClick={() => onChange(tab.name)}
        >
          {active === tab.name && (
            <motion.span
              className="category-pill"
              layoutId="clickedbutton"
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">
            {tab.name}
            <small>{tab.count}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
