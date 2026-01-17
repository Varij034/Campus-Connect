'use client';

import { useEffect, useState, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme === 'dark' ? 'night' : 'light');
  }, []);

  const toggleTheme = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Get button position for ripple effect
    if (buttonRef.current && rippleRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const x = buttonRect.left + buttonRect.width / 2;
      const y = buttonRect.top + buttonRect.height / 2;
      
      // Calculate the maximum distance from center to corner
      const maxDistance = Math.max(
        Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
        Math.sqrt(Math.pow(window.innerWidth - x, 2) + Math.pow(y, 2)),
        Math.sqrt(Math.pow(x, 2) + Math.pow(window.innerHeight - y, 2)),
        Math.sqrt(Math.pow(window.innerWidth - x, 2) + Math.pow(window.innerHeight - y, 2))
      );
      
      rippleRef.current.style.left = `${x}px`;
      rippleRef.current.style.top = `${y}px`;
      rippleRef.current.style.setProperty('--ripple-size', `${maxDistance * 2}px`);
      rippleRef.current.classList.add('active');
    }
    
    // Delay theme change to sync with animation
    setTimeout(() => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme === 'dark' ? 'night' : 'light');
    }, 150);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      if (rippleRef.current) {
        rippleRef.current.classList.remove('active');
      }
    }, 500);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleTheme}
        className="btn btn-ghost btn-circle relative z-10 transition-transform duration-200 hover:scale-110"
        aria-label="Toggle theme"
        disabled={isTransitioning}
      >
        <div className="relative transition-all duration-300">
          {theme === 'light' ? (
            <Moon className="w-5 h-5 transition-all duration-300" />
          ) : (
            <Sun className="w-5 h-5 transition-all duration-300" />
          )}
        </div>
      </button>
      <div
        ref={rippleRef}
        className="theme-ripple"
        aria-hidden="true"
      />
    </>
  );
}
