import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll para o topo quando a rota ou query params mudarem
    // Usar scroll instantâneo para evitar problemas de posicionamento
    window.scrollTo(0, 0);
    
    // Também garantir que o scroll está no topo após um pequeno delay
    // Isso resolve problemas com elementos que renderizam depois
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
