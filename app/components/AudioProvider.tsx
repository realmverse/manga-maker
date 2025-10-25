'use client';

import { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';

interface AudioContextType {
  isMusicMuted: boolean;
  toggleMusicMute: () => void;
  setBackgroundMusic: (src: string) => void;
  // For future SFX support
  playSFX: (src: string, volume?: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
  initialMusic?: string;
}

export function AudioProvider({ children, initialMusic }: AudioProviderProps) {
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const currentMusicSrc = useRef<string | null>(null);

  // Initialize on client side only
  useEffect(() => {
    setIsClient(true);
    
    // Create background music audio element
    if (typeof window !== 'undefined') {
      backgroundMusicRef.current = new Audio();
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.5; // Set default volume to 50%
      
      // Load initial music if provided
      if (initialMusic) {
        backgroundMusicRef.current.src = initialMusic;
        currentMusicSrc.current = initialMusic;
        
        // Attempt to play (may be blocked by browser autoplay policy)
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay was prevented - this is expected on most browsers
            // User will need to interact with the page first
            console.log('Autoplay prevented - waiting for user interaction');
          });
        }
      }
    }

    return () => {
      // Cleanup audio on unmount
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, [initialMusic]);

  const toggleMusicMute = () => {
    if (backgroundMusicRef.current) {
      if (isMusicMuted) {
        // Unmute and play
        backgroundMusicRef.current.muted = false;
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing music:', error);
          });
        }
      } else {
        // Mute
        backgroundMusicRef.current.muted = true;
      }
      setIsMusicMuted(!isMusicMuted);
    }
  };

  const setBackgroundMusic = (src: string) => {
    if (backgroundMusicRef.current && currentMusicSrc.current !== src) {
      currentMusicSrc.current = src;
      backgroundMusicRef.current.src = src;
      backgroundMusicRef.current.muted = isMusicMuted;
      
      const playPromise = backgroundMusicRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Error playing music:', error);
        });
      }
    }
  };

  const playSFX = (src: string, volume: number = 0.7) => {
    if (typeof window !== 'undefined' && !isMusicMuted) {
      const sfx = new Audio(src);
      sfx.volume = volume;
      sfx.play().catch((error) => {
        console.error('Error playing SFX:', error);
      });
    }
  };

  const value: AudioContextType = {
    isMusicMuted,
    toggleMusicMute,
    setBackgroundMusic,
    playSFX,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

