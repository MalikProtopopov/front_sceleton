import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/config";

export default function HomePage() {
  // Redirect to articles as default view
  redirect(ROUTES.ARTICLES);
}
