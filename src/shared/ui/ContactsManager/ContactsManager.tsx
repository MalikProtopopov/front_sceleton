"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  Phone,
  Mail,
  Link as LinkIcon,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";
import { NumberInput } from "../NumberInput";
import { Modal, ConfirmModal, ModalBody, ModalFooter } from "../Modal";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";

// ============================================================================
// TYPES
// ============================================================================

export type ContactType =
  | "website"
  | "instagram"
  | "telegram"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "email"
  | "phone"
  | "whatsapp"
  | "viber"
  | "other";

export interface Contact {
  id: string;
  contact_type: ContactType;
  value: string;
  sort_order: number;
}

export interface CreateContactDto {
  contact_type: ContactType;
  value: string;
  sort_order?: number;
}

export interface UpdateContactDto {
  contact_type?: ContactType;
  value?: string;
  sort_order?: number;
}

export interface ContactsManagerProps {
  /** List of existing contacts */
  contacts: Contact[];
  /** Whether the resource is in edit mode */
  isEditing: boolean;
  /** Callback when a new contact is created */
  onCreateContact: (data: CreateContactDto) => Promise<void>;
  /** Callback when a contact is updated */
  onUpdateContact: (contactId: string, data: UpdateContactDto) => Promise<void>;
  /** Callback when a contact is deleted */
  onDeleteContact: (contactId: string) => Promise<void>;
  /** Loading states */
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  /** Title for the card */
  title?: string;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: "website", label: "Веб-сайт" },
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Телефон" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "viber", label: "Viber" },
  { value: "other", label: "Другое" },
];

// ============================================================================
// HELPERS
// ============================================================================

function getContactIcon(type: ContactType) {
  switch (type) {
    case "website":
      return <Globe className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
    case "whatsapp":
    case "viber":
      return <Phone className="h-4 w-4" />;
    case "telegram":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
}

function getContactTypeLabel(type: ContactType): string {
  return CONTACT_TYPES.find((t) => t.value === type)?.label || type;
}

// ============================================================================
// CONTACT FORM
// ============================================================================

interface ContactFormProps {
  contact: Contact | null;
  onSubmit: (data: CreateContactDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ContactForm({ contact, onSubmit, onCancel, isLoading }: ContactFormProps) {
  const [contactType, setContactType] = useState<ContactType>(
    contact?.contact_type || "website"
  );
  const [value, setValue] = useState(contact?.value || "");
  const [sortOrder, setSortOrder] = useState<number | null>(
    contact?.sort_order ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!value.trim()) {
      newErrors.value = "Значение обязательно";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      contact_type: contactType,
      value: value.trim(),
      sort_order: sortOrder ?? undefined,
    });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Select
            label="Тип контакта"
            value={contactType}
            onChange={(e) => setContactType(e.target.value as ContactType)}
            options={CONTACT_TYPES}
            required
          />
          <Input
            label="Значение"
            placeholder={
              contactType === "email"
                ? "email@example.com"
                : contactType === "phone"
                  ? "+7 999 123-45-67"
                  : "https://..."
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={errors.value}
            required
          />
          <NumberInput
            label="Порядок сортировки"
            value={sortOrder}
            onChange={(val) => setSortOrder(val === undefined ? null : val)}
            min={0}
            max={1000}
            hint="Необязательно. Чем меньше число, тем выше в списке."
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          {contact ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </>
  );
}

// ============================================================================
// CONTACTS MANAGER COMPONENT
// ============================================================================

export function ContactsManager({
  contacts,
  isEditing,
  onCreateContact,
  onUpdateContact,
  onDeleteContact,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  title = "Контакты",
  className,
}: ContactsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  // Sort contacts by sort_order
  const sortedContacts = [...contacts].sort(
    (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
  );

  // Handlers
  const handleCreateSubmit = async (data: CreateContactDto) => {
    await onCreateContact(data);
    setShowCreateModal(false);
  };

  const handleUpdateSubmit = async (data: CreateContactDto) => {
    if (!editingContact) return;
    await onUpdateContact(editingContact.id, data);
    setEditingContact(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;
    await onDeleteContact(deletingContact.id);
    setDeletingContact(null);
  };

  // Don't render in create mode
  if (!isEditing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-muted)]">
            Сохраните запись, чтобы управлять контактами
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {title}
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedContacts.length === 0 ? (
            <div className="py-8 text-center">
              <LinkIcon className="mx-auto h-12 w-12 text-[var(--color-text-muted)] opacity-50" />
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Нет контактов. Добавьте первый контакт.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={cn(
                    "flex items-center justify-between gap-4",
                    "rounded-lg border border-[var(--color-border)]",
                    "bg-[var(--color-bg-secondary)]",
                    "p-4"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-hover)] flex-shrink-0">
                      {getContactIcon(contact.contact_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--color-text-primary)] truncate">
                        {contact.value}
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {getContactTypeLabel(contact.contact_type)}
                        {contact.sort_order !== undefined && (
                          <span className="ml-2 text-xs">
                            · Порядок: {contact.sort_order}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingContact(contact)}
                      className="h-8 w-8"
                      title="Редактировать"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingContact(contact)}
                      className="h-8 w-8 hover:text-[var(--color-error)]"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Contact Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Добавить контакт"
      >
        <ContactForm
          contact={null}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        title="Редактировать контакт"
      >
        {editingContact && (
          <ContactForm
            contact={editingContact}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingContact(null)}
            isLoading={isUpdating}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить контакт?"
        description={`Вы уверены, что хотите удалить контакт "${deletingContact?.value}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
