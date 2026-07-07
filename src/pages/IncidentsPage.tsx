import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import type { IncidentItem } from '../context/AppContext';

// Prefijos textuales para cada nivel de gravedad (WCAG 1.4.1 — no solo color)
const GRAVITY_PREFIX: Record<string, { es: string; en: string; symbol: string }> = {
  alto:  { es: '⛔ ALTO',  en: '⛔ HIGH',   symbol: '⛔' },
  medio: { es: '⚠ MEDIO', en: '⚠ MEDIUM', symbol: '⚠' },
  bajo:  { es: '✓ BAJO',  en: '✓ LOW',    symbol: '✓' },
};

export default function IncidentsPage() {
  const { t, currentLang, events, incidents, setIncidents, setEmergencyText, setEmergencyOpen, showToast } = useApp();

  const [incSelectedEventId, setIncSelectedEventId] = useState(events[0]?.id || '');
  const [incType, setIncType] = useState('medica');
  const [incLocation, setIncLocation] = useState('');
  const [incGravity, setIncGravity] = useState('bajo');
  const [incDescription, setIncDescription] = useState('');

  // WCAG 3.3.4 — Estado para modal de confirmación (gravedad alta)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingIncident, setPendingIncident] = useState<IncidentItem | null>(null);

  // WCAG 3.3.4 — Estado para deshacer la última incidencia
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const buildIncident = (): IncidentItem | null => {
    if (!incLocation || !incDescription) {
      showToast(
        currentLang === 'es'
          ? 'Por favor rellene la localización y la descripción de la alerta.'
          : 'Please fill in the hazard location and description details.',
        true
      );
      return null;
    }
    const ev = events.find(item => item.id === incSelectedEventId);
    return {
      id: Date.now(),
      eventName: ev ? ev.name : 'Evento',
      type: incType,
      location: incLocation,
      gravity: incGravity,
      description: incDescription,
    };
  };

  const commitIncident = (inc: IncidentItem) => {
    setIncidents(prev => [...prev, inc]);
    setLastAddedId(inc.id);

    // Activar alerta de emergencia si es gravedad alta
    if (inc.gravity === 'alto') {
      const textEs = `⚠ ALERTA DE INCIDENCIA [Gravedad Alta]: Emergencia tipo [${inc.type.toUpperCase()}] reportada en [${inc.location}]. Detalle: ${inc.description}`;
      const textEn = `⚠ HAZARD WARNING [High Severity]: [${inc.type.toUpperCase()}] incident reported at [${inc.location}]. Details: ${inc.description}`;
      const announcement = currentLang === 'es' ? textEs : textEn;
      setEmergencyText(announcement);
      setEmergencyOpen(true);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const urgentSpeak = new SpeechSynthesisUtterance(announcement);
        urgentSpeak.lang = currentLang === 'es' ? 'es-ES' : 'en-US';
        window.speechSynthesis.speak(urgentSpeak);
      }
    }

    showToast(
      currentLang === 'es'
        ? 'Incidencia registrada e informada al equipo técnico.'
        : 'Incident registered and reported to logistics team.'
    );
    setIncLocation('');
    setIncDescription('');

    // Mostrar botón de deshacer por 30 segundos (WCAG 3.3.4)
    setUndoVisible(true);
    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => setUndoVisible(false), 30000);
    setUndoTimer(timer);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const inc = buildIncident();
    if (!inc) return;

    // WCAG 3.3.4: Para gravedad alta, mostrar modal de confirmación
    if (incGravity === 'alto') {
      setPendingIncident(inc);
      setShowConfirmModal(true);
    } else {
      commitIncident(inc);
    }
  };

  const handleConfirmModal = () => {
    if (pendingIncident) commitIncident(pendingIncident);
    setShowConfirmModal(false);
    setPendingIncident(null);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setPendingIncident(null);
  };

  const handleUndo = () => {
    if (lastAddedId === null) return;
    setIncidents(prev => prev.filter(i => i.id !== lastAddedId));
    setUndoVisible(false);
    if (undoTimer) clearTimeout(undoTimer);
    showToast(
      currentLang === 'es'
        ? 'Última incidencia eliminada correctamente.'
        : 'Last incident successfully removed.'
    );
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>{t('inc_title')}</span>
      </h2>

      {/* WCAG 3.3.4 — Botón de deshacer última incidencia (ventana de 30 segundos) */}
      {undoVisible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-color)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--warning-color)',
            fontSize: '0.9rem',
          }}
        >
          <span>
            ⚠ {currentLang === 'es'
              ? 'Incidencia registrada. Puede deshacerla durante los próximos 30 segundos.'
              : 'Incident registered. You can undo it within the next 30 seconds.'}
          </span>
          <button
            className="btn btn-secondary"
            style={{ minWidth: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem', minHeight: '36px' }}
            onMouseUp={handleUndo}
            aria-label={currentLang === 'es' ? 'Deshacer el registro de la última incidencia' : 'Undo the last incident registration'}
          >
            ↩ {currentLang === 'es' ? 'Deshacer' : 'Undo'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>{t('inc_legend')}</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="inc-event-select">{t('costs_select_event')}</label>
              <select id="inc-event-select" value={incSelectedEventId} onChange={(e) => setIncSelectedEventId(e.target.value)}>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="inc-type">{t('inc_type')}</label>
              <select id="inc-type" value={incType} onChange={(e) => setIncType(e.target.value)}>
                <option value="medica">{t('inc_med')}</option>
                <option value="seguridad">{t('inc_sec')}</option>
                <option value="operativa">{t('inc_op')}</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="inc-location">{t('inc_loc')}</label>
              <input type="text" id="inc-location" required value={incLocation} onChange={(e) => setIncLocation(e.target.value)} placeholder="Ej. Zona B" />
            </div>
            <div className="form-group">
              <label htmlFor="inc-gravity">{t('inc_gravity')}</label>
              <select id="inc-gravity" value={incGravity} onChange={(e) => setIncGravity(e.target.value)}>
                <option value="bajo">{t('inc_low')}</option>
                <option value="medio">{t('inc_med_g')}</option>
                <option value="alto">{t('inc_high')}</option>
              </select>
              {/* Indicador textual del nivel seleccionado — WCAG 1.4.1 */}
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: incGravity === 'alto' ? 'var(--error-color)' : incGravity === 'medio' ? 'var(--warning-color)' : 'var(--success-color)',
                  marginTop: '0.25rem',
                }}
                aria-live="polite"
              >
                {GRAVITY_PREFIX[incGravity]?.[currentLang] ?? incGravity}
                {incGravity === 'alto' && (
                  <span style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
                    — {currentLang === 'es' ? 'Se requerirá confirmación antes de registrar.' : 'Confirmation will be required before registering.'}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inc-description">{t('inc_desc')}</label>
            <textarea id="inc-description" rows={4} required value={incDescription} onChange={(e) => setIncDescription(e.target.value)} placeholder="Detalle..." />
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-danger">{t('inc_btn')}</button>
          </div>
        </fieldset>
      </form>

      {/* WCAG 3.3.4 — Modal de confirmación para incidencias de gravedad Alta */}
      {showConfirmModal && pendingIncident && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          className="confirm-modal-overlay"
        >
          <div className="confirm-modal">
            <h3 id="confirm-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error-color)', marginBottom: '1rem' }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              {currentLang === 'es' ? 'Confirmar alerta de gravedad Alta' : 'Confirm High Severity Alert'}
            </h3>
            <p id="confirm-modal-desc" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
              {currentLang === 'es'
                ? 'Esta acción activará una alerta de emergencia visible en toda la plataforma y reproducirá un aviso de voz. Por favor confirme los datos antes de continuar.'
                : 'This action will trigger an emergency alert visible across the entire platform and play a voice announcement. Please confirm the details before continuing.'}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.9rem' }} aria-label={currentLang === 'es' ? 'Resumen de la incidencia' : 'Incident summary'}>
              <tbody>
                {[
                  [currentLang === 'es' ? 'Evento' : 'Event', pendingIncident.eventName],
                  [currentLang === 'es' ? 'Tipo' : 'Type', pendingIncident.type.toUpperCase()],
                  [currentLang === 'es' ? 'Ubicación' : 'Location', pendingIncident.location],
                  [currentLang === 'es' ? 'Gravedad' : 'Severity', GRAVITY_PREFIX['alto'][currentLang]],
                  [currentLang === 'es' ? 'Descripción' : 'Description', pendingIncident.description],
                ].map(([key, value]) => (
                  <tr key={String(key)} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', fontWeight: 600, width: '35%' }}>{key}</th>
                    <td style={{ padding: '0.4rem 0.5rem' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="btn-group" style={{ marginTop: 0 }}>
              <button
                className="btn btn-danger"
                onMouseUp={handleConfirmModal}
                aria-label={currentLang === 'es' ? 'Confirmar y registrar la incidencia de gravedad alta' : 'Confirm and register the high severity incident'}
              >
                {currentLang === 'es' ? '⛔ Confirmar y Registrar Alerta' : '⛔ Confirm & Register Alert'}
              </button>
              <button
                className="btn btn-secondary"
                onMouseUp={handleCancelModal}
                aria-label={currentLang === 'es' ? 'Cancelar y volver al formulario' : 'Cancel and return to form'}
              >
                {currentLang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {incidents.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            {currentLang === 'es' ? 'Incidencias Registradas' : 'Registered Incidents'}
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {incidents.map(inc => {
              const gPrefix = GRAVITY_PREFIX[inc.gravity];
              const gravityLabel = gPrefix ? gPrefix[currentLang] : inc.gravity.toUpperCase();
              return (
                <li key={inc.id} style={{
                  border: `2px solid ${inc.gravity === 'alto' ? 'var(--error-color)' : inc.gravity === 'medio' ? 'var(--warning-color)' : 'var(--border-color)'}`,
                  borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-secondary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <strong>{inc.eventName}</strong>
                    {/* WCAG 1.4.1: badge con prefijo textual + ícono + color */}
                    <span
                      className="badge"
                      style={{
                        backgroundColor: inc.gravity === 'alto' ? 'var(--error-color)' : inc.gravity === 'medio' ? 'var(--warning-color)' : 'var(--success-color)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                      aria-label={`${currentLang === 'es' ? 'Gravedad' : 'Severity'}: ${gravityLabel}`}
                    >
                      {gravityLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {inc.type.toUpperCase()} @ {inc.location}
                  </div>
                  <p style={{ marginTop: '0.25rem' }}>{inc.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
