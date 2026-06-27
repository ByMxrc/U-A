import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import type { IncidentItem } from '../context/AppContext';

export default function IncidentsPage() {
  const { t, currentLang, events, incidents, setIncidents, setEmergencyText, setEmergencyOpen, showToast } = useApp();

  const [incSelectedEventId, setIncSelectedEventId] = useState(events[0]?.id || '');
  const [incType, setIncType] = useState('medica');
  const [incLocation, setIncLocation] = useState('');
  const [incGravity, setIncGravity] = useState('bajo');
  const [incDescription, setIncDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!incLocation || !incDescription) {
      showToast(currentLang === 'es' ? 'Por favor rellene la localización y la descripción de la alerta.' : 'Please fill in the hazard location and description details.', true);
      return;
    }

    const ev = events.find(item => item.id === incSelectedEventId);
    const newInc: IncidentItem = {
      id: incidents.length + 1,
      eventName: ev ? ev.name : 'Evento',
      type: incType, location: incLocation,
      gravity: incGravity, description: incDescription
    };

    setIncidents(prev => [...prev, newInc]);

    if (incGravity === 'alto') {
      const textEs = `⚠ ALERTA DE INCIDENCIA [Gravedad Alta]: Emergencia tipo [${incType.toUpperCase()}] reportada en [${incLocation}]. Detalle: ${incDescription}`;
      const textEn = `⚠ HAZARD WARNING [High Severity]: [${incType.toUpperCase()}] incident reported at [${incLocation}]. Details: ${incDescription}`;
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

    showToast(currentLang === 'es' ? 'Incidencia registrada e informada al equipo técnico.' : 'Incident registered and reported to logistics team.');
    setIncLocation(''); setIncDescription('');
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>{t('inc_title')}</span>
      </h2>
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

      {incidents.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            {currentLang === 'es' ? 'Incidencias Registradas' : 'Registered Incidents'}
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {incidents.map(inc => (
              <li key={inc.id} style={{
                border: `1px solid ${inc.gravity === 'alto' ? 'var(--error-color)' : inc.gravity === 'medio' ? 'var(--warning-color)' : 'var(--border-color)'}`,
                borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong>{inc.eventName}</strong>
                  <span className="badge" style={{ backgroundColor: inc.gravity === 'alto' ? 'var(--error-color)' : inc.gravity === 'medio' ? 'var(--warning-color)' : 'var(--success-color)', color: '#fff' }}>
                    {inc.gravity.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {inc.type.toUpperCase()} @ {inc.location}
                </div>
                <p style={{ marginTop: '0.25rem' }}>{inc.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
