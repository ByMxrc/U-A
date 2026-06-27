import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { t, userProfile, setUserProfile, setCurrentLang, showToast } = useApp();

  const [profName, setProfName] = useState(userProfile.name);
  const [profEmail, setProfEmail] = useState(userProfile.email);
  const [profTel, setProfTel] = useState(userProfile.tel);
  const [profTz, setProfTz] = useState(userProfile.timezone);
  const [profLang, setProfLang] = useState(userProfile.lang);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUserProfile({ name: profName, email: profEmail, tel: profTel, timezone: profTz, lang: profLang });
    setCurrentLang(profLang as 'es' | 'en');
    showToast(t('profile_saved'));
  };

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>{t('profile_title')}</span>
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>{t('profile_legend')}</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profile-name">{t('profile_name')}</label>
              <input type="text" id="profile-name" autoComplete="name" required value={profName} onChange={(e) => setProfName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">{t('profile_email')}</label>
              <input type="email" id="profile-email" autoComplete="email" required value={profEmail} onChange={(e) => setProfEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profile-tel">{t('profile_tel')}</label>
              <input type="tel" id="profile-tel" autoComplete="tel" value={profTel} onChange={(e) => setProfTel(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-tz">{t('profile_tz')}</label>
              <select id="profile-tz" value={profTz} onChange={(e) => setProfTz(e.target.value)}>
                <option value="GMT-5">GMT-5 (Ecuador/Colombia/Perú)</option>
                <option value="GMT+1">GMT+1 (España/Madrid)</option>
                <option value="GMT-8">GMT-8 (PST)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="profile-lang">{t('profile_lang')}</label>
            <select id="profile-lang" value={profLang} onChange={(e) => setProfLang(e.target.value)}>
              <option value="es">Español (ES)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{t('btn_save')}</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
