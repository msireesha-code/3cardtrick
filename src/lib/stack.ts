import "server-only";
import { StackServerApp } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID ?? "";
export const stackEnabled =
  !!projectId && projectId !== "replace_me";

export const stackServerApp = stackEnabled
  ? new StackServerApp({ tokenStore: "nextjs-cookie" })
  : null;

export async function getStackUserId(): Promise<string | null> {
  if (!stackEnabled || !stackServerApp) return null;
  try {
    const user = await stackServerApp.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
