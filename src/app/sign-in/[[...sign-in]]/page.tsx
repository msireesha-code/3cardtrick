import { redirect } from "next/navigation";

// Stack Auth sign-in lives at /handler/sign-in
export default function SignInPage() {
  redirect("/handler/sign-in");
}
