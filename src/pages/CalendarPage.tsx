import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CalendarPage() {
  const { t, currentLang, events } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locFilter, setLocFilter] = useState('all');

  const filteredEvents = events.filter(ev => {
    const matchesQuery = ev.name.toLowerCase().includes(searchQuery.toLowerCase()) || (ev.venueName && ev.venueName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesLoc = locFilter === 'all' || ev.city === locFilter;
    return matchesQuery && matchesType && matchesLoc;
  });

  const uniqueCities = Array.from(new Set(events.map(ev => ev.city).filter(Boolean)));

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>{t('cal_title')}</span>
      </h2>

      <fieldset>
        <legend>{t('cal_filters')}</legend>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cal-search-input">{t('cal_search')}</label>
            <input type="text" id="cal-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ej. Accesibilidad" />
          </div>
          <div className="form-group">
            <label htmlFor="cal-type-select">{t('cal_filter_type')}</label>
            <select id="cal-type-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{t('cal_all')}</option>
              <option value="conferencia">{t('opt_conference')}</option>
              <option value="concierto">{t('opt_concert')}</option>
              <option value="taller">{t('opt_workshop')}</option>
              <option value="exposicion">{t('opt_exhibition')}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cal-loc-select">{t('cal_filter_loc')}</label>
            <select id="cal-loc-select" value={locFilter} onChange={(e) => setLocFilter(e.target.value)}>
              <option value="all">{currentLang === 'es' ? 'Todas' : 'All'}</option>
              {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="calendar-grid" role="region" aria-live="polite">
        {filteredEvents.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('cal_no_events')}
          </div>
        ) : (
          filteredEvents.map(ev => (
            <article key={ev.id} className="event-card" tabIndex={0}>
              <div className="event-card-img" role="img" aria-label={`Banner ${ev.name}`}>
                <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{ev.type}</span>
              </div>
              <div className="event-card-body">
                <span className="badge badge-active">{currentLang === 'es' ? 'Confirmado' : 'Confirmed'}</span>
                <h3 className="event-card-title">{ev.name}</h3>
                <p className="event-card-meta">📅 {ev.startDate} {ev.endDate !== ev.startDate && ` - ${ev.endDate}`}</p>
                <p className="event-card-meta">📍 {ev.venueName || (currentLang === 'es' ? 'Sin recinto' : 'No Venue')}, {ev.city}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }} aria-label="Servicios">
                  {ev.hasRamps && <span title="Rampas" aria-label="Rampas accesibles">♿</span>}
                  {ev.hasLoop && <span title="Bucle Magnético" aria-label="Bucle Magnético">🦻</span>}
                  {ev.hasToilets && <span title="Baños Adaptados" aria-label="Baños adaptados">🚻</span>}
                  {ev.hasParking && <span title="Parqueo PCD" aria-label="Estacionamiento accesible">🅿</span>}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
