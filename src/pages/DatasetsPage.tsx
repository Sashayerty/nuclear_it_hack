import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchDatasetsThunk,
  uploadDatasetThunk,
  triggerAnalysisThunk,
  checkAnalysisStatusThunk
} from '../store/slices/datasetSlice'
import { fetchReportThunk } from '../store/slices/dashboardSlice'
import type { Dataset } from '../api/types'

export const DatasetsPage = () => {
  const dispatch = useAppDispatch()
  const { datasets, isUploading, isAnalyzing, activeAnalysisRun, isLoading, error } =
    useAppSelector((state) => state.dataset)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customName, setCustomName] = useState('')
  const [textColumn, setTextColumn] = useState('text')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    dispatch(fetchDatasetsThunk())
  }, [dispatch])

  useEffect(() => {
    if (activeAnalysisRun && (activeAnalysisRun.status === 'pending' || activeAnalysisRun.status === 'processing')) {
      const interval = setInterval(() => {
        dispatch(checkAnalysisStatusThunk(activeAnalysisRun.analysis_run_id))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [activeAnalysisRun, dispatch])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!customName) {
        setCustomName(e.target.files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    await dispatch(
      uploadDatasetThunk({
        file: selectedFile,
        name: customName,
        textColumn
      })
    )

    setSelectedFile(null)
    setCustomName('')
    setShowUploadModal(false)
  }

  const handleAnalyze = (datasetId: number) => {
    dispatch(triggerAnalysisThunk(datasetId))
  }

  const handleViewReport = (datasetId: number) => {
    dispatch(fetchReportThunk(datasetId))
  }

  const renderStatusBadge = (status: Dataset['status']) => {
    const badgeStyle = {
      uploaded: 'bg-amber-50 text-amber-700 border-amber-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      failed: 'bg-rose-50 text-rose-700 border-rose-200'
    }[status]

    const statusLabel = {
      uploaded: 'Загружен',
      processing: 'Анализ...',
      completed: 'Готов',
      failed: 'Ошибка'
    }[status]

    return (
      <span className={`px-2.5 py-1 rounded-[6px] text-xs font-medium border ${badgeStyle}`}>
        {statusLabel}
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-slate-900 tracking-tight">
            Управление датасетами
          </h2>
          <p className="text-xs font-regular text-slate-500 mt-0.5">
            Загрузка логов и запуск автоматической нейросетевой категоризации
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-[#18191c] hover:bg-slate-800 text-white font-medium text-xs rounded-[6px] transition-all flex items-center gap-2 shadow-sm"
        >
          <span>➕ Загрузить датасет</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {activeAnalysisRun && activeAnalysisRun.status !== 'completed' && (
        <div className="bg-white p-5 rounded-[6px] border border-slate-100 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#22b24c] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22b24c] animate-ping"></span>
              Выполняется векторная кластеризация...
            </span>
            <span className="text-[#22b24c] font-mono">
              {activeAnalysisRun.job?.progress || 0}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-[6px] overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-[#22b24c] rounded-[6px] transition-all duration-300"
              style={{ width: `${activeAnalysisRun.job?.progress || 0}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[6px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-medium text-slate-800 uppercase tracking-wider">
            Список датасетов ({datasets.length})
          </h3>
        </div>

        {isLoading && datasets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-regular">
            Загрузка датасетов...
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-regular space-y-3">
            <span className="text-3xl block">📁</span>
            <p>Нет загруженных датасетов.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#22b24c] hover:bg-[#1ea143] text-white font-medium text-xs rounded-[6px]"
            >
              Загрузить первый файл
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-medium">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Название</th>
                  <th className="px-5 py-3.5 font-medium">Формат</th>
                  <th className="px-5 py-3.5 font-medium">Размер</th>
                  <th className="px-5 py-3.5 font-medium">Строк</th>
                  <th className="px-5 py-3.5 font-medium">Статус</th>
                  <th className="px-5 py-3.5 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {datasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      <div className="font-medium text-slate-900">{ds.name}</div>
                      <div className="text-[10px] font-regular text-slate-400">
                        {new Date(ds.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono uppercase text-[#22b24c]">{ds.file_format}</td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {(ds.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">{ds.rows_count || '-'}</td>
                    <td className="px-5 py-4">{renderStatusBadge(ds.status)}</td>
                    <td className="px-5 py-4 text-right">
                      {ds.status === 'completed' ? (
                        <button
                          onClick={() => handleViewReport(ds.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-[6px] text-xs font-medium transition-colors"
                        >
                          📄 Отчёт
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAnalyze(ds.id)}
                          disabled={isAnalyzing || ds.status === 'processing'}
                          className="px-3 py-1.5 bg-[#22b24c]/10 hover:bg-[#22b24c]/20 text-[#22b24c] border border-[#22b24c]/20 rounded-[6px] text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {ds.status === 'processing' ? 'Анализ...' : '🚀 Запустить'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[6px] p-6 border border-slate-100 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-medium text-slate-900">Загрузка датасета промптов</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
                  Файл датасета (CSV, JSON, JSONL, TXT)
                </label>
                <input
                  type="file"
                  required
                  accept=".csv,.json,.jsonl,.txt"
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] p-2.5 text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-medium file:bg-[#22b24c] file:text-white hover:file:bg-[#1ea143]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
                  Название датасета
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Например: Промпты разработчиков Q3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#22b24c]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
                  Имя колонки с промптами
                </label>
                <input
                  type="text"
                  value={textColumn}
                  onChange={(e) => setTextColumn(e.target.value)}
                  placeholder="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#22b24c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2.5 bg-[#22b24c] hover:bg-[#1ea143] text-white font-medium text-xs rounded-[6px] disabled:opacity-50"
                >
                  {isUploading ? 'Загрузка...' : 'Загрузить файл'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
