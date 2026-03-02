"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Textarea,
} from "@/shared/ui";
import { useUpdateLead } from "../model/useLeads";

interface LeadNotesCardProps {
  leadId: string;
  notes: string | null;
}

export function LeadNotesCard({ leadId, notes }: LeadNotesCardProps) {
  const [editValue, setEditValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead(leadId);

  const handleSave = () => {
    updateLead({ notes: editValue });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Заметки
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditValue(notes || "");
                setIsEditing(true);
              }}
            >
              Редактировать
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Добавьте заметки о заявке..."
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} isLoading={isUpdating}>
                Сохранить
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
            </div>
          </div>
        ) : notes ? (
          <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
            {notes}
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] italic">
            Заметки не добавлены
          </p>
        )}
      </CardContent>
    </Card>
  );
}
