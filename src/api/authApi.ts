import { apiClient } from './axios'
import { tokenStorage } from '../utils/tokenStorage'

export interface User {
  id: string
  email: string
  name: string
  role?: string
  avatarUrl?: string
  createdAt?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

const MOCK_DELAY = 600

const getMockUser = (email: string, name?: string): User => ({
  id: `usr_${Date.now()}`,
  email,
  name: name || email.split('@')[0] || 'Пользователь',
  role: 'пользователь',
  createdAt: new Date().toISOString(),
})

export const authApi = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any, AuthResponse>('/auth/login', credentials)
      tokenStorage.setTokens(response.accessToken, response.refreshToken)
      return response
    } catch (err: any) {
      if (!err.response) {
        await new Promise((res) => setTimeout(res, MOCK_DELAY))
        if (credentials.password.length < 4) {
          throw new Error('Неверный логин или пароль')
        }
        const mockUser = getMockUser(credentials.email)
        const mockResponse: AuthResponse = {
          user: mockUser,
          accessToken: `mock_access_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
        }
        tokenStorage.setTokens(mockResponse.accessToken, mockResponse.refreshToken)
        return mockResponse
      }
      throw err
    }
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any, AuthResponse>('/auth/register', dto)
      tokenStorage.setTokens(response.accessToken, response.refreshToken)
      return response
    } catch (err: any) {
      if (!err.response) {
        await new Promise((res) => setTimeout(res, MOCK_DELAY))
        const mockUser = getMockUser(dto.email, dto.name)
        const mockResponse: AuthResponse = {
          user: mockUser,
          accessToken: `mock_access_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
        }
        tokenStorage.setTokens(mockResponse.accessToken, mockResponse.refreshToken)
        return mockResponse
      }
      throw err
    }
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<any, TokenResponse>('/auth/refresh', { refreshToken })
      tokenStorage.setTokens(response.accessToken, response.refreshToken)
      return response
    } catch (err: any) {
      if (!err.response) {
        const mockResponse: TokenResponse = {
          accessToken: `mock_access_refreshed_${Date.now()}`,
          refreshToken: `mock_refresh_refreshed_${Date.now()}`,
        }
        tokenStorage.setTokens(mockResponse.accessToken, mockResponse.refreshToken)
        return mockResponse
      }
      throw err
    }
  },

  async getProfile(): Promise<User> {
    try {
      return await apiClient.get<any, User>('/auth/me')
    } catch (err: any) {
      if (!err.response) {
        await new Promise((res) => setTimeout(res, 300))
        return getMockUser('user@radar.ai', 'ИИ Инженер')
      }
      throw err
    }
  },

  async logout(): Promise<void> {
    try {
      const refresh = tokenStorage.getRefreshToken()
      if (refresh) {
        await apiClient.post('/auth/logout', { refreshToken: refresh }).catch(() => {})
      }
    } finally {
      tokenStorage.clearTokens()
    }
  },
}
