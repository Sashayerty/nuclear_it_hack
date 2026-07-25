import { useAppSelector } from './store/hooks'
import { Sidebar } from './components/layout/Sidebar'
import { HeaderBar } from './components/layout/HeaderBar'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { DatasetsPage } from './pages/DatasetsPage'
import { ReportPage } from './pages/ReportPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  const activeTab = useAppSelector((state) => state.dashboard.activeTab)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated || activeTab === 'auth') {
    return <AuthPage />
  }

  return (
    <div className="w-full h-screen bg-[#18191c] flex font-sans selection:bg-[#7cb0f8] selection:text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 bg-[#f4f6fa] rounded-[20px] my-2.5 mr-2.5 p-4 md:p-8 text-slate-800 flex flex-col gap-6 h-[calc(100vh-20px)] overflow-y-auto shadow-md">
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
