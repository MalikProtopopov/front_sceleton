"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Pencil, Trash2, FolderOpen, Folder } from "lucide-react";
import { Button, Badge } from "@/shared/ui";
import { ROUTES, TREE_INDENT_PER_LEVEL, TREE_BASE_PADDING } from "@/shared/config";
import type { Category } from "@/entities/product";

interface CategoryTreeProps {
  categories: Category[];
  onDelete?: (category: Category) => void;
}

interface TreeNode extends Category {
  children: TreeNode[];
}

function buildTree(categories: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  categories.forEach((cat) => map.set(cat.id, { ...cat, children: [] }));

  categories.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

function TreeItem({
  node,
  depth,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  onDelete?: (category: Category) => void;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--color-bg-hover)]"
        style={{ paddingLeft: `${depth * TREE_INDENT_PER_LEVEL + TREE_BASE_PADDING}px` }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--color-text-muted)]"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </button>

        {hasChildren && isExpanded ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-[var(--color-accent-primary)]" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />
        )}

        <button
          type="button"
          onClick={() => router.push(ROUTES.CATEGORY_EDIT(node.id))}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="truncate text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">
            {node.title}
          </span>
          <span className="flex-shrink-0 rounded bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
            /{node.slug}
          </span>
        </button>

        {!node.is_active && (
          <Badge variant="secondary" className="flex-shrink-0 text-xs">
            Скрыта
          </Badge>
        )}

        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(ROUTES.CATEGORY_EDIT(node.id))}
            className="h-7 w-7"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(node)}
              className="h-7 w-7 text-[var(--color-error)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ categories, onDelete }: CategoryTreeProps) {
  const tree = buildTree(categories);

  if (tree.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
        Категории не найдены
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <TreeItem key={node.id} node={node} depth={0} onDelete={onDelete} />
      ))}
    </div>
  );
}
