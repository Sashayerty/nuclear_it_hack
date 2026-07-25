import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginOrgThunk, loginAdminThunk, clearError } from '../store/slices/authSlice'

interface FloatingInputProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (val: string) => void
  iconSrc?: string
  required?: boolean
  autoFocus?: boolean
}

const FloatingInput = ({
  id,
  label,
  type,
  value,
  onChange,
  iconSrc,
  required = true,
  autoFocus = false
}: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const isFloating = isFocused || value.length > 0

  return (
    <div
      className={`relative w-full border rounded-[11px] px-4 py-1 flex items-center gap-3.5 transition-all bg-white min-h-[56px] ${isFocused ? 'border-[#10c885] ring-1 ring-[#10c885]/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
        }`}
    >
      {iconSrc && (
        <>
          <img src={iconSrc} alt={label} className="w-4 h-4 shrink-0 opacity-70 object-contain" />
          <div className="w-[1px] h-6 bg-slate-200 shrink-0 my-auto" />
        </>
      )}

      <div className="relative w-full flex flex-col justify-center h-full min-w-0">
        <label
          htmlFor={id}
          className={`absolute left-0 right-2 truncate transition-all duration-200 pointer-events-none select-none ${isFloating
            ? 'top-0.5 text-[10px] font-normal text-[#000000]/50'
            : 'top-1.5 text-[15px] text-[#000000]/50 font-normal'
            }`}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          className={`w-full bg-transparent text-[15px] text-slate-900 font-semibold outline-none transition-all ${isFloating ? 'pt-3.5 pb-0.5' : 'pt-2 pb-0.5'
            }`}
        />
      </div>
    </div>
  )
}

export const AuthPage = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)


  const [activeTab, setActiveTab] = useState<'admin' | 'org'>('admin')
  const [step, setStep] = useState<1 | 2>(1)

  const [adminLogin, setAdminLogin] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgPassword, setOrgPassword] = useState('')


  const handleStep1 = (e: FormEvent) => {
    e.preventDefault()
    if (activeTab === 'admin' && adminLogin.trim()) {
      setStep(2)
    } else if (activeTab === 'org' && orgName.trim()) {
      setStep(2)
    }
  }

  const handleStep2 = (e: FormEvent) => {
    e.preventDefault()
    if (activeTab === 'admin') {
      dispatch(loginAdminThunk({ login: adminLogin, password: adminPassword }))
    } else {
      dispatch(loginOrgThunk({ name: orgName, password: orgPassword }))
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-start relative font-sans selection:bg-[#10c885] selection:text-white bg-black overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/images/bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/45 z-[1] pointer-events-none" />

      <div className="relative z-10 w-full h-full max-w-[480px] bg-white p-1 flex flex-col justify-between overflow-y-auto border-r border-white/20">
        <div className="w-full p-6 md:px-11 pt-15 pb-11 flex flex-col justify-between h-full">
          <div className="flex justify-center mb-8">
            <img src="/images/orvix-logo.png" alt="ORVIX" className="h-4 object-contain" />
          </div>

          <div className="my-auto w-full">

            <div className="text-center mb-6">
              <h2 className="text-[25px] font-semibold text-[#111111] tracking-tight mb-1">
                Добро пожаловать
              </h2>
              <p className="text-[15px] text-[#888888]/70">
                {step === 1 ? 'Введите данные вашей учётной записи' : 'Введите пароль для входа'}
              </p>
            </div>

            <div className="w-full bg-[#f2f2f2] p-0.5 rounded-[11px] flex gap-1 mb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin')
                  setStep(1)
                  dispatch(clearError())
                }}
                className={`flex-1 py-3 text-xs cursor-pointer font-semibold rounded-[8px] transition-all ${activeTab === 'admin' ? 'bg-white text-[#111111]' : 'text-[#888888]'
                  }`}
              >
                Администратор
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('org')
                  setStep(1)
                  dispatch(clearError())
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-[8px] transition-all ${activeTab === 'org'
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#888888] hover:text-slate-700'
                  }`}
              >
                Организация
              </button>
            </div>

            {auth.error && (
              <div className="mb-4 p-3 rounded-[11px] absolute bg-rose-50 text-rose-700 text-xs font-medium left-30 top-10 items-center gap-2">
                <span>{auth.error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1} className="space-y-2">
                {activeTab === 'admin' ? (
                  <FloatingInput
                    id="admin-login"
                    label="Почта"
                    type="text"
                    value={adminLogin}
                    onChange={setAdminLogin}
                    iconSrc="/images/email.svg"
                    autoFocus
                  />
                ) : (
                  <FloatingInput
                    id="org-name"
                    label="Название организации"
                    type="text"
                    value={orgName}
                    onChange={setOrgName}
                    autoFocus
                  />
                )}

                <button
                  type="submit"
                  className="w-full cursor-pointer h-[52px] bg-[#10c885] hover:bg-[#0eb779] active:bg-[#0ca76e] text-white font-semibold text-sm rounded-[11px] transition-all flex items-center justify-center gap-2 shadow-sm mt-4"
                >
                  <span>Продолжить</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2} className="space-y-4">
                {activeTab === 'admin' ? (
                  <FloatingInput
                    id="admin-password"
                    label="Пароль"
                    type="password"
                    value={adminPassword}
                    onChange={setAdminPassword}
                    iconSrc="/images/password.svg"
                    autoFocus
                  />
                ) : (
                  <FloatingInput
                    id="org-password"
                    label="Пароль"
                    type="password"
                    value={orgPassword}
                    onChange={setOrgPassword}
                    iconSrc="/images/password.svg"
                    autoFocus
                  />
                )}

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-[52px] cursor-pointer px-5 border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold text-xs rounded-[11px] transition-all flex items-center justify-center shrink-0"
                  >
                    Назад
                  </button>

                  <button
                    type="submit"
                    disabled={auth.isLoading}
                    className="flex-1 cursor-pointer h-[52px] bg-[#10c885] hover:bg-[#0eb779] active:bg-[#0ca76e] text-white font-semibold text-sm rounded-[11px] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {auth.isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Войти</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-[#888888]/80 leading-relaxed mt-6">
            Вы входите в систему и принимаете наши условия{' '}
            <button type="button" className="text-[#888888]/80 underline cursor-pointer font-medium">
              Политики конфиденциальности
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
