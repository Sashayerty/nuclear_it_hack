import type { Organization, Dataset, DatasetReport, DashboardData } from './types'

const MOCK_ORGS_KEY = 'mock_organizations_v1'
const MOCK_DATASETS_KEY = 'mock_datasets_v1'

const defaultOrgs: (Organization & { pass?: string })[] = [
    {
        id: 1,
        name: 'ООО "Цифронит"',
        created_at: new Date(Date.now()).toISOString(),
        pass: '12345678'
    },
]

export const getMockOrganizations = (): (Organization & { pass?: string })[] => {
    const stored = localStorage.getItem(MOCK_ORGS_KEY)
    if (!stored) {
        localStorage.setItem(MOCK_ORGS_KEY, JSON.stringify(defaultOrgs))
        return defaultOrgs
    }
    try {
        return JSON.parse(stored)
    } catch {
        return defaultOrgs
    }
}

export const saveMockOrganization = (name: string, pass: string): Organization => {
    const orgs = getMockOrganizations()
    const newOrg = {
        id: Date.now(),
        name,
        created_at: new Date().toISOString(),
        pass
    }
    const updated = [newOrg, ...orgs]
    localStorage.setItem(MOCK_ORGS_KEY, JSON.stringify(updated))
    return newOrg
}

export const deleteMockOrganization = (id: number): void => {
    const orgs = getMockOrganizations()
    const updated = orgs.filter((o) => o.id !== id)
    localStorage.setItem(MOCK_ORGS_KEY, JSON.stringify(updated))
}

const defaultDatasets: Dataset[] = [
    {
        id: 101,
        name: 'Логи обращений клиентов ООО Цифронит (Июль 2026)',
        file_format: 'csv',
        file_size_bytes: 4280590,
        rows_count: 14250,
        status: 'completed',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        processed_at: new Date(Date.now() - 3600000 * 11).toISOString()
    },
    {
        id: 102,
        name: 'Выгрузка тикетов техподдержки Q2',
        file_format: 'json',
        file_size_bytes: 2150900,
        rows_count: 5800,
        status: 'uploaded',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
]

export const getMockDatasets = (): Dataset[] => {
    const stored = localStorage.getItem(MOCK_DATASETS_KEY)
    if (!stored) {
        localStorage.setItem(MOCK_DATASETS_KEY, JSON.stringify(defaultDatasets))
        return defaultDatasets
    }
    try {
        return JSON.parse(stored)
    } catch {
        return defaultDatasets
    }
}

export const addMockDataset = (name: string, sizeBytes: number): Dataset => {
    const datasets = getMockDatasets()
    const newDs: Dataset = {
        id: Date.now(),
        name: name || 'dataset_upload.csv',
        file_format: name.endsWith('.json') ? 'json' : 'csv',
        file_size_bytes: sizeBytes || 1540000,
        rows_count: Math.floor(Math.random() * 8000) + 2000,
        status: 'uploaded',
        created_at: new Date().toISOString()
    }
    const updated = [newDs, ...datasets]
    localStorage.setItem(MOCK_DATASETS_KEY, JSON.stringify(updated))
    return newDs
}

export const updateMockDatasetStatus = (id: number, status: Dataset['status']): Dataset | null => {
    const datasets = getMockDatasets()
    const ds = datasets.find((d) => d.id === id)
    if (ds) {
        ds.status = status
        if (status === 'completed') {
            ds.processed_at = new Date().toISOString()
        }
        localStorage.setItem(MOCK_DATASETS_KEY, JSON.stringify(datasets))
        return ds
    }
    return null
}

export const HUGE_MOCK_JSON_REPORT: DatasetReport = {
    dataset: {
        id: 101,
        name: 'Логи обращений клиентов ООО "Цифронит" (Июль 2026)',
        rows_count: 14250
    },
    analysis: {
        id: 8841,
        started_at: '2026-07-25T18:00:00Z',
        finished_at: '2026-07-25T18:01:14Z'
    },
    report: [
        {
            category_name: '🔑 Авторизация, Доступ и Учетные Записи',
            total_requests: 4820,
            use_cases: [
                {
                    use_case_name: 'Восстановление пароля и сброс двухфакторной аутентификации (2FA)',
                    queries_count: 2940,
                    automation_potential: 'Высокий (95%)',
                    pain_points: [
                        'Не приходят СМС с кодом подтверждения на номера региональных операторов',
                        'Долгая валидация при смене привязанного номера телефона (до 48 часов)',
                        'Пользователи путают логин компании и личный E-mail'
                    ],
                    suggested_actions: [
                        'Внедрить автоматический Telegram-бот автовосстановления доступа через ЕГОСУСЛУГИ/СБЕР',
                        'Добавить валидатор формата ИНН и номера телефона на этапе ввода логина',
                        'Настроить резервный SMS-шлюз для операторов сотовой связи'
                    ],
                    broken_queries: [
                        { query: 'не могу войти пишет ошибка 403 хотя пароль правильный 12345678', reason: 'Заблокирован IP из-за частоты запросов' },
                        { query: 'сбросить пароль ООО Цифронит инн 12345678 письмо не приходит', reason: 'Почта попала в спам-фильтр сервиса' }
                    ]
                },
                {
                    use_case_name: 'Управление правами сотрудников и ролями в личном кабинете',
                    queries_count: 1880,
                    automation_potential: 'Средний (75%)',
                    pain_points: [
                        'Отсутствует массовое добавление пользователей через Excel/CSV файл',
                        'Администратор организации не может самостоятельно сбросить сессию сотрудника'
                    ],
                    suggested_actions: [
                        'Создать интерфейс импорта списка сотрудников из CSV в панели администрирования ООО "Цифронит"',
                        'Добавить кнопку «Завершить все сеансы» в профиле управления компанией'
                    ]
                }
            ]
        },
        {
            category_name: '💳 Финансы, Акты, Оплата и СБП',
            total_requests: 3910,
            use_cases: [
                {
                    use_case_name: 'Запрос закрывающих документов (Акты сверки, УПД, Счета)',
                    queries_count: 2450,
                    automation_potential: 'Максимальный (99%)',
                    pain_points: [
                        'Бухгалтерия запрашивает оригиналы с печатью по почте России',
                        'Долгая выгрузка УПД за прошлые периоды (более 1 года)',
                        'Несоответствие КПП в сформированных счетах для филиалов'
                    ],
                    suggested_actions: [
                        'Автоматическая интеграция с ЭДО (Диадок / СБИС) для ООО "Цифронит"',
                        'Добавить кнопку «Скачать пакет документов за квартал в 1 клик»'
                    ],
                    broken_queries: [
                        { query: 'где акт за июнь 2026 ООО Цифронит скиньте на почту срочно!', reason: 'Отсутствует интеграция почтового бота' }
                    ]
                },
                {
                    use_case_name: 'Ошибки и задержки при оплате через СБП и Корпоративные карты',
                    queries_count: 1460,
                    automation_potential: 'Высокий (85%)',
                    pain_points: [
                        'Таймаут эквайринга при платежах свыше 500 000 рублей',
                        'Статус платежа "В обработке" зависает на 20 минут'
                    ],
                    suggested_actions: [
                        'Внедрить вебхук мгновенного уведомления о статусе транзакции',
                        'Выводить подробный статус платежа в виджете личного кабинета'
                    ]
                }
            ]
        },
        {
            category_name: '⚙️ Интеграция API, Webhooks и Техническая Поддержка',
            total_requests: 3520,
            use_cases: [
                {
                    use_case_name: 'Превышение лимитов API (Rate Limiting 429) и ошибки векторизации',
                    queries_count: 2100,
                    automation_potential: 'Высокий (90%)',
                    pain_points: [
                        'Разработчики не получают алерт перед исчерпанием месячного лимита токенов',
                        'Отсутствие детальных логов ошибок нейросети в ответах API'
                    ],
                    suggested_actions: [
                        'Внедрить автоматический Email & Telegram уведомитель при достижении 80% лимита',
                        'Обновить OpenAPI документацию с примерами кодов ответов Ollama / LLM'
                    ]
                },
                {
                    use_case_name: 'Настройка взаимодействия с локальными моделями Ollama (Gemma2)',
                    queries_count: 1420,
                    automation_potential: 'Высокий (88%)',
                    pain_points: [
                        'Задержка ответа локальной модели gemma2:2b при высокой нагрузке',
                        'Необходимость форматирования ответа строго в Pydantic JSON'
                    ],
                    suggested_actions: [
                        'Использовать асинхронный пул запросов к Ollama API',
                        'Кэшировать повторяющиеся эмбеддинги в Redis'
                    ]
                }
            ]
        },
        {
            category_name: '📈 Развитие Сервиса и Новые Пожелания Потребителей',
            total_requests: 2000,
            use_cases: [
                {
                    use_case_name: 'Запрос встроенных дашбордов и экспорт отчетов в PDF/Excel',
                    queries_count: 2000,
                    automation_potential: 'Средний (70%)',
                    pain_points: [
                        'Пользователям неудобно копировать графики скриншотами для презентаций руководство'
                    ],
                    suggested_actions: [
                        'Добавить генерацию стильного PDF отчета с диаграммами в один клик'
                    ]
                }
            ]
        }
    ]
}

export const MOCK_DASHBOARD_DATA: DashboardData = {
    total_requests: 14250,
    analyzed_datasets: 12,
    organization: {
        id: 1,
        name: 'ООО "Цифронит"'
    },
    broken_queries_count: 420,
    categories: [
        { name: '🔑 Авторизация и Доступ', requests: 4820, percentage: 33.8 },
        { name: '💳 Финансы и Оплата', requests: 3910, percentage: 27.4 },
        { name: '⚙️ Интеграция API и ИИ', requests: 3520, percentage: 24.7 },
        { name: '📈 Пожелания по функционалу', requests: 2000, percentage: 14.1 }
    ],
    top_use_cases: [
        { name: 'Восстановление доступа и 2FA', requests: 2940 },
        { name: 'Запрос закрывающих УПД и Актов', requests: 2450 },
        { name: 'Превышение API Rate Limits (429)', requests: 2100 },
        { name: 'Сбои СБП эквайринга', requests: 1460 }
    ],
    top_pain_points: [
        { text: 'Не приходят SMS при сбросе пароля на номера региональных операторов', mentions: 890 },
        { text: 'Бухгалтерия запрашивает оригиналы УПД с печатью по Почте России', mentions: 640 },
        { text: 'Таймаут ответа при вызове векторизации Ollama gemma2:2b', mentions: 510 },
        { text: 'Зависание статуса оплаты через СБП на 20 минут', mentions: 380 }
    ],
    automation_candidates: [
        {
            name: 'Авто-выгрузка Актов сверки и УПД через ЭДО (Диадок / СБИС)',
            requests: 2450,
            automation_potential: '99%',
            suggested_actions: [
                'Внедрить модуль автоматической отправки электронных УПД',
                'Сократит нагрузку на бухгалтерию ООО "Цифронит" на 80%'
            ]
        },
        {
            name: 'Smart-бот сброса 2FA и восстановления паролей',
            requests: 2940,
            automation_potential: '95%',
            suggested_actions: [
                'Подключить верификацию через Госуслуги / СберID',
                'Автоматически снизит кол-во тикетов поддержки на 30%'
            ]
        }
    ]
}
