"use client";

import OverallGauge     from "./OverallGauge";
import StatusDonut      from "./StatusDonut";
import ComplexityChart  from "./ComplexityChart";
import PhaseProgressBars from "./PhaseProgressBars";
import TimelineChart    from "./TimelineChart";
import PhaseAccordion   from "./PhaseAccordion";

interface Props { data: any }

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
      <span className={`text-3xl font-extrabold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500 mt-1 font-medium">{label}</span>
    </div>
  );
}

export default function ProgressDashboard({ data }: Props) {
  const { overallStats, byComplexity, byStatus, timeline, phaseBarData, phaseTree } = data;
  const overallPct = overallStats.total
    ? Math.round((overallStats.done / overallStats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live from Neon DB · version1
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Build Progress</h1>
          <p className="text-slate-300 mt-2">3S Stock Finder · Y Combinator Roadmap · 15-week plan</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ── Row 1: Gauge + Stat Cards ─────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-center">
            <OverallGauge pct={overallPct} done={overallStats.done} total={overallStats.total} />
          </div>
          <StatCard label="Total Tasks"  value={overallStats.total}       color="text-slate-800" />
          <StatCard label="Done"         value={overallStats.done}        color="text-green-600" />
          <StatCard label="In Progress"  value={overallStats.in_progress} color="text-blue-600"  />
          <StatCard label="To Do"        value={overallStats.todo}        color="text-slate-400" />
          {overallStats.blocked > 0 && (
            <StatCard label="Blocked"    value={overallStats.blocked}     color="text-red-600"   />
          )}
        </div>

        {/* ── Row 2: Status donut + Complexity bar ─────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Status Breakdown</h2>
            <StatusDonut data={byStatus} total={overallStats.total} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Complexity Distribution</h2>
            <ComplexityChart data={byComplexity} />
          </div>
        </div>

        {/* ── Row 3: Phase stacked bars ─────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Progress by Phase</h2>
          <PhaseProgressBars data={phaseBarData} />
        </div>

        {/* ── Row 4: Timeline Gantt ─────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">15-Week Timeline</h2>
          <TimelineChart data={timeline} />
        </div>

        {/* ── Row 5: Phase accordion with tasks ────────── */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">
            Phases · Categories · Tasks
          </h2>
          <PhaseAccordion phases={phaseTree} />
        </div>

        <p className="text-xs text-slate-400 text-center pb-6">
          Update task status directly in the <code className="bg-slate-100 px-1 rounded">version1</code> table — this page reflects live DB state.
        </p>
      </div>
    </div>
  );
}
