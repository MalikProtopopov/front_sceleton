"use client";

import { useState } from "react";
import { Globe, Plus, Trash2, Shield, ShieldAlert, Clock } from "lucide-react";
import {
  useTenantDomains,
  useCreateTenantDomain,
  useUpdateTenantDomain,
  useDeleteTenantDomain,
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
import type { TenantDomainResponse } from "@/entities/tenant";

interface TenantDomainsTabProps {
  tenantId: string;
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
          SSL Pending
        </Badge>
      );
    case "error":
      return (
        <Badge variant="error" className="gap-1">
          <ShieldAlert className="h-3 w-3" />
          SSL Error
        </Badge>
      );
  }
}

export function TenantDomainsTab({ tenantId }: TenantDomainsTabProps) {
  const { data, isLoading } = useTenantDomains(tenantId);
  const { mutate: createDomain, isPending: isCreating } = useCreateTenantDomain(tenantId);
  const { mutate: updateDomain, isPending: isUpdating } = useUpdateTenantDomain(tenantId);
  const { mutate: deleteDomain, isPending: isDeleting } = useDeleteTenantDomain(tenantId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TenantDomainResponse | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [newDomainPrimary, setNewDomainPrimary] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  const handleAddDomain = () => {
    setDomainError(null);
    const trimmed = newDomain.trim().toLowerCase();

    if (!trimmed || trimmed.length < 4) {
      setDomainError("Введите корректный домен (минимум 4 символа)");
      return;
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(trimmed)) {
      setDomainError("Введите корректный домен (например admin.client.com)");
      return;
    }

    createDomain(
      { domain: trimmed, is_primary: newDomainPrimary },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setNewDomain("");
          setNewDomainPrimary(false);
        },
      },
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-3 text-left text-sm font-medium text-[var(--color-text-muted)]">
                      Домен
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
                  {domains.map((domain) => (
                    <tr key={domain.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-[var(--color-text-muted)]" />
                          <a
                            href={`https://${domain.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--color-accent-primary)] hover:underline"
                          >
                            {domain.domain}
                          </a>
                        </div>
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
                          {!domain.is_primary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMakePrimary(domain)}
                              disabled={isUpdating}
                            >
                              Сделать основным
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(domain)}
                            className="text-[var(--color-error)] hover:text-[var(--color-error)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add domain modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Добавить домен
            </h3>
            <div className="space-y-4">
              <Input
                label="Домен"
                placeholder="admin.client.com"
                value={newDomain}
                onChange={(e) => {
                  setNewDomain(e.target.value);
                  setDomainError(null);
                }}
                error={domainError || undefined}
              />
              <Switch
                checked={newDomainPrimary}
                onChange={setNewDomainPrimary}
                label="Основной домен"
                description="Будет использоваться как admin_domain в API"
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setNewDomain("");
                  setNewDomainPrimary(false);
                  setDomainError(null);
                }}
              >
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
