import { useState } from 'react';
import { useApp } from '../context/AppContext';

type AdminTab = 'users' | 'surveys' | 'stats';

const StarRating = ({ value }: { value: number }) => (
  <span aria-label={`${value} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= value ? '#f59e0b' : 'var(--border-color)', fontSize: '1.1rem' }}>★</span>
    ))}
  </span>
);

export default function AdminPage() {
  const { t, currentLang, registrations, surveys, incidents } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // ── Stats calculations ──
  const activeRegs = registrations.filter(r => r.status === 'active');
  const generalCount = activeRegs.filter(r => r.category === 'general').length;
  const vipCount = activeRegs.filter(r => r.category === 'vip').length;
  const avgSatisfaction = surveys.length
    ? (surveys.reduce((acc, s) => acc + s.satisfaction, 0) / surveys.length).toFixed(1)
    : '—';

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(currentLang === 'es' ? 'es-EC' : 'en-US', {
        dateStyle: 'short', timeStyle: 'short'
      });
    } catch { return iso; }
  };

  const statCards = [
    { label: t('admin_stat_total_reg'), value: activeRegs.length, icon: '👤', color: 'var(--accent-primary)' },
    { label: t('admin_stat_avg_sat'), value: avgSatisfaction, icon: '⭐', color: '#f59e0b' },
    { label: t('admin_stat_general'), value: generalCount, icon: '🎫', color: 'var(--accent-secondary)' },
    { label: t('admin_stat_vip'), value: vipCount, icon: '💎', color: '#8b5cf6' },
    { label: t('admin_stat_incidents'), value: incidents.length, icon: '⚠️', color: '#ef4444' },
    { label: t('admin_stat_surveys_count'), value: surveys.length, icon: '📊', color: '#10b981' },
  ];

  const maxBarValue = Math.max(generalCount, vipCount, 1);

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
        </svg>
        <span>{t('admin_title')}</span>
      </h2>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
        {([
          { key: 'users' as AdminTab, label: t('admin_tab_users'), icon: '👥' },
          { key: 'surveys' as AdminTab, label: t('admin_tab_surveys'), icon: '📋' },
          { key: 'stats' as AdminTab, label: t('admin_tab_stats'), icon: '📊' },
        ]).map(tab => (
          <button
            key={tab.key}
            id={`admin-tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            onMouseUp={() => setActiveTab(tab.key)}
            style={{
              padding: '0.65rem 1.2rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === tab.key ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '-2px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.key === 'users' && (
              <span style={{
                background: 'var(--accent-primary)', color: '#fff',
                borderRadius: '9999px', padding: '0.05rem 0.5rem',
                fontSize: '0.7rem', fontWeight: 700
              }}>{registrations.length}</span>
            )}
            {tab.key === 'surveys' && surveys.length > 0 && (
              <span style={{
                background: '#10b981', color: '#fff',
                borderRadius: '9999px', padding: '0.05rem 0.5rem',
                fontSize: '0.7rem', fontWeight: 700
              }}>{surveys.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: USUARIOS REGISTRADOS ── */}
      {activeTab === 'users' && (
        <div>
          {registrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
              <p>{t('admin_users_empty')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} aria-label={t('admin_tab_users')}>
                <thead>
                  <tr style={{ background: 'var(--surface-color)', borderBottom: '2px solid var(--border-color)' }}>
                    {[
                      currentLang === 'es' ? 'Nombre' : 'Name',
                      'Email',
                      currentLang === 'es' ? 'Evento' : 'Event',
                      currentLang === 'es' ? 'Categoría' : 'Category',
                      currentLang === 'es' ? 'Descuento' : 'Discount',
                      currentLang === 'es' ? 'Fecha' : 'Date',
                      currentLang === 'es' ? 'Estado' : 'Status',
                      currentLang === 'es' ? 'Invitación' : 'Invitation',
                    ].map(h => (
                      <th key={h} style={{ padding: '0.75rem 0.6rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr
                      key={reg.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: idx % 2 === 0 ? 'transparent' : 'var(--surface-color)',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.6rem', fontWeight: 600 }}>{reg.userName}</td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{reg.userEmail}</td>
                      <td style={{ padding: '0.65rem 0.6rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.eventName}>{reg.eventName}</td>
                      <td style={{ padding: '0.65rem 0.6rem' }}>
                        <span style={{
                          background: reg.category === 'vip' ? '#8b5cf620' : 'var(--accent-primary)20',
                          color: reg.category === 'vip' ? '#8b5cf6' : 'var(--accent-primary)',
                          borderRadius: '0.3rem', padding: '0.2rem 0.5rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase'
                        }}>
                          {reg.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {reg.discount === 'none' ? '—' : reg.discount}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {formatDate(reg.timestamp)}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem' }}>
                        <span className={`badge ${reg.status === 'active' ? 'badge-active' : 'badge-cancelled'}`}>
                          {reg.status === 'active' ? t('my_tickets_active') : t('my_tickets_cancelled')}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          color: '#10b981', fontSize: '0.78rem', fontWeight: 600
                        }}>
                          ✉️ {t('admin_inv_sent')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ENCUESTAS ── */}
      {activeTab === 'surveys' && (
        <div>
          {surveys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
              <p>{t('admin_surveys_empty')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} aria-label={t('admin_tab_surveys')}>
                <thead>
                  <tr style={{ background: 'var(--surface-color)', borderBottom: '2px solid var(--border-color)' }}>
                    {[
                      currentLang === 'es' ? 'Evento' : 'Event',
                      currentLang === 'es' ? 'Respondente' : 'Respondent',
                      currentLang === 'es' ? 'Satisfacción' : 'Satisfaction',
                      currentLang === 'es' ? 'Comentarios' : 'Comments',
                      currentLang === 'es' ? 'Fecha' : 'Date',
                    ].map(h => (
                      <th key={h} style={{ padding: '0.75rem 0.6rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((sv, idx) => (
                    <tr
                      key={sv.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: idx % 2 === 0 ? 'transparent' : 'var(--surface-color)',
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.6rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sv.eventName}>{sv.eventName}</td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {sv.respondentName ?? (currentLang === 'es' ? 'Anónimo' : 'Anonymous')}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem' }}>
                        <StarRating value={sv.satisfaction} />
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>({sv.satisfaction}/5)</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '250px' }}>
                        {sv.comments || <em style={{ opacity: 0.5 }}>{currentLang === 'es' ? 'Sin comentarios' : 'No comments'}</em>}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-secondary)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {formatDate(sv.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ESTADÍSTICAS ── */}
      {activeTab === 'stats' && (
        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {statCards.map(card => (
              <div
                key={card.label}
                style={{
                  background: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  padding: '1.2rem 1rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Distribution chart */}
          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.2rem', fontSize: '1rem', fontWeight: 700 }}>
              {currentLang === 'es' ? 'Distribución de Entradas' : 'Ticket Distribution'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: t('admin_stat_general'), count: generalCount, color: 'var(--accent-primary)' },
                { label: t('admin_stat_vip'), count: vipCount, color: '#8b5cf6' },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{row.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.count} {currentLang === 'es' ? 'entradas' : 'tickets'}</span>
                  </div>
                  <div style={{ height: '12px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(row.count / maxBarValue) * 100}%`,
                      background: row.color,
                      borderRadius: '9999px',
                      transition: 'width 0.6s ease',
                      minWidth: row.count > 0 ? '4px' : '0',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction distribution */}
          {surveys.length > 0 && (
            <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.2rem', fontSize: '1rem', fontWeight: 700 }}>
                {currentLang === 'es' ? 'Distribución de Satisfacción' : 'Satisfaction Distribution'}
              </h3>
              {[5, 4, 3, 2, 1].map(val => {
                const count = surveys.filter(s => s.satisfaction === val).length;
                const pct = surveys.length > 0 ? (count / surveys.length) * 100 : 0;
                return (
                  <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <span style={{ minWidth: '2.5rem', textAlign: 'right', fontSize: '0.85rem' }}>
                      {'★'.repeat(val)}
                    </span>
                    <div style={{ flex: 1, height: '10px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: val >= 4 ? '#10b981' : val === 3 ? '#f59e0b' : '#ef4444',
                        borderRadius: '9999px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ minWidth: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
