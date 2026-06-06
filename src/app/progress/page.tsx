import ProgressDashboard from "@/components/progress/ProgressDashboard";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Build Progress · 3S Stock Finder" };

async function getData() {
  const rows = await sql`
    SELECT id, parent_id, level, phase, title, description,
           complexity, status, week_start, week_end
    FROM version1
    ORDER BY phase, id
  `;

  const tasks = rows.filter((r) => r.level === 3);
  const cats  = rows.filter((r) => r.level === 2);
  const phases = rows.filter((r) => r.level === 1);

  const overallStats = {
    total:       tasks.length,
    done:        tasks.filter((t) => t.status === "done").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    todo:        tasks.filter((t) => t.status === "todo").length,
    blocked:     tasks.filter((t) => t.status === "blocked").length,
  };

  const byComplexity = ["highest", "high", "medium", "low"].map((c) => ({
    name: c, value: tasks.filter((t) => t.complexity === c).length,
  }));

  const byStatus = [
    { name: "Done",        value: overallStats.done,        color: "#22c55e" },
    { name: "In Progress", value: overallStats.in_progress, color: "#3b82f6" },
    { name: "To Do",       value: overallStats.todo,        color: "#e2e8f0" },
    { name: "Blocked",     value: overallStats.blocked,     color: "#ef4444" },
  ].filter((s) => s.value > 0);

  const timeline = phases.map((p) => ({
    phase: `P${p.phase}`, label: p.title.replace(/Phase \d+ — /, ""),
    weekStart: p.week_start, weekEnd: p.week_end,
    duration: p.week_end - p.week_start + 1,
  }));

  const phaseTree = phases.map((phase) => {
    const phaseCats = cats.filter((c) => c.parent_id === phase.id);
    const categories = phaseCats.map((cat) => {
      const catTasks = tasks.filter((t) => t.parent_id === cat.id);
      return {
        ...cat,
        tasks: catTasks,
        taskStats: {
          total:       catTasks.length,
          done:        catTasks.filter((t) => t.status === "done").length,
          in_progress: catTasks.filter((t) => t.status === "in_progress").length,
          todo:        catTasks.filter((t) => t.status === "todo").length,
          blocked:     catTasks.filter((t) => t.status === "blocked").length,
        },
      };
    });
    const allTasks = categories.flatMap((c) => c.tasks);
    return {
      id: phase.id, phase: phase.phase, title: phase.title,
      week_start: phase.week_start, week_end: phase.week_end,
      categories,
      phaseStats: {
        total:       allTasks.length,
        done:        allTasks.filter((t) => t.status === "done").length,
        in_progress: allTasks.filter((t) => t.status === "in_progress").length,
        todo:        allTasks.filter((t) => t.status === "todo").length,
        blocked:     allTasks.filter((t) => t.status === "blocked").length,
      },
    };
  });

  const phaseBarData = phaseTree.map((p) => ({
    name: `P${p.phase}`, label: p.title.replace(/Phase \d+ — /, ""),
    done: p.phaseStats.done, in_progress: p.phaseStats.in_progress,
    todo: p.phaseStats.todo, blocked: p.phaseStats.blocked,
    total: p.phaseStats.total,
    pct: p.phaseStats.total
      ? Math.round((p.phaseStats.done / p.phaseStats.total) * 100) : 0,
  }));

  return { overallStats, byComplexity, byStatus, timeline, phaseBarData, phaseTree };
}

export default async function ProgressPage() {
  const data = await getData();
  return <ProgressDashboard data={data} />;
}
