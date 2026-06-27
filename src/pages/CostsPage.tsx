import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CostsPage() {
  const { t, events, setEvents, showToast } = useApp();
  const navigate = useNavigate();

  const [costsSelectedEventId, setCostsSelectedEventId] = useState(events[0]?.id || '');
  const [costsTicketType, setCostsTicketType] = useState('mixta');
  const [costsPriceGen, setCostsPriceGen] = useState(0);
  const [costsPriceVip, setCostsPriceVip] = useState(0);
  const [costsDiscStudent, setCostsDiscStudent] = useState(true);
  const [costsDiscSenior, setCostsDiscSenior] = useState(true);
  const [costsDiscDisabled, setCostsDiscDisabled] = useState(true);
  const [costsEarlyBird, setCostsEarlyBird] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEvents(prev => prev.map(ev => {
      if (ev.id === costsSelectedEventId) {
        return { ...ev, ticketType: costsTicketType, priceGen: costsPriceGen, priceVip: costsPriceVip, discStudent: costsDiscStudent, discSenior: costsDiscSenior, discDisabled: costsDiscDisabled };
      }
      return ev;
    }));
    showToast(t('costs_btn').includes('Guardar') ? 'Precios y descuentos configurados correctamente.' : 'Ticket pricing and discounts successfully saved.');
    setTimeout(() => navigate('/dashboard/venue'), 800);
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        <span>{t('costs_title')}</span>
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>{t('costs_legend')}</legend>
          <div className="form-group">
            <label htmlFor="costs-event-select">{t('costs_select_event')}</label>
            <select id="costs-event-select" value={costsSelectedEventId} onChange={(e) => setCostsSelectedEventId(e.target.value)}>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costs-ticket-type">{t('costs_ticket_type')}</label>
              <select id="costs-ticket-type" value={costsTicketType} onChange={(e) => setCostsTicketType(e.target.value)}>
                <option value="gratuita">{t('costs_free')}</option>
                <option value="pago">{t('costs_paid')}</option>
                <option value="mixta">{t('costs_mixed')}</option>
              </select>
            </div>
            {costsTicketType !== 'gratuita' && (
              <>
                <div className="form-group">
                  <label htmlFor="costs-price-gen">{t('costs_price_gen')}</label>
                  <input type="number" id="costs-price-gen" min="0" value={costsPriceGen} onChange={(e) => setCostsPriceGen(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label htmlFor="costs-price-vip">{t('costs_price_vip')}</label>
                  <input type="number" id="costs-price-vip" min="0" value={costsPriceVip} onChange={(e) => setCostsPriceVip(parseFloat(e.target.value) || 0)} />
                </div>
              </>
            )}
          </div>

          <div className="form-group">
            <span id="discounts-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{t('costs_discounts')}</span>
            <div role="group" aria-labelledby="discounts-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 'normal' }}>
                <input type="checkbox" checked={costsDiscStudent} onChange={(e) => setCostsDiscStudent(e.target.checked)} /> <span>{t('costs_disc_student')}</span>
              </label>
              <label style={{ fontWeight: 'normal' }}>
                <input type="checkbox" checked={costsDiscSenior} onChange={(e) => setCostsDiscSenior(e.target.checked)} /> <span>{t('costs_disc_senior')}</span>
              </label>
              <label style={{ fontWeight: 'normal' }}>
                <input type="checkbox" checked={costsDiscDisabled} onChange={(e) => setCostsDiscDisabled(e.target.checked)} /> <span>{t('costs_disc_disabled')}</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="costs-early-bird">{t('costs_early_bird')}</label>
            <input type="date" id="costs-early-bird" value={costsEarlyBird} onChange={(e) => setCostsEarlyBird(e.target.value)} />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{t('costs_btn')}</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
