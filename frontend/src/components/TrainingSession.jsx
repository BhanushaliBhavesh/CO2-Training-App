import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "../../frontend/hooks/useAudio";
// ❌ DELETE THIS LINE BELOW if it exists in your file:
// import { storageService } from "../../services/storageService";

// ✅ KEEP THIS ONE:
import { useCreateSessionMutation } from "../slices/sessionsApiSlice";
import { TRAINING_DEFAULTS } from "../../constants";
import BreathingAnimation from "./BreathingAnimation";
import { ArrowLeft, Square, AlertCircle, RefreshCcw } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

const TrainingSession = ({ onComplete, onCancel, latestMaxHold }) => {
  // --- DEBUG LOG: Check if props are arriving ---
  console.log("Training initialized with MaxHold:", latestMaxHold);

  const holdDuration = Math.ceil(
    (latestMaxHold || 30) * (TRAINING_DEFAULTS?.HOLD_PERCENTAGE || 0.5)
  );

  const [round, setRound] = useState(1);
  const [restDuration, setRestDuration] = useState(
    TRAINING_DEFAULTS?.INITIAL_REST || 120
  );
  const [phase, setPhase] = useState("rest");
  const [seconds, setSeconds] = useState(restDuration);
  const [isFinished, setIsFinished] = useState(false);

  const { speak } = useAudio();
  const timerRef = useRef(null);

  const [createSession, { isLoading, error: apiError }] =
    useCreateSessionMutation();

  // --- DEBUG LOG: Check if API Error exists ---
  useEffect(() => {
    if (apiError) console.error("API Error detected:", apiError);
  }, [apiError]);

  useEffect(() => {
    startPhase();
    // eslint-disable-next-line
  }, [phase]);

  const startPhase = () => {
    if (phase === "rest") {
      setSeconds(restDuration);
    } else if (phase === "hold") {
      setSeconds(holdDuration);
      speak("Hold.");
    }
  };

  useEffect(() => {
    if (phase === "rest") {
      if (seconds === 15) speak("15 seconds remaining. Prepare.");
      if (seconds === 6) speak("Take a deep breath.");
      if (seconds <= 5 && seconds > 0) speak(seconds.toString());
      if (seconds === 0) setPhase("hold");
    } else if (phase === "hold") {
      if (seconds <= 10 && seconds > 0) speak(seconds.toString());
      if (seconds === 0) handleRoundComplete();
    }
  }, [seconds, phase, speak]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRoundComplete = () => {
    const nextRest = restDuration - (TRAINING_DEFAULTS?.REST_DECREMENT || 15);
    const minRest = TRAINING_DEFAULTS?.MINIMUM_REST || 30;

    if (nextRest < minRest) {
      finishSession();
    } else {
      setRestDuration(nextRest);
      setRound((r) => r + 1);
      setPhase("rest");
      speak("Exhale slowly. Relax.");
    }
  };

  const finishSession = async () => {
    console.log("Attempting to Finish Session..."); // DEBUG
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const payload = {
      date: new Date().toISOString(),
      type: "training",
      holdDuration: holdDuration,
      roundsCompleted: round,
      status: "completed",
    };

    console.log("Payload:", payload); // DEBUG

    try {
      await createSession(payload).unwrap();
      console.log("SUCCESS: Session Saved to DB"); // DEBUG
      speak("Session complete. Excellent work today.");
      setTimeout(onComplete, 3000);
    } catch (err) {
      console.error("FAILED to save session:", err); // DEBUG
      alert("Error saving session. Check console.");
      setTimeout(onComplete, 3000);
    }
  };

  const handleAbort = async () => {
    if (window.confirm("End session? Progress will be saved as incomplete.")) {
      console.log("Aborting session..."); // DEBUG
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        await createSession({
          date: new Date().toISOString(),
          type: "training",
          holdDuration,
          roundsCompleted: Math.max(0, round - 1),
          status: "incomplete",
        }).unwrap();
        console.log("SUCCESS: Partial Session Saved"); // DEBUG
      } catch (err) {
        console.error("FAILED to save partial session:", err); // DEBUG
      }
      onCancel();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-500">
      <div className="w-full flex items-center justify-between absolute top-6 left-0 px-6">
        <AnimatedButton
          onClick={handleAbort}
          className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </AnimatedButton>
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Training • Round {round}
        </span>
        <div className="w-10"></div>
      </div>

      <div className="relative flex items-center justify-center py-4">
        <BreathingAnimation phase={phase} />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm ${
              phase === "rest"
                ? "bg-emerald-100/80 text-emerald-700"
                : "bg-indigo-100/80 text-indigo-700"
            }`}
          >
            {phase === "rest" ? "Recovery Phase" : "Holding Phase"}
          </span>
          <div className="text-6xl font-thin tracking-tighter text-slate-800">
            {seconds}s
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
            Target Hold
          </span>
          <span className="text-xl font-bold text-slate-800">
            {holdDuration}s
          </span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
            Current Rest
          </span>
          <span className="text-xl font-bold text-slate-800">
            {restDuration}s
          </span>
        </div>
      </div>

      <div className="w-full max-w-xs pt-8">
        <AnimatedButton
          onClick={handleAbort}
          className="w-full py-4 bg-white text-slate-400 border border-slate-200 rounded-2xl font-semibold flex items-center justify-center gap-3"
        >
          <Square size={16} /> End Session
        </AnimatedButton>
      </div>

      {isFinished && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <RefreshCcw size={40} className="animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Well Done!</h2>
          <p className="text-slate-500 mb-8">Saving your session...</p>
        </div>
      )}
    </div>
  );
};

export default TrainingSession;
