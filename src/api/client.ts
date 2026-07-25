import axios from 'axios'
import type {
  AuthTokens,
  Organization,
  Dataset,
  AnalysisRunStatus,
  DatasetReport,
  DashboardData
} from './types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiService = {
  async organizationLogin(name: string, password: string): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>('/organization/login', { name, password })
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('user_role', 'organization')
    localStorage.setItem('org_name', name)
    return { ...res.data, role: 'organization' }
  },

  async adminLogin(login: string, password: string): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>('/admin/login', { login, password })
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('user_role', 'admin')
    localStorage.setItem('admin_login', login)
    return { ...res.data, role: 'admin' }
  },

  async getDatasets(): Promise<Dataset[]> {
    const res = await api.get<Dataset[]>('/datasets')
    return res.data
  },

  async uploadDataset(file: File, name?: string, textColumn: string = 'text'): Promise<Dataset> {
    const formData = new FormData()
    formData.append('file', file)
    if (name) formData.append('name', name)
    formData.append('text_column', textColumn)

    const res = await api.post<Dataset>('/datasets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  async analyzeDataset(datasetId: number): Promise<AnalysisRunStatus> {
    const res = await api.post<AnalysisRunStatus>(`/datasets/${datasetId}/analyze`)
    return res.data
  },

  async getAnalysisStatus(analysisRunId: number): Promise<AnalysisRunStatus> {
    const res = await api.get<AnalysisRunStatus>(`/analysis-runs/${analysisRunId}`)
    return res.data
  },

  async getDatasetReport(datasetId: number): Promise<DatasetReport> {
    const res = await api.get<DatasetReport>(`/datasets/${datasetId}/report`)
    return res.data
  },

  async getDashboard(): Promise<DashboardData> {
    const res = await api.get<DashboardData>('/dashboard')
    return res.data
  },

  async getAdminOrganizations(): Promise<Organization[]> {
    const res = await api.get<Organization[]>('/admin/organizations')
    return res.data
  },

  async createOrganization(name: string, password: string): Promise<Organization> {
    const res = await api.post<Organization>('/admin/organizations', { name, password })
    return res.data
  },

  async deleteOrganization(id: number): Promise<void> {
    await api.delete(`/admin/organizations/${id}`)
  }
}
