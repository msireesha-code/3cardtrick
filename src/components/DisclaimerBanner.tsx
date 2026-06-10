export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
      <p className="text-xs text-amber-800">
        <span className="font-bold">Not investment advice.</span>{" "}
        3S Stock Finder is an AI-powered research tool for informational purposes only. It is not registered with SEBI as an investment adviser.{" "}
        <a href="/disclaimer" className="underline hover:text-amber-900 font-medium">Read full disclaimer →</a>
      </p>
    </div>
  );
}
