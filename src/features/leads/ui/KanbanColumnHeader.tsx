"use client";

import { Badge } from "@/shared/ui";
import type { InquiryStatus } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

interface KanbanColumnHeaderProps {
  status: InquiryStatus;
  color: string;
  bgColor: string;
  count: number;
}

export function KanbanColumnHeader({ status, color, bgColor, count }: KanbanColumnHeaderProps) {
  const config = INQUIRY_STATUS_CONFIG[status];

  return (
    <div
      className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-3"
      style={{
        borderTop: `3px solid ${color}`,
        borderTopLeftRadius: "0.75rem",
        borderTopRightRadius: "0.75rem",
      }}
    >
      <div className="flex items-center gap-2">
        <Badge variant={config.variant}>{config.label}</Badge>
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
          style={{ backgroundColor: bgColor, color }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}
