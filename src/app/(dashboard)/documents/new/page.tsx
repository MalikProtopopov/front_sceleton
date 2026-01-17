"use client";

import { useRouter } from "next/navigation";
import { DocumentForm, useCreateDocument } from "@/features/documents";
import { ROUTES } from "@/shared/config";
import type { CreateDocumentDto, UpdateDocumentDto } from "@/entities/document";

export default function NewDocumentPage() {
  const router = useRouter();
  const { mutate: createDocument, isPending } = useCreateDocument();

  const handleSubmit = (data: CreateDocumentDto | UpdateDocumentDto) => {
    createDocument(data as CreateDocumentDto, {
      onSuccess: (newDocument) => {
        // Redirect to edit page after creation so user can upload files
        router.push(ROUTES.DOCUMENT_EDIT(newDocument.id));
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый документ</h1>
        <p className="text-[var(--color-text-secondary)]">
          Создайте новый документ. После создания вы сможете загрузить файл.
        </p>
      </div>

      <DocumentForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}

