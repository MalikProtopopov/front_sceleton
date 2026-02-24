"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useProductsList, useDeleteProduct, useCategoriesTree } from "@/features/catalog";
import {
  Button,
  Table,
  Pagination,
  Badge,
  ConfirmModal,
  Select,
  Input,
  FilterBar,
  type Column,
} from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate } from "@/shared/lib";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { Product, ProductFilterParams } from "@/entities/product";

export default function ProductsPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const [filters, setFilters] = useState<ProductFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProductsList(filters);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { data: categoriesData } = useCategoriesTree();

  const handleFiltersChange = (newFilters: Partial<ProductFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  const handleSearch = () => {
    handleFiltersChange({ search: search || undefined });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSearch("");
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const getCoverUrl = (product: Product) => {
    const cover = product.images?.find((img) => img.is_cover) || product.images?.[0];
    return cover?.url;
  };

  const categoryOptions = [
    { value: "", label: "Все категории" },
    ...(categoriesData?.items || []).map((c) => ({ value: c.id, label: c.title })),
  ];

  const columns: Column<Product>[] = [
    {
      key: "image",
      header: "",
      width: "60px",
      render: (product) => {
        const url = getCoverUrl(product);
        return url ? (
          <img src={url} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-muted)]">
            —
          </div>
        );
      },
    },
    {
      key: "title",
      header: "Товар",
      render: (product) => (
        <div className="max-w-md">
          <p className="font-medium text-[var(--color-text-primary)]">{product.title}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {product.sku}
            {product.brand && ` · ${product.brand}`}
          </p>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Статус",
      width: "110px",
      render: (product) => (
        <Badge variant={product.is_active ? "success" : "secondary"}>
          {product.is_active ? "Активен" : "Скрыт"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Создан",
      width: "120px",
      render: (product) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(product.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.PRODUCT_EDIT(product.id));
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {can("catalog", "delete") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(product);
              }}
              className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Товары</h1>
          <p className="text-[var(--color-text-secondary)]">Управление каталогом товаров</p>
        </div>
        {can("catalog", "create") && (
          <Button
            onClick={() => router.push(ROUTES.PRODUCT_NEW)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Создать товар
          </Button>
        )}
      </div>

      <FilterBar onReset={handleResetFilters}>
        <Input
          placeholder="Поиск по названию, артикулу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearch}
          className="w-64"
        />
        <Select
          value={filters.category_id || ""}
          onChange={(e) => handleFiltersChange({ category_id: e.target.value || undefined })}
          options={categoryOptions}
          className="w-48"
        />
        <Select
          value={filters.isActive === undefined ? "" : String(filters.isActive)}
          onChange={(e) =>
            handleFiltersChange({
              isActive: e.target.value === "" ? undefined : e.target.value === "true",
            })
          }
          options={[
            { value: "", label: "Все статусы" },
            { value: "true", label: "Активные" },
            { value: "false", label: "Скрытые" },
          ]}
          className="w-40"
        />
      </FilterBar>

      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(product) => product.id}
        isLoading={isLoading}
        emptyMessage="Товары не найдены"
        onRowClick={(product) => router.push(ROUTES.PRODUCT_EDIT(product.id))}
      />

      {data && data.total > 0 && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.pageSize || 20}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить товар?"
        description={`Вы уверены, что хотите удалить товар "${selectedProduct?.title}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
