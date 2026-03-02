"use client";

import { useState } from "react";
import { Modal, ModalBody, ModalFooter, Button, Textarea } from "@/shared/ui";
import type { UpgradeRequestType, CreateUpgradeRequestDto } from "@/entities/billing";
import { requestTypeLabels } from "../lib/billingConstants";

interface UpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUpgradeRequestDto) => void;
  isLoading?: boolean;
  requestType: UpgradeRequestType;
  targetId: string;
  targetName: string;
}

export function UpgradeRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  requestType,
  targetId,
  targetName,
}: UpgradeRequestModalProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const data: CreateUpgradeRequestDto = {
      request_type: requestType,
      message: message.trim() || undefined,
    };

    if (requestType === "plan_upgrade") data.target_plan_id = targetId;
    else if (requestType === "module_addon") data.target_module_id = targetId;
    else if (requestType === "bundle_addon") data.target_bundle_id = targetId;

    onSubmit(data);
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Заявка на изменение тарифа"
      description={`${requestTypeLabels[requestType]}: ${targetName}`}
      size="md"
    >
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              Комментарий
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Необязательно. Укажите дополнительную информацию..."
              rows={4}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {message.length}/2000
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Отправить заявку
        </Button>
      </ModalFooter>
    </Modal>
  );
}
