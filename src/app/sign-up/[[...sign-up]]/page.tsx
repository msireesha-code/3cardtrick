import { redirect } from "next/navigation";

// Stack Auth sign-up lives at /handler/sign-up
export default function SignUpPage() {
  redirect("/handler/sign-up");
}
