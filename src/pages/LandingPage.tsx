import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { currentLang, setCurrentLang } = useApp();
  const navigate = useNavigate();
  const es = currentLang === 'es';

  const features = [
    {
      icon: (
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: es ? 'Gestión de Eventos' : 'Event Management',
      desc: es
        ? 'Crea y administra conferencias, talleres, conciertos y exposiciones con todos sus detalles: fechas, capacidad, costos y tipos de entrada.'
        : 'Create and manage conferences, workshops, concerts and exhibitions with full details: dates, capacity, costs and ticket types.',
    },
    {
      icon: (
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: es ? 'Inscripciones Digitales' : 'Digital Registration',
      desc: es
        ? 'Gestiona registros de asistentes con boleto digital y código QR. Envía correos de invitación y realiza check-in en tiempo real.'
        : 'Manage attendee registrations with digital tickets and QR codes. Send invitation emails and perform real-time check-in.',
    },
    {
      icon: (
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: es ? 'Accesibilidad del Recinto' : 'Venue Accessibility',
      desc: es
        ? 'Registra y publica los recursos de accesibilidad física: rampas, bucles magnéticos, baños adaptados y estacionamiento accesible.'
        : 'Register and publish physical accessibility resources: ramps, hearing loops, adapted restrooms, and accessible parking.',
    },
    {
      icon: (
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: es ? 'Gestión de Incidencias' : 'Incident Management',
      desc: es
        ? 'Reporta y registra incidencias operativas, médicas y de seguridad. Las alertas de alta gravedad se notifican de inmediato en toda la plataforma.'
        : 'Report and log operational, medical, and security incidents. High-severity alerts are instantly broadcast across the platform.',
    },
    {
      icon: (
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: es ? 'Panel Analítico' : 'Analytics Dashboard',
      desc: es
        ? 'Consulta estadísticas en tiempo real: asistencia, distribución de entradas, resultados de encuestas de satisfacción y métricas del evento.'
        : 'View real-time statistics: attendance, ticket distribution, satisfaction survey results, and event metrics.',
    },
    {
      icon: (
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" /><path d="M9 11h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v4a1 1 0 0 1-2 0v-4h-1v4a1 1 0 0 1-2 0v-4H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" />
        </svg>
      ),
      title: es ? 'Diseño Inclusivo' : 'Inclusive Design',
      desc: es
        ? 'Plataforma totalmente accesible: alto contraste, navegación por teclado, modo dislexia, soporte multilenguaje y lector de pantalla integrado.'
        : 'Fully accessible platform: high contrast, keyboard navigation, dyslexia mode, multilanguage support, and integrated screen reader.',
    },
  ];

  const stats = [
    { value: '100%', label: es ? 'Accesible' : 'Accessible' },
    { value: '4', label: es ? 'Tipos de evento' : 'Event types' },
    { value: '2', label: es ? 'Idiomas' : 'Languages' },
    { value: '∞', label: es ? 'Eventos' : 'Events' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'var(--font-main)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.9rem 2rem',
        background: 'var(--surface-color)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
            {es ? 'EventOS' : 'EventOS'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={currentLang}
            onChange={e => setCurrentLang(e.target.value as 'es' | 'en')}
            aria-label={es ? 'Cambiar idioma' : 'Change language'}
            style={{
              background: 'var(--bg-color)', border: '1px solid var(--border-color)',
              borderRadius: '0.4rem', padding: '0.3rem 0.6rem',
              color: 'var(--text-color)', fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            <option value="es">🌐 ES</option>
            <option value="en">🌐 EN</option>
          </select>
          <button
            id="landing-login-btn"
            onClick={() => navigate('/login')}
            style={{
              background: 'var(--accent-primary)', color: '#fff',
              border: 'none', borderRadius: '0.5rem',
              padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {es ? 'Acceder →' : 'Sign In →'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        textAlign: 'center', padding: '5rem 1.5rem 3.5rem',
        background: 'linear-gradient(160deg, var(--surface-color) 0%, var(--bg-color) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-primary)18 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--accent-primary)18', border: '1px solid var(--accent-primary)40',
            borderRadius: '2rem', padding: '0.35rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600,
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            {es ? 'Plataforma de Gestión de Eventos' : 'Event Management Platform'}
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15,
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, var(--text-color) 0%, var(--accent-primary) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {es ? 'Gestiona eventos con\nprofesionalismo' : 'Manage events with\nprofessionalism'}
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)',
            maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.7,
          }}>
            {es
              ? 'Una plataforma completa para organizadores: inscripciones, agenda, check-in, incidencias, encuestas y estadísticas en un solo lugar.'
              : 'A complete platform for organizers: registrations, agenda, check-in, incidents, surveys, and statistics all in one place.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="hero-access-btn"
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: '#fff', border: 'none', borderRadius: '0.6rem',
                padding: '0.85rem 2rem', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', boxShadow: '0 4px 20px var(--accent-primary)40',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px var(--accent-primary)60'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-primary)40'; }}
            >
              {es ? '🚀 Ingresar al sistema' : '🚀 Enter the system'}
            </button>
            <button
              id="hero-calendar-btn"
              onClick={() => navigate('/calendar')}
              style={{
                background: 'transparent', color: 'var(--text-color)',
                border: '1px solid var(--border-color)', borderRadius: '0.6rem',
                padding: '0.85rem 2rem', fontWeight: 600, fontSize: '1rem',
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              {es ? '📅 Ver eventos públicos' : '📅 View public events'}
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section aria-label={es ? 'Estadísticas' : 'Statistics'} style={{
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: '0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
        background: 'var(--surface-color)',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '1.75rem 2.5rem',
            borderRight: i < stats.length - 1 ? '1px solid var(--border-color)' : 'none',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section aria-labelledby="features-title" style={{ padding: '4rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 id="features-title" style={{
          textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700, marginBottom: '0.75rem',
        }}>
          {es ? 'Todo lo que necesitas para organizar eventos' : 'Everything you need to organize events'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem' }}>
          {es
            ? 'Herramientas especializadas para cada etapa del ciclo de vida de un evento.'
            : 'Specialized tools for every stage of the event lifecycle.'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--surface-color)', border: '1px solid var(--border-color)',
              borderRadius: '1rem', padding: '1.75rem',
              transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '0.75rem',
                background: 'var(--accent-primary)15', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-primary)', marginBottom: '1rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="how-title" style={{
        padding: '4rem 1.5rem',
        background: 'var(--surface-color)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 id="how-title" style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
            {es ? '¿Cómo funciona?' : 'How does it work?'}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            {es ? 'Proceso simple para organizar tu evento de principio a fin.' : 'Simple process to organize your event from start to finish.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              {
                step: '01', color: 'var(--accent-primary)',
                title: es ? 'Crea el evento' : 'Create the event',
                desc: es ? 'Define nombre, tipo, fechas, capacidad y configura los recursos del recinto.' : 'Set the name, type, dates, capacity and configure venue resources.',
              },
              {
                step: '02', color: 'var(--accent-secondary)',
                title: es ? 'Gestiona inscripciones' : 'Manage registrations',
                desc: es ? 'Los asistentes se registran digitalmente y reciben su boleto con código QR.' : 'Attendees register digitally and receive their ticket with QR code.',
              },
              {
                step: '03', color: '#10b981',
                title: es ? 'Realiza el check-in' : 'Run check-in',
                desc: es ? 'Controla la asistencia en tiempo real con escaneo de QR y visualiza el progreso.' : 'Track attendance in real time with QR scanning and view progress.',
              },
              {
                step: '04', color: '#f59e0b',
                title: es ? 'Analiza los resultados' : 'Analyze results',
                desc: es ? 'Revisa las encuestas de satisfacción y estadísticas del panel de administración.' : 'Review satisfaction surveys and statistics in the admin panel.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                padding: '1.25rem', borderRadius: '0.75rem',
                background: 'var(--bg-color)', border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  minWidth: '48px', height: '48px', borderRadius: '50%',
                  background: item.color + '20', border: `2px solid ${item.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', color: item.color,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1rem' }}>
          {es ? '¿Listo para organizar tu próximo evento?' : 'Ready to organize your next event?'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
          {es
            ? 'Accede al sistema con tus credenciales de organizador y comienza ahora.'
            : 'Sign in with your organizer credentials and get started now.'}
        </p>
        <button
          id="cta-access-btn"
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#fff', border: 'none', borderRadius: '0.6rem',
            padding: '0.9rem 2.5rem', fontWeight: 700, fontSize: '1.05rem',
            cursor: 'pointer', boxShadow: '0 4px 20px var(--accent-primary)40',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {es ? 'Ingresar al sistema →' : 'Enter the system →'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {es ? 'O consulta los eventos públicos sin necesidad de cuenta.' : 'Or browse public events without an account.'}
          {' '}
          <button
            onClick={() => navigate('/calendar')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: 'inherit' }}
          >
            {es ? 'Ver calendario' : 'View calendar'}
          </button>
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
        background: 'var(--surface-color)',
        fontSize: '0.82rem', color: 'var(--text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>EventOS</span>
          <span>— {es ? 'Sistema Inteligente de Gestión de Eventos' : 'Smart Event Management System'}</span>
        </div>
        <span>{es ? 'Plataforma profesional · Accesible e inclusiva' : 'Professional platform · Accessible & inclusive'}</span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
