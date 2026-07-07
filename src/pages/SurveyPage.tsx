import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import type { SurveyResponse } from '../context/AppContext';

export default function SurveyPage() {
  const { t, currentLang, events, showToast, setSurveys, isLoggedIn, userProfile } = useApp();

  const [surveySelectedEventId, setSurveySelectedEventId] = useState(events[0]?.id || '');
  const [surveySatisfaction, setSurveySatisfaction] = useState('');
  const [surveyComments, setSurveyComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!surveySatisfaction) {
      showToast(currentLang === 'es' ? 'Seleccione un valor de satisfacción.' : 'Please select a satisfaction score.', true);
      return;
    }

    const selectedEvent = events.find(ev => ev.id === surveySelectedEventId);
    const response: SurveyResponse = {
      id: Date.now(),
      eventId: surveySelectedEventId,
      eventName: selectedEvent?.name ?? 'Evento',
      satisfaction: Number(surveySatisfaction),
      comments: surveyComments.trim(),
      timestamp: new Date().toISOString(),
      respondentName: isLoggedIn ? userProfile.name : undefined,
    };

    setSurveys(prev => [...prev, response]);
    showToast(currentLang === 'es' ? '¡Muchas gracias! Encuesta registrada con éxito.' : 'Thank you! Survey successfully registered.');
    setSubmitted(true);
    setSurveyComments('');
    setSurveySatisfaction('');
  };

  const handleNew = () => setSubmitted(false);

  const likertLabels: Record<number, string> = {
    1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '😄',
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
        <span>{t('survey_title')}</span>
      </h2>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            {currentLang === 'es' ? '¡Gracias por tu opinión!' : 'Thank you for your feedback!'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {currentLang === 'es'
              ? 'Tu respuesta ha sido registrada y ayudará a mejorar futuros eventos.'
              : 'Your response has been recorded and will help improve future events.'}
          </p>
          <button className="btn btn-secondary" onMouseUp={handleNew}>
            {currentLang === 'es' ? 'Enviar otra encuesta' : 'Submit another survey'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend>{t('survey_legend')}</legend>
            <div className="form-group">
              <label htmlFor="survey-event-select">{t('survey_select')}</label>
              <select id="survey-event-select" value={surveySelectedEventId} onChange={(e) => setSurveySelectedEventId(e.target.value)}>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <span id="likert-group-label" style={{ fontWeight: 600 }}>{t('survey_likert')}</span>
              <div className="likert-scale" role="radiogroup" aria-labelledby="likert-group-label">
                {[1, 2, 3, 4, 5].map(val => (
                  <div key={val} className="likert-option">
                    <input
                      type="radio"
                      id={`likert-${val}`}
                      name="satisfaction"
                      value={val}
                      checked={surveySatisfaction === String(val)}
                      onChange={(e) => setSurveySatisfaction(e.target.value)}
                    />
                    <label htmlFor={`likert-${val}`}>
                      <span style={{ fontSize: '1.5rem' }}>{likertLabels[val]}</span>
                      <span style={{ fontSize: '0.75rem', display: 'block' }}>{val}</span>
                    </label>
                    <span className="likert-text">{t(`survey_likert_${val}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="survey-comments">{t('survey_comments')}</label>
              <textarea id="survey-comments" rows={4} value={surveyComments} onChange={(e) => setSurveyComments(e.target.value)} placeholder={currentLang === 'es' ? 'Escribe tus comentarios aquí...' : 'Write your comments here...'} />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-primary">{t('survey_btn')}</button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
