import { redirect } from "next/navigation";
import { getRole } from "@/lib/auth";

export default async function HomePage() {
  const role = await getRole();

  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/dashboard");
}

