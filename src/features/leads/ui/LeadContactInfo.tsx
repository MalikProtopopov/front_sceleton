"use client";

import {
  Mail,
  Phone,
  Building2,
  User,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { Inquiry } from "@/entities/inquiry";

export function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 py-2", className)}>
      <Icon className="h-4 w-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-sm text-[var(--color-accent-primary)] hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-[var(--color-text-primary)] break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

interface LeadContactInfoProps {
  lead: Inquiry;
}

export function LeadContactInfo({ lead }: LeadContactInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Контактная информация
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {lead.email && (
            <InfoRow
              icon={Mail}
              label="Email"
              value={lead.email}
              href={`mailto:${lead.email}`}
            />
          )}
          {lead.phone && (
            <InfoRow
              icon={Phone}
              label="Телефон"
              value={lead.phone}
              href={`tel:${lead.phone}`}
            />
          )}
          {lead.company && (
            <InfoRow icon={Building2} label="Компания" value={lead.company} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
