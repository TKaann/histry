import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import './AuthPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.identifier, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth container">
      <div className="auth__card card">
        <h1 className="auth__title">{t('auth.login_title')}</h1>
        <form onSubmit={handle} className="auth__form">
          <label className="auth__label">Kullanıcı adı veya e-posta</label>
          <input className="auth__input" type="text" required
            placeholder="kullaniciadi veya ornek@mail.com"
            value={form.identifier}
            onChange={e => setForm({ ...form, identifier: e.target.value })} />

          <label className="auth__label">{t('auth.password')}</label>
          <input className="auth__input" type="password" required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="submit" disabled={loading}>
            {loading ? '...' : t('auth.login_btn')}
          </button>
        </form>
        <p className="auth__switch">
          {t('auth.no_account')} <Link to="/register">{t('auth.register_btn')}</Link>
        </p>
      </div>
    </div>
  )
}
