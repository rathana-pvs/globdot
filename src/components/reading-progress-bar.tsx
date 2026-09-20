'use client';

import { useEffect, useState } from 'react';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const article = document.querySelector('.article-content') || document.getElementById('content');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Total scrollable distance of the article content
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) {
        setProgress(rect.top <= 0 ? 100 : 0);
        return;
      }

      // How far we have scrolled past the top of the article
      const scrolled = -rect.top;
      const percentage = Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100));
      setProgress(percentage);
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });
    calculateProgress();

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, []);

  return (
    <div className="reading-progress-bar" aria-hidden="true">
      <div
        className="reading-progress-fill"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
