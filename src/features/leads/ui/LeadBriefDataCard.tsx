"use client";

import {
  Hash,
  Globe,
  Lightbulb,
  DollarSign,
  Timer,
  Send,
  Layers,
  Target,
  Users,
  Cpu,
  Puzzle,
  CheckCircle2,
} from "lucide-react";
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import type { MvpBriefFields } from "@/entities/inquiry";
import {
  BRIEF_FIELD_LABELS,
  MARKET_OPTIONS,
  AUDIENCE_SIZE_OPTIONS,
  AI_REQUIRED_OPTIONS,
  APP_TYPES_OPTIONS,
  BUDGET_OPTIONS,
  URGENCY_OPTIONS,
  SOURCE_OPTIONS,
} from "@/entities/inquiry";

const ALL_VALUE_MAPS: Record<string, Record<string, string>> = {
  market: MARKET_OPTIONS,
  audienceSize: AUDIENCE_SIZE_OPTIONS,
  aiRequired: AI_REQUIRED_OPTIONS,
  budget: BUDGET_OPTIONS,
  urgency: URGENCY_OPTIONS,
  source: SOURCE_OPTIONS,
};

function interpretFieldValue(key: string, value: unknown): string {
  if (key === "consent") {
    return value ? "Да" : "Нет";
  }
  if (key === "appTypes" && Array.isArray(value)) {
    return value.map((v) => APP_TYPES_OPTIONS[v] || v).join(", ");
  }
  if (typeof value === "string" && ALL_VALUE_MAPS[key]) {
    return ALL_VALUE_MAPS[key][value] || value;
  }
  return String(value);
}

interface LeadBriefDataCardProps {
  customFields: Record<string, unknown>;
}

export function LeadBriefDataCard({ customFields }: LeadBriefDataCardProps) {
  const fields = customFields as MvpBriefFields;

  const getOptionLabel = (value: string | undefined, options: Record<string, string>) => {
    if (!value) return null;
    return options[value] || value;
  };

  const hasBriefData = fields.idea || fields.market || fields.audience ||
    fields.budget || fields.urgency || fields.appTypes?.length;

  if (!hasBriefData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Данные брифа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.consent !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            <span className="text-[var(--color-text-secondary)]">Согласие на обработку ПД получено</span>
          </div>
        )}

        {fields.idea && (
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {BRIEF_FIELD_LABELS.idea}
            </h4>
            <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed bg-[var(--color-bg-secondary)] p-3 rounded-lg">
              {fields.idea}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.market && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.market}
              </h4>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {getOptionLabel(fields.market, MARKET_OPTIONS)}
              </p>
            </div>
          )}

          {fields.audience && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.audience}
              </h4>
              <p className="text-sm text-[var(--color-text-primary)]">
                {fields.audience}
              </p>
            </div>
          )}

          {fields.audienceSize && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.audienceSize}
              </h4>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {getOptionLabel(fields.audienceSize, AUDIENCE_SIZE_OPTIONS)}
              </p>
            </div>
          )}

          {fields.aiRequired && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.aiRequired}
              </h4>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {getOptionLabel(fields.aiRequired, AI_REQUIRED_OPTIONS)}
              </p>
            </div>
          )}

          {fields.budget && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.budget}
              </h4>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {getOptionLabel(fields.budget, BUDGET_OPTIONS)}
              </p>
            </div>
          )}

          {fields.urgency && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.urgency}
              </h4>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {getOptionLabel(fields.urgency, URGENCY_OPTIONS)}
              </p>
            </div>
          )}

          {fields.telegram && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.telegram}
              </h4>
              <a
                href={fields.telegram.startsWith("@") ? `https://t.me/${fields.telegram.slice(1)}` : fields.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-accent-primary)] hover:underline"
              >
                {fields.telegram}
              </a>
            </div>
          )}

          {fields.source && (
            <div className="p-3 rounded-lg border border-[var(--color-border)]">
              <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {BRIEF_FIELD_LABELS.source}
              </h4>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {getOptionLabel(fields.source, SOURCE_OPTIONS)}
              </p>
            </div>
          )}
        </div>

        {fields.appTypes && fields.appTypes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {BRIEF_FIELD_LABELS.appTypes}
            </h4>
            <div className="flex flex-wrap gap-2">
              {fields.appTypes.map((type) => (
                <Badge key={type} variant="secondary">
                  {APP_TYPES_OPTIONS[type] || type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {fields.integrations && (
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              {BRIEF_FIELD_LABELS.integrations}
            </h4>
            <p className="text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] p-3 rounded-lg">
              {fields.integrations}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LeadCustomFieldsCardProps {
  customFields: Record<string, unknown>;
  formSlug: string | null;
}

export function LeadCustomFieldsCard({ customFields, formSlug }: LeadCustomFieldsCardProps) {
  const briefDisplayedInCard = new Set(["idea", "market", "audience", "audienceSize", "aiRequired", "appTypes", "integrations", "budget", "urgency", "telegram", "source", "consent"]);
  const isMvpBrief = formSlug === "mvp-brief";

  const entries = Object.entries(customFields).filter(([key, value]) => {
    if (value === null || value === undefined || value === "") return false;
    if (isMvpBrief && briefDisplayedInCard.has(key)) return false;
    return true;
  });

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Дополнительные поля
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]"
            >
              <p className="text-xs text-[var(--color-text-muted)]">
                {BRIEF_FIELD_LABELS[key] || key.replace(/_/g, " ")}
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)] break-words">
                {interpretFieldValue(key, value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
