
import React, { useState, useCallback, useEffect } from 'react';
import Experience from './components/Experience';
// Ensure this import is relative './' and points to the components folder
import OverlayUI from './components/OverlayUI';
import { AppState } from './types';
import { MEMORY_LANE } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SCATTERED');
  const [userName, setUserName] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1); // -1 means no slide active

  // Sequence Logic
  useEffect(() => {
    if (appState === 'SEQUENCE') {
      let slide = 0;
      setCurrentSlideIndex(0);

      const interval = setInterval(() => {
        slide++;
        if (slide < MEMORY_LANE.length) {
          setCurrentSlideIndex(slide);
        } else {
          // Sequence finished
          clearInterval(interval);
          setAppState('FORMING');
          setCurrentSlideIndex(-1);
        }
      }, 4000); // 4 seconds per slide for faster pace (was 6000)

      return () => clearInterval(interval);
    }
  }, [appState]);

  const handleJoin = useCallback(() => {
    setAppState('SEQUENCE');
  }, []);

  const handleTreeFormed = useCallback(() => {
    // When tree is done forming, show the Register Prompt
    setAppState('REGISTER');
  }, []);

  const handleRegister = useCallback(() => {
    setAppState('INPUT');
  }, []);

  const handleSubmitName = useCallback((name: string) => {
    setUserName(name);
    setAppState('ITINERARY');
  }, []);

  const handleGrabTicket = useCallback(() => {
    setAppState('TICKET');
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience 
          appState={appState} 
          onTreeFormed={handleTreeFormed} 
          currentSlideIndex={currentSlideIndex}
        />
      </div>

      {/* HTML UI Layer */}
      <OverlayUI 
        appState={appState} 
        onJoin={handleJoin} 
        onSubmitName={handleSubmitName}
        onGrabTicket={handleGrabTicket}
        onRegister={handleRegister}
        userName={userName}
        currentSlideIndex={currentSlideIndex}
      />
    </div>
  );
};

export default App;
