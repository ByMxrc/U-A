import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { SessionItem } from '../context/AppContext';

// Favoritos persistidos en localStorage por usuario
function loadFavs(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`ua_favs_${userId}`);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}
function saveFavs(userId: string, favs: Set<string>) {
  localStorage.setItem(`ua_favs_${userId}`, JSON.stringify([...favs]));
}

export default function CalendarPage() {
  const { t, currentLang, events, agendaSessions, isLoggedIn, userProfile } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locFilter, setLocFilter] = useState('all');
  const [favsOnly, setFavsOnly] = useState(false);

  // Estado de favoritos (per-user)
  const userId = isLoggedIn ? userProfile.email : 'guest';
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavs(userId));

  // Modal de programa del evento
  const [programEventId, setProgramEventId] = useState<string | null>(null);

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      saveFavs(userId, next);
      return next;
    });
  };

  const filteredEvents = events.filter(ev => {
    const matchesQuery = ev.name.toLowerCase().includes(searchQuery.toLowerCase()) || (ev.venueName && ev.venueName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesLoc = locFilter === 'all' || ev.city === locFilter;
    const matchesFav = !favsOnly || favorites.has(ev.id);
    return matchesQuery && matchesType && matchesLoc && matchesFav;
  });

  const uniqueCities = Array.from(new Set(events.map(ev => ev.city).filter(Boolean)));

  // Evento cuyo programa está abierto
  const programEvent = programEventId ? events.find(e => e.id === programEventId) : null;
  const programSessions: SessionItem[] = programEventId ? (agendaSessions[programEventId] ?? []) : [];

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

        {/* Filtro de favoritos */}
        <div className="switch-container" style={{ marginTop: '0.5rem' }}>
          <label htmlFor="cal-favs-checkbox" className="switch-label">
            ⭐ {t('cal_fav_filter')}
          </label>
          <input
            type="checkbox"
            id="cal-favs-checkbox"
            className="switch-checkbox"
            checked={favsOnly}
            onChange={(e) => setFavsOnly(e.target.checked)}
          />
          <div className="switch-control" onMouseUp={() => setFavsOnly(f => !f)}></div>
        </div>
      </fieldset>

      <div className="calendar-grid" role="region" aria-live="polite">
        {filteredEvents.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {favsOnly ? t('cal_fav_none') : t('cal_no_events')}
          </div>
        ) : (
          filteredEvents.map(ev => {
            const isFav = favorites.has(ev.id);
            return (
              <article key={ev.id} className="event-card" tabIndex={0}>
                <div className="event-card-img" role="img" aria-label={`Banner ${ev.name}`}>
                  <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{ev.type}</span>
                </div>
                <div className="event-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-active">{currentLang === 'es' ? 'Confirmado' : 'Confirmed'}</span>
                    {/* Botón de favorito */}
                    <button
                      className="btn-fav"
                      onMouseUp={() => toggleFavorite(ev.id)}
                      aria-pressed={isFav}
                      aria-label={`${t('cal_fav_toggle')}: ${ev.name}`}
                      title={isFav ? (currentLang === 'es' ? 'Quitar de favoritos' : 'Remove from favorites') : (currentLang === 'es' ? 'Añadir a favoritos' : 'Add to favorites')}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1.3rem', lineHeight: 1, padding: '0.2rem',
                        color: isFav ? '#f59e0b' : 'var(--text-muted)',
                        transition: 'color 0.2s, transform 0.15s',
                        transform: isFav ? 'scale(1.2)' : 'scale(1)',
                      }}
                    >
                      {isFav ? '⭐' : '☆'}
                    </button>
                  </div>
                  <h3 className="event-card-title">{ev.name}</h3>
                  <p className="event-card-meta">📅 {ev.startDate} {ev.endDate !== ev.startDate && ` - ${ev.endDate}`}</p>
                  <p className="event-card-meta">📍 {ev.venueName || (currentLang === 'es' ? 'Sin recinto' : 'No Venue')}, {ev.city}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }} aria-label="Servicios">
                    {ev.hasRamps && <span title="Rampas" aria-label="Rampas accesibles">♿</span>}
                    {ev.hasLoop && <span title="Bucle Magnético" aria-label="Bucle Magnético">🦻</span>}
                    {ev.hasToilets && <span title="Baños Adaptados" aria-label="Baños adaptados">🚻</span>}
                    {ev.hasParking && <span title="Parqueo PCD" aria-label="Estacionamiento accesible">🅿</span>}
                  </div>

                  {/* Botón Ver Programa */}
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem', minHeight: '36px', minWidth: 'auto', width: '100%' }}
                    onMouseUp={() => setProgramEventId(ev.id)}
                    aria-label={`${t('cal_view_program')}: ${ev.name}`}
                  >
                    📅 {t('cal_view_program')}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal de programa del evento */}
      {programEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="program-modal-title"
          className="confirm-modal-overlay"
          onMouseUp={(e) => { if (e.target === e.currentTarget) setProgramEventId(null); }}
        >
          <div className="confirm-modal" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 id="program-modal-title" style={{ fontSize: '1.1rem', fontWeight: 700, flex: 1, paddingRight: '1rem' }}>
                📅 {t('cal_program_title')}: {programEvent.name}
              </h3>
              <button
                className="acc-close-btn"
                onMouseUp={() => setProgramEventId(null)}
                aria-label={currentLang === 'es' ? 'Cerrar programa del evento' : 'Close event program'}
                style={{ flexShrink: 0 }}
              >✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              📍 {programEvent.venueName}, {programEvent.city} &nbsp;·&nbsp; 📆 {programEvent.startDate}
              {programEvent.endDate !== programEvent.startDate && ` – ${programEvent.endDate}`}
            </p>

            {programSessions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>
                {t('cal_no_sessions')}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {programSessions
                  .slice()
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((sess, idx) => (
                    <li key={idx} style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-primary)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: 'var(--accent-secondary)', fontSize: '1rem' }}>{sess.time}</strong>
                          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>—</span>
                          <strong>{sess.name}</strong>
                        </div>
                        {sess.interpreter && (
                          <span className="badge" style={{ backgroundColor: 'var(--bg-active)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)', fontSize: '0.7rem' }} aria-label="Requiere intérprete de lengua de señas">
                            🤟 {currentLang === 'es' ? 'Intérprete' : 'Interpreter'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                        🎤 {sess.speaker} &nbsp;·&nbsp; 🏛 {sess.room}
                        {sess.materials && (
                          <> &nbsp;·&nbsp; <a href={sess.materials} target="_blank" rel="noopener noreferrer">{currentLang === 'es' ? 'Materiales' : 'Materials'}</a></>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}

            <div className="btn-group" style={{ marginTop: '1rem' }}>
              <button
                className="btn btn-secondary"
                onMouseUp={() => setProgramEventId(null)}
              >
                {currentLang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
