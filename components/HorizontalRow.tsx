"use client";

import { ReactNode, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Props = {
  children: ReactNode;
  className?: string;
  /** Scroll amount in pixels for arrow clicks */
  scrollStep?: number;
};

export default function HorizontalRow({
  children,
  className = "",
  scrollStep = 560,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * scrollStep, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="
          absolute left-0 top-1/2 -translate-y-1/2 z-10
          hidden md:flex items-center justify-center
          h-8 w-8 rounded-full
          bg-black/60 text-white
          opacity-0 group-hover:opacity-100 transition
        "
      >
        <FiChevronLeft size={18} />
      </button>

      <div
        ref={scrollerRef}
        className={`
          mt-4 flex gap-4 overflow-x-auto
          scroll-smooth pb-2
          [scrollbar-width:none] [-ms-overflow-style:none]
          ${className}
        `}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="
          absolute right-0 top-1/2 -translate-y-1/2 z-10
          hidden md:flex items-center justify-center
          h-8 w-8 rounded-full
          bg-black/60 text-white
          opacity-0 group-hover:opacity-100 transition
        "
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}
