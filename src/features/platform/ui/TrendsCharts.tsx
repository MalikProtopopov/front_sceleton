"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import type { PlatformTrends } from "@/entities/platform";

interface TrendsChartsProps {
  data: PlatformTrends;
}

const COLORS = [
  "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function formatDateShort(dateStr: unknown) {
  const d = new Date(String(dateStr));
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function formatMonth(dateStr: unknown) {
  const parts = String(dateStr).split("-");
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  return d.toLocaleDateString("ru-RU", { month: "short", year: "numeric" });
}

export function TrendsCharts({ data }: TrendsChartsProps) {
  // Merge tenants/users by month
  const growthData = data.new_tenants_by_month.map((t) => ({
    date: t.date,
    tenants: t.value,
    users: data.new_users_by_month.find((u) => u.date === t.date)?.value ?? 0,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Inquiries by Day */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Заявки по дням
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.inquiries_by_day}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              labelFormatter={formatDateShort}
              contentStyle={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Заявки"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* New Tenants / Users by Month */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Рост: организации и пользователи
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatMonth}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              labelFormatter={formatMonth}
              contentStyle={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="tenants" name="Организации" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="users" name="Пользователи" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Logins by Day */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Входы по дням
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.logins_by_day}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              labelFormatter={formatDateShort}
              contentStyle={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Входы"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Inquiries by Tenant (Multi-Line) */}
      {data.inquiries_by_tenant.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
            Заявки по организациям (Топ-10)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                type="category"
                allowDuplicatedCategory={false}
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                labelFormatter={formatDateShort}
                contentStyle={{
                  backgroundColor: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {data.inquiries_by_tenant.map((tenant, i) => (
                <Line
                  key={tenant.tenant_id}
                  data={tenant.data}
                  dataKey="value"
                  name={tenant.tenant_name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
