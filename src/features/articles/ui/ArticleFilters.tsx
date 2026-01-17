"use client";

import { Select, Input, FilterBar } from "@/shared/ui";
import { Search } from "lucide-react";
import type { ArticleStatus, ArticleFilterParams } from "@/entities/article";

interface ArticleFiltersProps {
  filters: ArticleFilterParams;
  onFiltersChange: (filters: Partial<ArticleFilterParams>) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "", label: "Все статусы" },
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликовано" },
  { value: "archived", label: "В архиве" },
];

export function ArticleFilters({ filters, onFiltersChange, onReset }: ArticleFiltersProps) {
  return (
    <FilterBar onReset={onReset}>
      <Input
        label="Поиск"
        type="search"
        placeholder="Поиск статей..."
        value={filters.search || ""}
        onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
        leftIcon={<Search className="h-4 w-4" />}
        className="w-64"
      />
      <Select
        label="Статус"
        value={filters.status || ""}
        onChange={(e) =>
          onFiltersChange({ status: (e.target.value as ArticleStatus) || undefined })
        }
        options={statusOptions}
        className="w-48"
      />
    </FilterBar>
  );
}

