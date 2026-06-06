import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Stack Auth handles auth via /handler/[...stack] routes.
// Protected routes are guarded in individual server components/route handlers.
export default (_req: NextRequest) => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
