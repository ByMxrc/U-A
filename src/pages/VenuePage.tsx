import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function VenuePage() {
  const { t, currentLang, events, setEvents, showToast, setScreenReaderText } = useApp();
  const navigate = useNavigate();

  const [venueSelectedEventId, setVenueSelectedEventId] = useState(events[0]?.id || '');
  const [venueName, setVenueName] = useState('');
  const [venueCountry, setVenueCountry] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [resRamps, setResRamps] = useState(false);
  const [resLoop, setResLoop] = useState(false);
  const [resToilets, setResToilets] = useState(false);
  const [resParking, setResParking] = useState(false);
  const [aiBoxOpen, setAiBoxOpen] = useState(false);
  const [aiResultText, setAiResultText] = useState('');

  const calculateAICapacity = () => {
    const selectedEvent = events.find(e => e.id === venueSelectedEventId);
    const capacityVal = selectedEvent ? selectedEvent.capacity : 100;
    let accessiblePercent = 2;
    const listDetails: string[] = [];
    if (resRamps) { accessiblePercent += 4; listDetails.push(currentLang === 'es' ? '+4% por Rampa de acceso nivelada' : '+4% for Level access ramp'); }
    if (resToilets) { accessiblePercent += 4; listDetails.push(currentLang === 'es' ? '+4% por Baños adaptados reglamentarios' : '+4% for Standard adapted restrooms'); }
    if (resLoop) { accessiblePercent += 3; listDetails.push(currentLang === 'es' ? '+3% por Bucle Magnético de inducción' : '+3% for Audio Hearing Loop'); }
    if (resParking) { accessiblePercent += 2; listDetails.push(currentLang === 'es' ? '+2% por Plaza de Estacionamiento reservada' : '+2% for Reserved Parking slots'); }
    const totalDisabilityCapacity = Math.floor(capacityVal * (accessiblePercent / 100));
    const text = accessiblePercent === 2
      ? `${currentLang === 'es' ? '⚠ ALERTA DE SEGURIDAD: Este recinto no cuenta con accesibilidad física mínima. El aforo seguro para PCD se limita al 2% (' : '⚠ SAFETY ALERT: This venue lacks basic physical accessibility. Safe limit is set to 2% ('}${totalDisabilityCapacity} ${currentLang === 'es' ? 'asistentes) de forma preventiva.' : 'attendees) defensively.'}`
      : `${currentLang === 'es' ? 'Aforo adaptado seguro sugerido' : 'Suggested safe adapted capacity'}: ${totalDisabilityCapacity} ${currentLang === 'es' ? 'asistentes PCD' : 'PWD attendees'} (${accessiblePercent}% ${currentLang === 'es' ? 'del aforo general' : 'of general capacity'}).\n\nDesglose:\n${listDetails.join('\n')}`;
    setAiResultText(text);
    setAiBoxOpen(true);
    setScreenReaderText(text);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEvents(prev => prev.map(ev => {
      if (ev.id === venueSelectedEventId) {
        return { ...ev, venueName, country: venueCountry, city: venueCity, address: venueAddress, hasRamps: resRamps, hasLoop: resLoop, hasToilets: resToilets, hasParking: resParking };
      }
      return ev;
    }));
    showToast(currentLang === 'es' ? 'Información del recinto guardada con éxito.' : 'Venue physical accessibility details saved.');
    setTimeout(() => navigate('/dashboard/agenda'), 800);
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>{t('venue_title')}</span>
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>{t('venue_legend')}</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="venue-event-select">{t('costs_select_event')}</label>
              <select id="venue-event-select" value={venueSelectedEventId} onChange={(e) => setVenueSelectedEventId(e.target.value)}>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="venue-name">{t('venue_name')}</label>
              <input type="text" id="venue-name" required value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Centro de Convenciones Metropolitano" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="venue-country">{t('venue_country')}</label>
              <input type="text" id="venue-country" required value={venueCountry} onChange={(e) => setVenueCountry(e.target.value)} placeholder="Ecuador" />
            </div>
            <div className="form-group">
              <label htmlFor="venue-city">{t('venue_city')}</label>
              <input type="text" id="venue-city" required value={venueCity} onChange={(e) => setVenueCity(e.target.value)} placeholder="Quito" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="venue-address">{t('venue_address')}</label>
            <input type="text" id="venue-address" required value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Av. Amazonas y Mariana de Jesús" />
          </div>

          <div className="form-group">
            <span id="venue-resources-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{t('venue_resources')}</span>
            <div role="group" aria-labelledby="venue-resources-label" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <label style={{ fontWeight: 'normal' }}><input type="checkbox" checked={resRamps} onChange={(e) => setResRamps(e.target.checked)} /> <span>{t('venue_ramps')}</span></label>
              <label style={{ fontWeight: 'normal' }}><input type="checkbox" checked={resLoop} onChange={(e) => setResLoop(e.target.checked)} /> <span>{t('venue_loop')}</span></label>
              <label style={{ fontWeight: 'normal' }}><input type="checkbox" checked={resToilets} onChange={(e) => setResToilets(e.target.checked)} /> <span>{t('venue_toilets')}</span></label>
              <label style={{ fontWeight: 'normal' }}><input type="checkbox" checked={resParking} onChange={(e) => setResParking(e.target.checked)} /> <span>{t('venue_parking')}</span></label>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onMouseUp={calculateAICapacity}>{t('venue_ai_btn')}</button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{t('venue_ai_desc')}</p>
            <div className={`ai-box ${aiBoxOpen ? 'open' : ''}`} role="region" aria-live="polite">
              <h4>{t('ai_result_title')}</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{aiResultText}</p>
            </div>
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{t('btn_save')}</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
