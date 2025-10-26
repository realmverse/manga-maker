"use client";

import { useEffect, useState } from "react";

const BOSS_MESSAGES = [
  "We need this ASAP! The publisher is breathing down my neck!",
  "Can you work faster? The deadline was yesterday!",
  "I hope you're not slacking off over there...",
  "The client is waiting! Pick up the pace!",
  "Quality AND speed, that's what I need from you!",
  "Remember, time is money! Let's go!",
  "Stop daydreaming and get back to work!",
  "I need that page finished, like, 5 minutes ago!",
  "You call this progress?! We need MORE!",
  "The competition is crushing us! Work harder!",
  "Did you fall asleep? Wake up and draw!",
  "Chop chop! The manga won't draw itself!",
  "I'm checking on your progress... Don't disappoint me!",
  "Is that all you've done? Come on!",
  "The whole team is counting on you!",
  "I better see some results soon!",
  "Coffee break is OVER! Back to work!",
  "This better be perfect or we're all doomed!",
  "Why is this taking so long?!",
  "The editor called again... AGAIN!",
];

export default function BossWidget() {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scheduleNextMessage = () => {
      // Random interval between 20-60 seconds
      const randomInterval = Math.random() * 40000 + 20000; // 20000ms = 20s, adding 0-40s

      return setTimeout(() => {
        // Pick a random message
        const randomMessage =
          BOSS_MESSAGES[Math.floor(Math.random() * BOSS_MESSAGES.length)];
        setMessage(randomMessage);
        setIsVisible(true);

        // Hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
          // Clear message after animation
          setTimeout(() => {
            setMessage(null);
          }, 500); // Wait for fade out animation
        }, 5000);

        // Schedule next message
        scheduleNextMessage();
      }, randomInterval);
    };

    const timeout = scheduleNextMessage();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      className={`
        fixed top-6 right-6 z-50
        max-w-sm
        transition-all duration-500 ease-out
        ${
          isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-[120%]"
        }
      `}
    >
      <div
        className="
          bg-linear-to-br from-yellow-400 to-orange-500
          border-4 border-black
          rounded-2xl
          p-4
          shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]
          flex gap-4 items-start
        "
      >
        {/* Boss Avatar */}
        <div
          className="
            w-16 h-16 
            bg-linear-to-br from-gray-700 to-gray-900
            border-3 border-black
            rounded-full
            flex items-center justify-center
            text-3xl
            shrink-0
            shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]
          "
        >
          😤
        </div>

        {/* Message Content */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-titan-one text-white text-outline text-sm">
              YOUR BOSS
            </h3>
          </div>
          <p className="text-white font-bold text-sm leading-snug drop-shadow-md">
            {message}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="
            text-white hover:text-red-200
            font-bold text-xl
            leading-none
            transition-colors
            -mt-1 -mr-1
          "
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Pointer/tail for speech bubble effect */}
      <div
        className="
          absolute -bottom-3 right-12
          w-0 h-0
          border-l-20 border-l-transparent
          border-r-20 border-r-transparent
          border-t-20 border-t-orange-500
        "
        style={{
          filter: "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.8))",
        }}
      />
    </div>
  );
}
