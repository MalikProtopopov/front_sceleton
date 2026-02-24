"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, MessageSquare } from "lucide-react";
import {
  ProductForm,
  ProductCharsEditor,
  ProductImagesManager,
  ProductPricesEditor,
  ProductAliasesEditor,
  ProductAnalogsEditor,
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateProductCategories,
  useCategoriesTree,
  useProductContentBlocks,
  useCreateProductContentBlock,
  useUpdateProductContentBlock,
  useDeleteProductContentBlock,
  useReorderProductContentBlocks,
} from "@/features/catalog";
import { useLeadsList } from "@/features/leads";
import {
  Button,
  Spinner,
  Badge,
  ConfirmModal,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  Select,
  Combobox,
  ContentBlocksManager,
  TextBlockEditor,
  ImageBlockEditor,
  VideoBlockEditor,
  GalleryBlockEditor,
  LinkBlockEditor,
  ResultBlockEditor,
  type BlockEditorProps,
  type Column,
} from "@/shared/ui";
import { formatDateTime, formatDate } from "@/shared/lib";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { ROUTES } from "@/shared/config";
import type { CreateProductDto, UpdateProductDto, Category } from "@/entities/product";
import type { CreateContentBlockDto, UpdateContentBlockDto } from "@/entities/content-block";
import type { Inquiry } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = usePermissions();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [selectedBlocksLocale, setSelectedBlocksLocale] = useState("ru");

  const { data: product, isLoading, error } = useProduct(id);
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct(id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateCategories } = useUpdateProductCategories(id);
  const { data: categoriesData } = useCategoriesTree();
  const { data: inquiriesData } = useLeadsList({ productId: id, pageSize: 10 });

  const { data: contentBlocks = [], isLoading: isLoadingBlocks } = useProductContentBlocks(id, undefined);
  const createContentBlock = useCreateProductContentBlock(id);
  const updateContentBlock = useUpdateProductContentBlock(id);
  const deleteContentBlock = useDeleteProductContentBlock(id);
  const reorderContentBlocks = useReorderProductContentBlocks(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  const handleSubmit = (data: CreateProductDto | UpdateProductDto) => {
    updateProduct(data as UpdateProductDto);
  };

  const handleDelete = () => {
    deleteProduct(id);
    setDeleteModalOpen(false);
  };

  const handleCategoriesChange = (value: string | string[]) => {
    updateCategories(Array.isArray(value) ? value : value ? [value] : []);
  };

  const handleCreateContentBlock = async (data: CreateContentBlockDto) => {
    await createContentBlock.mutateAsync(data);
  };
  const handleUpdateContentBlock = async (blockId: string, data: UpdateContentBlockDto) => {
    await updateContentBlock.mutateAsync({ blockId, data });
  };
  const handleDeleteContentBlock = async (blockId: string) => {
    await deleteContentBlock.mutateAsync(blockId);
  };
  const handleReorderContentBlocks = async (blockIds: string[]) => {
    await reorderContentBlocks.mutateAsync({ locale: selectedBlocksLocale, block_ids: blockIds });
  };

  const renderBlockEditor = (props: BlockEditorProps) => {
    switch (props.blockType) {
      case "text": return <TextBlockEditor {...props} />;
      case "image": return <ImageBlockEditor {...props} />;
      case "video": return <VideoBlockEditor {...props} />;
      case "gallery": return <GalleryBlockEditor {...props} />;
      case "link": return <LinkBlockEditor {...props} />;
      case "result": return <ResultBlockEditor {...props} />;
      default: return null;
    }
  };

  const allCategories = categoriesData?.items || [];
  const linkedCategoryIds = product.categories?.map((c) => c.category_id) || [];

  const inquiryColumns: Column<Inquiry>[] = [
    {
      key: "name",
      header: "Клиент",
      render: (inq) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">{inq.name}</p>
          {inq.email && <p className="text-xs text-[var(--color-text-muted)]">{inq.email}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      width: "120px",
      render: (inq) => {
        const cfg = INQUIRY_STATUS_CONFIG[inq.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "created_at",
      header: "Дата",
      width: "120px",
      render: (inq) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(inq.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {product.title}
              </h1>
              <Badge variant={product.is_active ? "success" : "secondary"}>
                {product.is_active ? "Активен" : "Скрыт"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              SKU: {product.sku} · Slug: /{product.slug} · Версия: {product.version} · Обновлён:{" "}
              {formatDateTime(product.updated_at)}
            </p>
          </div>
        </div>
        {can("catalog", "delete") && (
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Удалить
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs activeIndex={activeTab} onChange={setActiveTab}>
        <Tab label="Основное">
          <Card>
            <CardContent className="pt-6">
              <ProductForm product={product} onSubmit={handleSubmit} isSubmitting={isUpdating} />
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Изображения">
          <Card>
            <CardHeader>
              <CardTitle>Изображения товара</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductImagesManager productId={id} images={product.images || []} />
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Характеристики">
          <Card>
            <CardHeader>
              <CardTitle>Характеристики (EAV)</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductCharsEditor productId={id} chars={product.chars || []} />
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Цены">
          <Card>
            <CardHeader>
              <CardTitle>Цены товара</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPricesEditor productId={id} prices={product.prices || []} />
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Контент">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Контент-блоки</CardTitle>
                <Select
                  value={selectedBlocksLocale}
                  onChange={(e) => setSelectedBlocksLocale(e.target.value)}
                  options={SUPPORTED_LOCALES}
                  minWidth="150px"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBlocks ? (
                <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Загрузка блоков...
                </div>
              ) : (
                <ContentBlocksManager
                  blocks={contentBlocks}
                  locale={selectedBlocksLocale}
                  isEditing={true}
                  onCreateBlock={handleCreateContentBlock}
                  onUpdateBlock={handleUpdateContentBlock}
                  onDeleteBlock={handleDeleteContentBlock}
                  onReorderBlocks={handleReorderContentBlocks}
                  isCreating={createContentBlock.isPending}
                  isUpdating={updateContentBlock.isPending}
                  isDeleting={deleteContentBlock.isPending}
                  renderBlockEditor={renderBlockEditor}
                  title=""
                />
              )}
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Категории">
          <Card>
            <CardHeader>
              <CardTitle>Привязка к категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                Первая выбранная категория становится основной.
              </p>
              <Combobox
                label="Категории"
                placeholder="Выберите категории..."
                searchPlaceholder="Поиск категорий"
                options={allCategories.map((cat: Category) => ({
                  value: cat.id,
                  label: `${cat.title} (/${cat.slug})`,
                }))}
                value={linkedCategoryIds}
                onChange={handleCategoriesChange}
                multiple
                searchable
                clearable
                emptyMessage="Нет категорий"
              />
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Псевдонимы">
          <Card>
            <CardHeader>
              <CardTitle>Псевдонимы (альтернативные названия)</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductAliasesEditor productId={id} aliases={product.aliases || []} />
            </CardContent>
          </Card>
        </Tab>

        <Tab label="Аналоги">
          <Card>
            <CardHeader>
              <CardTitle>Аналоги / заменители</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductAnalogsEditor productId={id} />
            </CardContent>
          </Card>
        </Tab>

        <Tab label={<span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Заявки{inquiriesData?.total ? ` (${inquiriesData.total})` : ""}</span>}>
          <Card>
            <CardHeader>
              <CardTitle>Заявки на этот товар</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiriesData?.items?.length ? (
                <>
                  <Table
                    data={inquiriesData.items}
                    columns={inquiryColumns}
                    keyExtractor={(inq) => inq.id}
                    onRowClick={(inq) => router.push(ROUTES.LEAD_DETAIL(inq.id))}
                  />
                  {inquiriesData.total > 10 && (
                    <div className="mt-3 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`${ROUTES.LEADS}?productId=${id}`)}
                      >
                        Показать все заявки ({inquiriesData.total})
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Заявок на этот товар пока нет
                </p>
              )}
            </CardContent>
          </Card>
        </Tab>
      </Tabs>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить товар?"
        description={`Вы уверены, что хотите удалить товар "${product.title}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
