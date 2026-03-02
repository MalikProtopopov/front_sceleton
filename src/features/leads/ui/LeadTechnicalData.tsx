"use client";

import { useState } from "react";
import {
  Globe,
  Monitor,
  MapPin,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Laptop,
  Tablet,
  Network,
  Tag,
  FileText,
  Eye,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import type { Inquiry } from "@/entities/inquiry";
import { InfoRow } from "./LeadContactInfo";

function DeviceIcon({ deviceType }: { deviceType: string | null }) {
  if (!deviceType) return <Monitor className="h-4 w-4" />;
  const type = deviceType.toLowerCase();
  if (type.includes("mobile") || type.includes("phone")) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (type.includes("tablet")) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Laptop className="h-4 w-4" />;
}

interface LeadTechnicalDataProps {
  lead: Inquiry;
}

export function LeadTechnicalData({ lead }: LeadTechnicalDataProps) {
  const [showTechnicalData, setShowTechnicalData] = useState(false);

  const hasUtmData =
    lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.utm_term || lead.utm_content;
  const hasSourceData = hasUtmData || lead.source_url || lead.referrer_url || lead.page_path;
  const hasTechnicalData =
    lead.ip_address ||
    lead.device_type ||
    lead.browser ||
    lead.os ||
    lead.city ||
    lead.country ||
    lead.session_id ||
    lead.session_page_views ||
    lead.time_on_page;

  if (!hasSourceData && !hasTechnicalData) return null;

  return (
    <>
      {hasSourceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Источник и аналитика
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasUtmData && (
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  UTM метки
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {lead.utm_source && (
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Source</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {lead.utm_source}
                      </p>
                    </div>
                  )}
                  {lead.utm_medium && (
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Medium</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {lead.utm_medium}
                      </p>
                    </div>
                  )}
                  {lead.utm_campaign && (
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Campaign</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {lead.utm_campaign}
                      </p>
                    </div>
                  )}
                  {lead.utm_term && (
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Term</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {lead.utm_term}
                      </p>
                    </div>
                  )}
                  {lead.utm_content && (
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Content</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {lead.utm_content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-1 sm:grid-cols-2">
              {lead.source_url && (
                <InfoRow
                  icon={LinkIcon}
                  label="Страница отправки"
                  value={lead.page_path || lead.source_url}
                  href={lead.source_url}
                />
              )}
              {lead.page_title && (
                <InfoRow icon={FileText} label="Заголовок страницы" value={lead.page_title} />
              )}
              {lead.referrer_url && (
                <InfoRow
                  icon={Globe}
                  label="Источник перехода"
                  value={lead.referrer_url}
                  href={lead.referrer_url}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasTechnicalData && (
        <Card>
          <CardHeader>
            <button
              onClick={() => setShowTechnicalData(!showTechnicalData)}
              className="flex w-full items-center justify-between"
            >
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Технические данные
              </CardTitle>
              {showTechnicalData ? (
                <ChevronUp className="h-5 w-5 text-[var(--color-text-muted)]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" />
              )}
            </button>
          </CardHeader>
          {showTechnicalData && (
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(lead.device_type || lead.browser || lead.os) && (
                  <div className="p-3 rounded-lg border border-[var(--color-border)]">
                    <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                      <DeviceIcon deviceType={lead.device_type} />
                      Устройство
                    </h4>
                    <div className="space-y-1 text-sm">
                      {lead.device_type && (
                        <p className="text-[var(--color-text-primary)]">{lead.device_type}</p>
                      )}
                      {lead.browser && (
                        <p className="text-[var(--color-text-secondary)]">{lead.browser}</p>
                      )}
                      {lead.os && (
                        <p className="text-[var(--color-text-secondary)]">{lead.os}</p>
                      )}
                    </div>
                  </div>
                )}

                {(lead.city || lead.country) && (
                  <div className="p-3 rounded-lg border border-[var(--color-border)]">
                    <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      Геолокация
                    </h4>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {[lead.city, lead.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}

                {lead.ip_address && (
                  <div className="p-3 rounded-lg border border-[var(--color-border)]">
                    <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                      <Network className="h-4 w-4" />
                      IP адрес
                    </h4>
                    <p className="text-sm text-[var(--color-text-primary)] font-mono">
                      {lead.ip_address}
                    </p>
                  </div>
                )}

                {(lead.session_id || lead.session_page_views || lead.time_on_page) && (
                  <div className="p-3 rounded-lg border border-[var(--color-border)]">
                    <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      Сессия
                    </h4>
                    <div className="space-y-1 text-sm">
                      {lead.session_page_views && (
                        <p className="text-[var(--color-text-primary)]">
                          {lead.session_page_views} просмотров
                        </p>
                      )}
                      {lead.time_on_page && (
                        <p className="text-[var(--color-text-secondary)]">
                          {Math.round(lead.time_on_page / 60)} мин. на странице
                        </p>
                      )}
                      {lead.session_id && (
                        <p className="text-[var(--color-text-muted)] text-xs font-mono truncate">
                          ID: {lead.session_id}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
