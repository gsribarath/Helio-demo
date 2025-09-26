import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Static back button bar (no absolute/fixed positioning)
// Places a single back button in normal document flow at page top (under any nav)
export default function BackButton(){
  const navigate = useNavigate();
  const { user } = useAuth();

  const fallback = user?.role === 'doctor'
    ? '/doctor'
    : user?.role === 'pharmacist'
      ? '/pharmacy'
      : '/';

  const goBack = () => {
    if (window.history.length <= 1) {
      navigate(fallback, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="back-button-bar" role="navigation" aria-label="Back navigation">
      <button
        type="button"
        className="btn-blue"
        onClick={goBack}
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          style={{marginRight:6}}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span style={{color:'#fff'}}>Back</span>
      </button>
    </div>
  );
}
