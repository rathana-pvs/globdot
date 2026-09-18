'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ArticleLeadImageProps {
  imageUrl: string;
  alt: string;
  displayMode?: 'auto' | 'ambient' | 'banner';
  focalPosition?: 'auto' | 'top' | 'center' | 'bottom';
  imageMeta?: {
    width?: number;
    height?: number;
    focalPosition?: 'top' | 'center' | 'bottom';
    focalX?: number;
    focalY?: number;
  };
}

export function ArticleLeadImage({
  imageUrl,
  alt,
  displayMode = 'auto',
  focalPosition = 'auto',
  imageMeta,
}: ArticleLeadImageProps) {
  // If dimensions are present from SSR/database, calculate ratio upfront
  const initialIsPortrait =
    Boolean(imageMeta?.width && imageMeta?.height && (imageMeta.height / imageMeta.width >= 0.8));

  const [isPortrait, setIsPortrait] = useState<boolean>(initialIsPortrait);

  // Determine if ambient mode should be used
  const useAmbient =
    displayMode === 'ambient' ||
    (displayMode === 'auto' && isPortrait);

  // Resolve focal position for banner mode
  const resolvedFocal =
    focalPosition !== 'auto'
      ? focalPosition
      : imageMeta?.focalPosition || (isPortrait ? 'top' : 'center');

  let objectPosition = '50% 25%';
  if (imageMeta?.focalX != null && imageMeta?.focalY != null) {
    objectPosition = `${imageMeta.focalX}% ${imageMeta.focalY}%`;
  } else if (resolvedFocal === 'top') {
    objectPosition = '50% 18%';
  } else if (resolvedFocal === 'bottom') {
    objectPosition = '50% 82%';
  } else if (resolvedFocal === 'center') {
    objectPosition = '50% 50%';
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalHeight / img.naturalWidth;
      // If height is at least 80% of width (e.g. 4:3, square 1:1, or tall portrait)
      if (ratio >= 0.8) {
        setIsPortrait(true);
      }
    }
  };

  if (useAmbient) {
    return (
      <div className="article-lead-visual is-ambient relative overflow-hidden" data-display-mode="ambient">
        {/* Soft ambient blurred backdrop */}
        <div className="article-lead-ambient-backdrop" aria-hidden="true">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="ambient-backdrop-blur"
            priority={false}
          />
          <div className="ambient-backdrop-tint" />
        </div>

        {/* Crisp uncropped foreground image */}
        <div className="article-lead-ambient-foreground">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 880px"
            className="object-contain"
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="article-lead-visual relative overflow-hidden" data-display-mode="banner">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority
        sizes="(max-width: 900px) 100vw, 880px"
        className="object-cover"
        style={{ objectPosition }}
        onLoad={handleImageLoad}
      />
    </div>
  );
}
