"use client";

const barColors = ["bg-blue-500", "bg-indigo-400", "bg-violet-400"];

interface AllocationBarProps {
  allocation: [string, string][];
}

export default function AllocationBar({ allocation }: AllocationBarProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
        Suggested Portfolio Allocation
      </h3>

      <div className="space-y-4">
        {allocation.map(([name, pct], i) => {
          const width = parseInt(pct);
          return (
            <div key={name}>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span>{name}</span>
                <span className="text-slate-300">{pct}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className={`${barColors[i]} h-2.5 rounded-full transition-all duration-700`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 mt-5">
        * This is a suggested allocation for reference only. Always do your own research before investing.
      </p>
    </div>
  );
}
