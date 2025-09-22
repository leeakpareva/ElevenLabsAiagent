import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Password = () => {
  const [secret, setSecret] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (secret === '54321') {
      alert('Access granted!');
      // Add your logic here for successful authentication
    } else {
      alert('Incorrect secret key');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)'
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <input
          type="password"
          placeholder="Secret Key"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            outline: 'none',
            minWidth: '300px',
            textAlign: 'center'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
            border: 'none',
            borderRadius: '50px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            animation: 'glow 2s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Enter
        </button>
      </form>
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5), 0 0 40px rgba(78, 205, 196, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 107, 107, 0.8), 0 0 60px rgba(78, 205, 196, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default Password;