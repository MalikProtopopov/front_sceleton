"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  MessageSquare,
  Package,
  User,
  Bell,
  BellOff,
} from "lucide-react";
import { useLead, useDeleteLead } from "@/features/leads";
import {
  Spinner,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { InquiryStatus } from "@/entities/inquiry";
import { useUpdateLead } from "@/features/leads";
import { LeadDetailHeader } from "@/features/leads/ui/LeadDetailHeader";
import { LeadContactInfo } from "@/features/leads/ui/LeadContactInfo";
import { LeadBriefDataCard, LeadCustomFieldsCard } from "@/features/leads/ui/LeadBriefDataCard";
import { LeadStatusTimeline } from "@/features/leads/ui/LeadStatusTimeline";
import { LeadNotesCard } from "@/features/leads/ui/LeadNotesCard";
import { LeadTechnicalData } from "@/features/leads/ui/LeadTechnicalData";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: lead, isLoading, error } = useLead(id);
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead(id);
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !lead) {
    notFound();
  }

  const handleStatusChange = (status: InquiryStatus) => {
    updateLead({ status });
  };

  const handleDelete = () => {
    deleteLead(id);
  };

  return (
    <div className="space-y-6">
      <LeadDetailHeader
        lead={lead}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <LeadContactInfo lead={lead} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Сообщение
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.message ? (
                <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                  {lead.message}
                </p>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">Сообщение не указано</p>
              )}
            </CardContent>
          </Card>

          {lead.product && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Товар
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={ROUTES.PRODUCT_EDIT(lead.product.id)}
                  className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-[var(--color-bg-hover)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--color-bg-secondary)]">
                    <Package className="h-5 w-5 text-[var(--color-accent-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {lead.product.name || lead.product.slug}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      SKU: {lead.product.sku} · /{lead.product.slug}
                    </p>
                  </div>
                </a>
              </CardContent>
            </Card>
          )}

          {lead.form_slug === "mvp-brief" && lead.custom_fields && (
            <LeadBriefDataCard customFields={lead.custom_fields} />
          )}

          <LeadTechnicalData lead={lead} />

          {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
            <LeadCustomFieldsCard customFields={lead.custom_fields} formSlug={lead.form_slug} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LeadStatusTimeline
            status={lead.status}
            createdAt={lead.created_at}
            updatedAt={lead.updated_at}
            contactedAt={lead.contacted_at}
          />

          {lead.assigned_to && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Назначено
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-medium">
                    {lead.assigned_to.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {lead.assigned_to}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">Ответственный</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <LeadNotesCard leadId={id} notes={lead.notes} />

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {lead.notification_sent ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center">
                      <Bell className="h-4 w-4 text-[var(--color-success)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Уведомление отправлено
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Email уведомление было отправлено
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                      <BellOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Уведомление не отправлено
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Email уведомление не было отправлено
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-[var(--color-text-muted)] space-y-1 px-1">
            <p>ID: {lead.id}</p>
            {lead.form_slug && <p>Тип формы: {lead.form_slug}</p>}
            {lead.service_id && <p>Услуга: {lead.service_id}</p>}
            {lead.product && (
              <p>
                Товар:{" "}
                <a
                  href={ROUTES.PRODUCT_EDIT(lead.product.id)}
                  className="text-[var(--color-accent-primary)] hover:underline"
                >
                  {lead.product.name || lead.product.sku}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
