"use client";

import { useState } from "react";
import { Spinner } from "@/shared/ui";
import {
  useMyPlan,
  usePublicPlans,
  usePublicModules,
  usePublicBundles,
  useCreateUpgradeRequest,
} from "@/features/billing";
import { PlanComparisonTable } from "@/features/billing/ui/PlanComparisonTable";
import { UpgradeRequestModal } from "@/features/billing/ui/UpgradeRequestModal";
import type { UpgradeRequestType, CreateUpgradeRequestDto } from "@/entities/billing";

export default function BillingPlansPage() {
  const { data: myPlan } = useMyPlan();
  const { data: plans, isLoading: plansLoading } = usePublicPlans();
  const { data: modules, isLoading: modulesLoading } = usePublicModules();
  const { data: bundles, isLoading: bundlesLoading } = usePublicBundles();
  const { mutate: createRequest, isPending } = useCreateUpgradeRequest();

  const [modalOpen, setModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<UpgradeRequestType>("plan_upgrade");
  const [targetId, setTargetId] = useState("");
  const [targetName, setTargetName] = useState("");

  const isLoading = plansLoading || modulesLoading || bundlesLoading;

  const openUpgradeModal = (type: UpgradeRequestType, id: string, name: string) => {
    setRequestType(type);
    setTargetId(id);
    setTargetName(name);
    setModalOpen(true);
  };

  const handleSubmit = (data: CreateUpgradeRequestDto) => {
    createRequest(data, {
      onSuccess: () => setModalOpen(false),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Каталог тарифов</h1>
        <p className="text-[var(--color-text-secondary)]">
          Сравните планы и выберите подходящий для вашего бизнеса
        </p>
      </div>

      <PlanComparisonTable
        plans={plans ?? []}
        allModules={modules ?? []}
        bundles={bundles ?? []}
        currentPlanSlug={myPlan?.plan?.slug}
        onUpgradePlan={(planId) => {
          const plan = plans?.find((p) => p.id === planId);
          if (plan) openUpgradeModal("plan_upgrade", plan.id, plan.name_ru);
        }}
        onAddBundle={(bundleId) => {
          const bundle = bundles?.find((b) => b.id === bundleId);
          if (bundle) openUpgradeModal("bundle_addon", bundle.id, bundle.name_ru);
        }}
      />

      <UpgradeRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isPending}
        requestType={requestType}
        targetId={targetId}
        targetName={targetName}
      />
    </div>
  );
}
