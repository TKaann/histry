import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { locale, setLocale, t } = useLocale()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">{t('nav.title')}</Link>

      <div className="navbar__right">
        <button
          className="navbar__locale"
          onClick={() => setLocale(locale === 'tr' ? 'en' : 'tr')}
          title="Switch language"
        >
          {locale === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
        </button>

        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="navbar__link">{t('nav.admin')}</Link>
            )}
            {(user.isSuggestionApproved || user.role === 'ADMIN') && (
              <Link to="/suggest" className="navbar__link">{t('nav.suggest')}</Link>
            )}
            <span className="navbar__user">@{user.username}</span>
            <button className="navbar__btn navbar__btn--ghost" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar__btn">{t('nav.login')}</Link>
        )}
      </div>
    </nav>
  )
}
