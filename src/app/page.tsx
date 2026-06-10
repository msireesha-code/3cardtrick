import { Suspense } from "react";
import StockFinder from "@/components/StockFinder";

export default function Home() {
  return (
    <Suspense>
      <StockFinder />
    </Suspense>
  );
}
