import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import { useCreateSessionMutation } from "../slices/sessionsApiSlice";
import { TRAINING_DEFAULTS } from "../../constants";
import { ArrowLeft, Square, AlertCircle, RefreshCcw } from "lucide-react";
import BreathingBackground from "../components/BreathingBackground"; // Import it

const TrainingSession = ({ onComplete, onCancel, latestMaxHold }) => {
  const holdDuration = Math.ceil(
    (latestMaxHold || 30) * TRAINING_DEFAULTS.HOLD_PERCENTAGE
  );

  const [round, setRound] = useState(1);
  const [restDuration, setRestDuration] = useState(
    TRAINING_DEFAULTS.INITIAL_REST
  );
  const [phase, setPhase] = useState("rest");
  const [seconds, setSeconds] = useState(TRAINING_DEFAULTS.INITIAL_REST);
  const [isFinished, setIsFinished] = useState(false);

  const { speak } = useAudio();
  const timerRef = useRef(null);

  const [createSession, { isLoading }] = useCreateSessionMutation();

  useEffect(() => {
    speak("Prepare for training. Focus on deep, diaphragmatic breathing.");
  }, []);

  useEffect(() => {
    if (phase === "rest") {
      if (seconds === 15) speak("15 seconds remaining. Prepare.");
      if (seconds === 6) speak("Take a deep breath.");
      if (seconds <= 5 && seconds > 0) speak(seconds.toString());
      if (seconds === 0) {
        setPhase("hold");
        setSeconds(holdDuration);
        speak("Hold.");
      }
    } else if (phase === "hold") {
      if (seconds <= 10 && seconds > 0) speak(seconds.toString());
      if (seconds === 0) {
        handleRoundComplete();
      }
    }
  }, [seconds, phase, holdDuration, speak]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRoundComplete = () => {
    const nextRest = restDuration - TRAINING_DEFAULTS.REST_DECREMENT;
    if (nextRest < TRAINING_DEFAULTS.MINIMUM_REST) {
      finishSession();
    } else {
      setRestDuration(nextRest);
      setRound((r) => r + 1);
      setPhase("rest");
      setSeconds(nextRest);
      speak("Release. Exhale slowly.");
    }
  };

  const finishSession = async () => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await createSession({
        date: new Date().toISOString(),
        type: "training",
        holdDuration,
        roundsCompleted: round,
        status: "completed",
      }).unwrap();

      speak("Session complete. Excellent work today.");
      setTimeout(onComplete, 3000);
    } catch (err) {
      console.error("Failed to save session:", err);
      alert("Error saving session");
      setTimeout(onComplete, 3000);
    }
  };

  const handleAbort = async () => {
    if (
      window.confirm(
        "End session? Your progress so far will be saved as incomplete."
      )
    ) {
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        await createSession({
          date: new Date().toISOString(),
          type: "training",
          holdDuration,
          roundsCompleted: Math.max(0, round - 1),
          status: "incomplete",
        }).unwrap();
      } catch (err) {
        console.error("Failed to save partial session:", err);
      }
      onCancel();
    }
  };

  return (
    // ✅ 1. Parent is relative to contain the absolute background
    <div className="relative h-full w-full overflow-hidden bg-white">
      {/* ✅ 2. The Background sits at z-0 */}
      <BreathingBackground phase={phase} seconds={seconds} />

      {/* ✅ 3. Your original content wrapper needs 'relative z-10' to float above */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-500">
        {/* ... Rest of your code exactly as it was ... */}
        <div className="w-full flex items-center justify-between absolute top-6 left-0 px-6">
          <button
            onClick={handleAbort}
            className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            Training • Round {round}
          </span>
          <div className="w-10"></div>
        </div>

        <div className="text-center">
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block ${
              phase === "rest"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {phase === "rest" ? "Recovery Phase" : "Holding Phase"}
          </span>
          <div className="text-8xl font-thin tracking-tighter text-slate-800 mt-2">
            {seconds}s
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

        <div className="w-full flex justify-center py-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === round
                    ? "w-6 bg-indigo-500"
                    : i < round
                    ? "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs pt-4 space-y-4">
          <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="text-slate-400" />
            <p className="text-xs text-slate-600 italic leading-relaxed">
              {phase === "rest"
                ? "Focus on deep, diaphragmatic breathing. Keep your heart rate low."
                : "Stay still. Let the urge to breathe pass without tension."}
            </p>
          </div>

          <button
            onClick={handleAbort}
            className="w-full py-4 bg-white text-slate-400 border border-slate-200 rounded-2xl font-semibold flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <Square size={16} /> End Session
          </button>
        </div>

        {isFinished && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <RefreshCcw size={40} className="animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Well Done!
            </h2>
            <p className="text-slate-500 mb-8">Saving your session...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingSession;
