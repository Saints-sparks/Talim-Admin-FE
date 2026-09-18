import { useEffect } from 'react';

/**
 * Freezes page scroll behind an open overlay and restores the previous scroll
 * position when it closes.
 *
 * Setting `overflow: hidden` alone makes the browser forget where the page was,
 * so a modal opened halfway down a long list would dump the user back at the
 * top on close. This pins the body in place instead and puts the scroll offset
 * back afterwards.
 *
 * @param isLocked - True while the overlay is open.
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflowY: body.style.overflowY,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflowY = 'scroll';

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflowY = previous.overflowY;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
