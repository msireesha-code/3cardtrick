"use client";

import { useState } from "react";

const STATUS_STYLE: Record<string, string> = {
  done:        "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  todo:        "bg-slate-100 text-slate-500",
  blocked:     "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  done:        "Done",
  in_progress: "In Progress",
  todo:        "To Do",
  blocked:     "Blocked",
};

const COMPLEXITY_STYLE: Record<string, string> = {
  highest: "bg-red-50 text-red-600 border-red-200",
  high:    "bg-orange-50 text-orange-600 border-orange-200",
  medium:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  low:     "bg-green-50 text-green-700 border-green-200",
};

const PHASE_COLORS = [
  "from-blue-500 to-blue-600",
  "from-indigo-500 to-indigo-600",
  "from-violet-500 to-violet-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-rose-500 to-rose-600",
];

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

export default function PhaseAccordion({ phases }: { phases: any[] }) {
  const [openPhase, setOpenPhase] = useState<number | null>(null);
  const [openCat, setOpenCat]   = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {phases.map((phase, pi) => {
        const p = pct(phase.phaseStats.done, phase.phaseStats.total);
        const isOpen = openPhase === phase.id;

        return (
          <div key={phase.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Phase header */}
            <button
              onClick={() => { setOpenPhase(isOpen ? null : phase.id); setOpenCat(null); }}
              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              {/* Phase badge */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${PHASE_COLORS[pi % PHASE_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shadow`}>
                P{phase.phase}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{phase.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Weeks {phase.week_start}–{phase.week_end} &nbsp;·&nbsp;
                  {phase.phaseStats.total} tasks &nbsp;·&nbsp;
                  {phase.phaseStats.done} done
                  {phase.phaseStats.in_progress > 0 && ` · ${phase.phaseStats.in_progress} in progress`}
                  {phase.phaseStats.blocked > 0 && ` · ${phase.phaseStats.blocked} blocked`}
                </p>
                {/* mini progress bar */}
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${PHASE_COLORS[pi % PHASE_COLORS.length]} transition-all duration-500`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-3">
                <span className="text-lg font-extrabold text-slate-700">{p}%</span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Categories */}
            {isOpen && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {phase.categories.map((cat: any) => {
                  const cp = pct(cat.taskStats.done, cat.taskStats.total);
                  const catOpen = openCat === cat.id;

                  return (
                    <div key={cat.id}>
                      {/* Category row */}
                      <button
                        onClick={() => setOpenCat(catOpen ? null : cat.id)}
                        className="w-full flex items-center gap-3 px-6 py-3 pl-20 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 text-sm">{cat.title}</span>
                            {cat.complexity && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${COMPLEXITY_STYLE[cat.complexity]}`}>
                                {cat.complexity}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {cat.taskStats.total} tasks · {cat.taskStats.done} done
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-400 transition-all"
                              style={{ width: `${cp}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{cp}%</span>
                          <svg
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Tasks */}
                      {catOpen && (
                        <div className="bg-slate-50/60 border-t border-slate-100 divide-y divide-slate-100">
                          {cat.tasks.map((task: any) => (
                            <div key={task.id} className="flex items-start gap-3 px-6 py-3 pl-28">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm text-slate-700">{task.title}</span>
                                  {task.complexity && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COMPLEXITY_STYLE[task.complexity]}`}>
                                      {task.complexity}
                                    </span>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>
                                )}
                              </div>
                              <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[task.status]}`}>
                                {STATUS_LABEL[task.status]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
