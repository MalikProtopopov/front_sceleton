"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { 
  Mail, 
  Phone, 
  Building2, 
  Globe, 
  MapPin, 
  Monitor, 
  Link 
} from "lucide-react";
import { useLead, useUpdateLead, useDeleteLead } from "@/features/leads";
import { Button, Spinner, Badge, Card, CardHeader, CardTitle, CardContent, Select, Textarea, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { InquiryStatus } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

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

  const handleSaveNotes = () => {
    updateLead({ notes });
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    deleteLead(id);
    setDeleteModalOpen(false);
  };

  const statusConfig = INQUIRY_STATUS_CONFIG[lead.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {lead.name}
            </h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          {lead.company && (
            <p className="mt-1 text-[var(--color-text-secondary)]">{lead.company}</p>
          )}
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создан: {formatDateTime(lead.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
            options={Object.entries(INQUIRY_STATUS_CONFIG).map(([value, { label }]) => ({
              value,
              label,
            }))}
            className="w-40"
          />
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Удалить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[var(--color-text-muted)]" />
                <a href={`mailto:${lead.email}`} className="text-[var(--color-accent-primary)] hover:underline">
                  {lead.email}
                </a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[var(--color-text-muted)]" />
                <a href={`tel:${lead.phone}`} className="text-[var(--color-accent-primary)] hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text-primary)]">{lead.company}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle>Сообщение</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.message ? (
              <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">{lead.message}</p>
            ) : (
              <p className="text-[var(--color-text-muted)]">Нет сообщения</p>
            )}
          </CardContent>
        </Card>

        {/* Source & Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Источник</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">UTM метки</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {lead.utm_source && (
                    <div>
                      <span className="text-[var(--color-text-muted)]">Source:</span>{" "}
                      <span className="text-[var(--color-text-primary)]">{lead.utm_source}</span>
                    </div>
                  )}
                  {lead.utm_medium && (
                    <div>
                      <span className="text-[var(--color-text-muted)]">Medium:</span>{" "}
                      <span className="text-[var(--color-text-primary)]">{lead.utm_medium}</span>
                    </div>
                  )}
                  {lead.utm_campaign && (
                    <div>
                      <span className="text-[var(--color-text-muted)]">Campaign:</span>{" "}
                      <span className="text-[var(--color-text-primary)]">{lead.utm_campaign}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {lead.source_url && (
              <div className="flex items-start gap-3">
                <Link className="h-5 w-5 text-[var(--color-text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Страница отправки</p>
                  <a 
                    href={lead.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent-primary)] hover:underline text-sm"
                  >
                    {lead.page_path || lead.source_url}
                  </a>
                </div>
              </div>
            )}

            {lead.referrer_url && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-[var(--color-text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Referrer</p>
                  <span className="text-[var(--color-text-primary)] text-sm">{lead.referrer_url}</span>
                </div>
              </div>
            )}

            {(lead.city || lead.country) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text-primary)]">
                  {[lead.city, lead.country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            {(lead.device_type || lead.browser || lead.os) && (
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-[var(--color-text-muted)] mt-0.5" />
                <div className="text-sm">
                  <span className="text-[var(--color-text-primary)]">
                    {[lead.device_type, lead.browser, lead.os].filter(Boolean).join(" · ")}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Заметки</CardTitle>
              {!isEditingNotes && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setNotes(lead.notes || "");
                    setIsEditingNotes(true);
                  }}
                >
                  Редактировать
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Добавьте заметки о лиде..."
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} isLoading={isUpdating}>
                    Сохранить
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingNotes(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : lead.notes ? (
              <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">{lead.notes}</p>
            ) : (
              <p className="text-[var(--color-text-muted)]">Нет заметок</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Fields */}
      {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Дополнительные поля</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(lead.custom_fields).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-[var(--color-text-muted)]">{key}</dt>
                  <dd className="text-[var(--color-text-primary)]">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить лид?"
        description={`Вы уверены, что хотите удалить заявку от "${lead.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

