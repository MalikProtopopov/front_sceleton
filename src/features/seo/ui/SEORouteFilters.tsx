"use client";

import { Search } from "lucide-react";
import { Input, Select, FilterBar } from "@/shared/ui";
import type { SEORouteFilterParams } from "@/entities/seo";

interface SEORouteFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: SEORouteFilterParams;
  onFiltersChange: (filters: SEORouteFilterParams) => void;
  onReset: () => void;
}

export function SEORouteFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onReset,
}: SEORouteFiltersProps) {
  return (
    <FilterBar onReset={onReset}>
      <Input
        label="Поиск по пути"
        type="search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="/about, /services..."
        className="w-48"
        leftIcon={<Search className="h-4 w-4" />}
      />
      <Select
        label="Локаль"
        value={filters.locale || ""}
        onChange={(e) => onFiltersChange({ ...filters, locale: e.target.value || undefined })}
        options={[
          { value: "", label: "Все" },
          { value: "ru", label: "Русский" },
          { value: "en", label: "English" },
        ]}
      />
      <Select
        label="Sitemap"
        value={filters.include_in_sitemap === undefined ? "" : String(filters.include_in_sitemap)}
        onChange={(e) => onFiltersChange({
          ...filters,
          include_in_sitemap: e.target.value === "" ? undefined : e.target.value === "true",
        })}
        options={[
          { value: "", label: "Все" },
          { value: "true", label: "Включен" },
          { value: "false", label: "Выключен" },
        ]}
      />
      <Select
        label="Индексация"
        value={filters.robots_index === undefined ? "" : String(filters.robots_index)}
        onChange={(e) => onFiltersChange({
          ...filters,
          robots_index: e.target.value === "" ? undefined : e.target.value === "true",
        })}
        options={[
          { value: "", label: "Все" },
          { value: "true", label: "Index" },
          { value: "false", label: "NoIndex" },
        ]}
      />
      <Select
        label="Ссылки"
        value={filters.robots_follow === undefined ? "" : String(filters.robots_follow)}
        onChange={(e) => onFiltersChange({
          ...filters,
          robots_follow: e.target.value === "" ? undefined : e.target.value === "true",
        })}
        options={[
          { value: "", label: "Все" },
          { value: "true", label: "Follow" },
          { value: "false", label: "NoFollow" },
        ]}
      />
    </FilterBar>
  );
}
