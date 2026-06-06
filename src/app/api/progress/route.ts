import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`
    SELECT id, parent_id, level, phase, title, description,
           complexity, status, week_start, week_end
    FROM version1
    ORDER BY phase, id
  `;

  // ── build lookup maps ──────────────────────────────────
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  const phases   = rows.filter((r) => r.level === 1);
  const cats     = rows.filter((r) => r.level === 2);
  const tasks    = rows.filter((r) => r.level === 3);

  // ── overall stats (tasks only) ─────────────────────────
  const countBy = (field: string, val: string) =>
    tasks.filter((t) => t[field] === val).length;

  const overallStats = {
    total:       tasks.length,
    done:        countBy("status", "done"),
    in_progress: countBy("status", "in_progress"),
    todo:        countBy("status", "todo"),
    blocked:     countBy("status", "blocked"),
  };

  // ── by complexity ──────────────────────────────────────
  const byComplexity = ["highest", "high", "medium", "low"].map((c) => ({
    name:  c,
    value: tasks.filter((t) => t.complexity === c).length,
  }));

  // ── by status (for donut) ──────────────────────────────
  const byStatus = [
    { name: "Done",        value: overallStats.done,        color: "#22c55e" },
    { name: "In Progress", value: overallStats.in_progress, color: "#3b82f6" },
    { name: "To Do",       value: overallStats.todo,        color: "#e2e8f0" },
    { name: "Blocked",     value: overallStats.blocked,     color: "#ef4444" },
  ].filter((s) => s.value > 0);

  // ── timeline data (phases) ─────────────────────────────
  const timeline = phases.map((p) => ({
    phase: `P${p.phase}`,
    label: p.title.replace(/Phase \d+ — /, ""),
    weekStart: p.week_start,
    weekEnd:   p.week_end,
    duration:  p.week_end - p.week_start + 1,
  }));

  // ── nested phase tree ──────────────────────────────────
  const phaseTree = phases.map((phase) => {
    const phaseCats = cats.filter((c) => c.parent_id === phase.id);

    const categories = phaseCats.map((cat) => {
      const catTasks = tasks.filter((t) => t.parent_id === cat.id);
      const taskStats = {
        total:       catTasks.length,
        done:        catTasks.filter((t) => t.status === "done").length,
        in_progress: catTasks.filter((t) => t.status === "in_progress").length,
        todo:        catTasks.filter((t) => t.status === "todo").length,
        blocked:     catTasks.filter((t) => t.status === "blocked").length,
      };
      return { ...cat, tasks: catTasks, taskStats };
    });

    const allTasks = categories.flatMap((c) => c.tasks);
    const phaseStats = {
      total:       allTasks.length,
      done:        allTasks.filter((t) => t.status === "done").length,
      in_progress: allTasks.filter((t) => t.status === "in_progress").length,
      todo:        allTasks.filter((t) => t.status === "todo").length,
      blocked:     allTasks.filter((t) => t.status === "blocked").length,
    };

    return { phase: phase.phase, title: phase.title, week_start: phase.week_start, week_end: phase.week_end, id: phase.id, categories, phaseStats };
  });

  // ── phase bar chart data ───────────────────────────────
  const phaseBarData = phaseTree.map((p) => ({
    name:        `P${p.phase}`,
    label:       (p.title as string).replace(/Phase \d+ — /, ""),
    done:        p.phaseStats.done,
    in_progress: p.phaseStats.in_progress,
    todo:        p.phaseStats.todo,
    blocked:     p.phaseStats.blocked,
    total:       p.phaseStats.total,
    pct: p.phaseStats.total
      ? Math.round((p.phaseStats.done / p.phaseStats.total) * 100)
      : 0,
  }));

  return NextResponse.json({
    overallStats,
    byComplexity,
    byStatus,
    timeline,
    phaseBarData,
    phaseTree,
  });
}
