import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, hash, key } = useLocation();

    useEffect(() => {
        // If there's no hash, scroll to top
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            // If there's a hash, scroll to the element with that ID after a short delay
            // to ensure the DOM is rendered
            const scrollWithHash = () => {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            };

            // Short delay to allow component mounting
            const timer = setTimeout(scrollWithHash, 100);
            return () => clearTimeout(timer);
        }
    }, [pathname, hash, key]);

    return null;
};

export default ScrollToTop;
