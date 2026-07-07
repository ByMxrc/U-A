import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CheckInLogItem, RegistrationItem } from '../context/AppContext';

export default function RegisterPage() {
  const { t, currentLang, events, setActualAttendance, setCheckInLog, checkInLog, showToast, setScreenReaderText, setRegistrations, userProfile, isLoggedIn, sendInvitationEmail } = useApp();

  const [wizardStep, setWizardStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTel, setRegTel] = useState('');
  const [regSelectedEventId, setRegSelectedEventId] = useState(events[0]?.id || '');
  const [regCategory, setRegCategory] = useState('general');
  const [regDiscount, setRegDiscount] = useState('none');
  const [regNameError, setRegNameError] = useState('');
  const [regEmailError, setRegEmailError] = useState('');
  const [regTelError, setRegTelError] = useState('');

  const regSelectedEvent = events.find(e => e.id === regSelectedEventId);

  const handleWizardNext = (step: number) => {
    if (step === 2) {
      let valid = true;
      if (regName.trim().length < 3) {
        setRegNameError(currentLang === 'es'
          ? '⚠ El nombre es demasiado corto. Debe tener al menos 3 caracteres. Ingrese su nombre completo (nombre y apellido).'
          : '⚠ Name is too short. It must have at least 3 characters. Please enter your full name (first and last name).');
        valid = false;
      } else setRegNameError('');
      if (!regEmail.includes('@') || !regEmail.includes('.')) {
        setRegEmailError(currentLang === 'es'
          ? '⚠ Formato de correo inválido. Debe seguir el esquema usuario@dominio.com e incluir @ y un punto en el dominio (ej: danna@evento.com).'
          : '⚠ Invalid email format. It must follow the pattern user@domain.com and include @ and a dot in the domain (e.g. danna@event.com).');
        valid = false;
      } else setRegEmailError('');
      if (regTel.trim().length < 7) {
        setRegTelError(currentLang === 'es'
          ? '⚠ El número telefónico ingresado es demasiado corto. Debe contener al menos 7 dígitos (ej: 0987654321).'
          : '⚠ The phone number entered is too short. It must contain at least 7 digits (e.g. 0987654321).');
        valid = false;
      } else setRegTelError('');
      if (!valid) { setScreenReaderText(currentLang === 'es' ? 'Errores de validación en el paso 1. Corrija los campos marcados antes de continuar.' : 'Validation errors on step 1. Please fix the marked fields before continuing.'); return; }
    }
    setWizardStep(step);
    setScreenReaderText((currentLang === 'es' ? 'Asistente de registro: Paso ' : 'Registration wizard: Step ') + step);
  };

  const submitRegistration = () => {
    setActualAttendance(prev => prev + 1);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    const newLogItem: CheckInLogItem = { id: checkInLog.length + 1, time: timeStr, name: regName, type: regCategory.toUpperCase() + (regDiscount !== 'none' ? ` (${regDiscount})` : '') };
    setCheckInLog(prev => [newLogItem, ...prev]);

    // Guardar inscripción vinculada al usuario activo (localStorage compartido)
    const newReg: RegistrationItem = {
      id: Date.now(),
      userId: isLoggedIn ? userProfile.email : 'guest',
      userName: regName,
      userEmail: regEmail,
      eventId: regSelectedEventId,
      eventName: regSelectedEvent?.name ?? 'Evento',
      category: regCategory,
      discount: regDiscount,
      timestamp: new Date().toISOString(),
      status: 'active',
      qrId: `QR-${Date.now().toString(36).toUpperCase()}`,
    };
    setRegistrations(prev => [...prev, newReg]);

    // Send invitation email (simulated)
    sendInvitationEmail(regName, regEmail, regSelectedEvent?.name ?? 'Evento', newReg.qrId);

    setWizardStep(4);
    showToast(currentLang === 'es' ? '¡Registro completado! Entrada generada.' : 'Registration successful! Ticket issued.');
  };

  const resetWizard = () => { setRegName(''); setRegEmail(''); setRegTel(''); setRegDiscount('none'); setWizardStep(1); };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        <span>{t('reg_title')}</span>
      </h2>

      <div className="stepper" id="wizard-stepper">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className={`step-item ${wizardStep === step ? 'active' : wizardStep > step ? 'completed' : ''}`}>
            <div className="step-circle" aria-hidden="true">{step}</div>
            <span className="step-text">{t(`reg_step${step}`)}</span>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate>
        {wizardStep === 1 && (
          <div className="wizard-step">
            <fieldset>
              <legend>{t('reg_step1_legend')}</legend>
              <div className="form-group">
                <label htmlFor="reg-name">{t('reg_name')}</label>
                <input type="text" id="reg-name" autoComplete="name" required placeholder="María García" value={regName} onChange={(e) => setRegName(e.target.value)} />
                {regNameError && <div className="validation-message error">{regNameError}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">{t('reg_email')}</label>
                <input type="email" id="reg-email" autoComplete="email" required placeholder="danna@evento.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                {regEmailError && <div className="validation-message error">{regEmailError}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="reg-tel">{t('reg_tel')}</label>
                <input type="tel" id="reg-tel" autoComplete="tel" placeholder="0987654321" value={regTel} onChange={(e) => setRegTel(e.target.value)} />
                {regTelError && <div className="validation-message error">{regTelError}</div>}
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-primary" onMouseUp={() => handleWizardNext(2)}>{t('btn_next')}</button>
              </div>
            </fieldset>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="wizard-step">
            <fieldset>
              <legend>{t('reg_step2_legend')}</legend>
              <div className="form-group">
                <label htmlFor="reg-event-select">{t('costs_select_event')}</label>
                <select id="reg-event-select" value={regSelectedEventId} onChange={(e) => setRegSelectedEventId(e.target.value)}>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-category">{t('reg_ticket_cat')}</label>
                  <select id="reg-category" value={regCategory} onChange={(e) => setRegCategory(e.target.value)}>
                    {regSelectedEvent?.ticketType === 'gratuita' ? (
                      <option value="general">{currentLang === 'es' ? 'Entrada Gratuita General ($0)' : 'Free General Admission ($0)'}</option>
                    ) : (
                      <>
                        <option value="general">{currentLang === 'es' ? `Entrada General ($${regSelectedEvent?.priceGen})` : `General Pass ($${regSelectedEvent?.priceGen})`}</option>
                        <option value="vip">{`Entrada VIP ($${regSelectedEvent?.priceVip})`}</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-discount">{t('reg_apply_disc')}</label>
                  <select id="reg-discount" value={regDiscount} onChange={(e) => setRegDiscount(e.target.value)}>
                    <option value="none">{t('reg_no_disc')}</option>
                    <option value="estudiante">{t('reg_student')}</option>
                    <option value="tercera_edad">{t('reg_senior')}</option>
                    <option value="discapacidad">{t('reg_disabled')}</option>
                  </select>
                </div>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onMouseUp={() => handleWizardNext(1)}>{t('btn_prev')}</button>
                <button type="button" className="btn btn-primary" onMouseUp={() => handleWizardNext(3)}>{t('btn_next')}</button>
              </div>
            </fieldset>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="wizard-step">
            <fieldset>
              <legend>{t('reg_step3_legend')}</legend>
              <p style={{ marginBottom: '1.5rem' }}>{t('reg_confirm_desc')}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }} aria-label="Resumen">
                <tbody>
                  {[
                    [t('reg_name'), regName],
                    [t('reg_email'), regEmail],
                    [t('reg_tel'), regTel],
                    [t('costs_select_event'), regSelectedEvent?.name],
                    [t('reg_ticket_cat'), regCategory.toUpperCase()],
                    [t('reg_apply_disc'), regDiscount],
                  ].map(([key, value]) => (
                    <tr key={String(key)} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>{key}</th>
                      <td style={{ padding: '0.5rem 0' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onMouseUp={() => handleWizardNext(2)}>{t('btn_edit')}</button>
                <button type="button" className="btn btn-primary" onMouseUp={submitRegistration}>{t('reg_confirm_btn')}</button>
              </div>
            </fieldset>
          </div>
        )}

        {wizardStep === 4 && (
          <div className="wizard-step">
            <fieldset>
              <legend>{t('reg_step4_legend')}</legend>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-active">{t('reg_success_title')}</span>
                <p style={{ marginTop: '0.5rem' }}>{t('reg_ticket_desc')}</p>
              </div>
              <div className="ticket-container" tabIndex={0} aria-label="Digital Ticket">
                <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{t('reg_ticket_badge')}</span>
                <h3 style={{ textAlign: 'center' }}>{regSelectedEvent?.name}</h3>
                <div className="ticket-divider"></div>
                <div style={{ textAlign: 'left', width: '100%', fontSize: '0.9rem' }}>
                  <p><strong>{t('reg_name')}:</strong> {regName}</p>
                  <p><strong>{t('reg_ticket_cat')}:</strong> {regCategory.toUpperCase()}</p>
                  <p><strong>{t('reg_apply_disc')}:</strong> {regDiscount}</p>
                </div>
                <div className="ticket-divider"></div>
                <div className="ticket-qr">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="QR Code">
                    <rect x="0" y="0" width="20" height="20" fill="black"/><rect x="3" y="3" width="14" height="14" fill="white"/><rect x="6" y="6" width="8" height="8" fill="black"/>
                    <rect x="80" y="0" width="20" height="20" fill="black"/><rect x="83" y="3" width="14" height="14" fill="white"/><rect x="86" y="6" width="8" height="8" fill="black"/>
                    <rect x="0" y="80" width="20" height="20" fill="black"/><rect x="3" y="83" width="14" height="14" fill="white"/><rect x="6" y="86" width="8" height="8" fill="black"/>
                    <rect x="30" y="5" width="5" height="5" fill="black"/><rect x="40" y="10" width="10" height="5" fill="black"/><rect x="60" y="5" width="5" height="15" fill="black"/>
                    <rect x="35" y="30" width="15" height="5" fill="black"/><rect x="55" y="25" width="5" height="10" fill="black"/><rect x="70" y="35" width="10" height="5" fill="black"/>
                    <rect x="25" y="50" width="5" height="20" fill="black"/><rect x="45" y="45" width="15" height="5" fill="black"/><rect x="65" y="60" width="10" height="10" fill="black"/>
                    <rect x="35" y="80" width="10" height="5" fill="black"/><rect x="50" y="85" width="5" height="10" fill="black"/><rect x="65" y="80" width="10" height="5" fill="black"/>
                  </svg>
                </div>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onMouseUp={resetWizard}>{t('btn_restart_reg')}</button>
              </div>
            </fieldset>
          </div>
        )}
      </form>
    </div>
  );
}
