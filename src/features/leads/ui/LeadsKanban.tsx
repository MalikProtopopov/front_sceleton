"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Note: useRouter is imported here for use in nested components (KanbanCard, CardActionsMenu)
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Mail,
  Phone,
  Building,
  GripVertical,
  MoreHorizontal,
  Eye,
  Trash2,
  ArrowRight,
  Calendar,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useLeadsList, leadsKeys, leadsApi } from "@/features/leads";
import { Badge, Skeleton } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime, cn } from "@/shared/lib";
import type { Inquiry, InquiryStatus, InquiryFilterParams } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";
import type { PaginatedResponse } from "@/shared/types";

// Kanban columns configuration with enhanced colors
const KANBAN_COLUMNS: { status: InquiryStatus; color: string; bgColor: string }[] = [
  { status: "new", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.08)" },
  { status: "in_progress", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.08)" },
  { status: "contacted", color: "#FF006E", bgColor: "rgba(255, 0, 110, 0.08)" },
  { status: "completed", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.08)" },
  { status: "spam", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.08)" },
  { status: "cancelled", color: "#737373", bgColor: "rgba(115, 115, 115, 0.08)" },
];

// ============== Card Actions Menu ==============
interface CardActionsMenuProps {
  inquiry: Inquiry;
  onStatusChange: (status: InquiryStatus) => void;
  onDelete: () => void;
  isUpdating: boolean;
}

function CardActionsMenu({ inquiry, onStatusChange, onDelete, isUpdating }: CardActionsMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setShowStatusMenu(false);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(ROUTES.LEAD_DETAIL(inquiry.id));
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
  };

  const handleStatusSelect = (e: React.MouseEvent, status: InquiryStatus) => {
    e.stopPropagation();
    if (status !== inquiry.status) {
      onStatusChange(status);
    }
    setIsOpen(false);
    setShowStatusMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  };

  // Close menu when clicking outside
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setShowStatusMenu(false);
    }, 150);
  };

  return (
    <div className="relative" ref={menuRef} onBlur={handleBlur}>
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md transition-all",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-bg-hover)] opacity-0 group-hover:opacity-100",
          isOpen && "opacity-100 bg-[var(--color-bg-hover)]"
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MoreHorizontal className="h-3.5 w-3.5" />
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-1 min-w-[160px]",
            "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]",
            "shadow-lg animate-in"
          )}
        >
          <div className="p-1">
            <button
              onClick={handleViewDetails}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              Просмотреть
            </button>

            <div className="relative">
              <button
                onClick={handleStatusClick}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm",
                  "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Переместить
                </span>
                <ArrowRight className="h-3 w-3" />
              </button>

              {showStatusMenu && (
                <div
                  className={cn(
                    "absolute left-full top-0 ml-1 min-w-[140px]",
                    "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]",
                    "shadow-lg"
                  )}
                >
                  <div className="p-1">
                    {KANBAN_COLUMNS.map(({ status, color }) => (
                      <button
                        key={status}
                        onClick={(e) => handleStatusSelect(e, status)}
                        disabled={status === inquiry.status}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                          status === inquiry.status
                            ? "text-[var(--color-text-muted)] cursor-not-allowed"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {INQUIRY_STATUS_CONFIG[status].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="my-1 border-t border-[var(--color-border)]" />

            <button
              onClick={handleDelete}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                "text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== Kanban Card ==============
interface KanbanCardProps {
  inquiry: Inquiry;
  isDragging?: boolean;
  isOverlay?: boolean;
  isUpdating?: boolean;
  onStatusChange?: (status: InquiryStatus) => void;
  onDelete?: () => void;
}

function KanbanCard({
  inquiry,
  isDragging,
  isOverlay,
  isUpdating,
  onStatusChange,
  onDelete,
}: KanbanCardProps) {
  const router = useRouter();
  const statusColor = KANBAN_COLUMNS.find((c) => c.status === inquiry.status)?.color;

  const handleClick = () => {
    if (!isOverlay) {
      router.push(ROUTES.LEAD_DETAIL(inquiry.id));
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-[var(--color-bg-primary)] p-3.5",
        "transition-all duration-200",
        isDragging && !isOverlay && "opacity-40",
        isOverlay && "shadow-2xl scale-[1.02] rotate-[2deg] border-[var(--color-accent-primary)]",
        !isDragging && !isOverlay && "hover:shadow-md hover:border-[var(--color-border-hover)]",
        isUpdating && "opacity-70"
      )}
      style={{
        borderColor: isOverlay ? statusColor : undefined,
      }}
    >
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--color-bg-primary)]/50">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent-primary)]" />
        </div>
      )}

      {/* Status indicator line */}
      <div
        className="absolute left-0 top-3 h-8 w-1 rounded-r-full"
        style={{ backgroundColor: statusColor }}
      />

      {/* Header with name and actions */}
      <div className="flex items-start justify-between gap-2 pl-2">
        <p className="font-medium text-[var(--color-text-primary)] line-clamp-1 flex-1">
          {inquiry.name}
        </p>
        {onStatusChange && onDelete && (
          <CardActionsMenu
            inquiry={inquiry}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            isUpdating={isUpdating || false}
          />
        )}
      </div>

      {/* Company */}
      {inquiry.company && (
        <p className="mt-1.5 flex items-center gap-1.5 pl-2 text-xs text-[var(--color-text-muted)]">
          <Building className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{inquiry.company}</span>
        </p>
      )}
      
      {/* Contact info */}
      <div className="mt-2 flex flex-col gap-1 pl-2">
        {inquiry.email && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{inquiry.email}</span>
          </span>
        )}
        {inquiry.phone && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{inquiry.phone}</span>
          </span>
        )}
      </div>
      
      {/* Message preview */}
      {inquiry.message && (
        <p className="mt-2.5 pl-2 text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
          {inquiry.message}
        </p>
      )}
      
      {/* Footer with date and source */}
      <div className="mt-3 flex items-center justify-between gap-2 pl-2 text-[10px] text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
        {formatDateTime(inquiry.created_at)}
        </span>
        {inquiry.utm_source && (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5">
            <Globe className="h-2.5 w-2.5" />
            {inquiry.utm_source}
          </span>
        )}
      </div>
    </div>
  );
}

// ============== Sortable Kanban Card ==============
interface SortableKanbanCardProps {
  inquiry: Inquiry;
  isUpdating: boolean;
  onStatusChange: (status: InquiryStatus) => void;
  onDelete: () => void;
}

function SortableKanbanCard({
  inquiry,
  isUpdating,
  onStatusChange,
  onDelete,
}: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: inquiry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "z-50")}
    >
      <div className="group relative">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-1 top-1/2 -translate-y-1/2 z-10",
            "flex h-8 w-5 cursor-grab items-center justify-center",
            "rounded-md opacity-0 transition-opacity",
            "group-hover:opacity-100 hover:bg-[var(--color-bg-hover)]",
            "active:cursor-grabbing"
          )}
        >
          <GripVertical className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
        <KanbanCard
          inquiry={inquiry}
          isDragging={isDragging}
          isUpdating={isUpdating}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

// ============== Kanban Column ==============
interface KanbanColumnProps {
  status: InquiryStatus;
  color: string;
  bgColor: string;
  inquiries: Inquiry[];
  isOver: boolean;
  updatingIds: Set<string>;
  onStatusChange: (id: string, status: InquiryStatus) => void;
  onDelete: (id: string) => void;
}

function KanbanColumn({
  status,
  color,
  bgColor,
  inquiries,
  isOver,
  updatingIds,
  onStatusChange,
  onDelete,
}: KanbanColumnProps) {
  const config = INQUIRY_STATUS_CONFIG[status];
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: status,
  });

  const isHighlighted = isOver || isDroppableOver;

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-340px)] min-h-[400px] w-[280px] flex-shrink-0 flex-col",
        "rounded-xl border-2 transition-all duration-200",
        isHighlighted
          ? "border-dashed border-[var(--color-accent-primary)] scale-[1.01]"
          : "border-transparent"
      )}
      style={{
        backgroundColor: isHighlighted ? bgColor : undefined,
      }}
    >
      {/* Column container - droppable area covers entire column */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex h-full flex-col rounded-xl border border-[var(--color-border)]",
          "bg-[var(--color-bg-secondary)] overflow-hidden",
          "relative"
        )}
      >
      {/* Column Header */}
      <div
          className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-3"
          style={{
            borderTop: `3px solid ${color}`,
            borderTopLeftRadius: "0.75rem",
            borderTopRightRadius: "0.75rem",
          }}
      >
        <div className="flex items-center gap-2">
          <Badge variant={config.variant}>{config.label}</Badge>
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
              style={{ backgroundColor: bgColor, color }}
            >
              {inquiries.length}
            </span>
        </div>
      </div>

        {/* Column Content - expanded scrollable area */}
        <div className="flex-1 overflow-y-auto overflow-x-visible p-2">
          <SortableContext
            items={inquiries.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
          <div className="space-y-2">
            {inquiries.map((inquiry) => (
                <SortableKanbanCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  isUpdating={updatingIds.has(inquiry.id)}
                  onStatusChange={(newStatus) => onStatusChange(inquiry.id, newStatus)}
                  onDelete={() => onDelete(inquiry.id)}
                />
            ))}
            {inquiries.length === 0 && (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center py-12 text-center",
                    "rounded-lg border-2 border-dashed border-[var(--color-border)]"
                  )}
                >
                  <p className="text-sm text-[var(--color-text-muted)]">Нет заявок</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Перетащите карточку сюда
                  </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
      </div>
    </div>
  );
}

// ============== Kanban Skeleton ==============
function KanbanCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>
      <Skeleton className="mt-2 h-4 w-24" />
      <Skeleton className="mt-2 h-4 w-40" />
      <Skeleton className="mt-2 h-4 w-36" />
      <Skeleton className="mt-3 h-8 w-full" />
      <div className="mt-3 flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}

function KanbanColumnSkeleton({ color }: { color: string }) {
  return (
    <div className="flex h-[calc(100vh-340px)] min-h-[400px] w-[280px] flex-shrink-0 flex-col">
      <div className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
        <div
          className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-3"
          style={{
            borderTop: `3px solid ${color}`,
            borderTopLeftRadius: "0.75rem",
            borderTopRightRadius: "0.75rem",
          }}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-2 space-y-2">
          <KanbanCardSkeleton />
          <KanbanCardSkeleton />
          <div className="opacity-50">
            <KanbanCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(({ status, color }) => (
        <KanbanColumnSkeleton key={status} color={color} />
      ))}
    </div>
  );
}

// ============== Main Kanban Component ==============
interface LeadsKanbanProps {
  filters?: Partial<InquiryFilterParams>;
}

export function LeadsKanban({ filters }: LeadsKanbanProps) {
  const queryClient = useQueryClient();

  // Merge filters with kanban defaults (high pageSize for kanban view)
  const kanbanFilters: InquiryFilterParams = {
    ...filters,
    pageSize: 200,
  };

  const { data, isLoading } = useLeadsList(kanbanFilters);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Optimistic update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
      return leadsApi.updateStatus(id, status);
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: leadsKeys.list(kanbanFilters) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters)
      );

      // Optimistically update
      queryClient.setQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, status } : item
            ),
          };
        }
      );

      // Add to updating set
      setUpdatingIds((prev) => new Set(prev).add(id));

      return { previousData };
    },
    onSuccess: (_data, { status }) => {
      const statusLabel = INQUIRY_STATUS_CONFIG[status].label;
      toast.success(`Статус изменен: ${statusLabel}`);
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(leadsKeys.list(kanbanFilters), context.previousData);
      }
      const message = error instanceof Error ? error.message : "Не удалось обновить статус";
      toast.error(message);
    },
    onSettled: (_data, _error, { id }) => {
      // Remove from updating set
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: leadsKeys.list(kanbanFilters) });

      const previousData = queryClient.getQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters)
      );

      queryClient.setQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Лид удален");
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(leadsKeys.list(kanbanFilters), context.previousData);
      }
      const message = error instanceof Error ? error.message : "Не удалось удалить лид";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });

  // Sensors with touch support for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group inquiries by status
  const groupedInquiries = KANBAN_COLUMNS.reduce(
    (acc, { status }) => {
      acc[status] = data?.items.filter((i) => i.status === status) || [];
      return acc;
    },
    {} as Record<InquiryStatus, Inquiry[]>
  );

  const activeInquiry = activeId
    ? data?.items.find((i) => i.id === activeId)
    : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Custom collision detection with expanded zones for columns
  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      // First, try standard rect intersection
      const intersections = rectIntersection(args);
      
      if (intersections.length > 0) {
        // Check if we're intersecting with a column
        const columnIntersection = intersections.find((collision) =>
          KANBAN_COLUMNS.some((col) => col.status === collision.id)
        );
        
        if (columnIntersection) {
          return [columnIntersection];
        }
        
        // If intersecting with a card, find its column
        const cardIntersection = intersections[0];
        if (cardIntersection) {
          const targetInquiry = data?.items.find((i) => i.id === cardIntersection.id);
          if (targetInquiry) {
            // Return the column instead of the card for easier dropping
            return [{ id: targetInquiry.status }];
          }
        }
      }
      
      // Fallback: expand collision zones for columns
      // Check if we're near any column (within 30px)
      const activeRect = args.active.rect.current.translated;
      if (!activeRect) {
        return intersections;
      }
      
      const columnIds = KANBAN_COLUMNS.map((col) => col.status);
      
      for (const columnId of columnIds) {
        const droppable = args.droppableContainers.find((c) => c.id === columnId);
        if (droppable && droppable.rect.current) {
          const droppableRect = droppable.rect.current;
          // Expand the collision zone by 30px on all sides
          const expandedRect = {
            top: droppableRect.top - 30,
            left: droppableRect.left - 30,
            bottom: droppableRect.bottom + 30,
            right: droppableRect.right + 30,
            width: droppableRect.width + 60,
            height: droppableRect.height + 60,
          };
          
          // Check if active rect intersects with expanded rect
          if (
            activeRect.left < expandedRect.right &&
            activeRect.right > expandedRect.left &&
            activeRect.top < expandedRect.bottom &&
            activeRect.bottom > expandedRect.top
          ) {
            return [{ id: columnId }];
          }
        }
      }
      
      return intersections;
    },
    [data?.items]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const overId = over.id as string;

    // Check if it's a column directly
    const isColumn = KANBAN_COLUMNS.some((col) => col.status === overId);
    if (isColumn) {
      setOverColumnId(overId);
      return;
    }

    // Find which column the target card belongs to
    const targetInquiry = data?.items.find((i) => i.id === overId);
    if (targetInquiry) {
      setOverColumnId(targetInquiry.status);
      return;
    }
  }, [data?.items]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
      setOverColumnId(null);

    if (!over) return;

      const draggedInquiry = data?.items.find((i) => i.id === active.id);
      if (!draggedInquiry) return;

    const overId = over.id as string;
    let newStatus: InquiryStatus | null = null;
    
      // Check if dropped on a column
    const targetColumn = KANBAN_COLUMNS.find((col) => col.status === overId);
    if (targetColumn) {
      newStatus = targetColumn.status;
    } else {
        // Dropped on another card - find its column
      const targetInquiry = data?.items.find((i) => i.id === overId);
      if (targetInquiry) {
        newStatus = targetInquiry.status;
      }
    }

      // Update status if changed
      if (newStatus && newStatus !== draggedInquiry.status) {
        updateStatusMutation.mutate({ id: draggedInquiry.id, status: newStatus });
      }
    },
    [data?.items, updateStatusMutation]
  );

  const handleStatusChange = useCallback(
    (id: string, status: InquiryStatus) => {
      updateStatusMutation.mutate({ id, status });
    },
    [updateStatusMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  return (
      <DndContext
        sensors={sensors}
      collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
      onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(({ status, color, bgColor }) => (
            <KanbanColumn
              key={status}
              status={status}
              color={color}
            bgColor={bgColor}
              inquiries={groupedInquiries[status]}
            isOver={overColumnId === status}
            updatingIds={updatingIds}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            />
          ))}
        </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}>
          {activeInquiry && (
          <div className="w-[280px]">
            <KanbanCard inquiry={activeInquiry} isOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>
  );
}
