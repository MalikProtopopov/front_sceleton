"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, X } from "lucide-react";
import { useTopics, useDeleteTopic } from "../model/useTopics";
import { TopicModal } from "./TopicModal";
import { Button, Spinner, ConfirmModal } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { Topic } from "@/entities/topic";

interface TopicsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopicId?: string | null;
  onSelectTopic?: (topic: Topic | null) => void;
}

export function TopicsSidebar({ isOpen, onClose, selectedTopicId, onSelectTopic }: TopicsSidebarProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  const { data, isLoading } = useTopics({ pageSize: 100 });
  const { mutate: deleteTopic, isPending: isDeleting } = useDeleteTopic();

  const handleDeleteClick = (topic: Topic) => {
    setTopicToDelete(topic);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (topicToDelete) {
      deleteTopic(topicToDelete.id);
      setDeleteModalOpen(false);
      setTopicToDelete(null);
    }
  };

  const getTopicName = (topic: Topic): string => {
    const ruLocale = topic.locales.find((l) => l.locale === "ru");
    const defaultLocale = topic.locales[0];
    return ruLocale?.title || defaultLocale?.title || "Без названия";
  };
  
  const getTopicSlug = (topic: Topic): string => {
    const ruLocale = topic.locales.find((l) => l.locale === "ru");
    const defaultLocale = topic.locales[0];
    return ruLocale?.slug || defaultLocale?.slug || "";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Темы статей</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Add button */}
        <div className="border-b border-[var(--color-border)] p-4">
          <Button
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full"
          >
            Добавить тему
          </Button>
        </div>

        {/* Topics list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Темы не найдены
            </p>
          ) : (
            <ul className="space-y-2">
              {data.items.map((topic) => (
                <li
                  key={topic.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg border border-transparent p-3 transition-colors",
                    "hover:border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]",
                    selectedTopicId === topic.id && "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
                  )}
                >
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[var(--color-text-muted)]" />
                  
                  <button
                    onClick={() => onSelectTopic?.(selectedTopicId === topic.id ? null : topic)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {getTopicName(topic)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      /{getTopicSlug(topic)}
                    </p>
                  </button>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTopic(topic);
                      }}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(topic);
                      }}
                      className="h-7 w-7 text-[var(--color-error)] hover:text-[var(--color-error)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Create/Edit Modal */}
      <TopicModal
        isOpen={createModalOpen || !!editTopic}
        onClose={() => {
          setCreateModalOpen(false);
          setEditTopic(null);
        }}
        topic={editTopic || undefined}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить тему?"
        description={`Вы уверены, что хотите удалить тему "${topicToDelete ? getTopicName(topicToDelete) : ""}"? Статьи, связанные с этой темой, останутся, но потеряют привязку.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

