import React, { useState, useMemo } from 'react'
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  CheckSquare,
  Square,
  BarChart2,
  Zap,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Filter,
  FileText,
  ChevronRight,
  MessageSquareQuote,
  Activity,
  ArrowUpRight
} from 'lucide-react'

interface UseCase {
  use_case_name: string
  queries_count: number
  examples: string[]
  description: string
  typical_phrases: string[]
  pain_points: string[]
  broken_queries: string[]
  automation_potential: string
  suggested_actions: string[]
}

interface CategoryData {
  category_name: string
  total_requests: number
  use_cases: UseCase[]
}

const DASHBOARD_DATA: CategoryData[] = [
  {
    category_name: "Аналитика и обработка данных",
    total_requests: 3,
    use_cases: [
      {
        use_case_name: "Ежедневный и еженедельный анализ входящих данных для оперативного планирования",
        queries_count: 3,
        examples: [
          "сделай репорт по тендерам за неделю для отдела продаж чтобы планировать работу",
          "проанализируй входящие за сегодня и выдай структурированную выжимку, что срочно",
          "проанализируй входящие за сегодня и выдай структурированную выжимку, что срочно"
        ],
        description: "Анализ запросов пользователей для кластера логов 'Ежедневный и еженедельный анализ входящих данных для оперативного планирования'.",
        typical_phrases: [
          "сделай репорт по тендерам за неделю для отдела продаж чтобы планировать работу",
          "проанализируй входящие за сегодня и выдай структурированную выжимку, что срочно"
        ],
        pain_points: [
          "Необходимость агрегировать данные (тендеры) для стратегического планирования (планирование работы).",
          "Потребность в быстром выявлении критически важных/срочных задач из большого объема входящих данных.",
          "Недостаток готовых, структурированных отчетов и выжимок, требующих ручной обработки."
        ],
        broken_queries: [
          "сделай репорт по тендерам за неделю для отдела продаж чтобы планировать работу",
          "проанализируй входящие за сегодня и выдай структурированную выжимку, что срочно",
          "проанализируй входящие за сегодня и выдай структурированную выжимку, что срочно"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Технические шаги (Архитектура и Инструменты):**",
          "1. **Интеграция с источниками данных:** Определить и настроить API-интерфейсы для бесшовного извлечения логов (например, от ELK Stack, Splunk, Prometheus) и пользовательских запросов (Jira, Zendesk).",
          "2. **Разработка ИИ-модели анализа:** Создать или адаптировать LLM/ML модель, способную выполнять не только агрегацию, но и семантический анализ логов и запросов.",
          "3. **Создание Агента-Планировщика:** Разработать ИИ-агента, который генерирует проактивные рекомендации по планированию.",
          "4. **Автоматизация отчетности:** Автоматизировать генерацию еженедельных/ежедневных сводок с использованием ИИ.",
          "**Управленческие шаги (Пользовательский опыт и Доверие):**",
          "1. **Определение Метрик Успеха:** Четко определить критерии качества и точности оперативного планирования.",
          "2. **Прозрачность и Объяснимость (Explainability):** Обеспечить, чтобы ИИ объяснял причины формирования рекомендаций.",
          "3. **Контроль Качества (Human-in-the-Loop):** Внедрить обязательный этап валидации человеком перед финальным утверждением.",
          "4. **Поэтапное Внедрение:** Начать с анализа исторических данных в пассивном режиме."
        ]
      }
    ]
  },
  {
    category_name: "Управление задачами и проектами",
    total_requests: 42,
    use_cases: [
      {
        use_case_name: "Автоматизация рабочего процесса и управление задачами (Workflow & Task Management Automation)",
        queries_count: 42,
        examples: [
          "переведи письма от клиента в задачи на личной доске Project",
          "добавь новый тикет в ИСУП и обнови статус в задаче TASK-9000",
          "выведи таски из джиры которые на меня назначены"
        ],
        description: "Анализ запросов пользователей для кластера 'Автоматизация рабочего процесса и управление задачами (Workflow & Task Management Automation)'",
        typical_phrases: [
          "переведи письма от клиента в задачи на личной доске Project",
          "добавить новый тикет в ИСУП и обновить статус в задаче TASK-9000",
          "выведи таски из джиры которые на меня назначены",
          "сформировать excel отчет по клиенту Газпром, забери нужные поля из crm",
          "создай тикеты на доске project на основе этих входящих писем",
          "создай напоминание: подготовить отчет после встречи с клиентом",
          "что у меня в Jira? хочу видеть свои задачи для планирования",
          "следи за статусами в ИСУП с периодичностью раз в день шли алерты при изменениях"
        ],
        pain_points: [
          "Необходимость ручного переноса информации между разными системами (письма -> задачи, CRM -> Excel).",
          "Отсутствие централизованного и удобного способа управления задачами и статусами (Jira, ИСУП).",
          "Проблемы с проактивным управлением временем и напоминаниями.",
          "Недостаток прозрачности в рабочих процессах.",
          "Трудности в мониторинге прогресса работы сотрудников и задач.",
          "Потребность в автоматизации рутинных операций."
        ],
        broken_queries: [
          "ты даун норм сделай"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Классификация и маршрутизация запросов (Intelligent Routing):** Использовать ИИ для автоматической классификации входящих запросов пользователей по категории процессов.",
          "**Автоматическое создание задач (Intelligent Task Generation):** Разработать агента, способного анализировать текст и генерировать тикеты в Jira / ИСУП.",
          "**Суммирование и контекстуализация (Summarization & Contextualization):** Внедрить функцию ИИ для авто-резюме цепочек писем.",
          "**Проактивное управление статусами (Proactive Status Updates):** Автоматически отслеживать переходы статусов и отправлять алерты.",
          "**Обработка неоднозначности (Ambiguity Resolution):** Задавать уточняющие вопросы при размытых формулировках."
        ]
      }
    ]
  },
  {
    category_name: "Поиск и сбор информации",
    total_requests: 29,
    use_cases: [
      {
        use_case_name: "Автоматизированный сбор и структурирование данных из CRM и внутренних систем",
        queries_count: 27,
        examples: [
          "скачай эти данные в эксель",
          "собери инфу по клиенту Сбер из CRM (поля: Email, Телефон, ФИО) и выгрузи в Excel",
          "собери инфо по коомпании Яндекс. Кто в дочерних компаниях Директор клиента?"
        ],
        description: "Автоматизированный сбор и структурирование данных из CRM и внутренних систем.",
        typical_phrases: [
          "скачай эти данные в эксель",
          "собери инфу по клиенту [Название] из CRM (поля: Email, Телефон, ФИО) и выгрузи в Excel",
          "сделай выгрузку в формат .xlsx для построения отчетов",
          "вытащи текст и материалы, которые были прикреплены к встрече",
          "найди [документ/регламент] по теме [Тема]"
        ],
        pain_points: [
          "Необходимость ручного сбора и форматирования данных (выгрузка в Excel).",
          "Сложность навигации и поиска информации в разрозненных источниках (CRM, Confluence, новости).",
          "Отсутствие структурированных ответов по сложным запросам.",
          "Необходимость агрегировать информацию из разных систем в единый формат."
        ],
        broken_queries: [
          "собери инфу по коомпании Яндекс. Кто в дочерних компаниях Директор клиента? Есть ли там выигранные сделки?",
          "кто контактное лицо в МТС? дай телефон и почту",
          "найди доку в confluence по теме Закупки",
          "найди в Confluence регламент по процессу Закупки"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Технические шаги (Архитектура и Интеграция):**",
          "1. **Определение источника данных:** Провести аудит всех CRM-систем и настроить схемы данных.",
          "2. **Разработка ETL/ELT Пайплайнов:** Создать надежные коннекторы для автоматического извлечения сущностей.",
          "3. **Стандартизация Данных:** Применить NLP для унификации разнородных полей.",
          "**Управленческие шаги (Пользовательский опыт):**",
          "1. **Создание Централизованного Хаба Данных:** Собрать все данные в единый интуитивный дашборд.",
          "2. **Прозрачность и Обратная Связь:** Внедрить интерфейс с механизмом Human-in-the-Loop."
        ]
      },
      {
        use_case_name: "Автоматизированная еженедельная отчетность по тендерам",
        queries_count: 2,
        examples: [
          "присылай мне каждую пятницу список выигранных тендеров за последние 7 дней"
        ],
        description: "Запросы пользователей, связанные с получением еженедельной отчетности по выигранным тендерам.",
        typical_phrases: [
          "присылай мне каждую пятницу список выигранных тендеров за последние 7 дней"
        ],
        pain_points: [
          "Необходимость вручную собирать и агрегировать данные из разных источников.",
          "Отсутствие автоматизации регулярной отчетности.",
          "Потребность в своевременном получении актуальной информации."
        ],
        broken_queries: [
          "присылай мне каждую пятницу список выигранных тедеров за последние 7 дней"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Технические шаги:**",
          "1. **Интеграция с источниками данных:** Настроить API-подключения к ERP и тендерным платформам.",
          "2. **Создание ИИ-агента для агрегации:** Автоматически формировать и рассылать готовые выгрузки.",
          "**Управленческие шаги:**",
          "1. **Интерактивный дашборд:** Предоставить гибкие фильтры по регионам и типам контрактов."
        ]
      }
    ]
  },
  {
    category_name: "Автоматизация и триггеры",
    total_requests: 9,
    use_cases: [
      {
        use_case_name: "Автоматизация рутинных задач и мониторинга данных",
        queries_count: 9,
        examples: [
          "следи за статусами в ИСУП с периодичностью раз в день, шли алерты при изменениях",
          "настрой рассылку фокус-группе каждую неделю: список выигранных тендеров",
          "настрой периодическое задание: мониторинг писем с расчетом цен"
        ],
        description: "Анализ запросов пользователей для сценария 'Автоматизация рутинных задач и мониторинга данных'.",
        typical_phrases: [
          "следи за статусами в ИСУП с периодичностью раз в день, шли алерты при изменениях",
          "настрой рассылку фокус-группе каждую неделю: список выигранных тендеров",
          "мониторинг писем с расчетом цен если нет ответа 2 часа - пингуй"
        ],
        pain_points: [
          "Ручное отслеживание статусов и генерация алертов.",
          "Необходимость ручного сбора данных из CRM для регулярных отчетов.",
          "Отсутствие автоматизации обработки входящих писем и последующих действий.",
          "Отсутствие проактивного мониторинга по критическим событиям."
        ],
        broken_queries: [
          "ты тупой что ли, следи за статусами в ИСУП с периодичностью раз в день, шли алерты при изменениях"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Оценка сложности и объема данных:** Провести детальный аудит текущих рутинных задач.",
          "**Разработка SMART-целей:** Установить измеримые показатели точности и скорости реакций.",
          "**Интеграция с источниками данных:** Настроить сквозную веб-хук автоматизацию.",
          "**Поэтапное внедрение:** Начать с простых алертов и переходить к сложным цепочкам."
        ]
      }
    ]
  },
  {
    category_name: "Планирование и расписание",
    total_requests: 9,
    use_cases: [
      {
        use_case_name: "Планирование и обзор расписания (Meeting & Task Scheduling)",
        queries_count: 9,
        examples: [
          "выведи список митингов на завтрашний день",
          "покажи расписание на следующий день",
          "запланируй мне задачу: подготовить отчет, сгруппируй по приоритету"
        ],
        description: "Анализ кластера логов по сценарию 'Планирование и обзор расписания (Meeting & Task Scheduling)'.",
        typical_phrases: [
          "выведи список митингов на завтрашний день",
          "покажи расписание на следующий день",
          "запланируй мне задачу: подготовить отчет, сгруппируй по приоритету"
        ],
        pain_points: [
          "Необходимость регулярно получать актуальный обзор расписания.",
          "Желание автоматизировать процесс планирования задач с приоритизацией.",
          "Потребность в быстром доступе к информации о запланированных событиях."
        ],
        broken_queries: [
          "выведи список митингов на завтрашний фастом день"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Технические шаги:**",
          "1. **Интеграция с источниками данных:** Синхронизация с Google Calendar, Outlook, Jira.",
          "2. **Семантический анализ расписания:** Определение доступных слотов и приоритетов.",
          "**Управленческие шаги:**",
          "1. **Прозрачность и управление:** Предоставление интерактивного черновика перед бронированием."
        ]
      }
    ]
  },
  {
    category_name: "Генерация текста и коммуникация",
    total_requests: 8,
    use_cases: [
      {
        use_case_name: "Управление обратной связью и мониторинг сотрудника",
        queries_count: 8,
        examples: [
          "добавь вводные для мониторинга сотрудника в заметки: проверить архитектуру",
          "напиши отзыв руководителя в CoolFeedback после мониторинга сотрудника"
        ],
        description: "Анализ запросов пользователей для сценария 'Управление обратной связью и мониторинг сотрудника'.",
        typical_phrases: [
          "добавить вводные для мониторинга сотрудника в заметки: проверить архитектуру",
          "напиши отзыв руководителя в CoolFeedback после мониторинга сотрудника",
          "набросай отзыв для coolfeedback на основе этих договоренностей"
        ],
        pain_points: [
          "Необходимость структурировать и формализовать обратную связь для сотрудников.",
          "Трудности в формулировании конструктивной обратной связи.",
          "Необходимость автоматизировать процесс документирования мониторинга.",
          "Потребность в помощи в создании форматов для различных платформ (CoolFeedback)."
        ],
        broken_queries: [
          "добавить вводные для мониторинга сотрудника в заметки: проверить архитектуру",
          "набросай отзыв для coolfeedback на сорян основе этих договоренностей: есть проблемы с тайм-менементом"
        ],
        automation_potential: "Высокий",
        suggested_actions: [
          "**Автоматизация сбора обратной связи:** Извлечение тезисов и ключевых сущностей из текстовых заметок.",
          "**Проактивное выявление проблем:** Триггеры при снижении показателей эффективности.",
          "**Безопасность данных:** Конфиденциальное хранение чувствительной оценочной информации."
        ]
      }
    ]
  }
]

export const ProductDashboard: React.FC = () => {
  const [categories] = useState<CategoryData[]>(DASHBOARD_DATA)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(
    DASHBOARD_DATA[0]?.category_name || ''
  )
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({})

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.category_name === selectedCategoryName) || categories[0]
  }, [categories, selectedCategoryName])

  const filteredUseCases = useMemo(() => {
    if (!currentCategory) return []
    if (!searchQuery.trim()) return currentCategory.use_cases
    const q = searchQuery.toLowerCase()
    return currentCategory.use_cases.filter(
      (uc) =>
        uc.use_case_name.toLowerCase().includes(q) ||
        uc.description.toLowerCase().includes(q) ||
        uc.typical_phrases.some((p) => p.toLowerCase().includes(q))
    )
  }, [currentCategory, searchQuery])

  const totalGlobalRequests = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.total_requests, 0)
  }, [categories])



  const toggleActionItem = (actionText: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionText]: !prev[actionText]
    }))
  }

  const cleanStars = (str: string) => str.replace(/\*\*/g, '')

  const isHeaderString = (str: string) => {
    const trimmed = str.trim()
    return (
      (trimmed.startsWith('**') && (trimmed.endsWith(':**') || trimmed.endsWith('**'))) ||
      trimmed.startsWith('Технические шаги') ||
      trimmed.startsWith('Управленческие шаги')
    )
  }

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 font-sans antialiased overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <aside className="w-72 bg-[#0d121f] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">Product Intelligence</h1>
              <p className="text-[11px] text-slate-400 font-medium">Аналитический Дашборд</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-800/50 bg-[#0a0e1a]/60">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Всего запросов</span>
            <span className="text-cyan-400 font-bold">{totalGlobalRequests}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Категорий анализа</span>
            <span className="text-white font-bold">{categories.length}</span>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400/80">
            Категории
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {categories.map((cat) => {
            const isActive = cat.category_name === selectedCategoryName
            return (
              <button
                key={cat.category_name}
                onClick={() => {
                  setSelectedCategoryName(cat.category_name)
                  setSelectedUseCase(null)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                      isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600 group-hover:bg-slate-400'
                    }`}
                  />
                  <span className="truncate leading-relaxed">{cat.category_name}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                  }`}
                >
                  {cat.total_requests}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-[#090d16] text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Vercel Analytics Engine
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#090d16] overflow-y-auto">
        <header className="sticky top-0 z-10 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentCategory?.category_name}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {currentCategory?.total_requests} запросов
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по сценариям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#0d121f] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d121f] border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Сценариев использования</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {currentCategory?.use_cases.length || 0}
                </span>
                <span className="text-xs text-slate-400">юзкейса в категории</span>
              </div>
            </div>

            <div className="bg-[#0d121f] border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Сумма запросов</span>
                <BarChart2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {currentCategory?.total_requests || 0}
                </span>
                <span className="text-xs text-slate-400">активных логов</span>
              </div>
            </div>

            <div className="bg-[#0d121f] border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Потенциал автоматизации</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">100%</span>
                <span className="text-xs text-emerald-500/80 font-medium">Высокий эффект</span>
              </div>
            </div>

            <div className="bg-[#0d121f] border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Проблемные запросы</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-400">
                  {currentCategory?.use_cases.reduce((acc, u) => acc + (u.broken_queries?.length || 0), 0)}
                </span>
                <span className="text-xs text-slate-400">ошибок требуют внимания</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Сценарии использования (Use Cases)
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Нажмите на карточку для просмотра детального анализа
              </span>
            </div>

            {filteredUseCases.length === 0 ? (
              <div className="bg-[#0d121f] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Filter className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium">Сценарии по вашему запросу не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredUseCases.map((useCase, index) => {
                  const isHighAutomation = useCase.automation_potential.toLowerCase().includes('высок')
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedUseCase(useCase)}
                      className="group bg-[#0d121f] border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-500/50 to-transparent transition-all duration-500" />
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                            {useCase.use_case_name}
                          </h4>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border flex items-center gap-1 ${
                              isHighAutomation
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {useCase.automation_potential}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed mb-5 line-clamp-3">
                          {useCase.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 font-mono text-[11px] font-medium border border-slate-700/50 flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            {useCase.queries_count} запросов
                          </span>
                          {useCase.broken_queries?.length > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 font-mono text-[11px] font-medium border border-rose-500/20 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {useCase.broken_queries.length} ошибок
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-cyan-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                          Детали
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedUseCase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="bg-[#0d121f] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-7 py-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-[#0a0e1a]">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Потенциал: {selectedUseCase.automation_potential}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {selectedUseCase.queries_count} запросов
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {selectedUseCase.use_case_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUseCase(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-7 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Проблематика и Сбои
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#121827] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Болевые точки (Pain Points)
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedUseCase.pain_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Сбойные и необработанные запросы (Broken Queries)
                    </h4>
                    <div className="space-y-2">
                      {selectedUseCase.broken_queries && selectedUseCase.broken_queries.length > 0 ? (
                        selectedUseCase.broken_queries.map((query, idx) => (
                          <div
                            key={idx}
                            className="bg-rose-900/30 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-200 font-mono leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-rose-400 font-bold select-none">•</span>
                            <span>"{query}"</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">Сбойные запросы не зафиксированы</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-wider">
                  <MessageSquareQuote className="w-4 h-4" />
                  Примеры и Типичные фразы
                </div>

                <div className="bg-[#121827] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Типичные формулировки пользователей
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUseCase.typical_phrases.map((phrase, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium flex items-center gap-1.5"
                        >
                          <FileText className="w-3 h-3 text-cyan-400" />
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedUseCase.examples && selectedUseCase.examples.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Реальные примеры выгрузок
                      </h4>
                      <div className="space-y-2">
                        {selectedUseCase.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="bg-[#090d16] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono flex items-center justify-between"
                          >
                            <span>{ex}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  План действий по автоматизации (To-Do List)
                </div>

                <div className="bg-[#121827] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  {selectedUseCase.suggested_actions.map((action, idx) => {
                    const isHeader = isHeaderString(action)
                    const cleaned = cleanStars(action)
                    const isChecked = !!completedActions[action]

                    if (isHeader) {
                      return (
                        <div
                          key={idx}
                          className="pt-3 first:pt-0 pb-1 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800/60 flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {cleaned}
                        </div>
                      )
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleActionItem(action)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                            : 'bg-[#090d16] border-slate-800/80 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <button className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition-colors">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <span className="text-xs leading-relaxed">{cleaned}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            <div className="px-7 py-4 border-t border-slate-800 bg-[#0a0e1a] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Нажмите на шаги плана, чтобы отметить их выполнение
              </span>
              <button
                onClick={() => setSelectedUseCase(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-cyan-500/20"
              >
                Закрыть окно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
