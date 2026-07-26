export type UserRole = 'organization' | 'admin'

export interface Organization {
  id: number
  name: string
  created_at?: string
}

export interface Admin {
  id: number
  login: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
  expires_in: number
  role: UserRole
}

export interface Dataset {
  id: number
  name: string
  file_format: string
  file_size_bytes: number
  rows_count?: number
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  created_at: string
  processed_at?: string | null
}

export interface AnalysisJob {
  id: number
  task_id?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  error?: string | null
}

export interface AnalysisRunStatus {
  analysis_run_id: number
  dataset_id: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  job: AnalysisJob
  started_at?: string
  finished_at?: string
}

export interface CategoryMetric {
  name: string
  requests: number
  percentage: number
}

export interface TopUseCase {
  name: string
  requests: number
}

export interface PainPointMetric {
  text: string
  mentions: number
}

export interface AutomationCandidate {
  name: string
  requests: number
  automation_potential: string
  suggested_actions: string[]
}

export interface DashboardData {
  total_requests: number
  categories: CategoryMetric[]
  top_use_cases: TopUseCase[]
  top_pain_points: PainPointMetric[]
  broken_queries_count: number
  automation_candidates: AutomationCandidate[]
  organization?: {
    id: number
    name: string
  }
  analyzed_datasets?: number
  total_tokens_used?: number
  total_cost_rub?: number
  net_roi_rub?: number
  minutes_saved_net?: number
}

export interface BrokenQueryInfo {
  query: string
  reason?: string
}

export interface UseCaseReport {
  use_case_name: string
  queries_count: number
  examples?: string[]
  description?: string
  typical_phrases?: string[]
  pain_points?: string[]
  broken_queries?: (string | BrokenQueryInfo)[]
  automation_potential?: string
  suggested_actions?: string | string[]
  total_tokens_used?: number
  total_cost_rub?: number
  avg_cost_per_query_rub?: number
  dominant_department?: string
  estimated_time_saved?: string
  estimated_money_saved?: string
}

export interface CategoryReport {
  category_name: string
  total_requests: number
  use_cases: UseCaseReport[]
}

export interface DatasetReport {
  dataset: {
    id: number
    name: string
    rows_count?: number
  }
  analysis: {
    id: number
    started_at?: string
    finished_at?: string
  }
  report: CategoryReport[]
}
