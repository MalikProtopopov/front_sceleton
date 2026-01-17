import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        primary: "bg-[var(--color-accent-primary)] text-white",
        secondary: "bg-[var(--color-accent-secondary)] text-white",
        success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        error: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
        info: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
        outline: "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Status-specific badges for articles, reviews, etc.
export type StatusBadgeVariant = "draft" | "published" | "archived" | "pending" | "approved" | "rejected" | "new" | "in_progress" | "contacted" | "completed" | "spam";

const statusVariantMap: Record<StatusBadgeVariant, VariantProps<typeof badgeVariants>["variant"]> = {
  draft: "default",
  published: "success",
  archived: "warning",
  pending: "warning",
  approved: "success",
  rejected: "error",
  new: "info",
  in_progress: "warning",
  contacted: "info",
  completed: "success",
  spam: "error",
};

const statusLabelMap: Record<StatusBadgeVariant, string> = {
  draft: "Черновик",
  published: "Опубликовано",
  archived: "В архиве",
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
  new: "Новая",
  in_progress: "В работе",
  contacted: "Связались",
  completed: "Завершено",
  spam: "Спам",
};

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: StatusBadgeVariant;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]} className={className} {...props}>
      {statusLabelMap[status]}
    </Badge>
  );
}

