import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FaGraduationCap, FaPhone, FaEnvelope, FaHeartbeat } from 'react-icons/fa';

const DoctorProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const storageKey = `helio_doctor_profile_${user?.id || 'default'}`;
  const defaults = {
    name: user?.name || 'Dr. Rajesh Kumar',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD (Cardiology)',
    experience_years: 15,
    languages: 'English, Hindi, Punjabi',
    phone: '+91 98765 43210',
    email: 'dr.rajesh@example.com',
    registrationNo: 'MCI/DEL/2009/4521',
    upi: 'drrajesh@upi',
    consultationModes: 'In-Person, Video, Telephone',
    bio: 'Committed to providing accessible cardiac care with a preventive focus for rural communities.'
  };

  const [profile, setProfile] = useState(defaults);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile({ ...defaults, ...parsed });
      } else {
        setProfile(defaults);
      }
    } catch {
      setProfile(defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: name === 'experience_years' ? Number(value) : value }));
  };

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(profile));
    setEditing(false);
    alert(t('saved','Saved'));
  };

  const cancel = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      setProfile(raw ? { ...defaults, ...JSON.parse(raw) } : defaults);
    } catch { setProfile(defaults); }
    setEditing(false);
  };

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-10 mb-8 text-center px-4 shadow hero-header">
        <div className="top-right-actions">
          {!editing ? (
            <button className="btn-blue" onClick={() => setEditing(true)}>{t('edit','Edit')}</button>
          ) : (
            <div className="flex gap-2">
              <button className="btn-blue" onClick={save}>{t('save','Save')}</button>
              <button className="btn-blue" onClick={cancel}>{t('cancel','Cancel')}</button>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">{t('profile','Profile')}</h1>
        <p className="text-indigo-100">{t('profile_overview_copy','Manage your professional information')}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* Overview Card */}
        <div className="rx-card">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            {!editing ? (
              <>
                <h2 className="rx-card-title m-0">{profile.name}</h2>
                <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">{profile.specialty}</span>
              </>
            ) : (
              <div className="w-full grid sm:grid-cols-2 gap-3">
                <input name="name" value={profile.name} onChange={onChange} className="border rounded-lg px-3 py-2 text-sm" placeholder={t('name','Name')} />
                <input name="specialty" value={profile.specialty} onChange={onChange} className="border rounded-lg px-3 py-2 text-sm" placeholder={t('specialty','Specialty')} />
              </div>
            )}
          </div>
          <div>
            {!editing ? (
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            ) : (
              <textarea name="bio" value={profile.bio} onChange={onChange} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={t('bio','Bio')} />
            )}
          </div>
        </div>

        {/* Details Card */}
        <div className="rx-card">
          <h3 className="rx-card-title mb-4">{t('professional_details','Professional Details')}</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {/* Registration */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('registration_no','Registration No')}</p>
              {!editing ? (
                <p className="font-medium">{profile.registrationNo}</p>
              ) : (
                <input name="registrationNo" value={profile.registrationNo} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
            {/* Experience */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('experience','Experience')}</p>
              {!editing ? (
                <p className="font-medium tabular-nums">{profile.experience_years} {t('years_experience_other',{count: profile.experience_years})}</p>
              ) : (
                <input type="number" min={0} name="experience_years" value={profile.experience_years} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
            {/* Qualifications */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('qualifications','Qualifications')}</p>
              {!editing ? (
                <p className="font-medium">{profile.qualifications}</p>
              ) : (
                <input name="qualifications" value={profile.qualifications} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
            {/* Modes */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('consultation_modes','Consultation Modes')}</p>
              {!editing ? (
                <p className="font-medium">{profile.consultationModes}</p>
              ) : (
                <input name="consultationModes" value={profile.consultationModes} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
            {/* Languages */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('languages','Languages')}</p>
              {!editing ? (
                <p className="font-medium">{profile.languages}</p>
              ) : (
                <input name="languages" value={profile.languages} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
            {/* UPI */}
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('upi_id','UPI ID')}</p>
              {!editing ? (
                <p className="font-medium">{profile.upi}</p>
              ) : (
                <input name="upi" value={profile.upi} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="rx-card">
          <h3 className="rx-card-title mb-4">{t('contact','Contact')}</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('phone','Phone')}</p>
              {!editing ? (
                <p className="font-medium tabular-nums">{profile.phone}</p>
              ) : (
                <input name="phone" value={profile.phone} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">{t('email','Email')}</p>
              {!editing ? (
                <p className="font-medium break-all">{profile.email}</p>
              ) : (
                <input name="email" value={profile.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Professional Focus Card */}
        <div className="rx-card">
          <h3 className="rx-card-title mb-2">{t('professional_focus','Professional Focus')}</h3>
          {!editing ? (
            <p className="text-sm text-gray-600 leading-relaxed">{t('professional_focus_copy','Special interest in preventive cardiology, hypertension management, and lifestyle counseling for early intervention.')}</p>
          ) : (
            <textarea name="focus" value={profile.focus || ''} onChange={onChange} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={t('add_focus','Add focus (optional)')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
