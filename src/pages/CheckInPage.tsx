import { useApp } from '../context/AppContext';

export default function CheckInPage() {
  const { t, currentLang, checkInLog, expectedAttendance, actualAttendance, isCheckInActive, setIsCheckInActive, simulateCheckIn } = useApp();
  const checkInProgressPct = expectedAttendance > 0 ? Math.round((actualAttendance / expectedAttendance) * 100) : 0;

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span>{t('check_title')}</span>
      </h2>

      <div className="checkin-dashboard">
        <div className="checkin-card">
          <span>{t('check_expected')}</span>
          <div className="checkin-number">{expectedAttendance}</div>
        </div>
        <div className="checkin-card">
          <span>{t('check_actual')}</span>
          <div className="checkin-number">{actualAttendance}</div>
        </div>
      </div>

      <fieldset style={{ marginBottom: '1.5rem' }}>
        <legend>{t('check_progress')}</legend>
        <div
          className="checkin-progress"
          aria-label={`Progress is ${checkInProgressPct}%`}
          tabIndex={0}
        >
          <div className="checkin-progress-fill" style={{ width: `${checkInProgressPct}%` }}></div>
        </div>
        <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {checkInProgressPct}%
        </div>
      </fieldset>

      <div className="btn-group" style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onMouseUp={() => setIsCheckInActive(!isCheckInActive)}>
          {isCheckInActive ? t('check_pause') : t('check_resume')}
        </button>
        <button className="btn btn-primary" onMouseUp={simulateCheckIn}>{t('check_scan')}</button>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>{t('check_log_title')}</h3>
      <div className="checkin-logs" role="log" aria-live="polite">
        {checkInLog.map(log => (
          <div key={log.id} className="checkin-log-item">
            {log.time} - {log.name} {currentLang === 'es' ? 'ingresó con' : 'entered with'} {log.type}
          </div>
        ))}
      </div>
    </div>
  );
}
