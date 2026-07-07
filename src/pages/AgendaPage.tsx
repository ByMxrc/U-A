import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import type { SessionItem } from '../context/AppContext';

export default function AgendaPage() {
  const { t, currentLang, events, agendaSessions, setAgendaSessions, showToast } = useApp();

  const [agendaSelectedEventId, setAgendaSelectedEventId] = useState(events[0]?.id || '');
  const [agendaSessName, setAgendaSessName] = useState('');
  const [agendaSpeaker, setAgendaSpeaker] = useState('');
  const [agendaTime, setAgendaTime] = useState('');
  const [agendaRoom, setAgendaRoom] = useState('');
  const [agendaMaterials, setAgendaMaterials] = useState('');
  const [agendaInterpreter, setAgendaInterpreter] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!agendaSessName || !agendaSpeaker || !agendaTime || !agendaRoom) {
      showToast(currentLang === 'es' ? 'Complete los campos de la sesión.' : 'Complete session required fields.', true);
      return;
    }
    const newSession: SessionItem = { name: agendaSessName, speaker: agendaSpeaker, time: agendaTime, room: agendaRoom, materials: agendaMaterials, interpreter: agendaInterpreter };
    setAgendaSessions(prev => {
      const currentList = prev[agendaSelectedEventId] || [];
      return { ...prev, [agendaSelectedEventId]: [...currentList, newSession] };
    });
    setAgendaSessName(''); setAgendaSpeaker(''); setAgendaTime(''); setAgendaRoom(''); setAgendaMaterials(''); setAgendaInterpreter(false);
    showToast(currentLang === 'es' ? 'Sesión añadida al cronograma.' : 'Session successfully added to agenda timeline.');
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>{t('agenda_title')}</span>
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>{t('agenda_legend')}</legend>
          <div className="form-group">
            <label htmlFor="agenda-event-select">{t('costs_select_event')}</label>
            <select id="agenda-event-select" value={agendaSelectedEventId} onChange={(e) => setAgendaSelectedEventId(e.target.value)}>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agenda-session-name">{t('agenda_session_name')}</label>
              <input type="text" id="agenda-session-name" required value={agendaSessName} onChange={(e) => setAgendaSessName(e.target.value)} placeholder="Ej. Panel de Accesibilidad" />
            </div>
            <div className="form-group">
              <label htmlFor="agenda-speaker">{t('agenda_speaker')}</label>
              <input type="text" id="agenda-speaker" required value={agendaSpeaker} onChange={(e) => setAgendaSpeaker(e.target.value)} placeholder="Ej: Dr. Laura Quispe" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agenda-time">{t('agenda_time')}</label>
              <input type="time" id="agenda-time" required value={agendaTime} onChange={(e) => setAgendaTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="agenda-room">{t('agenda_room')}</label>
              <input type="text" id="agenda-room" required value={agendaRoom} onChange={(e) => setAgendaRoom(e.target.value)} placeholder="Sala Magna (Planta Baja)" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="agenda-materials">{t('agenda_materials')}</label>
            <input type="text" id="agenda-materials" value={agendaMaterials} onChange={(e) => setAgendaMaterials(e.target.value)} placeholder="https://url-documentos.com/pdf" />
          </div>
          <div className="form-group">
            <div className="switch-container">
              <label htmlFor="agenda-interpreter" className="switch-label">{t('agenda_interpreter')}</label>
              <input type="checkbox" id="agenda-interpreter" className="switch-checkbox" checked={agendaInterpreter} onChange={(e) => setAgendaInterpreter(e.target.checked)} />
              <div className="switch-control" onMouseUp={() => setAgendaInterpreter(!agendaInterpreter)}></div>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{t('agenda_btn')}</button>
          </div>
        </fieldset>
      </form>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>{t('agenda_list_title')}</h3>
      <div role="region" aria-live="polite">
        {(!agendaSessions[agendaSelectedEventId] || agendaSessions[agendaSelectedEventId].length === 0) ? (
          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            {currentLang === 'es' ? 'No hay sesiones añadidas a la agenda.' : 'No sessions added to the agenda yet.'}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {agendaSessions[agendaSelectedEventId].map((sess, idx) => (
              <li key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: 'var(--accent-secondary)', fontSize: '1.1rem' }}>{sess.time}</strong> - <strong>{sess.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Speaker: {sess.speaker} | Room: {sess.room}
                    {sess.materials && ` | `}
                    {sess.materials && <a href={sess.materials} style={{ color: 'var(--accent-primary)' }} target="_blank" rel="noopener noreferrer">{currentLang === 'es' ? 'Materiales' : 'Materials'}</a>}
                  </div>
                </div>
                {sess.interpreter && (
                  <span className="badge" style={{ backgroundColor: 'var(--bg-active)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)', fontSize: '0.7rem' }} aria-label="Requiere intérprete de lengua de señas">
                    🤟 {currentLang === 'es' ? 'Intérprete Señas' : 'Sign Interpreter'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
