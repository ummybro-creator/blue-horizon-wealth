import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  /** Shown while loading — defaults to a shimmer skeleton */
  placeholder?: React.ReactNode;
  /** Shown on load error */
  fallback?: React.ReactNode;
  /** Extra wrapper class */
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

const shimmer = (
  <div
    className="w-full h-full animate-pulse rounded-inherit"
    style={{ background: 'linear-gradient(90deg, #f0ece8 25%, #e8e4e0 50%, #f0ece8 75%)', backgroundSize: '200% 100%' }}
  />
);

const defaultFallback = (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-inherit">
    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// Simple in-memory set to track successfully loaded URLs so re-renders are instant
const loadedCache = new Set<string>();

export function LazyImage({
  src,
  alt,
  className,
  style,
  placeholder = shimmer,
  fallback = defaultFallback,
  wrapperClassName,
  wrapperStyle,
}: LazyImageProps) {
  const alreadyCached = loadedCache.has(src);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    alreadyCached ? 'loaded' : 'loading'
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visible, setVisible] = useState(alreadyCached);

  // Use IntersectionObserver for true lazy loading
  useEffect(() => {
    if (alreadyCached) return;
    const el = imgRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before entering viewport
    );
    observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [alreadyCached]);

  const handleLoad = () => {
    loadedCache.add(src);
    setStatus('loaded');
  };

  const handleError = () => {
    setStatus('error');
  };

  return (
    <div className={`relative overflow-hidden ${wrapperClassName ?? ''}`} style={wrapperStyle}>
      {/* Placeholder / skeleton shown while loading */}
      {status !== 'loaded' && status !== 'error' && (
        <div className="absolute inset-0">{placeholder}</div>
      )}

      {/* Error fallback */}
      {status === 'error' && (
        <div className="absolute inset-0">{fallback}</div>
      )}

      {/* The actual image — only set src once visible */}
      <img
        ref={imgRef}
        src={visible ? src : undefined}
        alt={alt}
        decoding="async"
        loading="lazy"
        className={`${className ?? ''} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
