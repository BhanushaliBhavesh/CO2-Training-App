import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import { useCreateSessionMutation } from "../slices/sessionsApiSlice";
import { ArrowLeft, Square, AlertCircle } from "lucide-react";
// ✅ Import the Background
import BreathingBackground from "../components/BreathingBackground";

const BaselineTest = ({ onComplete, onCancel }) => {
  const [phase, setPhase] = useState("prepare");
  const [seconds, setSeconds] = useState(15);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const { speak } = useAudio();
  const timerRef = useRef(null);

  const [createSession, { isLoading }] = useCreateSessionMutation();

  useEffect(() => {
    if (phase === "prepare") {
      speak(
        "Relax your body. Inhale and exhale gently. We will begin in 15 seconds."
      );
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (phase === "prepare") {
      if (seconds === 12) speak("Prepare for a deep breath");
      if (seconds <= 5 && seconds > 0) speak(seconds.toString());
      if (seconds === 0) {
        setPhase("hold");
        speak("Hold.");
      }
    }
  }, [seconds, phase, speak]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (phase === "prepare") {
        setSeconds((s) => (s > 0 ? s - 1 : 0));
      } else if (phase === "hold") {
        setHoldSeconds((s) => s + 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleStop = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await createSession({
        type: "baseline",
        date: new Date().toISOString(),
        maxHold: holdSeconds,
        status: "completed",
      }).unwrap();

      onComplete();
    } catch (err) {
      console.error("Failed to save session:", err);
      alert("Error saving result. Check console.");
    }
  };

  // --- MAPPING LOGIC FOR BACKGROUND ---
  // The Baseline 'prepare' phase is exactly like the Training 'rest' phase
  const backgroundPhase = phase === "prepare" ? "rest" : "hold";
  const backgroundSeconds = phase === "prepare" ? seconds : 0;

  return (
    // ✅ 1. Relative Container
    <div className="relative h-full w-full overflow-hidden bg-white">
      {/* ✅ 2. Background (Mapped Props) */}
      <BreathingBackground
        phase={backgroundPhase}
        seconds={backgroundSeconds}
      />

      {/* ✅ 3. Content floating on top (z-10) */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="w-full flex items-center justify-between absolute top-6 left-0 px-6">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            Baseline Test
          </span>
          <div className="w-10"></div>
        </div>

        {/* Timer / Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg className="w-64 h-64">
            <circle
              className="text-slate-100" // Ring background
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="120"
              cx="128"
              cy="128"
            />
            <circle
              className={`${
                phase === "hold" ? "text-indigo-600" : "text-emerald-500"
              } transition-all duration-1000 ease-linear`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={
                phase === "prepare" ? 2 * Math.PI * 120 * (seconds / 15) : 0
              }
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="120"
              cx="128"
              cy="128"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-light tracking-tighter text-slate-800">
              {phase === "prepare" ? seconds : holdSeconds}
            </span>
            <span className="text-sm font-semibold uppercase text-slate-400 tracking-widest mt-2">
              {phase === "prepare" ? "Prepare" : "Holding"}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2 max-w-xs">
          <h3 className="text-xl font-bold text-slate-800">
            {phase === "prepare" ? "Take it easy" : "Don't push too hard"}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {phase === "prepare"
              ? "Deep diagrammatic inhale to 80% capacity before the timer hits zero."
              : "Focus on staying relaxed. Tap 'Finish' when you need to breathe."}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-xs pt-8">
          {phase === "hold" ? (
            <button
              onClick={handleStop}
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Square fill="white" size={18} />
              {isLoading ? "Saving..." : "Finish Hold"}
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-slate-100 p-4 rounded-2xl">
              <AlertCircle className="text-slate-400 flex-shrink-0" size={20} />
              <p className="text-xs text-slate-600">
                Ensure you're in a safe, seated position. Do not practice in
                water.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaselineTest;
