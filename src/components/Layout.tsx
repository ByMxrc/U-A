import { useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const {
    currentLang, setCurrentLang,
    accPanelOpen, setAccPanelOpen,
    accContrast, setAccContrast,
    accFontSize, setAccFontSize,
    accSpacing, setAccSpacing,
    accReduceMotion, setAccReduceMotion,
    accDyslexia, setAccDyslexia,
    accGrayscale, setAccGrayscale,
    accUnderlineLinks, setAccUnderlineLinks,
    emergencyOpen, setEmergencyOpen,
    emergencyText,
    toastOpen, toastText, toastIsError,
    isLoggedIn, userRole, logout,
    userProfile,
    screenReaderText, setScreenReaderText,
    shortcutsPanelOpen, setShortcutsPanelOpen,
    invModalOpen, invModalData, setInvModalOpen,
    showToast,
    t,
  } = useApp();

  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Listen to custom navigation events dispatched from keyboard shortcuts
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      navigate(path);
    };
    window.addEventListener('ua-navigate', handler);
    return () => window.removeEventListener('ua-navigate', handler);
  }, [navigate]);

  // Keyboard shortcuts list
  const shortcuts = [
    { keys: 'Alt + A', desc: t('shortcut_acc') },
    { keys: 'Alt + K', desc: t('shortcuts_title') },
    { keys: 'Alt + H', desc: t('shortcut_home') },
    { keys: 'Alt + R', desc: t('shortcut_reg') },
    { keys: 'Alt + C', desc: t('shortcut_cal') },
    { keys: 'Alt + S', desc: t('shortcut_survey') },
    { keys: 'Alt + M', desc: t('shortcut_tickets') },
    { keys: 'Alt + I', desc: t('shortcut_incidents') },
    { keys: 'Alt + P', desc: t('shortcut_admin') },
    { keys: 'Esc', desc: t('shortcut_esc') },
  ];

  return (
    <>
      {/* SKIP LINK */}
      <a href="#main-content" className="skip-link">{t('skip_to_content')}</a>

      {/* EMERGENCY BANNER */}
      {emergencyOpen && (
        <div id="emergency-banner" className="emergency-banner open" role="alert" aria-live="assertive">
          <span>{emergencyText}</span>
          <button
            className="emergency-close"
            onMouseUp={() => { setEmergencyOpen(false); setScreenReaderText(currentLang === 'es' ? "Alerta descartada" : "Alert dismissed"); }}
          >
            {t('dismiss')}
          </button>
        </div>
      )}

      {/* HEADER */}
      <header>
        <div className="header-logo">
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
          <div>
            <h1>{t('app_title')}</h1>
          </div>
        </div>

        <div className="header-controls">
          {/* Icon buttons first — left group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Shortcuts panel button */}
            <button
              id="shortcuts-panel-toggle"
              className="acc-panel-toggle"
              aria-label={`${t('shortcuts_title')} (Atajo: Alt+K)`}
              aria-haspopup="true"
              aria-expanded={shortcutsPanelOpen}
              onMouseUp={() => setShortcutsPanelOpen(!shortcutsPanelOpen)}
              title={`${t('shortcuts_title')} — Alt+K`}
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h.01M10 16h8"></path>
              </svg>
            </button>

            {/* Accessibility button */}
            <button
              className="acc-panel-toggle"
              aria-label="Menú de Accesibilidad (Atajo: Alt+A)"
              aria-haspopup="true"
              aria-expanded={accPanelOpen}
              onMouseUp={() => setAccPanelOpen(!accPanelOpen)}
              title="Accesibilidad — Alt+A"
            >
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
              <path d="M9 11h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v4a1 1 0 0 1-2 0v-4h-1v4a1 1 0 0 1-2 0v-4H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"></path>
            </svg>
            </button>
          </div>

          {/* Separator */}
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.25rem' }} aria-hidden="true" />

          {/* User info + Logout — right group */}
          <div className="header-meta">
            {isLoggedIn ? (
              <span>
                <strong style={{ color: 'var(--accent-secondary)' }}>
                  {userRole === 'organizador'
                    ? (currentLang === 'es' ? 'Organizador: ' : 'Organizer: ')
                    : (currentLang === 'es' ? 'Asistente: ' : 'Attendee: ')}
                </strong>
                {userProfile.name}
              </span>
            ) : (
              <span>{t('profile_guest')}</span>
            )}
          </div>

          {isLoggedIn && (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onMouseUp={handleLogout}
            >
              {t('logout_btn')}
            </button>
          )}
        </div>
      </header>

      {/* SHORTCUTS PANEL */}
      <aside
        id="shortcuts-panel"
        className={`acc-panel ${shortcutsPanelOpen ? 'open' : ''}`}
        style={{ minWidth: '280px' }}
        role="dialog"
        aria-modal="false"
        aria-label={t('shortcuts_title')}
      >
        <div className="acc-panel-header">
          <h2>{t('shortcuts_title')}</h2>
          <button className="acc-close-btn" onMouseUp={() => setShortcutsPanelOpen(false)} aria-label="Cerrar panel">✕</button>
        </div>
        <div style={{ padding: '0.5rem 0' }}>
          {shortcuts.map(sc => (
            <div key={sc.keys} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.55rem 1rem', borderBottom: '1px solid var(--border-color)',
              gap: '0.75rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sc.desc}</span>
              <kbd style={{
                background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                borderRadius: '0.35rem', padding: '0.2rem 0.5rem',
                fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700,
                color: 'var(--accent-primary)', whiteSpace: 'nowrap',
                boxShadow: '0 2px 0 var(--border-color)',
              }}>
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>
      </aside>

      {/* ACCESSIBILITY PANEL */}
      <aside className={`acc-panel ${accPanelOpen ? 'open' : ''}`} role="dialog" aria-modal="false" aria-label={t('acc_title')}>
        <div className="acc-panel-header">
          <h2>{t('acc_title')}</h2>
          <button className="acc-close-btn" onMouseUp={() => setAccPanelOpen(false)} aria-label="Cerrar panel">✕</button>
        </div>

        <div className="acc-option">
          <span>{t('acc_contrast')}</span>
          <div className="switch-container">
            <label htmlFor="acc-contrast-checkbox" className="switch-label">{t('acc_contrast_desc')}</label>
            <input type="checkbox" id="acc-contrast-checkbox" className="switch-checkbox" checked={accContrast} onChange={(e) => setAccContrast(e.target.checked)} />
            <div className="switch-control" onMouseUp={() => setAccContrast(!accContrast)}></div>
          </div>
        </div>

        <div className="acc-option">
          <span>{t('acc_font_size')}</span>
          <div className="font-size-grid" role="group" aria-label={t('acc_font_size')}>
            <button className={`font-size-btn ${accFontSize === 'sm' ? 'active' : ''}`} onMouseUp={() => setAccFontSize('sm')}>P</button>
            <button className={`font-size-btn ${accFontSize === 'md' ? 'active' : ''}`} onMouseUp={() => setAccFontSize('md')}>N</button>
            <button className={`font-size-btn ${accFontSize === 'lg' ? 'active' : ''}`} onMouseUp={() => setAccFontSize('lg')}>G</button>
            <button className={`font-size-btn ${accFontSize === 'xl' ? 'active' : ''}`} onMouseUp={() => setAccFontSize('xl')}>XG</button>
          </div>
        </div>

        <div className="acc-option">
          <span>{t('acc_spacing')}</span>
          <div className="switch-container">
            <label htmlFor="acc-spacing-checkbox" className="switch-label">{t('acc_spacing_desc')}</label>
            <input type="checkbox" id="acc-spacing-checkbox" className="switch-checkbox" checked={accSpacing} onChange={(e) => setAccSpacing(e.target.checked)} />
            <div className="switch-control" onMouseUp={() => setAccSpacing(!accSpacing)}></div>
          </div>
        </div>

        <div className="acc-option">
          <span>{t('acc_reduce_motion')}</span>
          <div className="switch-container">
            <label htmlFor="acc-motion-checkbox" className="switch-label">{t('acc_reduce_motion_desc')}</label>
            <input type="checkbox" id="acc-motion-checkbox" className="switch-checkbox" checked={accReduceMotion} onChange={(e) => setAccReduceMotion(e.target.checked)} />
            <div className="switch-control" onMouseUp={() => setAccReduceMotion(!accReduceMotion)}></div>
          </div>
        </div>

        <div className="acc-option">
          <span>{t('acc_dyslexia')}</span>
          <div className="switch-container">
            <label htmlFor="acc-dyslexia-checkbox" className="switch-label">{t('acc_dyslexia_desc')}</label>
            <input type="checkbox" id="acc-dyslexia-checkbox" className="switch-checkbox" checked={accDyslexia} onChange={(e) => setAccDyslexia(e.target.checked)} />
            <div className="switch-control" onMouseUp={() => setAccDyslexia(!accDyslexia)}></div>
          </div>
        </div>

        <div className="acc-option">
          <span>{t('acc_grayscale')}</span>
          <div className="switch-container">
            <label htmlFor="acc-grayscale-checkbox" className="switch-label">{t('acc_grayscale_desc')}</label>
            <input type="checkbox" id="acc-grayscale-checkbox" className="switch-checkbox" checked={accGrayscale} onChange={(e) => setAccGrayscale(e.target.checked)} />
            <div className="switch-control" onMouseUp={() => setAccGrayscale(!accGrayscale)}></div>
          </div>
        </div>

        <div className="acc-option">
          <span>{t('acc_underline')}</span>
          <div className="switch-container">
            <label htmlFor="acc-underline-checkbox" className="switch-label">{t('acc_underline_desc')}</label>
            <input type="checkbox" id="acc-underline-checkbox" className="switch-checkbox" checked={accUnderlineLinks} onChange={(e) => setAccUnderlineLinks(e.target.checked)} />
            <div className="switch-control" onMouseUp={() => setAccUnderlineLinks(!accUnderlineLinks)}></div>
          </div>
        </div>

        <div className="acc-option">
          <label htmlFor="acc-lang-select">{t('acc_lang')}</label>
          <select
            id="acc-lang-select"
            value={currentLang}
            onChange={(e) => {
              const lang = e.target.value as 'es' | 'en';
              setCurrentLang(lang);
              setScreenReaderText(lang === 'es' ? "Idioma cambiado a Español." : "Language changed to English.");
            }}
          >
            <option value="es">Español (ES)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>
      </aside>

      {/* INVITATION EMAIL MODAL */}
      {invModalOpen && invModalData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inv-modal-title"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setInvModalOpen(false); }}
        >
          <div style={{
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            maxWidth: '500px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            animation: 'slideUp 0.25s ease',
          }}>
            {/* Modal header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              padding: '1.2rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✉️</span>
                <div>
                  <h3 id="inv-modal-title" style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                    {t('inv_email_title')}
                  </h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
                    {t('inv_email_from')}
                  </p>
                </div>
              </div>
              <button
                onMouseUp={() => setInvModalOpen(false)}
                aria-label="Cerrar"
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                  width: '2rem', height: '2rem', cursor: 'pointer', color: '#fff', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Email preview */}
            <div style={{ padding: '1.5rem' }}>
              {/* Email meta */}
              <div style={{ background: 'var(--bg-color)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.2rem', fontSize: '0.82rem' }}>
                {[
                  { label: currentLang === 'es' ? 'Para' : 'To', value: `${invModalData.name} <${invModalData.email}>` },
                  { label: currentLang === 'es' ? 'De' : 'From', value: t('inv_email_from') },
                  { label: currentLang === 'es' ? 'Asunto' : 'Subject', value: t('inv_email_subject') },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700, minWidth: '60px', color: 'var(--text-secondary)' }}>{row.label}:</span>
                    <span style={{ color: 'var(--text-color)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Email body */}
              <div style={{
                border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.2rem',
                lineHeight: 1.6, fontSize: '0.9rem',
              }}>
                <p style={{ margin: '0 0 0.75rem' }}>
                  <strong>{t('inv_email_greeting')}, {invModalData.name}! 👋</strong>
                </p>
                <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>
                  {t('inv_email_body')}
                </p>

                {/* Event info box */}
                <div style={{
                  background: 'var(--accent-primary)15',
                  border: '1px solid var(--accent-primary)40',
                  borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--accent-primary)' }}>
                    🎫 {invModalData.eventName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {currentLang === 'es' ? 'Código QR' : 'QR Code'}: <code style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{invModalData.qrId}</code>
                  </div>
                </div>

                {/* CTA Button */}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button
                    id="inv-accept-btn"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: '0.5rem' }}
                    onMouseUp={() => {
                      showToast(t('inv_email_accept_done'));
                      setInvModalOpen(false);
                    }}
                  >
                    ✅ {t('inv_email_accept')}
                  </button>
                </div>
              </div>

              {/* Footer note */}
              <p style={{ textAlign: 'center', fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.8rem', margin: '0.8rem 0 0' }}>
                {currentLang === 'es'
                  ? '📧 Este es un correo simulado. En producción se enviaría al email registrado.'
                  : '📧 This is a simulated email. In production it would be sent to the registered address.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE */}
      <div className="app-wrapper">
        {/* SIDEBAR */}
        <nav className="sidebar" aria-label="Navegación principal">
          <div className="sidebar-title">{t('nav_title_org')}</div>

          {!isLoggedIn ? (
            <NavLink to="/login" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>{t('nav_login')}</span>
            </NavLink>
          ) : userRole === 'organizador' ? (
            <>
              <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>{t('nav_profile')}</span>
              </NavLink>

              <NavLink to="/dashboard/events/new" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                <span>{t('nav_create_event')}</span>
              </NavLink>

              <NavLink to="/dashboard/costs" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>{t('nav_costs')}</span>
              </NavLink>

              <NavLink to="/dashboard/venue" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{t('nav_venue')}</span>
              </NavLink>

              <NavLink to="/dashboard/agenda" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{t('nav_agenda')}</span>
              </NavLink>

              <NavLink to="/dashboard/checkin" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>{t('nav_checkin')}</span>
              </NavLink>

              <NavLink to="/dashboard/incidents" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>{t('nav_incidents')}</span>
              </NavLink>

              {/* Admin Panel link */}
              <NavLink to="/dashboard/admin" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`} style={{ marginTop: '0.25rem' }}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                </svg>
                <span>{t('nav_admin')}</span>
              </NavLink>
            </>
          ) : (
            /* Asistente logueado — Área privada del asistente */
            <>
              <div className="sidebar-title">{t('nav_title_att')}</div>
              <NavLink to="/my-tickets" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 3h-8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"></path></svg>
                <span>{t('nav_my_tickets')}</span>
              </NavLink>
            </>
          )}

          <div className="sidebar-title">{t('nav_title_pub')}</div>

          <NavLink to="/register" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            <span>{t('nav_register')}</span>
          </NavLink>

          <NavLink to="/calendar" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>{t('nav_calendar')}</span>
          </NavLink>

          <NavLink to="/chatbot" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>{t('nav_chatbot')}</span>
          </NavLink>

          <NavLink to="/survey" className={({ isActive }) => `sidebar-btn${isActive ? ' active' : ''}`}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            <span>{t('nav_survey')}</span>
          </NavLink>
        </nav>

        {/* PAGE CONTENT */}
        <main className="main-content" id="main-content">
          <div tabIndex={-1} ref={mainContentRef}></div>
          <Outlet />
        </main>
      </div>

      {/* GLOBAL TOAST */}
      <div
        id="global-toast"
        className={`toast ${toastOpen ? 'open' : ''}`}
        role="status"
        aria-live="polite"
        style={{ backgroundColor: toastIsError ? 'var(--error-color)' : 'var(--success-color)' }}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>{toastText}</span>
      </div>

      {/* SIMULATED SCREEN READER TERMINAL */}
      <footer className="sr-simulator" id="sr-simulator-footer">
        <div className="sr-title">{t('acc_reader_title')}</div>
        <div className="sr-text" id="sr-simulator-text" aria-live="polite">
          {screenReaderText}
        </div>
      </footer>
    </>
  );
}
