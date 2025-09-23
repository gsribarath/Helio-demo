import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Forces window scroll position to top on every route/pathname change.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Use requestAnimationFrame to ensure after DOM paint
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Fallback for some browsers that ignore custom behavior tokens
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    });
  }, [pathname]);
  return null;
}
