import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import './AuthPage.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth container">
      <div className="auth__card card">
        <h1 className="auth__title">{t('auth.register_title')}</h1>
        <form onSubmit={handle} className="auth__form">
          <label className="auth__label">{t('auth.username')}</label>
          <input className="auth__input" type="text" required minLength={3}
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />

          <label className="auth__label">{t('auth.email')}</label>
          <input className="auth__input" type="email" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

          <label className="auth__label">{t('auth.password')}</label>
          <input className="auth__input" type="password" required minLength={6}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="submit" disabled={loading}>
            {loading ? '...' : t('auth.register_btn')}
          </button>
        </form>
        <p className="auth__switch">
          {t('auth.has_account')} <Link to="/login">{t('auth.login_btn')}</Link>
        </p>
      </div>
    </div>
  )
}
