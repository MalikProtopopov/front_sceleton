"use client";

import { useState } from "react";
import { X, Trash2, Check, Archive, EyeOff } from "lucide-react";
import { Button } from "../Button/Button";
import { ConfirmModal } from "../Modal";
import { useBulkOperation } from "@/features/bulk";
import type { BulkResourceType, BulkAction } from "@/entities/bulk";
import { BULK_ACTION_CONFIG } from "@/entities/bulk";

interface BulkActionsToolbarProps {
  selectedIds: string[];
  resourceType: BulkResourceType;
  onClearSelection: () => void;
  availableActions?: BulkAction[];
}

export function BulkActionsToolbar({
  selectedIds,
  resourceType,
  onClearSelection,
  availableActions = ["publish", "unpublish", "archive", "delete"],
}: BulkActionsToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const { mutate: executeBulk, isPending } = useBulkOperation();

  if (selectedIds.length === 0) {
    return null;
  }

  const handleAction = (action: BulkAction) => {
    setConfirmAction(action);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      executeBulk(
        {
          resource_type: resourceType,
          action: confirmAction,
          ids: selectedIds,
        },
        {
          onSuccess: () => {
            onClearSelection();
            setConfirmAction(null);
          },
          onError: () => {
            setConfirmAction(null);
          },
        }
      );
    }
  };

  const getActionIcon = (action: BulkAction) => {
    switch (action) {
      case "publish":
        return <Check className="h-4 w-4" />;
      case "unpublish":
        return <EyeOff className="h-4 w-4" />;
      case "archive":
        return <Archive className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
    }
  };

  const getConfirmDescription = () => {
    const actionConfig = confirmAction ? BULK_ACTION_CONFIG[confirmAction] : null;
    if (!actionConfig) return "";
    
    const actionName = actionConfig.label.toLowerCase();
    return `Вы уверены, что хотите ${actionName} ${selectedIds.length} ${getItemWord(selectedIds.length)}?`;
  };

  const getItemWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return "запись";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "записи";
    return "записей";
  };

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-lg border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 p-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Выбрано: {selectedIds.length}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4 mr-1" />
            Отменить
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {availableActions.map((action) => {
            const config = BULK_ACTION_CONFIG[action];
            return (
              <Button
                key={action}
                variant={config.variant}
                size="sm"
                onClick={() => handleAction(action)}
                leftIcon={getActionIcon(action)}
              >
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction ? BULK_ACTION_CONFIG[confirmAction].label : ""}
        description={getConfirmDescription()}
        confirmText={confirmAction ? BULK_ACTION_CONFIG[confirmAction].label : "Подтвердить"}
        variant={confirmAction === "delete" ? "danger" : "default"}
        isLoading={isPending}
      />
    </>
  );
}

