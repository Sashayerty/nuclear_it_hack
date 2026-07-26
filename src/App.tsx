import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { logout } from './store/slices/authSlice'
import { Sidebar } from './components/layout/Sidebar'
import { HeaderBar } from './components/layout/HeaderBar'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { DatasetsPage } from './pages/DatasetsPage'
import { ReportPage } from './pages/ReportPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector((state) => state.dashboard.activeTab)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout())
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [dispatch])

  if (!isAuthenticated || activeTab === 'auth') {
    return <AuthPage />
  }

  return (
    <div className="w-full h-screen bg-[#18191c] flex font-sans selection:bg-[#7cb0f8] selection:text-[#18191c] overflow-hidden relative">
      <Sidebar />

      <div className="flex-1 bg-[#F2F2F2] rounded-none md:rounded-[20px] my-0 md:my-2.5 mr-0 md:mr-2.5 p-3 sm:p-5 text-slate-800 flex flex-col gap-4 md:gap-6 h-screen md:h-[calc(100vh-20px)] overflow-y-auto shadow-md">
        <HeaderBar />

        <main className="w-full flex-1">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'datasets' && <DatasetsPage />}
          {activeTab === 'report' && <ReportPage />}
          {activeTab === 'admin' && <AdminPage />}
        </main>
      </div>
    </div>
  )
}

export default App
