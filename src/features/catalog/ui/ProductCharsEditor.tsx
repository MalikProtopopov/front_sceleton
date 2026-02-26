"use client";

import { useState, useMemo, useEffect } from "react";
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
  ProductCharacteristic,
  ProductCharacteristicBulkItem,
} from "@/entities/product";
import { PARAMETER_VALUE_TYPE_LABELS } from "@/entities/product";

interface ProductCharsEditorProps {
  productId: string;
  productCategoryIds?: string[];
}

interface CharRow {
  parameter: Parameter;
  selectedValueIds: string[];
  valueText: string;
  valueNumber: string;
  valueBool: boolean;
  rangeMin: string;
  rangeMax: string;
  isNew?: boolean;
}

function buildRowFromExisting(
  param: Parameter,
  chars: ProductCharacteristic[],
): CharRow {
  const paramChars = chars.filter((c) => c.parameter_id === param.id);
  const row: CharRow = {
    parameter: param,
    selectedValueIds: [],
    valueText: "",
    valueNumber: "",
    valueBool: false,
    rangeMin: "",
    rangeMax: "",
  };

  switch (param.value_type) {
    case "enum":
      row.selectedValueIds = paramChars
        .map((c) => c.parameter_value_id)
        .filter((id): id is string => !!id);
      break;
    case "number":
      row.valueNumber = paramChars[0]?.value_number?.toString() ?? "";
      break;
    case "string":
      row.valueText = paramChars[0]?.value_text ?? "";
      break;
    case "bool":
      row.valueBool = paramChars[0]?.value_bool ?? false;
      break;
    case "range": {
      const sorted = paramChars
        .map((c) => c.value_number)
        .filter((n): n is number => n != null)
        .sort((a, b) => a - b);
      row.rangeMin = sorted[0]?.toString() ?? "";
      row.rangeMax = sorted[1]?.toString() ?? sorted[0]?.toString() ?? "";
      break;
    }
  }

  return row;
}

export function ProductCharsEditor({ productId, productCategoryIds = [] }: ProductCharsEditorProps) {
  const { data: characteristics = [], isLoading: charsLoading, error: charsError } = useProductCharacteristics(productId);
  const { data: parametersData, isLoading: paramsLoading, error: paramsError } = useParametersList({ page: 1, page_size: 200 });
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

  useEffect(() => {
    if (initialized || charsLoading || allParameters.length === 0) return;

    const usedParamIds = new Set(characteristics.map((c) => c.parameter_id));
    const initialRows: CharRow[] = [];

    usedParamIds.forEach((paramId) => {
      const param = allParameters.find((p) => p.id === paramId);
      if (param) {
        initialRows.push(buildRowFromExisting(param, characteristics));
      }
    });

    setRows(initialRows);
    setInitialized(true);
  }, [initialized, charsLoading, allParameters, characteristics]);

  const usedParameterIds = useMemo(() => new Set(rows.map((r) => r.parameter.id)), [rows]);

  const availableParameters = useMemo(() => {
    return allParameters.filter((p) => {
      if (usedParameterIds.has(p.id)) return false;
      if (!p.is_active) return false;
      if (p.scope === "global") return true;
      if (productCategoryIds.length === 0) return true;
      return p.category_ids?.some((cid) => productCategoryIds.includes(cid));
    });
  }, [allParameters, usedParameterIds, productCategoryIds]);

  const handleAddParameter = (parameterId: string | string[]) => {
    const id = Array.isArray(parameterId) ? parameterId[0] : parameterId;
    if (!id) return;
    const param = allParameters.find((p) => p.id === id);
    if (!param) return;
    setRows((prev) => [
      ...prev,
      {
        parameter: param,
        selectedValueIds: [],
        valueText: "",
        valueNumber: "",
        valueBool: false,
        rangeMin: "",
        rangeMax: "",
        isNew: true,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const row = rows[index];
    if (!row) return;
    if (!row.isNew) {
      deleteChar.mutate(row.parameter.id);
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, updates: Partial<CharRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  };

  const handleSave = () => {
    const items: ProductCharacteristicBulkItem[] = rows
      .map((row) => {
        const item: ProductCharacteristicBulkItem = {
          parameter_id: row.parameter.id,
        };
        switch (row.parameter.value_type) {
          case "enum":
            item.parameter_value_ids = row.selectedValueIds;
            break;
          case "number":
            if (row.valueNumber !== "") item.value_number = parseFloat(row.valueNumber);
            break;
          case "string":
            if (row.valueText) item.value_text = row.valueText;
            break;
          case "bool":
            item.value_bool = row.valueBool;
            break;
          case "range":
            // Range stores the product's value; constraints on the parameter define bounds
            if (row.rangeMin !== "") item.value_number = parseFloat(row.rangeMin);
            if (row.rangeMax !== "" && !item.value_number) item.value_number = parseFloat(row.rangeMax);
            break;
        }
        return item;
      })
      .filter((item) => {
        if (item.parameter_value_ids?.length) return true;
        if (item.value_text) return true;
        if (item.value_number != null) return true;
        if (item.value_bool != null) return true;
        return false;
      });

    bulkUpdate.mutate(
      { characteristics: items },
      {
        onSuccess: () => {
          setRows((prev) => prev.map((r) => ({ ...r, isNew: false })));
        },
      },
    );
  };

  const renderValueWidget = (row: CharRow, index: number) => {
    switch (row.parameter.value_type) {
      case "enum": {
        const values = row.parameter.values?.filter((v) => v.is_active) || [];
        return (
          <div className="flex flex-wrap gap-2">
            {values.map((v) => {
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
            {values.length === 0 && (
              <span className="text-sm text-[var(--color-text-muted)] italic">
                Нет значений
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
            {row.parameter.uom_id && uomMap.get(row.parameter.uom_id) && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {uomMap.get(row.parameter.uom_id)}
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
              onChange={(checked: boolean) => updateRow(index, { valueBool: checked })}
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
            {row.parameter.uom_id && uomMap.get(row.parameter.uom_id) && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {uomMap.get(row.parameter.uom_id)}
              </span>
            )}
          </div>
        );
    }
  };

  if (charsLoading || paramsLoading) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
        Загрузка характеристик...
      </p>
    );
  }

  if (charsError || paramsError) {
    return (
      <div className="rounded-lg border border-[var(--color-error)] bg-red-50 p-4 text-center">
        <p className="text-sm text-[var(--color-error)]">
          Не удалось загрузить данные.
          {charsError && " Ошибка загрузки характеристик."}
          {paramsError && " Ошибка загрузки словаря параметров."}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Проверьте, что API-эндпоинты /characteristics и /parameters доступны.
        </p>
      </div>
    );
  }

  const hasNoParameters = allParameters.length === 0;

  return (
    <div className="space-y-4">
      {rows.length === 0 && !hasNoParameters && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Характеристики не добавлены. Выберите параметр из списка ниже.
        </p>
      )}

      {rows.length === 0 && hasNoParameters && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Словарь параметров пуст.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Сначала создайте параметры в разделе{" "}
            <a href="/catalog/parameters" className="text-[var(--color-accent-primary)] underline">
              Каталог → Параметры
            </a>
            , затем возвращайтесь сюда для привязки характеристик к товару.
          </p>
        </div>
      )}

      {rows.map((row, index) => (
        <div
          key={row.parameter.id}
          className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] p-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-[var(--color-text-primary)]">
                {row.parameter.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {PARAMETER_VALUE_TYPE_LABELS[row.parameter.value_type]}
              </Badge>
              {row.isNew && (
                <Badge variant="warning" className="text-xs">Новая</Badge>
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
        {!hasNoParameters && (
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
        )}
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
