// Dashboard entity types

export interface DashboardSummary {
  total_articles: number;
  total_cases: number;
  total_team_members: number;
  total_services: number;
  total_faqs: number;
  total_reviews: number;
}

export interface DashboardInquiries {
  total: number;
  pending: number;
  in_progress: number;
  done: number;
  this_month: number;
}

export interface ContentStatusBreakdown {
  published: number;
  draft: number;
  archived: number;
}

export interface DashboardContentByStatus {
  articles: ContentStatusBreakdown;
  cases: ContentStatusBreakdown;
}

export interface DashboardActivityUser {
  id: string | null;
  email: string | null;
  name: string | null;
}

export interface DashboardActivity {
  id: string;
  timestamp: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  user: DashboardActivityUser | null;
  status: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  inquiries: DashboardInquiries;
  content_by_status: DashboardContentByStatus;
  recent_activity: DashboardActivity[];
}

