"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mail, Phone, Building, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useLeadsList, leadsKeys, leadsApi } from "@/features/leads";
import { Badge, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime } from "@/shared/lib";
import type { Inquiry, InquiryStatus } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

// Kanban columns configuration
const KANBAN_COLUMNS: { status: InquiryStatus; color: string }[] = [
  { status: "new", color: "var(--color-info)" },
  { status: "in_progress", color: "var(--color-warning)" },
  { status: "contacted", color: "var(--color-accent-primary)" },
  { status: "completed", color: "var(--color-success)" },
  { status: "spam", color: "var(--color-error)" },
  { status: "cancelled", color: "var(--color-text-muted)" },
];

interface KanbanCardProps {
  inquiry: Inquiry;
  isDragging?: boolean;
}

function KanbanCard({ inquiry, isDragging }: KanbanCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(ROUTES.LEAD_DETAIL(inquiry.id))}
      className={`cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <p className="font-medium text-[var(--color-text-primary)] line-clamp-1">{inquiry.name}</p>
      
      {inquiry.company && (
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
          <Building className="h-3 w-3" />
          {inquiry.company}
        </p>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1 text-xs">
        {inquiry.email && (
          <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
            <Mail className="h-3 w-3" />
            {inquiry.email}
          </span>
        )}
        {inquiry.phone && (
          <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
            <Phone className="h-3 w-3" />
            {inquiry.phone}
          </span>
        )}
      </div>
      
      {inquiry.message && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)] line-clamp-2">
          {inquiry.message}
        </p>
      )}
      
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        {formatDateTime(inquiry.created_at)}
      </p>
    </div>
  );
}

interface SortableKanbanCardProps {
  inquiry: Inquiry;
}

function SortableKanbanCard({ inquiry }: SortableKanbanCardProps) {
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
      className={isDragging ? "z-50" : ""}
    >
      <div className="relative group">
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
        <KanbanCard inquiry={inquiry} isDragging={isDragging} />
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  status: InquiryStatus;
  color: string;
  inquiries: Inquiry[];
}

function KanbanColumn({ status, color, inquiries }: KanbanColumnProps) {
  const config = INQUIRY_STATUS_CONFIG[status];

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      {/* Column Header */}
      <div
        className="flex items-center justify-between rounded-t-lg border-b border-[var(--color-border)] p-3"
        style={{ borderTopColor: color, borderTopWidth: "3px" }}
      >
        <div className="flex items-center gap-2">
          <Badge variant={config.variant}>{config.label}</Badge>
          <span className="text-sm text-[var(--color-text-muted)]">({inquiries.length})</span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext items={inquiries.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {inquiries.map((inquiry) => (
              <SortableKanbanCard key={inquiry.id} inquiry={inquiry} />
            ))}
            {inquiries.length === 0 && (
              <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                Нет заявок
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export function LeadsKanban() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useLeadsList({ pageSize: 100 });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Single mutation for status updates
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      toast.success("Статус обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить статус";
      toast.error(message);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeInquiry = data?.items.find((i) => i.id === active.id);
    if (!activeInquiry) return;

    // Find which column the item was dropped in
    const overId = over.id as string;
    
    // Check if dropped on a column or on another card
    let newStatus: InquiryStatus | null = null;
    
    // Check if it's a column
    const targetColumn = KANBAN_COLUMNS.find((col) => col.status === overId);
    if (targetColumn) {
      newStatus = targetColumn.status;
    } else {
      // It was dropped on another card, find its column
      const targetInquiry = data?.items.find((i) => i.id === overId);
      if (targetInquiry) {
        newStatus = targetInquiry.status;
      }
    }

    if (newStatus && newStatus !== activeInquiry.status) {
      // Update status using mutation
      updateStatusMutation.mutate({ id: activeInquiry.id, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(({ status, color }) => (
            <KanbanColumn
              key={status}
              status={status}
              color={color}
              inquiries={groupedInquiries[status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeInquiry && (
            <div className="w-72">
              <KanbanCard inquiry={activeInquiry} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}

