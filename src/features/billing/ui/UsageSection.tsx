"use client";

import type { UsageMap } from "@/entities/billing";
import { limitLabels } from "../lib/billingConstants";
import { UsageProgressBar } from "./UsageProgressBar";

interface UsageSectionProps {
  usage: UsageMap;
}

const DISPLAY_ORDER = [
  "max_users",
  "max_storage_mb",
  "max_leads_per_month",
  "max_articles",
  "max_products",
  "max_domains",
  "max_variants",
  "max_rbac_roles",
];

export function UsageSection({ usage }: UsageSectionProps) {
  const keys = DISPLAY_ORDER.filter((k) => k in usage && k in limitLabels);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {keys.map((key) => (
        <UsageProgressBar key={key} limitKey={key} entry={usage[key]!} />
      ))}
    </div>
  );
}
