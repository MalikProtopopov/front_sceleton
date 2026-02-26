"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Trash2, Save } from "lucide-react";
import { Button, Input, Switch, Badge, Combobox } from "@/shared/ui";
import { useParametersList } from "../model/useParameters";
import { useUomsList } from "../model/useUoms";
import {
  useProductCharacteristics,
  useBulkUpdateCharacteristics,
  useDeleteCharacteristic,
} from "../model/useProducts";
import type {
  Parameter,
  ParameterBrief,
  ParameterValue,
  ParameterValueBrief,
  ParameterValueType,
  ProductCharacteristic,
  ProductCharacteristicBulkItem,
} from "@/entities/product";
import { PARAMETER_VALUE_TYPE_LABELS } from "@/entities/product";

interface ProductCharsEditorProps {
  productId: string;
  productCategoryIds?: string[];
}

/**
 * Unified parameter info used within CharRow.
 * For rows built from existing characteristics we start with ParameterBrief
 * and enrich with full Parameter data (values[], uom_id) when available.
 * For rows added from the dropdown we always have the full Parameter.
 */
interface CharRowParam {
  id: string;
  name: string;
  slug: string;
  value_type: ParameterValueType;
  is_filterable: boolean;
  uom_symbol: string | null;
  /** Full enum values list from the parameters dictionary (for checkboxes). */
  enumValues: ParameterValue[];
}

interface CharRow {
  param: CharRowParam;
  selectedValueIds: string[];
  valueText: string;
  valueNumber: string;
  valueBool: boolean;
  rangeMin: string;
  rangeMax: string;
  isNew: boolean;
}

function paramFromBrief(brief: ParameterBrief): CharRowParam {
  return {
    id: brief.id,
    name: brief.name,
    slug: brief.slug,
    value_type: brief.value_type,
    is_filterable: brief.is_filterable,
    uom_symbol: brief.uom?.symbol ?? brief.uom?.code ?? null,
    enumValues: [],
  };
}

function paramFromFull(
  full: Parameter,
  uomMap: Map<string, string>,
): CharRowParam {
  return {
    id: full.id,
    name: full.name,
    slug: full.slug,
    value_type: full.value_type,
    is_filterable: full.is_filterable,
    uom_symbol: full.uom_id ? (uomMap.get(full.uom_id) ?? null) : null,
    enumValues: full.values?.filter((v) => v.is_active) ?? [],
  };
}

function buildRowFromChars(
  brief: ParameterBrief,
  chars: ProductCharacteristic[],
): CharRow {
  const paramChars = chars.filter((c) => c.parameter_id === brief.id);
  const row: CharRow = {
    param: paramFromBrief(brief),
    selectedValueIds: [],
    valueText: "",
    valueNumber: "",
    valueBool: false,
    rangeMin: "",
    rangeMax: "",
    isNew: false,
  };

  switch (brief.value_type) {
    case "enum":
      row.selectedValueIds = paramChars
        .map((c) => c.parameter_value_id)
        .filter((id): id is string => !!id);
      break;
    case "number":
      row.valueNumber = paramChars[0]?.value_number ?? "";
      break;
    case "string":
      row.valueText = paramChars[0]?.value_text ?? "";
      break;
    case "bool":
      row.valueBool = paramChars[0]?.value_bool ?? false;
      break;
    case "range": {
      const nums = paramChars
        .map((c) => c.value_number)
        .filter((n): n is string => n != null)
        .map(parseFloat)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
      row.rangeMin = nums[0]?.toString() ?? "";
      row.rangeMax = nums[1]?.toString() ?? nums[0]?.toString() ?? "";
      break;
    }
  }

  return row;
}

function rowHasValue(row: CharRow): boolean {
  switch (row.param.value_type) {
    case "enum":
      return row.selectedValueIds.length > 0;
    case "number":
      return row.valueNumber !== "";
    case "string":
      return row.valueText !== "";
    case "bool":
      return true;
    case "range":
      return row.rangeMin !== "" || row.rangeMax !== "";
    default:
      return false;
  }
}

export function ProductCharsEditor({
  productId,
  productCategoryIds = [],
}: ProductCharsEditorProps) {
  const {
    data: characteristics = [],
    isLoading: charsLoading,
    error: charsError,
  } = useProductCharacteristics(productId);
  const {
    data: parametersData,
    isLoading: paramsLoading,
    error: paramsError,
  } = useParametersList({ page: 1, page_size: 200 });
  const { data: uoms } = useUomsList();
  const bulkUpdate = useBulkUpdateCharacteristics(productId);
  const deleteChar = useDeleteCharacteristic(productId);

  const allParameters = parametersData?.items || [];

  const uomMap = useMemo(() => {
    const map = new Map<string, string>();
    (uoms || []).forEach((u) => map.set(u.id, u.symbol || u.code));
    return map;
  }, [uoms]);

  const [rows, setRows] = useState<CharRow[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Build initial rows from enriched characteristics — no dependency on parameters list.
  useEffect(() => {
    if (initialized || charsLoading) return;

    const seen = new Set<string>();
    const initialRows: CharRow[] = [];

    for (const ch of characteristics) {
      if (seen.has(ch.parameter_id)) continue;
      seen.add(ch.parameter_id);
      initialRows.push(buildRowFromChars(ch.parameter, characteristics));
    }

    setRows(initialRows);
    setInitialized(true);
  }, [initialized, charsLoading, characteristics]);

  // Once the full parameters list arrives, enrich existing rows with
  // full enum values and UOM symbols so checkboxes show all options.
  useEffect(() => {
    if (paramsLoading || allParameters.length === 0) return;

    setRows((prev) =>
      prev.map((row) => {
        const full = allParameters.find((p) => p.id === row.param.id);
        if (!full) return row;
        return {
          ...row,
          param: {
            ...row.param,
            enumValues: full.values?.filter((v) => v.is_active) ?? [],
            uom_symbol:
              row.param.uom_symbol ??
              (full.uom_id ? (uomMap.get(full.uom_id) ?? null) : null),
          },
        };
      }),
    );
  }, [paramsLoading, allParameters, uomMap]);

  const usedParameterIds = useMemo(
    () => new Set(rows.map((r) => r.param.id)),
    [rows],
  );

  const availableParameters = useMemo(() => {
    return allParameters.filter((p) => {
      if (usedParameterIds.has(p.id)) return false;
      if (!p.is_active) return false;
      if (p.scope === "global") return true;
      if (productCategoryIds.length === 0) return true;
      return p.category_ids?.some((cid) => productCategoryIds.includes(cid));
    });
  }, [allParameters, usedParameterIds, productCategoryIds]);

  const handleAddParameter = useCallback(
    (parameterId: string | string[]) => {
      const id = Array.isArray(parameterId) ? parameterId[0] : parameterId;
      if (!id) return;
      const full = allParameters.find((p) => p.id === id);
      if (!full) return;
      setRows((prev) => [
        ...prev,
        {
          param: paramFromFull(full, uomMap),
          selectedValueIds: [],
          valueText: "",
          valueNumber: "",
          valueBool: false,
          rangeMin: "",
          rangeMax: "",
          isNew: true,
        },
      ]);
    },
    [allParameters, uomMap],
  );

  const handleRemoveRow = useCallback(
    (index: number) => {
      const row = rows[index];
      if (!row) return;
      if (!row.isNew) {
        deleteChar.mutate(row.param.id);
      }
      setRows((prev) => prev.filter((_, i) => i !== index));
    },
    [rows, deleteChar],
  );

  const updateRow = useCallback(
    (index: number, updates: Partial<CharRow>) => {
      setRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, ...updates } : r)),
      );
    },
    [],
  );

  const handleSave = useCallback(() => {
    const items: ProductCharacteristicBulkItem[] = rows
      .map((row): ProductCharacteristicBulkItem => {
        const item: ProductCharacteristicBulkItem = {
          parameter_id: row.param.id,
        };
        switch (row.param.value_type) {
          case "enum":
            item.parameter_value_ids = row.selectedValueIds;
            break;
          case "number":
            if (row.valueNumber !== "")
              item.value_number = parseFloat(row.valueNumber);
            break;
          case "string":
            if (row.valueText) item.value_text = row.valueText;
            break;
          case "bool":
            item.value_bool = row.valueBool;
            break;
          case "range":
            if (row.rangeMin !== "")
              item.value_number = parseFloat(row.rangeMin);
            else if (row.rangeMax !== "")
              item.value_number = parseFloat(row.rangeMax);
            break;
        }
        return item;
      })
      .filter((_item, idx) => {
        const row = rows[idx];
        if (!row) return false;
        if (!row.isNew) return true;
        return rowHasValue(row);
      });

    bulkUpdate.mutate(
      { characteristics: items },
      {
        onSuccess: () => {
          setRows((prev) => prev.map((r) => ({ ...r, isNew: false })));
        },
      },
    );
  }, [rows, bulkUpdate]);

  const renderValueWidget = (row: CharRow, index: number) => {
    switch (row.param.value_type) {
      case "enum": {
        const fullValues = row.param.enumValues;
        // When the full parameter dictionary hasn't loaded yet, show
        // selected values inline using the enriched characteristic labels.
        if (fullValues.length === 0 && row.selectedValueIds.length > 0) {
          const selectedLabels = characteristics
            .filter(
              (c) =>
                c.parameter_id === row.param.id && c.parameter_value != null,
            )
            .map((c) => ({
              id: c.parameter_value_id!,
              label: (c.parameter_value as ParameterValueBrief).label,
            }));
          return (
            <div className="flex flex-wrap gap-2">
              {selectedLabels.map((v) => (
                <span
                  key={v.id}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2.5 py-1 text-sm"
                >
                  {v.label}
                </span>
              ))}
              {paramsLoading && (
                <span className="text-xs text-[var(--color-text-muted)] italic self-center">
                  Загрузка вариантов...
                </span>
              )}
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-2">
            {fullValues.map((v) => {
              const isSelected = row.selectedValueIds.includes(v.id);
              return (
                <label
                  key={v.id}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      const next = isSelected
                        ? row.selectedValueIds.filter((id) => id !== v.id)
                        : [...row.selectedValueIds, v.id];
                      updateRow(index, { selectedValueIds: next });
                    }}
                    className="sr-only"
                  />
                  {v.label}
                </label>
              );
            })}
            {fullValues.length === 0 && (
              <span className="text-sm text-[var(--color-text-muted)] italic">
                Нет значений в справочнике
              </span>
            )}
          </div>
        );
      }
      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={row.valueNumber}
              onChange={(e) => updateRow(index, { valueNumber: e.target.value })}
              placeholder="0"
              className="w-32"
            />
            {row.param.uom_symbol && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {row.param.uom_symbol}
              </span>
            )}
          </div>
        );
      case "string":
        return (
          <Input
            value={row.valueText}
            onChange={(e) => updateRow(index, { valueText: e.target.value })}
            placeholder="Значение"
            className="max-w-md"
          />
        );
      case "bool":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.valueBool}
              onChange={(checked: boolean) =>
                updateRow(index, { valueBool: checked })
              }
            />
            <span className="text-sm">{row.valueBool ? "Да" : "Нет"}</span>
          </div>
        );
      case "range":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={row.rangeMin}
              onChange={(e) => updateRow(index, { rangeMin: e.target.value })}
              placeholder="Мин"
              className="w-24"
            />
            <span className="text-sm text-[var(--color-text-muted)]">—</span>
            <Input
              type="number"
              value={row.rangeMax}
              onChange={(e) => updateRow(index, { rangeMax: e.target.value })}
              placeholder="Макс"
              className="w-24"
            />
            {row.param.uom_symbol && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {row.param.uom_symbol}
              </span>
            )}
          </div>
        );
    }
  };

  if (charsLoading) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
        Загрузка характеристик...
      </p>
    );
  }

  if (charsError) {
    return (
      <div className="rounded-lg border border-[var(--color-error)] bg-red-50 p-4 text-center">
        <p className="text-sm text-[var(--color-error)]">
          Не удалось загрузить характеристики.
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Проверьте, что API-эндпоинт /characteristics доступен.
        </p>
      </div>
    );
  }

  const hasNoParameters = !paramsLoading && allParameters.length === 0;

  return (
    <div className="space-y-4">
      {rows.length === 0 && !hasNoParameters && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Характеристики не добавлены. Выберите параметр из списка ниже.
        </p>
      )}

      {rows.length === 0 && hasNoParameters && characteristics.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Словарь параметров пуст.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Сначала создайте параметры в разделе{" "}
            <a
              href="/catalog/parameters"
              className="text-[var(--color-accent-primary)] underline"
            >
              Каталог → Параметры
            </a>
            , затем возвращайтесь сюда для привязки характеристик к товару.
          </p>
        </div>
      )}

      {rows.map((row, index) => (
        <div
          key={row.param.id}
          className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] p-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-[var(--color-text-primary)]">
                {row.param.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {PARAMETER_VALUE_TYPE_LABELS[row.param.value_type]}
              </Badge>
              {row.isNew && (
                <Badge variant="warning" className="text-xs">
                  Новая
                </Badge>
              )}
            </div>
            {renderValueWidget(row, index)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveRow(index)}
            className="h-8 w-8 flex-shrink-0 text-[var(--color-error)] mt-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center gap-3">
        {paramsLoading ? (
          <span className="text-xs text-[var(--color-text-muted)]">
            Загрузка параметров...
          </span>
        ) : paramsError ? (
          <span className="text-xs text-[var(--color-error)]">
            Ошибка загрузки словаря параметров
          </span>
        ) : allParameters.length > 0 ? (
          <Combobox
            placeholder="Добавить параметр..."
            searchPlaceholder="Поиск параметров"
            options={availableParameters.map((p) => ({
              value: p.id,
              label: `${p.name} (${PARAMETER_VALUE_TYPE_LABELS[p.value_type]})`,
            }))}
            value=""
            onChange={handleAddParameter}
            searchable
            emptyMessage="Все параметры уже добавлены"
            className="w-72"
          />
        ) : null}
        {rows.length > 0 && (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={bulkUpdate.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Сохранить всё
          </Button>
        )}
      </div>
    </div>
  );
}
