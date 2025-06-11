import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MiniCartPortalProps {
  children: React.ReactNode;
}

const MiniCartPortal = ({ children }: MiniCartPortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("mini-cart-portal");
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
};

export default MiniCartPortal;
