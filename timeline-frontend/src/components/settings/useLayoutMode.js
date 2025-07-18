import { useState, useEffect } from 'react';

/**
 * Hook to determine the appropriate layout mode based on screen size
 * @returns {'grid' | 'list' | 'compact'} The current layout mode
 */
export const useLayoutMode = () => {
  const [layout, setLayout] = useState('list');

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 768) {
        setLayout('compact');
      } else if (window.innerWidth < 1024) {
        setLayout('list');
      } else {
        setLayout('grid');
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return layout;
};

export default useLayoutMode;
