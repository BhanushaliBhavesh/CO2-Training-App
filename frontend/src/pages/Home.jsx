import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetSessionsQuery } from "../slices/sessionsApiSlice";
import { logout } from "../slices/authSlice";

import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import BaselineTest from "../views/BaselineTest";
import TrainingSession from "../views/TrainingSession";
import BreathingButton from "../components/BreathingButton"; // ✅ Imported

import { Timer, Zap, ArrowLeft, LogOut, MapPin, Calendar } from "lucide-react";

// --- HELPER: PHONE FRAME ---
const PhoneFrame = ({ children }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-md bg-white h-[850px] rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-gray-900 flex flex-col">
      {children}
    </div>
  </div>
);

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [view, setView] = useState("main");

  const dispatch = useDispatch();

  const { data: sessions, isLoading, refetch } = useGetSessionsQuery();
  const { userInfo } = useSelector((state) => state.auth);

  const latestMaxHold =
    sessions && sessions.length > 0
      ? sessions
          .filter((s) => s.type === "baseline")
          .reduce((max, curr) => Math.max(max, curr.maxHold || 0), 0)
      : 0;

  const handleSessionComplete = () => {
    setView("main");
    setActiveTab("dashboard");
    refetch();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      dispatch(logout());
    }
  };

  // --- FULL SCREEN MODES ---
  if (view === "baseline") {
    return (
      <PhoneFrame>
        <BaselineTest
          onComplete={handleSessionComplete}
          onCancel={() => setView("main")}
        />
      </PhoneFrame>
    );
  }

  if (view === "training") {
    return (
      <PhoneFrame>
        <TrainingSession
          latestMaxHold={latestMaxHold}
          onComplete={handleSessionComplete}
          onCancel={() => setView("main")}
        />
      </PhoneFrame>
    );
  }

  const isTrainingMode = view === "baseline" || view === "training";

  // --- MAIN LAYOUT ---
  return (
    <Layout
      activeTab={activeTab}
      isFullScreen={isTrainingMode}
      onTabChange={(tab) => {
        if (tab === "training_select") setView("training_select");
        else {
          setActiveTab(tab);
          setView("main");
        }
      }}
    >
      {/* 1. DASHBOARD */}
      {view === "main" && activeTab === "dashboard" && <Dashboard />}

      {/* 2. HISTORY */}
      {view === "main" && activeTab === "history" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Activity Log
          </h2>
          {isLoading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              No logs found.
            </div>
          ) : (
            sessions
              .slice()
              .reverse()
              .map((s) => (
                <div
                  key={s._id || s.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        s.type === "baseline"
                          ? "bg-indigo-50 text-indigo-500"
                          : "bg-emerald-50 text-emerald-500"
                      }`}
                    >
                      {s.type === "baseline" ? (
                        <Timer size={18} />
                      ) : (
                        <Zap size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 capitalize">
                        {s.type} Test
                      </p>
                      <p className="text-sm font-medium text-slate-400">
                        {new Date(s.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">
                      {s.maxHold || s.holdDuration}s
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* 3. SETTINGS */}
      {view === "main" && activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Settings</h2>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-gray-500 text-center">
              Audio & Vibration settings coming soon.
            </p>
          </div>
        </div>
      )}

      {/* 4. PROFILE */}
      {view === "main" && activeTab === "profile" && (
        <div className="flex flex-col items-center py-10 animate-in fade-in duration-500">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4 ring-4 ring-indigo-50">
            {userInfo?.name?.charAt(0) || "U"}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {userInfo?.name || "User"}
          </h2>
          <p className="text-slate-400 text-sm mb-6">{userInfo?.email}</p>

          {/* Location & Age Badges */}
          <div className="flex gap-3 mb-8">
            {userInfo?.city && (
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-2">
                <MapPin size={14} />
                {userInfo.city}
                {userInfo.state && `, ${userInfo.state}`}
              </div>
            )}
            {userInfo?.age && (
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-2">
                <Calendar size={14} />
                {userInfo.age} Years Old
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-slate-800">
                {sessions ? sessions.length : 0}
              </p>
              <p className="text-xs text-slate-400 font-medium uppercase mt-1">
                Sessions
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-slate-800">Elite</p>
              <p className="text-xs text-slate-400 font-medium uppercase mt-1">
                Tier
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <BreathingButton
            onClick={handleLogout}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm text-rose-500"
            fillColor="rgb(254, 202, 202)" // Soft Red Air
            icon={LogOut}
            defaultIconColor="text-rose-500"
          >
            Sign Out
          </BreathingButton>
        </div>
      )}

      {/* 5. TRAINING SELECTION MODAL */}
      {view === "training_select" && (
        <div className="absolute inset-0 bg-white z-[100] p-8 flex flex-col justify-end gap-4 animate-in slide-in-from-bottom-full duration-500">
          <button
            onClick={() => setView("main")}
            className="absolute top-8 left-8 p-2 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="mb-auto mt-20">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Select Session
            </h2>
            <p className="text-slate-500">Choose your breathing mode.</p>
          </div>

          {/* 🟣 BASELINE BUTTON (Ice Blue Air) */}
          <BreathingButton
            onClick={() => setView("baseline")}
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl"
            fillColor="rgb(179, 217, 255)"
            icon={Timer}
            defaultIconColor="text-indigo-500"
          >
            <div className="text-left">
              <h3 className="text-lg font-bold">Baseline Test</h3>
              <p className="text-xs opacity-70 font-medium">
                Measure CO2 tolerance
              </p>
            </div>
          </BreathingButton>

          {/* ⚡ TRAINING BUTTON (Mint Green Air - Matches Shader Tone) */}
          <BreathingButton
            onClick={() => setView("training")}
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl"
            fillColor="rgb(167, 243, 208)"
            icon={Zap}
            defaultIconColor="text-emerald-500"
          >
            <div className="text-left">
              <h3 className="text-lg font-bold">Training Session</h3>
              <p className="text-xs opacity-70 font-medium">
                Increase your capacity
              </p>
            </div>
          </BreathingButton>
        </div>
      )}
    </Layout>
  );
};

export default Home;
