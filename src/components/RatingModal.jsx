import { useState } from 'react';
import { Star, X, Check, AlertCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRating } from '../context/RatingContext';

const RATING_LABELS = {
  1: '1/10 — Appalling',
  2: '2/10 — Terrible',
  3: '3/10 — Bad',
  4: '4/10 — Poor',
  5: '5/10 — Average',
  6: '6/10 — Fine',
  7: '7/10 — Good',
  8: '8/10 — Very Good',
  9: '9/10 — Great',
  10: '10/10 — Masterpiece'
};

export default function RatingModal({ movie, onClose }) {
  const { user } = useAuth();
  const { getUserRating, rateMovie } = useRating();
  
  const currentRating = getUserRating(movie?.id) || 0;
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  if (!movie) return null;

  const displayRating = hoverRating || selectedRating || 0;

  const handleSubmit = async () => {
    if (!selectedRating) return;
    setIsSubmitting(true);
    try {
      const res = await rateMovie(movie.id, selectedRating);
      if (res && res.error) {
        setMessage(`Notice: ${res.error}`);
      } else {
        setSubmitted(true);
        if (res.requiresAuth) {
          setMessage('Rating recorded for this session! Sign in to store your rating in Supabase.');
        } else {
          setMessage('Your rating has been successfully saved to Supabase!');
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to save rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#17171F',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F5C518';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
        >
          <X size={16} />
        </button>

        {/* Big Star Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(245, 197, 24, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: 'var(--accent-gold)'
        }}>
          <Star size={34} fill="var(--accent-gold)" />
        </div>

        <span style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--accent-gold)',
          fontWeight: 700
        }}>
          RATE THIS TITLE
        </span>

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0.4rem 0 1.5rem',
          lineHeight: 1.3
        }}>
          {movie.title}
        </h2>

        {/* 10 Stars row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '1rem'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
            const isFilled = star <= displayRating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  padding: '2px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Star
                  size={26}
                  fill={isFilled ? 'var(--accent-gold)' : 'none'}
                  color={isFilled ? 'var(--accent-gold)' : '#4B5563'}
                  strokeWidth={isFilled ? 0 : 2}
                />
              </button>
            );
          })}
        </div>

        {/* Score and Label feedback */}
        <div style={{
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: displayRating > 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
          marginBottom: '1.5rem'
        }}>
          {displayRating > 0 ? RATING_LABELS[displayRating] : 'Select rating from 1 to 10'}
        </div>

        {/* Guest Warning / Supabase Notice */}
        {!user && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            background: 'rgba(245, 197, 24, 0.08)',
            border: '1px solid rgba(245, 197, 24, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.8rem',
            color: '#E5E7EB'
          }}>
            <AlertCircle size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span>You are rating as a guest. </span>
              <Link to="/login" style={{ color: 'var(--accent-gold)', fontWeight: 600, textDecoration: 'underline' }}>
                Sign in with Supabase
              </Link>
              <span> to store ratings permanently on your account.</span>
            </div>
          </div>
        )}

        {submitted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#34D399',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            <Check size={18} />
            <span>{message}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedRating || isSubmitting || submitted}
          className="btn-gold"
          style={{
            width: '100%',
            opacity: !selectedRating || isSubmitting || submitted ? 0.6 : 1,
            cursor: !selectedRating || isSubmitting || submitted ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Saving...' : submitted ? 'Rated!' : currentRating ? `Update Rating (${selectedRating}/10)` : `Submit Rating (${selectedRating || 0}/10)`}
        </button>
      </div>
    </div>
  );
}
