import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MyTicketsPage() {
  const { t, currentLang, registrations, setRegistrations, userProfile, isLoggedIn, showToast, setScreenReaderText } = useApp();
  const navigate = useNavigate();

  // Modal de confirmación de cancelación (WCAG 3.3.4)
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  const myRegistrations = isLoggedIn
    ? registrations.filter(r => r.userId === userProfile.email)
    : [];

  const activeCount = myRegistrations.filter(r => r.status === 'active').length;
  const cancelledCount = myRegistrations.filter(r => r.status === 'cancelled').length;

  const handleCancelRequest = (id: number) => {
    setConfirmCancelId(id);
  };

  const handleCancelConfirm = () => {
    if (confirmCancelId === null) return;
    setRegistrations(prev =>
      prev.map(r => r.id === confirmCancelId ? { ...r, status: 'cancelled' } : r)
    );
    setConfirmCancelId(null);
    const msg = currentLang === 'es'
      ? 'Inscripción cancelada correctamente. El organizador ha sido notificado.'
      : 'Registration cancelled successfully. The organizer has been notified.';
    showToast(msg);
    setScreenReaderText(msg);
  };

  const handleCancelDismiss = () => setConfirmCancelId(null);

  // El boleto cuya cancelación se está confirmando
  const pendingCancelReg = confirmCancelId !== null
    ? myRegistrations.find(r => r.id === confirmCancelId)
    : null;

  if (!isLoggedIn) {
    return (
      <div className="app-section active" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 style={{ marginBottom: '0.5rem' }}>{t('my_tickets_title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {currentLang === 'es'
            ? 'Debes iniciar sesión para ver tus boletos e inscripciones.'
            : 'You must log in to view your tickets and registrations.'}
        </p>
        <button className="btn btn-primary" onMouseUp={() => navigate('/login')}>
          {currentLang === 'es' ? 'Iniciar Sesión' : 'Log In'}
        </button>
      </div>
    );
  }

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 3h-8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"></path></svg>
        <span>{t('my_tickets_title')}</span>
      </h2>

      {/* Resumen rápido */}
      {myRegistrations.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-color)', borderRadius: 'var(--border-radius)', color: 'var(--success-color)', fontWeight: 600 }}>
            ✓ {activeCount} {currentLang === 'es' ? 'activa(s)' : 'active'}
          </div>
          {cancelledCount > 0 && (
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-color)', borderRadius: 'var(--border-radius)', color: 'var(--error-color)', fontWeight: 600 }}>
              ✗ {cancelledCount} {currentLang === 'es' ? 'cancelada(s)' : 'cancelled'}
            </div>
          )}
        </div>
      )}

      <fieldset>
        <legend>{t('my_tickets_legend')}</legend>

        {myRegistrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('my_tickets_empty')}</p>
            <button className="btn btn-primary" onMouseUp={() => navigate('/register')}>
              {t('my_tickets_go_reg')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {myRegistrations.map(reg => {
              const isCancelled = reg.status === 'cancelled';
              const date = new Date(reg.timestamp).toLocaleDateString(
                currentLang === 'es' ? 'es-EC' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              );
              return (
                <div
                  key={reg.id}
                  className="ticket-container"
                  style={{ opacity: isCancelled ? 0.6 : 1, position: 'relative' }}
                  tabIndex={0}
                  aria-label={`${currentLang === 'es' ? 'Boleto para' : 'Ticket for'} ${reg.eventName} — ${isCancelled ? t('my_tickets_cancelled') : t('my_tickets_active')}`}
                >
                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.5rem' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: isCancelled ? 'var(--error-color)' : 'var(--success-color)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {isCancelled
                        ? `✗ ${t('my_tickets_cancelled')}`
                        : `✓ ${t('my_tickets_active')}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date}</span>
                  </div>

                  {/* Ticket body */}
                  <span style={{ fontWeight: 700, color: 'var(--accent-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('reg_ticket_badge')}
                  </span>
                  <h3 style={{ textAlign: 'center', marginTop: '0.25rem' }}>{reg.eventName}</h3>
                  <div className="ticket-divider"></div>
                  <div style={{ textAlign: 'left', width: '100%', fontSize: '0.9rem' }}>
                    <p><strong>{t('reg_name')}:</strong> {reg.userName}</p>
                    <p><strong>{t('reg_email')}:</strong> {reg.userEmail}</p>
                    <p><strong>{t('reg_ticket_cat')}:</strong> {reg.category.toUpperCase()}</p>
                    {reg.discount !== 'none' && (
                      <p><strong>{t('reg_apply_disc')}:</strong> {reg.discount}</p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      ID: <code>{reg.qrId}</code>
                    </p>
                  </div>
                  <div className="ticket-divider"></div>

                  {/* QR simulado */}
                  <div className="ticket-qr" style={{ opacity: isCancelled ? 0.4 : 1 }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`QR Code: ${reg.qrId}`}>
                      <rect x="0" y="0" width="20" height="20" fill="black"/><rect x="3" y="3" width="14" height="14" fill="white"/><rect x="6" y="6" width="8" height="8" fill="black"/>
                      <rect x="80" y="0" width="20" height="20" fill="black"/><rect x="83" y="3" width="14" height="14" fill="white"/><rect x="86" y="6" width="8" height="8" fill="black"/>
                      <rect x="0" y="80" width="20" height="20" fill="black"/><rect x="3" y="83" width="14" height="14" fill="white"/><rect x="6" y="86" width="8" height="8" fill="black"/>
                      <rect x="30" y="5" width="5" height="5" fill="black"/><rect x="40" y="10" width="10" height="5" fill="black"/><rect x="60" y="5" width="5" height="15" fill="black"/>
                      <rect x="35" y="30" width="15" height="5" fill="black"/><rect x="55" y="25" width="5" height="10" fill="black"/><rect x="70" y="35" width="10" height="5" fill="black"/>
                      <rect x="25" y="50" width="5" height="20" fill="black"/><rect x="45" y="45" width="15" height="5" fill="black"/><rect x="65" y="60" width="10" height="10" fill="black"/>
                      <rect x="35" y="80" width="10" height="5" fill="black"/><rect x="50" y="85" width="5" height="10" fill="black"/><rect x="65" y="80" width="10" height="5" fill="black"/>
                    </svg>
                  </div>

                  {/* Botón cancelar (solo si activa) */}
                  {!isCancelled && (
                    <div className="btn-group" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 1rem', minHeight: '36px', minWidth: 'auto', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}
                        onMouseUp={() => handleCancelRequest(reg.id)}
                        aria-label={`${t('my_tickets_cancel')}: ${reg.eventName}`}
                      >
                        ✗ {t('my_tickets_cancel')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* WCAG 3.3.4 — Modal de confirmación de cancelación */}
      {pendingCancelReg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-confirm-title"
          aria-describedby="cancel-confirm-desc"
          className="confirm-modal-overlay"
        >
          <div className="confirm-modal">
            <h3 id="cancel-confirm-title" style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              {t('my_tickets_cancel')}
            </h3>
            <p id="cancel-confirm-desc" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
              {t('my_tickets_cancel_confirm')}
            </p>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <strong>{pendingCancelReg.eventName}</strong><br />
              <span style={{ color: 'var(--text-secondary)' }}>{pendingCancelReg.category.toUpperCase()} — {pendingCancelReg.qrId}</span>
            </div>
            <div className="btn-group" style={{ marginTop: 0 }}>
              <button
                className="btn btn-danger"
                onMouseUp={handleCancelConfirm}
                aria-label={currentLang === 'es' ? 'Confirmar cancelación de inscripción' : 'Confirm registration cancellation'}
              >
                ✗ {currentLang === 'es' ? 'Sí, cancelar inscripción' : 'Yes, cancel registration'}
              </button>
              <button
                className="btn btn-secondary"
                onMouseUp={handleCancelDismiss}
                aria-label={currentLang === 'es' ? 'Mantener inscripción' : 'Keep registration'}
              >
                {currentLang === 'es' ? 'No, conservar boleto' : 'No, keep my ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
