import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PrivacyBackLink() {
  return (
    <Link
      href="/tools/json/formatter"
      className="inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to DevToolset
    </Link>
  );
}
