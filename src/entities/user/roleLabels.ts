/**
 * Mapping of system role names (from backend) to Russian labels.
 * Custom roles not in this map will be displayed as-is.
 */
const ROLE_LABELS: Record<string, string> = {
  platform_owner: "Владелец платформы",
  site_owner: "Владелец сайта",
  content_manager: "Контент-менеджер",
  marketer: "Маркетолог",
  editor: "Редактор",
};

/**
 * Get human-readable Russian label for a role name.
 * Falls back to the original name if no translation exists.
 */
export function getRoleLabel(roleName: string): string {
  return ROLE_LABELS[roleName] || roleName;
}
