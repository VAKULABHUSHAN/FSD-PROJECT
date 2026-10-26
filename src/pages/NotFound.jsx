import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container animate-fade-in" style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1rem'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(245, 197, 24, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        color: 'var(--accent-gold)'
      }}>
        <Film size={40} />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '4rem',
        fontWeight: 900,
        color: 'var(--accent-gold)',
        lineHeight: 1,
        marginBottom: '0.5rem'
      }}>
        404
      </h1>

      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: '1rem'
      }}>
        Scene Not Found
      </h2>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '460px',
        lineHeight: 1.6,
        marginBottom: '2rem'
      }}>
        The reel you're looking for seems to have been cut or moved to another theater. Let's get you back to the main show.
      </p>

      <Link to="/" className="btn-gold" style={{ padding: '0.75rem 1.75rem' }}>
        <Home size={18} />
        <span>Back to Cineverse Home</span>
      </Link>
    </div>
  );
}
