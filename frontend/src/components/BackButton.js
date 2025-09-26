import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Reusable Back button using existing CSS classes: .btn-blue and .top-left-actions
export default function BackButton(){
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const fallback = (() => {
    if(user?.role === 'doctor') return '/doctor';
    if(user?.role === 'pharmacist') return '/pharmacy';
    return '/';
  })();

  const goBack = () => {
    // If there's no history to go back to, navigate to role home
    if (window.history.length <= 1) {
      navigate(fallback, { replace: true });
    } else {
      navigate(-1);
    }
  };

  // Render within a positioned wrapper so .top-left-actions anchors properly
  return (
    <div className="hero-header" aria-hidden={false} aria-label="Back navigation area">
      <div className="top-left-actions">
        <button
          type="button"
          className="btn-blue"
          onClick={goBack}
          aria-label="Go back"
        >
          {/* Left arrow icon */}
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
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span style={{color:'#fff'}}>Back</span>
        </button>
      </div>
    </div>
  );
}
