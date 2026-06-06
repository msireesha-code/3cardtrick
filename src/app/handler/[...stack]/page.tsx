import { StackHandler } from "@stackframe/stack";
import { stackServerApp, stackEnabled } from "@/lib/stack";

export default function StackHandlerPage(props: unknown) {
  if (!stackEnabled || !stackServerApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
        <p>Auth not configured. Add NEXT_PUBLIC_STACK_PROJECT_ID and keys to .env.local</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </div>
  );
}
