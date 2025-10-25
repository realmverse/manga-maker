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
  const musicStartedRef = useRef<boolean>(false);

  // Initialize on client side only
  useEffect(() => {
    setIsClient(true);
    
    // Create background music audio element
    if (typeof window !== 'undefined') {
      backgroundMusicRef.current = new Audio();
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.5; // Set default volume to 50%
      
      // Load initial music if provided (but don't play yet)
      if (initialMusic) {
        backgroundMusicRef.current.src = initialMusic;
        currentMusicSrc.current = initialMusic;
        // Don't attempt to play automatically - wait for user interaction
      }

      // Start music on first user interaction
      const startMusicOnInteraction = () => {
        if (!musicStartedRef.current && backgroundMusicRef.current && currentMusicSrc.current) {
          const playPromise = backgroundMusicRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                musicStartedRef.current = true;
                console.log('Background music started on user interaction');
              })
              .catch((error) => {
                console.error('Could not start background music:', error);
              });
          }
        }
      };

      // Add event listeners for first interaction
      document.addEventListener('click', startMusicOnInteraction, { once: true });
      document.addEventListener('keydown', startMusicOnInteraction, { once: true });
      document.addEventListener('touchstart', startMusicOnInteraction, { once: true });

      return () => {
        // Cleanup audio and event listeners on unmount
        document.removeEventListener('click', startMusicOnInteraction);
        document.removeEventListener('keydown', startMusicOnInteraction);
        document.removeEventListener('touchstart', startMusicOnInteraction);
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
          backgroundMusicRef.current = null;
        }
      };
    }
  }, [initialMusic]);

  const toggleMusicMute = () => {
    if (backgroundMusicRef.current) {
      if (isMusicMuted) {
        // Unmute and play
        backgroundMusicRef.current.muted = false;
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              musicStartedRef.current = true;
            })
            .catch((error) => {
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
        playPromise
          .then(() => {
            musicStartedRef.current = true;
          })
          .catch((error) => {
            console.error('Error playing music:', error);
          });
      }
    }
  };

  const playSFX = (src: string, volume: number = 0.7) => {
    if (typeof window !== 'undefined' && !isMusicMuted) {
      // Attempt to start background music on first user interaction if not already started
      if (!musicStartedRef.current && backgroundMusicRef.current && currentMusicSrc.current) {
        const playPromise = backgroundMusicRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              musicStartedRef.current = true;
              console.log('Background music started on user interaction');
            })
            .catch((error) => {
              console.error('Could not start background music:', error);
            });
        }
      }
      
      // Play the sound effect
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

