import { redirect } from "next/navigation";

/**
 * Root page — redirects to default locale.
 * This handles the bare "/" route.
 */
export default function RootPage() {
  redirect("/ar");
}
