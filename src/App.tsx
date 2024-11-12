import { useEffect, useState } from 'react';
import { ConsolePage } from './pages/ConsolePage';
import { MobileConsolePage } from './mobile/pages/MobileConsolePage';
import './App.scss';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div data-component="App">
      {isMobile ? <MobileConsolePage /> : <ConsolePage />}
    </div>
  );
}

export default App;
