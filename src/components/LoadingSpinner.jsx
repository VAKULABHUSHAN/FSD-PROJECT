export default function LoadingSpinner({ text = 'Loading Cineverse...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      gap: '1rem',
      width: '100%'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(245, 197, 24, 0.2)',
        borderTopColor: '#F5C518',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ color: '#9CA3AF', fontSize: '0.9rem', fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}
