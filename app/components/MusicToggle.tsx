"use client";

import { useAudio } from "./AudioProvider";
import { HiSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";

export default function MusicToggle() {
  const { isMusicMuted, toggleMusicMute } = useAudio();

  return (
    <button
      onClick={toggleMusicMute}
      className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white border-[3px] border-[#2C2C2C] hover:bg-gray-50 transition-all duration-300 group"
      style={{
        boxShadow: "inset 0 0 0 2px white, 0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
      aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
    >
      {isMusicMuted ? (
        <HiMiniSpeakerXMark className="w-6 h-6 text-[#2C2C2C] group-hover:scale-110 transition-transform" />
      ) : (
        <HiSpeakerWave className="w-6 h-6 text-[#2C2C2C] group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
