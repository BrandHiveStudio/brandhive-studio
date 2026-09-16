import { redirect } from "next/navigation";

export default function AdminInsightsRedirect() {
  redirect("/admin/posts");
}
