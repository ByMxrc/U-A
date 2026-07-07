import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, DEMO_USERS } from '../context/AppContext';

export default function LoginPage() {
  const {
    t, currentLang, setCurrentLang,
    login,
    showToast, setScreenReaderText,
    accPanelOpen, setAccPanelOpen,
    accContrast, setAccContrast,
    accFontSize, setAccFontSize,
    accSpacing, setAccSpacing,
    accReduceMotion, setAccReduceMotion,
    accDyslexia, setAccDyslexia,
    accGrayscale, setAccGrayscale,
    accUnderlineLinks, setAccUnderlineLinks,
  } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let valid = true;
    setAuthError('');

    if (!email.includes('@') || !email.includes('.') || email.trim().length < 5) {
      setEmailError(currentLang === 'es'
        ? '⚠ El correo debe tener el formato usuario@dominio.com (ej: nombre@evento.com). Verifique que incluya @ y un dominio con punto.'
        : '⚠ Email must follow the format user@domain.com (e.g. name@event.com). Make sure it includes @ and a domain with a dot.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.trim().length < 3) {
      setPasswordError(currentLang === 'es'
        ? '⚠ La contraseña debe tener al menos 3 caracteres. Asegúrese de que no haya espacios en blanco al inicio ni al final.'
        : '⚠ Password must be at least 3 characters long. Make sure there are no leading or trailing spaces.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      setScreenReaderText(currentLang === 'es'
        ? 'Error en el formulario de acceso. Revise los campos requeridos.'
        : 'Access form errors. Please check the required fields.');
      return;
    }

    const matched = login(email.trim(), password);

    if (!matched) {
      const msg = currentLang === 'es'
        ? '⚠ Correo electrónico o contraseña incorrectos. Verifique que el correo sea exactamente el registrado y que la contraseña respete mayúsculas y minúsculas. Puede usar las credenciales de demostración del panel izquierdo.'
        : '⚠ Incorrect email address or password. Make sure the email matches exactly and that the password is case-sensitive. You can use the demo credentials shown on the left panel.';
      setAuthError(msg);
      setScreenReaderText(msg);
      return;
    }

    const dest = matched.role === 'organizador' ? '/dashboard/events/new' : '/calendar';
    const successMsg = currentLang === 'es'
      ? `¡Acceso exitoso! Bienvenido, ${matched.name}. Rol: ${matched.role === 'organizador' ? 'Organizador' : 'Asistente'}.`
      : `Access granted! Welcome, ${matched.name}. Role: ${matched.role === 'organizador' ? 'Organizer' : 'Attendee'}.`;
    showToast(successMsg);
    setTimeout(() => navigate(dest), 600);
  };

  return (
    <div className="login-page">
      {/* Skip link */}
      <a href="#login-form" className="skip-link">{t('skip_to_content')}</a>

      {/* Accessibility quick controls */}
      <div className="login-acc-bar" role="toolbar" aria-label="Controles de accesibilidad rápidos">
        <button
          className="acc-panel-toggle"
          aria-label="Abrir panel de accesibilidad (Alt+A)"
          aria-haspopup="true"
          aria-expanded={accPanelOpen}
          onMouseUp={() => setAccPanelOpen(!accPanelOpen)}
          style={{ color: 'var(--text-primary)' }}
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
            <path d="M9 11h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v4a1 1 0 0 1-2 0v-4h-1v4a1 1 0 0 1-2 0v-4H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"></path>
          </svg>
        </button>

        <aside className={`acc-panel ${accPanelOpen ? 'open' : ''}`} role="dialog" aria-modal="false" aria-label={t('acc_title')}>
          <div className="acc-panel-header">
            <h2>{t('acc_title')}</h2>
            <button className="acc-close-btn" onMouseUp={() => setAccPanelOpen(false)} aria-label="Cerrar panel">✕</button>
          </div>
          <div className="acc-option">
            <span>{t('acc_contrast')}</span>
            <div className="switch-container">
              <label htmlFor="login-acc-contrast" className="switch-label">{t('acc_contrast_desc')}</label>
              <input type="checkbox" id="login-acc-contrast" className="switch-checkbox" checked={accContrast} onChange={(e) => setAccContrast(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAccContrast(!accContrast)}></div>
            </div>
          </div>
          <div className="acc-option">
            <span>{t('acc_font_size')}</span>
            <div className="font-size-grid" role="group" aria-label={t('acc_font_size')}>
              {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                <button key={size} className={`font-size-btn ${accFontSize === size ? 'active' : ''}`} onMouseUp={() => setAccFontSize(size)}>
                  {size === 'sm' ? 'P' : size === 'md' ? 'N' : size === 'lg' ? 'G' : 'XG'}
                </button>
              ))}
            </div>
          </div>
          <div className="acc-option">
            <span>{t('acc_spacing')}</span>
            <div className="switch-container">
              <label htmlFor="login-acc-spacing" className="switch-label">{t('acc_spacing_desc')}</label>
              <input type="checkbox" id="login-acc-spacing" className="switch-checkbox" checked={accSpacing} onChange={(e) => setAccSpacing(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAccSpacing(!accSpacing)}></div>
            </div>
          </div>
          <div className="acc-option">
            <span>{t('acc_reduce_motion')}</span>
            <div className="switch-container">
              <label htmlFor="login-acc-motion" className="switch-label">{t('acc_reduce_motion_desc')}</label>
              <input type="checkbox" id="login-acc-motion" className="switch-checkbox" checked={accReduceMotion} onChange={(e) => setAccReduceMotion(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAccReduceMotion(!accReduceMotion)}></div>
            </div>
          </div>
          <div className="acc-option">
            <span>{t('acc_dyslexia')}</span>
            <div className="switch-container">
              <label htmlFor="login-acc-dyslexia" className="switch-label">{t('acc_dyslexia_desc')}</label>
              <input type="checkbox" id="login-acc-dyslexia" className="switch-checkbox" checked={accDyslexia} onChange={(e) => setAccDyslexia(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAccDyslexia(!accDyslexia)}></div>
            </div>
          </div>
          <div className="acc-option">
            <span>{t('acc_grayscale')}</span>
            <div className="switch-container">
              <label htmlFor="login-acc-grayscale" className="switch-label">{t('acc_grayscale_desc')}</label>
              <input type="checkbox" id="login-acc-grayscale" className="switch-checkbox" checked={accGrayscale} onChange={(e) => setAccGrayscale(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAccGrayscale(!accGrayscale)}></div>
            </div>
          </div>
          <div className="acc-option">
            <span>{t('acc_underline')}</span>
            <div className="switch-container">
              <label htmlFor="login-acc-underline" className="switch-label">{t('acc_underline_desc')}</label>
              <input type="checkbox" id="login-acc-underline" className="switch-checkbox" checked={accUnderlineLinks} onChange={(e) => setAccUnderlineLinks(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAccUnderlineLinks(!accUnderlineLinks)}></div>
            </div>
          </div>
          <div className="acc-option">
            <label htmlFor="login-lang-select">{t('acc_lang')}</label>
            <select id="login-lang-select" value={currentLang} onChange={(e) => setCurrentLang(e.target.value as 'es' | 'en')}>
              <option value="es">Español (ES)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>
        </aside>
      </div>

      {/* LOGIN HERO */}
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          <h1 className="login-app-title">{t('app_title')}</h1>
          <p className="login-subtitle">{currentLang === 'es' ? 'Plataforma profesional de gestión de eventos' : 'Professional event management platform'}</p>

          <div className="login-features" aria-label="Características clave del sistema">
            <div className="login-feature-item">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>{currentLang === 'es' ? 'Plataforma Accesible e Inclusiva' : 'Accessible & Inclusive Platform'}</span>
            </div>
            <div className="login-feature-item">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path><path d="M9 11h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v4a1 1 0 0 1-2 0v-4h-1v4a1 1 0 0 1-2 0v-4H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"></path></svg>
              <span>{currentLang === 'es' ? 'Diseño 100% Inclusivo' : '100% Inclusive Design'}</span>
            </div>
            <div className="login-feature-item">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>{currentLang === 'es' ? 'Gestión completa de eventos' : 'Complete event management'}</span>
            </div>
          </div>

          {/* Demo credentials card */}
          <div className="login-demo-box" aria-label={currentLang === 'es' ? 'Credenciales de demostración' : 'Demo credentials'}>
            <div className="login-demo-title">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {currentLang === 'es' ? 'Credenciales de acceso demo' : 'Demo access credentials'}
            </div>
            <div className="login-demo-users">
              {DEMO_USERS.map((u) => (
                <div
                  key={u.email}
                  className="login-demo-user"
                  role="button"
                  tabIndex={0}
                  aria-label={`${currentLang === 'es' ? 'Usar credencial de' : 'Use credentials for'} ${u.name}`}
                  onMouseUp={() => { setEmail(u.email); setPassword(u.password); setAuthError(''); setEmailError(''); setPasswordError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setEmail(u.email); setPassword(u.password); } }}
                >
                  <span className={`login-demo-badge ${u.role}`}>
                    {u.role === 'organizador'
                      ? (currentLang === 'es' ? '🎯 Organizador' : '🎯 Organizer')
                      : (currentLang === 'es' ? '🎫 Asistente' : '🎫 Attendee')}
                  </span>
                  <code className="login-demo-email">{u.email}</code>
                  <code className="login-demo-pass">{u.password}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <h2>{t('login_title')}</h2>
          </div>

          <form id="login-form" onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend>{t('login_legend')}</legend>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t('login_instructions')}
              </p>

              <div className="form-group">
                <label htmlFor="login-email">{t('login_email')}</label>
                <input
                  type="email"
                  id="login-email"
                  autoComplete="email"
                  required
                  placeholder="organizador@evento.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                />
                {emailError && (
                  <div id="login-email-error" className="validation-message error" role="alert">
                    {emailError}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">{t('login_pass')}</label>
                <input
                  type="password"
                  id="login-password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={passwordError ? 'login-pass-error' : undefined}
                />
                {passwordError && (
                  <div id="login-pass-error" className="validation-message error" role="alert">
                    {passwordError}
                  </div>
                )}
              </div>

              {authError && (
                <div className="validation-message error" role="alert" aria-live="assertive" style={{ marginBottom: '1rem' }}>
                  {authError}
                </div>
              )}

              <div className="btn-group">
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                  {t('login_btn')}
                </button>
              </div>
            </fieldset>
          </form>

          <div className="login-public-links">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.75rem' }}>
              {currentLang === 'es' ? '¿Eres asistente? Accede al área pública:' : 'Attending an event? Access the public area:'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onMouseUp={() => window.location.href = '/calendar'}>
                {t('nav_calendar')}
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onMouseUp={() => window.location.href = '/register'}>
                {t('nav_register')}
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onMouseUp={() => window.location.href = '/chatbot'}>
                {t('nav_chatbot')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader footer for login */}
      <footer className="sr-simulator" id="sr-simulator-footer" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <div className="sr-title">{t('acc_reader_title')}</div>
        <div className="sr-text" aria-live="polite">
          {currentLang === 'es' ? 'Página de inicio de sesión. Ingrese sus credenciales de acceso.' : 'Login page. Enter your access credentials.'}
        </div>
      </footer>
    </div>
  );
}
