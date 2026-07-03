'use client';

import { useEffect, useRef, useState } from 'react';

type LazyImgProps = {
  src: string;
  alt: string;
  className?: string;
};

const PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />');

export default function LazyImg({ src, alt, className }: LazyImgProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const root = document.getElementById('scroll-area') || null;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      {
        root,
        rootMargin: '400px', // start loading a bit before it scrolls into view
        threshold: 0,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={shouldLoad ? src : PLACEHOLDER}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
