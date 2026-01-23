"use client";

import { useMemo } from "react";
import { Combobox, type ComboboxOption } from "@/shared/ui";
import { useCases } from "@/features/cases";

interface CaseSelectorProps {
  value?: string | null;
  onChange: (caseId: string | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CaseSelector({
  value,
  onChange,
  error,
  disabled,
  className,
}: CaseSelectorProps) {
  const { data: casesData, isLoading } = useCases({ pageSize: 100 });

  const options: ComboboxOption[] = useMemo(() => {
    if (!casesData?.items) return [];

    return casesData.items.map((caseItem) => {
      // Get title from first locale (prefer Russian)
      const ruLocale = caseItem.locales?.find((l) => l.locale === "ru");
      const title = ruLocale?.title || caseItem.locales?.[0]?.title || "Без названия";
      const clientName = caseItem.client_name;

      return {
        value: caseItem.id,
        label: title,
        description: clientName || undefined,
      };
    });
  }, [casesData?.items]);

  const handleChange = (newValue: string | string[]) => {
    // Combobox returns string for single select
    const stringValue = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange(stringValue || null);
  };

  return (
    <Combobox
      label="Привязать к кейсу"
      value={value || ""}
      onChange={handleChange}
      options={options}
      placeholder="Не привязан"
      searchPlaceholder="Поиск кейса..."
      emptyMessage="Кейсы не найдены"
      loading={isLoading}
      clearable
      error={error}
      disabled={disabled}
      className={className}
    />
  );
}
