import { useEffect, useRef, useState } from "react";

// ─── useCountUp ───────────────────────────────────────────────────────────────
// Animates a number counting up from 0 to target value
// Used for stats cards on the dashboard
export const useCountUp = (target, duration = 600) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!target) return;

    let startTime = null;
    const startValue = 0;
    const endValue = parseFloat(target) || 0;

    // requestAnimationFrame gives us smooth 60fps animation
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      // How far through the animation are we? (0 to 1)
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out — fast start, slow end
      // This formula makes it feel snappy
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // Calculate current value
      setCurrent(startValue + (endValue - startValue) * easeOut);

      // Keep animating until progress reaches 1
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
};

// ─── useEntrance ──────────────────────────────────────────────────────────────
// Returns a className to apply entrance animation to any element
// The element will animate in when it first renders
export const useEntrance = (animClass = "anim-fadeIn", delay = 0) => {
  const [className, setClassName] = useState("");

  useEffect(() => {
    // Small timeout to allow the DOM to paint before animating
    const timer = setTimeout(() => {
      setClassName(animClass);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return className;
};

// ─── useStaggered ─────────────────────────────────────────────────────────────
// Returns staggered animation delays for lists
// Each item in a list animates in slightly after the previous one
// Usage: items.map((item, i) => <div style={getStaggerStyle(i)}>...)
export const useStaggered = (baseDelay = 0, step = 40) => {
  const getStaggerStyle = (index) => ({
    animationDelay: `${baseDelay + index * step}ms`,
    opacity: 0, // start invisible
    animation: `slideInRight 0.18s ease-out ${baseDelay + index * step}ms both`,
  });

  return { getStaggerStyle };
};

// ─── useClickFeedback ─────────────────────────────────────────────────────────
// Adds a flash class when an element is clicked for visual feedback
export const useClickFeedback = () => {
  const ref = useRef(null);

  const triggerFeedback = () => {
    if (!ref.current) return;
    ref.current.classList.remove("flash-success");
    // Force reflow so the animation restarts even if clicked twice
    void ref.current.offsetWidth;
    ref.current.classList.add("flash-success");
  };

  return { ref, triggerFeedback };
};
