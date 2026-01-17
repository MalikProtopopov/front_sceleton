import { cn } from "@/shared/lib";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6",
        variant === "elevated" && "shadow-[var(--shadow-lg)]",
        variant === "interactive" &&
          "cursor-pointer transition-all duration-[var(--transition-normal)] hover:-translate-y-1 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  // Check if children is SectionHeader by checking for displayName
  const isSectionHeader = 
    children && 
    typeof children === 'object' && 
    'type' in children && 
    (children.type as any)?.displayName === 'SectionHeader';
  
  return (
    <div 
      className={cn(
        "mb-4",
        !isSectionHeader && "flex items-center justify-between",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn("text-lg font-semibold text-[var(--color-text-primary)]", className)}
      {...props}
    />
  );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-[var(--color-text-secondary)]", className)} {...props} />
  );
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("", className)} {...props} />;
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("mt-4 flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4", className)}
      {...props}
    />
  );
}
