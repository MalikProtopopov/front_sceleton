"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  FileText,
  Image,
  Video,
  Images,
  Link as LinkIcon,
  Target,
  Smartphone,
  Monitor,
  Globe,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "../Button";
import { Modal, ConfirmModal, ModalBody, ModalFooter } from "../Modal";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";
import type {
  ContentBlock,
  ContentBlockType,
  CreateContentBlockDto,
  UpdateContentBlockDto,
  DeviceType,
} from "@/entities/content-block";

// ============================================================================
// TYPES
// ============================================================================

export interface ContentBlocksManagerProps {
  blocks: ContentBlock[];
  locale: string;
  isEditing: boolean;
  onCreateBlock: (data: CreateContentBlockDto) => Promise<void>;
  onUpdateBlock: (blockId: string, data: UpdateContentBlockDto) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
  onReorderBlocks: (blockIds: string[]) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  renderBlockEditor: (props: BlockEditorProps) => React.ReactNode;
  title?: string;
  className?: string;
}

export interface BlockEditorProps {
  block: ContentBlock | null;
  blockType: ContentBlockType;
  locale: string;
  onSubmit: (data: Partial<CreateContentBlockDto>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BLOCK_TYPE_INFO: Record<ContentBlockType, { icon: React.ReactNode; label: string; description: string }> = {
  text: { icon: <FileText className="h-4 w-4" />, label: "Текст", description: "HTML-текст" },
  image: { icon: <Image className="h-4 w-4" />, label: "Изображение", description: "Одно изображение" },
  video: { icon: <Video className="h-4 w-4" />, label: "Видео", description: "YouTube, RuTube и др." },
  gallery: { icon: <Images className="h-4 w-4" />, label: "Галерея", description: "Слайдер изображений" },
  link: { icon: <LinkIcon className="h-4 w-4" />, label: "Ссылка", description: "Кнопка/ссылка" },
  result: { icon: <Target className="h-4 w-4" />, label: "Результат", description: "Блок результата" },
};

const DEVICE_TYPE_ICONS: Record<DeviceType, React.ReactNode> = {
  mobile: <Smartphone className="h-3 w-3" />,
  desktop: <Monitor className="h-3 w-3" />,
  both: <Globe className="h-3 w-3" />,
};

// ============================================================================
// SORTABLE BLOCK ITEM
// ============================================================================

interface SortableBlockItemProps {
  block: ContentBlock;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableBlockItem({ block, onEdit, onDelete }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockInfo = BLOCK_TYPE_INFO[block.block_type as ContentBlockType];
  const deviceIcon = block.device_type ? DEVICE_TYPE_ICONS[block.device_type] : null;

  // Get display text based on block type
  const getDisplayText = () => {
    if (block.title) return block.title;
    if (block.block_type === "text" && block.content) {
      // Strip HTML and truncate
      const text = block.content.replace(/<[^>]*>/g, "").trim();
      return text.length > 100 ? text.substring(0, 100) + "..." : text;
    }
    if (block.block_type === "link" && block.link_label) return block.link_label;
    if (block.block_type === "video" && block.media_url) return block.media_url;
    if (block.block_type === "image" && block.media_url) return block.media_url;
    return blockInfo?.label || block.block_type;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-[var(--color-border)]",
        "bg-[var(--color-bg-secondary)] p-3",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Block type icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-bg-hover)] flex-shrink-0">
        {blockInfo?.icon}
      </div>

      {/* Block info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-text-primary)] truncate">
            {getDisplayText()}
          </span>
          {deviceIcon && block.device_type && block.device_type !== "both" && (
            <span className="flex items-center text-[var(--color-text-muted)]" title={block.device_type}>
              {deviceIcon}
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {blockInfo?.label} · Порядок: {block.sort_order}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8"
          title="Редактировать"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 hover:text-[var(--color-error)]"
          title="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// BLOCK TYPE SELECTOR
// ============================================================================

interface BlockTypeSelectorProps {
  onSelect: (type: ContentBlockType) => void;
  onCancel: () => void;
}

function BlockTypeSelector({ onSelect, onCancel }: BlockTypeSelectorProps) {
  const blockTypes: ContentBlockType[] = ["text", "image", "video", "gallery", "link", "result"];

  return (
    <>
      <ModalBody>
        <div className="grid grid-cols-2 gap-3">
          {blockTypes.map((type) => {
            const info = BLOCK_TYPE_INFO[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border border-[var(--color-border)]",
                  "bg-[var(--color-bg-secondary)] text-left",
                  "hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-hover)]",
                  "transition-colors"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-hover)]">
                  {info.icon}
                </div>
                <div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {info.label}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {info.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </ModalFooter>
    </>
  );
}

// ============================================================================
// CONTENT BLOCKS MANAGER
// ============================================================================

export function ContentBlocksManager({
  blocks,
  locale,
  isEditing,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  renderBlockEditor,
  title = "Контент-блоки",
  className,
}: ContentBlocksManagerProps) {
  const [showTypeSelectorModal, setShowTypeSelectorModal] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<ContentBlockType | null>(null);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<ContentBlock | null>(null);

  // Filter blocks by locale and sort
  const filteredBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.locale === locale)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [blocks, locale]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredBlocks.findIndex((b) => b.id === active.id);
      const newIndex = filteredBlocks.findIndex((b) => b.id === over.id);

      const newOrder = arrayMove(filteredBlocks, oldIndex, newIndex);
      const blockIds = newOrder.map((b) => b.id);

      await onReorderBlocks(blockIds);
    }
  };

  const handleSelectBlockType = (type: ContentBlockType) => {
    setShowTypeSelectorModal(false);
    setSelectedBlockType(type);
  };

  const handleCreateSubmit = async (data: Partial<CreateContentBlockDto>) => {
    if (!selectedBlockType) return;

    const createData: CreateContentBlockDto = {
      locale,
      block_type: selectedBlockType,
      sort_order: filteredBlocks.length,
      ...data,
    };

    await onCreateBlock(createData);
    setSelectedBlockType(null);
  };

  const handleUpdateSubmit = async (data: Partial<CreateContentBlockDto>) => {
    if (!editingBlock) return;

    const updateData: UpdateContentBlockDto = {
      ...data,
    };

    await onUpdateBlock(editingBlock.id, updateData);
    setEditingBlock(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBlock) return;
    await onDeleteBlock(deletingBlock.id);
    setDeletingBlock(null);
  };

  // Don't render in create mode
  if (!isEditing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-muted)]">
            Сохраните запись, чтобы управлять контент-блоками
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
              <FileText className="h-5 w-5" />
              {title}
              {filteredBlocks.length > 0 && (
                <span className="text-sm font-normal text-[var(--color-text-muted)]">
                  ({filteredBlocks.length})
                </span>
              )}
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTypeSelectorModal(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Добавить блок
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBlocks.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-[var(--color-text-muted)] opacity-50" />
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Нет контент-блоков для локали «{locale}». Добавьте первый блок.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredBlocks.map((block) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      onEdit={() => setEditingBlock(block)}
                      onDelete={() => setDeletingBlock(block)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Block Type Selector Modal */}
      <Modal
        isOpen={showTypeSelectorModal}
        onClose={() => setShowTypeSelectorModal(false)}
        title="Выберите тип блока"
      >
        <BlockTypeSelector
          onSelect={handleSelectBlockType}
          onCancel={() => setShowTypeSelectorModal(false)}
        />
      </Modal>

      {/* Create Block Modal */}
      <Modal
        isOpen={!!selectedBlockType}
        onClose={() => setSelectedBlockType(null)}
        title={`Добавить блок: ${selectedBlockType ? BLOCK_TYPE_INFO[selectedBlockType]?.label : ""}`}
        size="lg"
      >
        {selectedBlockType &&
          renderBlockEditor({
            block: null,
            blockType: selectedBlockType,
            locale,
            onSubmit: handleCreateSubmit,
            onCancel: () => setSelectedBlockType(null),
            isLoading: isCreating,
          })}
      </Modal>

      {/* Edit Block Modal */}
      <Modal
        isOpen={!!editingBlock}
        onClose={() => setEditingBlock(null)}
        title={`Редактировать блок: ${editingBlock ? BLOCK_TYPE_INFO[editingBlock.block_type as ContentBlockType]?.label : ""}`}
        size="lg"
      >
        {editingBlock &&
          renderBlockEditor({
            block: editingBlock,
            blockType: editingBlock.block_type as ContentBlockType,
            locale,
            onSubmit: handleUpdateSubmit,
            onCancel: () => setEditingBlock(null),
            isLoading: isUpdating,
          })}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBlock}
        onClose={() => setDeletingBlock(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить блок?"
        description={`Вы уверены, что хотите удалить этот блок? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
