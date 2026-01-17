"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Briefcase, Award, MapPin, Phone, Mail, Globe } from "lucide-react";
import {
  usePracticeAreasList,
  useAdvantagesList,
  useAddressesList,
  useContactsList,
  useDeletePracticeArea,
  useDeleteAdvantage,
  useDeleteAddress,
  useDeleteContact,
} from "@/features/company";
import { Button, Table, Badge, ConfirmModal, Tabs, TabsList, TabsTrigger, TabsContent, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { PracticeArea, Advantage, Address, Contact } from "@/entities/company";

export default function CompanyPage() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"practiceArea" | "advantage" | "address" | "contact" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const { data: practiceAreasData, isLoading: practiceAreasLoading } = usePracticeAreasList();
  const { data: advantagesData, isLoading: advantagesLoading } = useAdvantagesList();
  const { data: addressesData, isLoading: addressesLoading } = useAddressesList();
  const { data: contactsData, isLoading: contactsLoading } = useContactsList();

  const { mutate: deletePracticeArea, isPending: deletingPracticeArea } = useDeletePracticeArea();
  const { mutate: deleteAdvantage, isPending: deletingAdvantage } = useDeleteAdvantage();
  const { mutate: deleteAddress, isPending: deletingAddress } = useDeleteAddress();
  const { mutate: deleteContact, isPending: deletingContact } = useDeleteContact();

  const handleDeleteClick = (type: typeof deleteType, id: string, name: string) => {
    setDeleteType(type);
    setSelectedId(id);
    setSelectedName(name);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedId || !deleteType) return;
    
    switch (deleteType) {
      case "practiceArea":
        deletePracticeArea(selectedId);
        break;
      case "advantage":
        deleteAdvantage(selectedId);
        break;
      case "address":
        deleteAddress(selectedId);
        break;
      case "contact":
        deleteContact(selectedId);
        break;
    }
    
    setDeleteModalOpen(false);
    setSelectedId(null);
    setDeleteType(null);
  };

  // Practice Areas columns
  const practiceAreasColumns: Column<PracticeArea>[] = [
    {
      key: "name",
      header: "Название",
      render: (item) => {
        const ruLocale = item.locales?.find((l) => l.locale === "ru");
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
              <Briefcase className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                {ruLocale?.name || "—"}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">/{ruLocale?.slug || ""}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Статус",
      width: "100px",
      render: (item) => (
        <Badge variant={item.is_active ? "success" : "secondary"}>
          {item.is_active ? "Активно" : "Неактивно"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Порядок",
      width: "80px",
      render: (item) => <span className="text-[var(--color-text-secondary)]">{item.sort_order}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (item) => {
        const ruLocale = item.locales?.find((l) => l.locale === "ru");
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.PRACTICE_AREA_EDIT(item.id))} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick("practiceArea", item.id, ruLocale?.name || "")} className="h-8 w-8 text-[var(--color-error)]">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Advantages columns
  const advantagesColumns: Column<Advantage>[] = [
    {
      key: "title",
      header: "Название",
      render: (item) => {
        const ruLocale = item.locales?.find((l) => l.locale === "ru");
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
              <Award className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <p className="font-medium text-[var(--color-text-primary)]">{ruLocale?.title || "—"}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Статус",
      width: "100px",
      render: (item) => (
        <Badge variant={item.is_active ? "success" : "secondary"}>
          {item.is_active ? "Активно" : "Неактивно"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Порядок",
      width: "80px",
      render: (item) => <span className="text-[var(--color-text-secondary)]">{item.sort_order}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (item) => {
        const ruLocale = item.locales?.find((l) => l.locale === "ru");
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.ADVANTAGE_EDIT(item.id))} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick("advantage", item.id, ruLocale?.title || "")} className="h-8 w-8 text-[var(--color-error)]">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Addresses columns
  const addressesColumns: Column<Address>[] = [
    {
      key: "name",
      header: "Название",
      render: (item) => {
        const ruLocale = item.locales?.find((l) => l.locale === "ru");
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
              <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">{ruLocale?.name || "—"}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{ruLocale?.city}, {ruLocale?.country}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "is_primary",
      header: "Основной",
      width: "100px",
      render: (item) => item.is_primary ? <Badge variant="info">Основной</Badge> : null,
    },
    {
      key: "sort_order",
      header: "Порядок",
      width: "80px",
      render: (item) => <span className="text-[var(--color-text-secondary)]">{item.sort_order}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (item) => {
        const ruLocale = item.locales?.find((l) => l.locale === "ru");
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.ADDRESS_EDIT(item.id))} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick("address", item.id, ruLocale?.name || "")} className="h-8 w-8 text-[var(--color-error)]">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Contacts columns
  const contactsColumns: Column<Contact>[] = [
    {
      key: "value",
      header: "Контакт",
      render: (item) => {
        const icon = item.type === "phone" ? Phone : item.type === "email" ? Mail : Globe;
        const IconComponent = icon;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
              <IconComponent className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">{item.value}</p>
              {item.label && <p className="text-sm text-[var(--color-text-muted)]">{item.label}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Тип",
      width: "120px",
      render: (item) => (
        <Badge variant="secondary">
          {item.type === "phone" ? "Телефон" : item.type === "email" ? "Email" : "Соцсети"}
        </Badge>
      ),
    },
    {
      key: "is_primary",
      header: "Основной",
      width: "100px",
      render: (item) => item.is_primary ? <Badge variant="info">Основной</Badge> : null,
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.CONTACT_EDIT(item.id))} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick("contact", item.id, item.value)} className="h-8 w-8 text-[var(--color-error)]">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Компания</h1>
        <p className="text-[var(--color-text-secondary)]">
          Управление информацией о компании
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="practiceAreas">
        <TabsList>
          <TabsTrigger value="practiceAreas">Направления</TabsTrigger>
          <TabsTrigger value="advantages">Преимущества</TabsTrigger>
          <TabsTrigger value="addresses">Адреса</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
        </TabsList>

        <TabsContent value="practiceAreas">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push(ROUTES.PRACTICE_AREA_NEW)} leftIcon={<Plus className="h-4 w-4" />}>
                Добавить направление
              </Button>
            </div>
            <Table data={practiceAreasData?.items || []} columns={practiceAreasColumns} keyExtractor={(item) => item.id} isLoading={practiceAreasLoading} emptyMessage="Направления не найдены" />
          </div>
        </TabsContent>

        <TabsContent value="advantages">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push(ROUTES.ADVANTAGE_NEW)} leftIcon={<Plus className="h-4 w-4" />}>
                Добавить преимущество
              </Button>
            </div>
            <Table data={advantagesData?.items || []} columns={advantagesColumns} keyExtractor={(item) => item.id} isLoading={advantagesLoading} emptyMessage="Преимущества не найдены" />
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push(ROUTES.ADDRESS_NEW)} leftIcon={<Plus className="h-4 w-4" />}>
                Добавить адрес
              </Button>
            </div>
            <Table data={addressesData?.items || []} columns={addressesColumns} keyExtractor={(item) => item.id} isLoading={addressesLoading} emptyMessage="Адреса не найдены" />
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push(ROUTES.CONTACT_NEW)} leftIcon={<Plus className="h-4 w-4" />}>
                Добавить контакт
              </Button>
            </div>
            <Table data={contactsData?.items || []} columns={contactsColumns} keyExtractor={(item) => item.id} isLoading={contactsLoading} emptyMessage="Контакты не найдены" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить запись?"
        description={`Вы уверены, что хотите удалить "${selectedName}"?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deletingPracticeArea || deletingAdvantage || deletingAddress || deletingContact}
      />
    </div>
  );
}

