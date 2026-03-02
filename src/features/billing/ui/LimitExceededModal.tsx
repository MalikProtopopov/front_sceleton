"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalBody, ModalFooter, Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { limitLabels, formatLimit } from "../lib/billingConstants";
import { useLimitExceededStore } from "@/shared/model/useLimitExceededStore";

export function LimitExceededModal() {
  const router = useRouter();
  const { isOpen, resource, currentUsage, limit, close } = useLimitExceededStore();

  const meta = resource ? limitLabels[resource] : null;
  const label = meta?.label ?? resource ?? "";

  return (
    <Modal isOpen={isOpen} onClose={close} title="Лимит исчерпан" size="sm">
      <ModalBody>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error-bg)]">
            <AlertTriangle className="h-6 w-6 text-[var(--color-error)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[var(--color-text-primary)]">
              <strong>{label}</strong>: использовано{" "}
              {formatLimit(currentUsage ?? 0, meta?.unit)} из{" "}
              {formatLimit(limit ?? 0, meta?.unit)}.
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Обновите тариф или приобретите дополнительные ресурсы.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={close}>
          Закрыть
        </Button>
        <Button
          onClick={() => {
            close();
            router.push(ROUTES.BILLING_PLANS);
          }}
        >
          Обновить тариф
        </Button>
      </ModalFooter>
    </Modal>
  );
}
