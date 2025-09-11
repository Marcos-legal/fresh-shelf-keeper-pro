import { useState, useEffect } from "react";

// Enhanced mobile breakpoints
const BREAKPOINTS = {
  mobile: 640,   // sm
  tablet: 768,   // md
  desktop: 1024, // lg
} as const;

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface MobileEnhanced {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useMobileEnhanced(): MobileEnhanced {
  const [state, setState] = useState<MobileEnhanced>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        orientation: 'landscape',
        isTouch: false,
        screenWidth: 1024,
        screenHeight: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < BREAKPOINTS.mobile;
    const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop;
    const isDesktop = width >= BREAKPOINTS.desktop;
    
    let deviceType: DeviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType,
      orientation: width > height ? 'landscape' : 'portrait',
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < BREAKPOINTS.mobile;
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop;
      const isDesktop = width >= BREAKPOINTS.desktop;
      
      let deviceType: DeviceType = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      setState({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenWidth: width,
        screenHeight: height,
      });
    };

    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.desktop - 1}px)`);
    const orientationQuery = window.matchMedia('(orientation: portrait)');
    
    mediaQuery.addEventListener('change', updateState);
    orientationQuery.addEventListener('change', updateState);
    window.addEventListener('resize', updateState);

    return () => {
      mediaQuery.removeEventListener('change', updateState);
      orientationQuery.removeEventListener('change', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, []);

  return state;
}

// Touch gesture hooks
export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
}

// Virtual keyboard detection for better mobile UX
export function useVirtualKeyboard() {
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // Consider keyboard open if viewport height decreased by more than 150px
        setIsVirtualKeyboardOpen(heightDifference > 150);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  return { isVirtualKeyboardOpen };
}