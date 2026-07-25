import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/dashboardSlice'

export const ReportPage = () => {
  const dispatch = useAppDispatch()
  const { currentReport, isReportLoading } = useAppSelector((state) => state.dashboard)

  if (isReportLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-10 w-10 border-4 border-[#7cb0f8] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Загрузка отчёта анализа с бэкенда...</p>
      </div>
    )
  }

  if (!currentReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-lg border border-slate-100 p-12 text-center shadow-sm space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#7cb0f8] flex items-center justify-center text-xl font-bold">
          📑
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-semibold text-slate-900">Отчёт не выбран</h3>
          <p className="text-xs text-slate-500">
            Перейдите в раздел «Датасеты» и нажмите кнопку «📄 Отчёт» у обработанного датасета, чтобы загрузить аналитический отчёт.
          </p>
        </div>
        <button
          onClick={() => dispatch(setActiveTab('datasets'))}
          className="px-4 py-2 bg-[#7cb0f8] hover:bg-[#689fe7] text-white text-xs font-medium rounded-md transition-colors shadow-sm"
        >
          Перейти к датасетам →
        </button>
      </div>
    )
  }

  const { dataset, analysis, report } = currentReport

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Отчёт анализа: {dataset.name}</h2>
            <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Завершено
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Анализ ID #{analysis.id} | Обработано строк: {dataset.rows_count || '—'}
          </p>
        </div>

        <button
          onClick={() => dispatch(setActiveTab('datasets'))}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors"
        >
          ← Все датасеты
        </button>
      </div>

      <div className="space-y-6">
        {report && report.length > 0 ? (
          report.map((cat, cIdx) => (
            <div key={cIdx} className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">{cat.category_name}</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-600">
                  Всего запросов: {cat.total_requests}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.use_cases.map((uc, uIdx) => (
                  <div key={uIdx} className="p-4 rounded-lg bg-slate-50/70 border border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">{uc.use_case_name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        {uc.automation_potential || 'Нормальный'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Количество запросов: <strong className="text-slate-800">{uc.queries_count}</strong>
                    </div>

                    {uc.pain_points && uc.pain_points.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Проблемы пользователей:</span>
                        <ul className="text-[11px] text-rose-600 list-disc list-inside space-y-0.5">
                          {uc.pain_points.map((p, pIdx) => (
                            <li key={pIdx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {uc.suggested_actions && uc.suggested_actions.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Рекомендации:</span>
                        <ul className="text-[11px] text-slate-700 list-disc list-inside space-y-0.5">
                          {uc.suggested_actions.map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {uc.broken_queries && uc.broken_queries.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-rose-100">
                        <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Сломанные запросы:</span>
                        <div className="space-y-1">
                          {uc.broken_queries.map((bq, bIdx) => (
                            <div key={bIdx} className="p-2 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-800">
                              <div className="font-mono">{bq.query}</div>
                              {bq.reason && <div className="text-[10px] text-rose-500 mt-0.5">Причина: {bq.reason}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 bg-white rounded-lg border border-slate-100 text-center text-xs text-slate-500 font-medium">
            В отчёте пока нет сформированных данных по категориям.
          </div>
        )}
      </div>
    </div>
  )
}
