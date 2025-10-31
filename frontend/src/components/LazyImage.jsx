import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImage } from '../utils/imageOptimizer';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/', '') || 'http://localhost:8000';

/**
 * Lazy Loading Image Component with Cloudinary optimization
 * Only loads images when they're about to enter the viewport
 */
function LazyImage({ src, alt, preset = 'CARD', className, onClick, style }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef(null);

  useEffect(() => {
    // Handle both Cloudinary and local images
    if (src) {
      if (src.includes('cloudinary.com')) {
        // Optimize Cloudinary images
        setImageSrc(getOptimizedImage(src, preset));
      } else if (src.startsWith('/media/')) {
        // Local Django media files
        setImageSrc(`${API_BASE_URL}${src}`);
      } else {
        // Use as-is
        setImageSrc(src);
      }
    }
  }, [src, preset]);

  useEffect(() => {
    if (!imgRef.current) return;

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={imgRef}
      className={className}
      onClick={onClick}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a3a52', // Placeholder color
      }}
    >
      {isInView && imageSrc && (
        <>
          <img
            src={imageSrc}
            alt={alt}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              console.error('Image failed to load:', imageSrc);
              e.target.src = '/placeholder-game.jpg';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
          {!isLoaded && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#9ed5c5',
                fontSize: '14px',
              }}
            >
              Loading...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LazyImage;
