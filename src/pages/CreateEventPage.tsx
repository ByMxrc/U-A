import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { EventItem } from '../context/AppContext';

export default function CreateEventPage() {
  const { t, events, setEvents, setAgendaSessions, showToast } = useApp();
  const navigate = useNavigate();

  const [evFormType, setEvFormType] = useState('conferencia');
  const [evFormName, setEvFormName] = useState('');
  const [evFormStart, setEvFormStart] = useState('');
  const [evFormEnd, setEvFormEnd] = useState('');
  const [evFormCapacity, setEvFormCapacity] = useState('');
  const [evFormCost, setEvFormCost] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!evFormName || !evFormStart || !evFormEnd || !evFormCapacity) {
      showToast(t('event_success').includes('!') ? 'Complete todos los campos del evento.' : 'Complete all event fields.', true);
      return;
    }

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
    showToast(t('event_success'));
    setTimeout(() => navigate('/dashboard/costs'), 800);
  };

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
    </div>
  );
}
