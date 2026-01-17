"use client";

import { ArticleForm, useCreateArticle, useTopics } from "@/features/articles";
import { Spinner } from "@/shared/ui";
import type { CreateArticleDto, UpdateArticleDto } from "@/entities/article";

export default function NewArticlePage() {
  const { data: topicsData, isLoading: topicsLoading } = useTopics();
  const { mutate: createArticle, isPending } = useCreateArticle();

  const handleSubmit = (data: CreateArticleDto | UpdateArticleDto) => {
    createArticle(data as CreateArticleDto);
  };

  if (topicsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новая статья</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новую статью для блога</p>
      </div>

      <ArticleForm
        topics={topicsData?.items || []}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}

