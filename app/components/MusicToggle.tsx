'use client';

import { useAudio } from './AudioProvider';
import { HiSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";

export default function MusicToggle() {
  const { isMusicMuted, toggleMusicMute } = useAudio();

  return (
    <button
      onClick={toggleMusicMute}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl group"
      aria-label={isMusicMuted ? 'Unmute music' : 'Mute music'}
    >
      {isMusicMuted ? (
        <HiMiniSpeakerXMark className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      ) : (
        <HiSpeakerWave className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}

