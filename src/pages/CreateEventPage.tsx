import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { EventItem } from '../context/AppContext';

export default function CreateEventPage() {
  const { t, currentLang, events, setEvents, setAgendaSessions, showToast } = useApp();
  const navigate = useNavigate();

  const [evFormType, setEvFormType] = useState('conferencia');
  const [evFormName, setEvFormName] = useState('');
  const [evFormStart, setEvFormStart] = useState('');
  const [evFormEnd, setEvFormEnd] = useState('');
  const [evFormCapacity, setEvFormCapacity] = useState('');
  const [evFormCost, setEvFormCost] = useState('');

  // WCAG 3.3.4 — Estado del modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!evFormName || !evFormStart || !evFormEnd || !evFormCapacity) {
      showToast(
        currentLang === 'es'
          ? 'Complete todos los campos obligatorios del evento.'
          : 'Complete all required event fields.',
        true
      );
      return;
    }
    // WCAG 3.3.4: mostrar resumen de confirmación antes de guardar
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    const newId = `ev-${events.length + 1}`;
    const newEvent: EventItem = {
      id: newId, name: evFormName, type: evFormType,
      startDate: evFormStart, endDate: evFormEnd,
      capacity: parseInt(evFormCapacity) || 0, cost: parseInt(evFormCost) || 0,
      venueName: '', city: '', country: '', address: '',
      hasRamps: false, hasLoop: false, hasToilets: false, hasParking: false,
      ticketType: 'gratuita', priceGen: 0, priceVip: 0,
      discStudent: true, discSenior: true, discDisabled: true
    };
    setEvents(prev => [...prev, newEvent]);
    setAgendaSessions(prev => ({ ...prev, [newId]: [] }));
    setShowConfirmModal(false);
    showToast(t('event_success'));
    setTimeout(() => navigate('/dashboard/costs'), 800);
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  // Etiquetas amigables de tipo de evento
  const typeLabels: Record<string, { es: string; en: string }> = {
    conferencia: { es: 'Conferencia / Seminario', en: 'Conference / Seminar' },
    concierto:   { es: 'Concierto / Evento Cultural', en: 'Concert / Cultural Event' },
    taller:      { es: 'Taller Tecnológico', en: 'Tech Workshop' },
    exposicion:  { es: 'Exposición Inclusiva', en: 'Inclusive Exhibition' },
  };
  const typeLabelText = typeLabels[evFormType]?.[currentLang] ?? evFormType;

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        <span>{t('event_title')}</span>
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>{t('event_legend')}</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event-type">{t('event_type')}</label>
              <select id="event-type" value={evFormType} onChange={(e) => setEvFormType(e.target.value)}>
                <option value="conferencia">{t('opt_conference')}</option>
                <option value="concierto">{t('opt_concert')}</option>
                <option value="taller">{t('opt_workshop')}</option>
                <option value="exposicion">{t('opt_exhibition')}</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="event-name">{t('event_name')}</label>
              <input type="text" id="event-name" required placeholder="Ej. Congreso de Accesibilidad Universal 2026" value={evFormName} onChange={(e) => setEvFormName(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event-start">{t('event_start')}</label>
              <input type="date" id="event-start" required value={evFormStart} onChange={(e) => setEvFormStart(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="event-end">{t('event_end')}</label>
              <input type="date" id="event-end" required value={evFormEnd} onChange={(e) => setEvFormEnd(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event-capacity">{t('event_capacity')}</label>
              <input type="number" id="event-capacity" min="1" placeholder="Ej. 250" value={evFormCapacity} onChange={(e) => setEvFormCapacity(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="event-cost">{t('event_cost')}</label>
              <input type="number" id="event-cost" min="0" placeholder="Ej. 12000" value={evFormCost} onChange={(e) => setEvFormCost(e.target.value)} />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{t('event_btn')}</button>
          </div>
        </fieldset>
      </form>

      {/* WCAG 3.3.4 — Modal de confirmación antes de guardar el evento */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-confirm-title"
          aria-describedby="event-confirm-desc"
          className="confirm-modal-overlay"
        >
          <div className="confirm-modal">
            <h3 id="event-confirm-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {currentLang === 'es' ? 'Confirmar Creación del Evento' : 'Confirm Event Creation'}
            </h3>
            <p id="event-confirm-desc" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {currentLang === 'es'
                ? 'Por favor revise los datos del evento antes de confirmar. Una vez creado, podrá editarlos en la sección de Costos y Entradas.'
                : 'Please review the event details before confirming. Once created, you can update them in the Costs & Tickets section.'}
            </p>

            <table
              style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}
              aria-label={currentLang === 'es' ? 'Resumen del nuevo evento' : 'New event summary'}
            >
              <tbody>
                {[
                  [t('event_type'),     typeLabelText],
                  [t('event_name'),     evFormName],
                  [t('event_start'),    evFormStart],
                  [t('event_end'),      evFormEnd],
                  [t('event_capacity'), evFormCapacity ? `${evFormCapacity} ${currentLang === 'es' ? 'personas' : 'attendees'}` : '—'],
                  [t('event_cost'),     evFormCost ? `$${evFormCost}` : '$0'],
                ].map(([key, value]) => (
                  <tr key={String(key)} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', fontWeight: 600, width: '40%' }}>{key}</th>
                    <td style={{ padding: '0.4rem 0.5rem' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="btn-group" style={{ marginTop: 0 }}>
              <button
                className="btn btn-primary"
                onMouseUp={handleConfirm}
                aria-label={currentLang === 'es' ? 'Confirmar y guardar el evento' : 'Confirm and save the event'}
              >
                ✓ {currentLang === 'es' ? 'Confirmar y Guardar' : 'Confirm & Save'}
              </button>
              <button
                className="btn btn-secondary"
                onMouseUp={handleCancelConfirm}
                aria-label={currentLang === 'es' ? 'Cancelar y volver al formulario' : 'Cancel and return to form'}
              >
                {currentLang === 'es' ? 'Volver y Editar' : 'Go Back & Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
