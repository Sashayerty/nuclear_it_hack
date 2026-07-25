import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginOrgThunk, loginAdminThunk, clearError } from '../store/slices/authSlice'

export const AuthPage = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  const [selectedRole, setSelectedRole] = useState<'org' | 'admin' | null>(null)
  const [mode, setMode] = useState<'org' | 'admin'>('org')
  const [isRegister, setIsRegister] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgPassword, setOrgPassword] = useState('')
  const [adminLogin, setAdminLogin] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const handleOrgSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(loginOrgThunk({ name: orgName, password: orgPassword }))
  }

  const handleAdminSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(loginAdminThunk({ login: adminLogin, password: adminPassword }))
  }

  return (
    <div
      className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/images/bg_auth.png')` }}
    >
      <div className="w-full max-w-[580px] min-h-[600px] flex flex-col justify-between p-8 md:p-6 rounded-l-[17px] rounded-r-none bg-white text-slate-800 border border-slate-100 ml-auto my-auto shadow-2xl">
        <div className="w-full flex items-center justify-between pb-4">
          {selectedRole !== null && !isRegister ? (
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="text-xs font-bold text-black px-5 py-3 bg-black/5 rounded-[6px] flex items-center gap-1"
            >
              Сменить роль
            </button>
          ) : (
            <div></div>
          )}
        </div>

        {selectedRole === null && !isRegister ? (
          <div className="w-full max-w-lg mx-auto my-auto flex flex-col justify-center py-4">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Выберите роль</h3>
              <p className="text-[15px] text-slate-400 font-regular mt-1">Чтобы войти в аккаунт</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div
                onClick={() => {
                  setMode('org')
                  setSelectedRole('org')
                  dispatch(clearError())
                }}
                className="cursor-pointer border border-slate-100 bg-[#F8FAFC] rounded-[12px] p-4 flex flex-col justify-between transition-all duration-200"
              >
                <div className="text-[15px] font-bold text-slate-900 mb-2">
                  Организация
                </div>
                <div className="w-full h-44 flex items-center justify-center p-1">
                  <img
                    src="/images/auth_illustration_1.png"
                    alt="Организация"
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />
                </div>
              </div>

              <div
                onClick={() => {
                  setMode('admin')
                  setSelectedRole('admin')
                  dispatch(clearError())
                }}
                className="cursor-pointer border border-slate-100 bg-[#F8FAFC] rounded-[12px] p-4 flex flex-col justify-between transition-all duration-200"
              >
                <div className="text-[15px] font-bold text-slate-900 mb-2">
                  Администратор
                </div>
                <div className="w-full h-44 flex items-center justify-center p-1">
                  <img
                    src="/images/auth_illustration_2.png"
                    alt="Администратор"
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="text-[14px] text-center mt-8">
              <span>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="cursor-pointer text-[#22b24c] font-semibold hover:underline"
                >
                  Зарегистрироваться
                </button>
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto my-auto flex flex-col justify-center py-4">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isRegister
                  ? 'Регистрация организации'
                  : 'Добро пожаловать!'}
              </h3>
              <p className="text-[14px] text-slate-500 font-regular mt-1">
                {isRegister
                  ? 'Введите данные вашей компании для создания аккаунта'
                  : 'Пожалуйста, введите ваши данные для входа в систему'}
              </p>
            </div>

            {auth.error && (
              <div className="mb-4 p-3 rounded-[6px] border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
                <span>{auth.error}</span>
              </div>
            )}

            {mode === 'org' || isRegister ? (
              <form onSubmit={handleOrgSubmit} className="space-y-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Название организации
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Например: Росатом ИТ"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#22b24c] focus:bg-white rounded-[6px] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Пароль</label>
                  </div>
                  <input
                    type="password"
                    required
                    value={orgPassword}
                    onChange={(e) => setOrgPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#22b24c] focus:bg-white rounded-[6px] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 pb-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-[6px] border-slate-300 text-[#22b24c] bg-white focus:ring-[#22b24c] cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Запомнить меня
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={auth.isLoading}
                  className="w-full py-3.5 px-4 bg-[#22b24c] hover:bg-[#1ea143] active:bg-[#1b913c] text-white font-bold text-sm rounded-[6px] transition-all flex items-center justify-center gap-2 group"
                >
                  {auth.isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isRegister ? (
                    <>
                      <span>Зарегистрироваться</span>
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                        →
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Войти</span>
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Логин
                  </label>
                  <input
                    type="text"
                    required
                    value={adminLogin}
                    onChange={(e) => setAdminLogin(e.target.value)}
                    placeholder="Логин"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#22b24c] focus:bg-white rounded-[6px] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Пароль администратора</label>
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#22b24c] focus:bg-white rounded-[6px] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 pb-1">
                  <input
                    type="checkbox"
                    id="rememberAdmin"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-[6px] border-slate-300 text-[#22b24c] bg-white focus:ring-[#22b24c] cursor-pointer"
                  />
                  <label htmlFor="rememberAdmin" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Запомнить меня
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={auth.isLoading}
                  className="w-full py-3.5 px-4 bg-[#22b24c] hover:bg-[#1ea143] active:bg-[#1b913c] text-white font-bold text-sm rounded-[6px] transition-all flex items-center justify-center gap-2 group"
                >
                  {auth.isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Войти как администратор</span>
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-[14px] text-center mt-6">
              {isRegister ? (
                <span>
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-regular cursor-pointer text-[#22b24c] hover:underline"
                  >
                    Войти
                  </button>
                </span>
              ) : (
                <span>
                  Нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-regular cursor-pointer text-[#22b24c] hover:underline"
                  >
                    Зарегистрироваться
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex items-center justify-between pt-4 text-[12px] font-regular text-slate-500">
          <span>© 2026</span>
          <div className="flex items-center gap-3">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
