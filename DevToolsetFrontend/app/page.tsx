import { redirect } from "next/navigation";
import { defaultToolHref } from "@/lib/tools";

export default function HomePage() {
  redirect(defaultToolHref);
}
