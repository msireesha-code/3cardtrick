"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveButtonClient({ ticker }: { holdingId: number; ticker: string }) {
  const [removing, setRemoving] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    if (!confirm(`Remove ${ticker} from portfolio?`)) return;
    setRemoving(true);
    await fetch(`/api/portfolio?ticker=${encodeURIComponent(ticker)}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleRemove}
      disabled={removing}
      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
      title="Remove from portfolio"
    >
      {removing ? "Removing…" : "Remove"}
    </button>
  );
}
