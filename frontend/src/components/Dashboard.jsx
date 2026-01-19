import React from "react";
// 1. Import the API Hook (Connects to MongoDB)
import { useGetSessionsQuery } from "../slices/sessionsApiSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap, Timer, Flame, ChevronRight, Info } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-lg z-50">
        <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-indigo-600">{payload[0].value}s</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  // 2. Fetch data from Redux/Backend
  const { data: sessions, isLoading } = useGetSessionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // 3. Helper function to calculate stats on the fly
  const getStats = () => {
    if (!sessions || sessions.length === 0) {
      return { sessionsToday: 0, maxHold: 0, currentStreak: 0 };
    }

    // A. Sessions Today
    const today = new Date().toDateString();
    const sessionsToday = sessions.filter(
      (s) => new Date(s.date).toDateString() === today
    ).length;

    // B. Best Hold (Baseline)
    const baselineSessions = sessions.filter(
      (s) => s.type === "baseline" && s.maxHold
    );
    // Calculate Personal Best (Max Hold)
    const maxHold = baselineSessions.reduce(
      (max, s) => Math.max(max, Number(s.maxHold) || 0),
      0
    );

    // C. Streak (Simplified count of active days)
    const uniqueDates = [
      ...new Set(sessions.map((s) => new Date(s.date).toDateString())),
    ];

    return {
      sessionsToday,
      maxHold,
      currentStreak: uniqueDates.length, // Display total active days for now
    };
  };

  const stats = getStats();

  // 4. Prepare Chart Data (Last 7 Baselines)
  const chartData =
    sessions && sessions.length > 0
      ? sessions
          .filter((s) => s.type === "baseline" && s.maxHold)
          // Sort by date ascending for the chart
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7) // Take the last 7
          .map((s) => ({
            // FIX: Use 'toLocaleString' to include TIME.
            // This ensures points on the same day have unique labels (e.g. "Jan 15, 10:30 AM")
            date: new Date(s.date).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }),
            seconds: Number(s.maxHold) || 0,
          }))
      : [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading your progress...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
          <Zap className="text-amber-500 mb-1" size={18} />
          <span className="text-xl font-bold text-slate-800">
            {stats.sessionsToday}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">
            Today
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
          <Timer className="text-indigo-500 mb-1" size={18} />
          <span className="text-xl font-bold text-slate-800">
            {stats.maxHold}s
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">
            Max Hold
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
          <Flame className="text-orange-500 mb-1" size={18} />
          <span className="text-xl font-bold text-slate-800">
            {stats.currentStreak}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">
            Active Days
          </span>
        </div>
      </div>

      {/* AI Insights Section (Placeholder until we connect AI to Backend) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">AI Insights</h2>
          <Info size={14} className="text-slate-300" />
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
          <p className="text-sm text-indigo-700 font-medium flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            Keep logging sessions to unlock personalized AI coaching.
          </p>
        </div>
      </section>

      {/* Progress Chart */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Progress</h2>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-4 tracking-wider">
            Max Hold Over Time
          </p>
          <div className="h-48 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    // Increase tick font size slightly for readability
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    minTickGap={20}
                  />
                  <YAxis hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="seconds"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No baseline data yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity List */}
      <section className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {sessions && sessions.length > 0 ? (
            sessions
              .slice()
              .reverse() // Show newest first
              .slice(0, 3) // Only top 3
              .map((session, index) => (
                <div
                  key={session._id || index}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        session.type === "baseline"
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {session.type === "baseline" ? (
                        <Timer size={20} />
                      ) : (
                        <Zap size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 capitalize">
                        {session.type} Session
                      </h3>
                      <p className="text-xs text-slate-400">
                        {new Date(session.date).toLocaleDateString()} •{" "}
                        {session.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {session.maxHold || session.holdDuration}s
                  </span>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              No sessions found. Start a new test!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
