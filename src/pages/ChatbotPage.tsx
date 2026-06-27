import { useState, KeyboardEvent } from 'react';
import { useApp } from '../context/AppContext';

export default function ChatbotPage() {
  const { t, currentLang, accReduceMotion, setAccReduceMotion, chatMessages, setChatMessages, lastBotMessage, setLastBotMessage, chatMessagesEndRef, showToast, setScreenReaderText } = useApp();
  const [chatInputText, setChatInputText] = useState('');

  const sendChatMessage = (overrideText?: string) => {
    const userMsg = (overrideText ?? chatInputText).trim();
    if (!userMsg) return;
    setChatMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setChatInputText('');

    setTimeout(() => {
      let botResponse = '';
      const norm = userMsg.toLowerCase();
      if (norm.includes('registro') || norm.includes('inscribir') || norm.includes('entrada')) {
        botResponse = currentLang === 'es'
          ? "Para registrarte, ve a la sección de 'Inscripción' en el menú lateral. El proceso tiene 4 pasos guiados, incluye validaciones y te dará un boleto digital con código QR."
          : "To register, go to the 'Registration' page on the sidebar. It is a 4-step wizard with real-time feedback, ending with a digital ticket pass.";
      } else if (norm.includes('acceso') || norm.includes('rampa') || norm.includes('silla') || norm.includes('física') || norm.includes('baño') || norm.includes('bucle')) {
        botResponse = currentLang === 'es'
          ? "Cada evento especifica sus recursos físicos en su tarjeta del Calendario. Al crear un evento, puedes registrar rampas, bucles magnéticos para audífonos, baños de movilidad reducida y parqueos reservados."
          : "Every event lists physical access items on the Calendar cards. During event creation, organizers can set ramps, hearing loops, adapted restrooms, and reserved spaces.";
      } else if (norm.includes('incidencia') || norm.includes('emergencia') || norm.includes('médica') || norm.includes('seguridad')) {
        botResponse = currentLang === 'es'
          ? "Puedes reportar cualquier problema o emergencia en 'Incidencias'. Al reportar una incidencia de gravedad 'Alta', se activa de inmediato una alarma visual e instrucciones audibles."
          : "You can report any hazard or issue in the 'Incident Log'. Reporting a High severity incident instantly triggers a prominent screen alert and read-aloud warnings.";
      } else {
        botResponse = currentLang === 'es'
          ? "Entendido. Si tienes dudas sobre los criterios WCAG de este prototipo, recuerda que cumple con los niveles de contraste 7:1, es operable por teclado, tiene focos altamente visibles y soporte multilenguaje."
          : "Understood. If you have questions about this prototype's WCAG criteria, remember it fully supports 7:1 contrast ratios, keyboard navigation, clear focus indicators, and translations.";
      }
      setChatMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      setLastBotMessage(botResponse);
      setScreenReaderText((currentLang === 'es' ? 'Respuesta del asistente: ' : 'Assistant response: ') + botResponse);
    }, 500);
  };

  const handleChatKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendChatMessage();
  };

  const speakBotMessage = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastBotMessage);
      utterance.lang = currentLang === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
      setScreenReaderText(currentLang === 'es' ? 'Reproduciendo audio de la respuesta.' : 'Playing voice synthesis readout.');
    } else {
      showToast(currentLang === 'es' ? 'API de voz no soportada en este navegador.' : 'Web Speech API not supported on this browser.', true);
    }
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>{t('chat_title')}</span>
      </h2>

      <fieldset>
        <legend>{t('chat_config')}</legend>
        <div className="switch-container">
          <label htmlFor="chat-animation-checkbox" className="switch-label">{t('chat_motion')}</label>
          <input type="checkbox" id="chat-animation-checkbox" className="switch-checkbox" checked={accReduceMotion} onChange={(e) => setAccReduceMotion(e.target.checked)} />
          <div className="switch-control" onMouseUp={() => setAccReduceMotion(!accReduceMotion)}></div>
        </div>
      </fieldset>

      <div className="chat-box">
        <div className="chat-messages" role="log" aria-live="polite">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatMessagesEndRef}></div>
        </div>

        <div className="chat-chips" aria-label="Preguntas rápidas">
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', width: '100%', marginBottom: '0.25rem' }}>{t('chat_faq')}</span>
          <button className="chip-btn" onMouseUp={() => sendChatMessage('¿Cómo me registro en un evento?')}>{t('faq_register')}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage('¿Qué accesos físicos hay disponibles en el recinto?')}>{t('faq_venue')}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage('¿Cómo reporto una emergencia operativa?')}>{t('faq_incident')}</button>
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder={currentLang === 'es' ? 'Escribe aquí...' : 'Type here...'}
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            onKeyDown={handleChatKey}
          />
          <button className="btn btn-primary" style={{ minWidth: '80px' }} onMouseUp={() => sendChatMessage()}>{t('chat_send')}</button>
          <button className="btn btn-secondary" style={{ minWidth: '80px' }} onMouseUp={speakBotMessage}>{t('chat_voice')}</button>
        </div>
      </div>
    </div>
  );
}
