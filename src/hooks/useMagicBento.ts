// src/hooks/useMagicBento.ts
import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { MagicBentoSettings } from '../ThemeService';

const createParticleElement = (
  x: number,
  y: number,
  color: string
): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

export const useMagicBento = (
  gridRef: React.RefObject<HTMLDivElement>,
  settings: MagicBentoSettings,
  isEditable: boolean,
  layouts: any,
  mousePosition: { x: number, y: number }
) => {
  const {
    isEnabled,
    enableStars,
    enableSpotlight,
    spotlightRadius,
    particleCount,
    enableTilt,
    glowColor,
    clickEffect,
    enableBorderGlow,
    intensity,
  } = settings;

  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number>();
  const hoveredCardRef = useRef<HTMLElement | null>(null);

  const updateEffects = useCallback(() => {
    if (!isEnabled || !gridRef.current) {
      if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
      return;
    }

    const cards = Array.from(gridRef.current.querySelectorAll('.widget-container')) as HTMLElement[];
    if (cards.length === 0) return;

    let currentlyHoveredCard: HTMLElement | null = null;
    
    cards.forEach(card => {
      card.style.setProperty('--glow-color-rgb', glowColor);
      const rect = card.getBoundingClientRect();
      const isHovered = mousePosition.x >= rect.left && mousePosition.x <= rect.right &&
                        mousePosition.y >= rect.top && mousePosition.y <= rect.bottom;
      
      if (isHovered) {
        currentlyHoveredCard = card;
      }

      const x = mousePosition.x - rect.left;
      const y = mousePosition.y - rect.top;

      gsap.set(card, {
        '--glow-x': `${(x / rect.width) * 100}%`,
        '--glow-y': `${(y / rect.height) * 100}%`,
        '--glow-radius': `${spotlightRadius}px`,
      });
    });

    if (currentlyHoveredCard !== hoveredCardRef.current) {
      if (hoveredCardRef.current) {
        gsap.to(hoveredCardRef.current, { '--glow-intensity': 0, duration: 0.3 });
      }
      if (currentlyHoveredCard) {
        gsap.to(currentlyHoveredCard, { '--glow-intensity': intensity, duration: 0.3 });
      }
      hoveredCardRef.current = currentlyHoveredCard;
    }
    
    if (spotlightRef.current) {
      gsap.set(spotlightRef.current, {
        x: mousePosition.x - spotlightRadius,
        y: mousePosition.y - spotlightRadius,
      });

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(mousePosition.x - centerX, mousePosition.y - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);
      });

      const targetOpacity = minDistance <= proximity ? 0.8 : minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8 : 0;
      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    }

    animationFrameId.current = requestAnimationFrame(updateEffects);
  }, [isEnabled, gridRef, spotlightRadius, glowColor, intensity, mousePosition]);


  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(updateEffects);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateEffects]);


  useEffect(() => {
    if (enableSpotlight && !spotlightRef.current) {
      const spotlight = document.createElement('div');
      spotlight.className = 'global-spotlight';
      document.body.appendChild(spotlight);
      spotlightRef.current = spotlight;
    } else if (!enableSpotlight && spotlightRef.current) {
      spotlightRef.current.remove();
      spotlightRef.current = null;
    }
    // Cleanup on unmount
    return () => {
        if (spotlightRef.current) {
            spotlightRef.current.remove();
            spotlightRef.current = null;
        }
    }
  }, [enableSpotlight]);

  useEffect(() => {
    if (spotlightRef.current) {
      gsap.set(spotlightRef.current, {
        width: `${spotlightRadius * 2}px`,
        height: `${spotlightRadius * 2}px`,
        background: `radial-gradient(circle,
          rgba(${glowColor}, 0.15) 0%,
          rgba(${glowColor}, 0.08) 15%,
          rgba(${glowColor}, 0.04) 25%,
          rgba(${glowColor}, 0.02) 40%,
          rgba(${glowColor}, 0.01) 65%,
          transparent 70%
        )`,
      });
    }
  }, [spotlightRadius, glowColor]);


  useEffect(() => {
    if (!gridRef.current) return;

    const activeCleanups = new Map<HTMLElement, () => void>();

    const applyEffectsToCard = (card: HTMLElement) => {
      if (activeCleanups.has(card)) return; // Already processed

      if (enableBorderGlow) {
        card.classList.add('widget-container--border-glow');
      } else {
        card.classList.remove('widget-container--border-glow');
      }
      let particles: HTMLDivElement[] = [];
      let timeouts: NodeJS.Timeout[] = [];
      let memoizedParticles: HTMLDivElement[] | null = null;
      
      const clearAllParticles = () => {
        timeouts.forEach(clearTimeout);
        timeouts = [];
        
        particles.forEach(p => {
          gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => p.remove() });
        });
        particles = [];
      };

      const handleCardMouseEnter = () => {
        if (enableStars) {
          if (!memoizedParticles) {
            const { width, height } = card.getBoundingClientRect();
            memoizedParticles = Array.from({ length: particleCount }, () =>
              createParticleElement(Math.random() * width, Math.random() * height, glowColor)
            );
          }
          memoizedParticles.forEach((particle, index) => {
            const timeoutId = setTimeout(() => {
              const clone = particle.cloneNode(true) as HTMLDivElement;
              card.appendChild(clone);
              particles.push(clone);
              gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
              gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
              gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
            }, index * 100);
            timeouts.push(timeoutId);
          });
        }
        if (enableTilt) {
          gsap.to(card, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
        }
      };

      const handleCardMouseLeave = () => {
        clearAllParticles();
        if (enableTilt) {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
        }
      };

      const handleCardMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (enableTilt) {
          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;
          gsap.to(card, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
        }
      };

      const handleCardClick = (e: MouseEvent) => {
        if (clickEffect) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const maxDistance = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));

          const ripple = document.createElement('div');
          ripple.style.cssText = `
            position: absolute;
            width: ${maxDistance * 2}px;
            height: ${maxDistance * 2}px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
            left: ${x - maxDistance}px;
            top: ${y - maxDistance}px;
            pointer-events: none;
            z-index: 1000;
          `;
          card.appendChild(ripple);
          gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
        }
      };

      // We still need these for tilt and stars
      card.addEventListener('mouseenter', handleCardMouseEnter);
      card.addEventListener('mouseleave', handleCardMouseLeave);
      card.addEventListener('mousemove', handleCardMouseMove);
      card.addEventListener('click', handleCardClick);

      const cleanup = () => {
        card.removeEventListener('mouseenter', handleCardMouseEnter);
        card.removeEventListener('mouseleave', handleCardMouseLeave);
        card.removeEventListener('mousemove', handleCardMouseMove);
        card.removeEventListener('click', handleCardClick);
        clearAllParticles();
      };
      
      activeCleanups.set(card, cleanup);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
              if (node.matches('.widget-container')) {
                applyEffectsToCard(node);
              }
              node.querySelectorAll('.widget-container').forEach(card => applyEffectsToCard(card as HTMLElement));
          }
        }
        for (const node of mutation.removedNodes) {
            if (node instanceof HTMLElement) {
                const cleanup = activeCleanups.get(node);
                if (cleanup) {
                    cleanup();
                    activeCleanups.delete(node);
                }
            }
        }
      }
    });

    observer.observe(gridRef.current, { childList: true, subtree: true });

    // Apply to existing cards
    const initialCards = Array.from(gridRef.current.querySelectorAll('.widget-container')) as HTMLElement[];
    initialCards.forEach(applyEffectsToCard);

    return () => {
      observer.disconnect();
      activeCleanups.forEach(cleanup => cleanup());
    };
  }, [
    gridRef,
    layouts,
    isEnabled,
    enableStars,
    particleCount,
    glowColor,
    enableTilt,
    clickEffect,
    enableBorderGlow,
    intensity,
  ]);
}; 