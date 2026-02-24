"use client";

import { useState } from "react";
import {
  Globe,
  Plus,
  Trash2,
  Shield,
  ShieldAlert,
  Clock,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  useTenantDomains,
  useCreateTenantDomain,
  useUpdateTenantDomain,
  useDeleteTenantDomain,
  useVerifyTenantDomain,
  useDomainSSLPolling,
} from "../model/useTenants";
import {
  Button,
  Badge,
  Spinner,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Switch,
  ConfirmModal,
} from "@/shared/ui";
import type { TenantDomainResponse, DNSVerifyResponse } from "@/entities/tenant";

interface TenantDomainsTabProps {
  tenantId: string;
}

const PLATFORM_SUFFIX = ".mediann.dev";
const CNAME_TARGET = "tenants.mediann.dev";

function isPlatformDomain(domain: string): boolean {
  return domain.endsWith(PLATFORM_SUFFIX);
}

function SslBadge({ status }: { status: TenantDomainResponse["ssl_status"] }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="success" className="gap-1">
          <Shield className="h-3 w-3" />
          SSL Active
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Ожидает DNS
        </Badge>
      );
    case "verifying":
      return (
        <Badge variant="info" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Получаем SSL...
        </Badge>
      );
    case "error":
      return (
        <Badge variant="error" className="gap-1">
          <ShieldAlert className="h-3 w-3" />
          Ошибка SSL
        </Badge>
      );
  }
}

function DomainSSLPoller({
  tenantId,
  domain,
}: {
  tenantId: string;
  domain: TenantDomainResponse;
}) {
  const shouldPoll =
    domain.ssl_status === "pending" || domain.ssl_status === "verifying";
  useDomainSSLPolling(tenantId, domain.id, shouldPoll);
  return null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)]"
      title="Копировать"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function TenantDomainsTab({ tenantId }: TenantDomainsTabProps) {
  const { data, isLoading } = useTenantDomains(tenantId);
  const { mutate: createDomain, isPending: isCreating } =
    useCreateTenantDomain(tenantId);
  const { mutate: updateDomain, isPending: isUpdating } =
    useUpdateTenantDomain(tenantId);
  const { mutate: deleteDomain, isPending: isDeleting } =
    useDeleteTenantDomain(tenantId);
  const {
    mutate: verifyDomain,
    isPending: isVerifying,
    reset: resetVerify,
  } = useVerifyTenantDomain(tenantId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TenantDomainResponse | null>(
    null,
  );

  // Add domain form state
  type DomainType = "platform" | "custom";
  const [domainType, setDomainType] = useState<DomainType>("custom");
  const [newDomain, setNewDomain] = useState("");
  const [newDomainPrimary, setNewDomainPrimary] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  // DNS verify state per domain
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const resetAddModal = () => {
    setShowAddModal(false);
    setNewDomain("");
    setNewDomainPrimary(false);
    setDomainError(null);
    setDomainType("custom");
  };

  const handleAddDomain = () => {
    setDomainError(null);
    let fullDomain: string;

    if (domainType === "platform") {
      const prefix = newDomain.trim().toLowerCase();
      if (!prefix || prefix.length < 1) {
        setDomainError("Введите поддомен");
        return;
      }
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(prefix)) {
        setDomainError(
          "Только строчные буквы, цифры и дефис (не в начале/конце)",
        );
        return;
      }
      fullDomain = `${prefix}${PLATFORM_SUFFIX}`;
    } else {
      fullDomain = newDomain.trim().toLowerCase();
      if (!fullDomain || fullDomain.length < 4) {
        setDomainError("Введите корректный домен (минимум 4 символа)");
        return;
      }
      if (
        !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
          fullDomain,
        )
      ) {
        setDomainError(
          "Введите корректный домен (например admin.client.com)",
        );
        return;
      }
    }

    createDomain(
      { domain: fullDomain, is_primary: newDomainPrimary },
      { onSuccess: resetAddModal },
    );
  };

  const handleMakePrimary = (domain: TenantDomainResponse) => {
    updateDomain({ domainId: domain.id, data: { is_primary: true } });
  };

  const handleDeleteDomain = () => {
    if (!deleteTarget) return;
    deleteDomain(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleVerifyDNS = (domain: TenantDomainResponse) => {
    setVerifyingDomainId(domain.id);
    setVerifyMessage(null);
    resetVerify();
    verifyDomain(domain.id, {
      onSuccess: (result: DNSVerifyResponse) => {
        if (!result.ok) {
          setVerifyMessage(result.message);
        } else {
          setVerifyMessage(null);
        }
        setVerifyingDomainId(null);
      },
      onError: () => {
        setVerifyingDomainId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const domains = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Hidden pollers for domains in transitional states */}
      {domains
        .filter(
          (d) => d.ssl_status === "pending" || d.ssl_status === "verifying",
        )
        .map((d) => (
          <DomainSSLPoller key={d.id} tenantId={tenantId} domain={d} />
        ))}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Админ-домены</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Добавить домен
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <Globe className="mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">
                Нет привязанных доменов
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Добавьте домен, чтобы admin_domain появился в API
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="pb-3 text-left text-sm font-medium text-[var(--color-text-muted)]">
                        Домен
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-[var(--color-text-muted)]">
                        Тип
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-[var(--color-text-muted)]">
                        Статус
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-[var(--color-text-muted)]">
                        SSL
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-[var(--color-text-muted)]">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {domains.map((domain) => {
                      const isTransitional =
                        domain.ssl_status === "verifying";
                      const canMakePrimary =
                        !domain.is_primary && domain.ssl_status === "active";
                      const showVerifyButton =
                        !isPlatformDomain(domain.domain) &&
                        (domain.ssl_status === "pending" ||
                          domain.ssl_status === "error");
                      const isThisDomainVerifying =
                        verifyingDomainId === domain.id && isVerifying;

                      return (
                        <tr key={domain.id}>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                              {domain.ssl_status === "active" ? (
                                <a
                                  href={`https://${domain.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 font-medium text-[var(--color-accent-primary)] hover:underline"
                                >
                                  {domain.domain}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="font-medium text-[var(--color-text-primary)]">
                                  {domain.domain}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            {isPlatformDomain(domain.domain) ? (
                              <Badge variant="info">Платформа</Badge>
                            ) : (
                              <Badge variant="outline">Кастомный</Badge>
                            )}
                          </td>
                          <td className="py-3">
                            {domain.is_primary ? (
                              <Badge variant="success">Primary</Badge>
                            ) : (
                              <Badge variant="secondary">Secondary</Badge>
                            )}
                          </td>
                          <td className="py-3">
                            <SslBadge status={domain.ssl_status} />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-2">
                              {showVerifyButton && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleVerifyDNS(domain)}
                                  disabled={isThisDomainVerifying}
                                  leftIcon={
                                    isThisDomainVerifying ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    )
                                  }
                                >
                                  {domain.ssl_status === "error"
                                    ? "Повторить"
                                    : "Проверить DNS"}
                                </Button>
                              )}
                              {canMakePrimary && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMakePrimary(domain)}
                                  disabled={isUpdating || isTransitional}
                                >
                                  Сделать основным
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(domain)}
                                disabled={isTransitional}
                                className="text-[var(--color-error)] hover:text-[var(--color-error)]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* DNS verification error message */}
              {verifyMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)] p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
                  <p className="text-sm text-[var(--color-warning)]">
                    {verifyMessage}
                  </p>
                </div>
              )}

              {/* CNAME instructions for pending custom domains */}
              {domains.some(
                (d) =>
                  !isPlatformDomain(d.domain) &&
                  (d.ssl_status === "pending" || d.ssl_status === "error"),
              ) && (
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                  <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Настройка DNS для кастомных доменов
                  </p>
                  <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                    Добавьте CNAME-запись у вашего DNS-провайдера для каждого
                    кастомного домена:
                  </p>
                  {domains
                    .filter(
                      (d) =>
                        !isPlatformDomain(d.domain) &&
                        (d.ssl_status === "pending" ||
                          d.ssl_status === "error"),
                    )
                    .map((d) => (
                      <div
                        key={d.id}
                        className="mb-2 flex items-center gap-2 rounded bg-[var(--color-bg-primary)] px-3 py-2 font-mono text-xs"
                      >
                        <span className="text-[var(--color-text-secondary)]">
                          {d.domain}
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          CNAME
                        </span>
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {CNAME_TARGET}
                        </span>
                        <CopyButton text={`${d.domain} CNAME ${CNAME_TARGET}`} />
                      </div>
                    ))}
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    После настройки DNS нажмите «Проверить DNS». Изменения DNS
                    могут вступить в силу в течение нескольких минут до 24 часов.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add domain modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Добавить домен
            </h3>

            <div className="space-y-4">
              {/* Domain type radio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Тип домена
                </label>
                <div className="flex gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="domainType"
                      checked={domainType === "platform"}
                      onChange={() => {
                        setDomainType("platform");
                        setNewDomain("");
                        setDomainError(null);
                      }}
                      className="accent-[var(--color-accent-primary)]"
                    />
                    <span className="text-sm text-[var(--color-text-primary)]">
                      Поддомен платформы
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="domainType"
                      checked={domainType === "custom"}
                      onChange={() => {
                        setDomainType("custom");
                        setNewDomain("");
                        setDomainError(null);
                      }}
                      className="accent-[var(--color-accent-primary)]"
                    />
                    <span className="text-sm text-[var(--color-text-primary)]">
                      Кастомный домен
                    </span>
                  </label>
                </div>
              </div>

              {/* Domain input */}
              {domainType === "platform" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                    Поддомен
                  </label>
                  <div className="flex items-center">
                    <Input
                      placeholder="admin-yastvo"
                      value={newDomain}
                      onChange={(e) => {
                        setNewDomain(e.target.value);
                        setDomainError(null);
                      }}
                      error={domainError || undefined}
                      className="rounded-r-none"
                    />
                    <span className="inline-flex h-10 items-center rounded-r-[var(--radius-md)] border border-l-0 border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-sm text-[var(--color-text-muted)]">
                      {PLATFORM_SUFFIX}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                    SSL-сертификат будет активен автоматически (wildcard)
                  </p>
                </div>
              ) : (
                <div>
                  <Input
                    label="Домен"
                    placeholder="admin.yastvo.com"
                    value={newDomain}
                    onChange={(e) => {
                      setNewDomain(e.target.value);
                      setDomainError(null);
                    }}
                    error={domainError || undefined}
                  />
                  <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
                    <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                      После добавления настройте DNS
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Добавьте CNAME-запись у вашего DNS-провайдера:
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 rounded bg-[var(--color-bg-primary)] px-2.5 py-1.5 font-mono text-xs">
                      <span className="text-[var(--color-text-secondary)]">
                        {newDomain.trim() || "admin.example.com"}
                      </span>
                      <span className="text-[var(--color-text-muted)]">→</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {CNAME_TARGET}
                      </span>
                      {newDomain.trim() && (
                        <CopyButton
                          text={`${newDomain.trim()} CNAME ${CNAME_TARGET}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Switch
                checked={newDomainPrimary}
                onChange={setNewDomainPrimary}
                label="Основной домен"
                description="Будет использоваться как admin_domain в API для переключателя организаций"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={resetAddModal}>
                Отмена
              </Button>
              <Button onClick={handleAddDomain} disabled={isCreating}>
                {isCreating ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete domain confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDomain}
        title="Удалить домен?"
        description={`Вы уверены, что хотите удалить домен "${deleteTarget?.domain}"? Если это основной домен, admin_domain перестанет работать.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
