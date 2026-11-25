import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Start every newly opened page at the top. Going back or forward with the
// browser buttons keeps the browser's own scroll position, so people land
// where they left off.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
