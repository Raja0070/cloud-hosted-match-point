import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only enable for desktop devices with fine pointer (mouse)
    const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasPointer) return;

    setEnabled(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPos({ x: mouseX, y: mouseY });

      // Check hover state on clickable elements
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button, a, input, select, textarea, label, [role="button"]')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      setTrailingPos({ x: ringX, y: ringY });
      rafId = requestAnimationFrame(animateRing);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Center sharp dot */}
      <div
        id="cursor-dot"
        className="pointer-events-none fixed z-50 w-1.5 h-1.5 rounded-full bg-emerald-600 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          opacity: pos.x === -100 ? 0 : 1
        }}
      />

      {/* Trailing soft ring */}
      <div
        id="cursor-ring"
        className={`pointer-events-none fixed z-40 rounded-full border border-emerald-500/50 -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color] duration-200 ease-out ${
          isHovered
            ? 'w-11 h-11 border-emerald-600/80 bg-emerald-500/10'
            : 'w-8 h-8 bg-transparent'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          opacity: trailingPos.x === -100 ? 0 : 1
        }}
      />
    </>
  );
}
