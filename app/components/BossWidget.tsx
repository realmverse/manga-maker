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
      const randomInterval = Math.random() * 40000 + 30000;

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
        max-w-sm w-96
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        className="
          bg-white/95 backdrop-blur-xl
          rounded-2xl
          p-3
          shadow-lg
          flex gap-3 items-start
          border border-gray-200/50
        "
      >
        {/* Boss Avatar - iOS style app icon */}
        <div
          className="
            w-10 h-10 
            bg-linear-to-br from-gray-600 to-gray-800
            rounded-xl
            flex items-center justify-center
            text-xl
            shrink-0
            shadow-sm
          "
        >
          😤
        </div>

        {/* Message Content */}
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">Your Boss</h3>
            <span className="text-xs text-gray-500">now</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="
            text-gray-400 hover:text-gray-600
            text-lg
            leading-none
            transition-colors
            -mt-0.5
          "
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
