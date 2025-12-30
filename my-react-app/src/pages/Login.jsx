import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import api from '../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [showStatus, setShowStatus] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setStatusMessage({ text: '', type: '' });
    setShowStatus(false);

    if (username.trim() === '') {
      showMessage('Veuillez entrer votre identifiant.', 'error');
      return;
    }

    try {
      const payload = { email: username, password };
      const user = await api.login(payload);
      showMessage('Connexion réussie ! Redirection...', 'success');

      localStorage.setItem('username', user.name || username);
      localStorage.setItem('user', JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

  setTimeout(() => navigate('/'), 800);
    } catch (err) {
      console.error('Login error', err);
      const message = err?.message?.includes('401') ? 'Identifiant ou mot de passe incorrect.' : 'Impossible de joindre le serveur.';
      showMessage(message, 'error');
    }
  };

  const showMessage = (message, type) => {
    setStatusMessage({ text: message, type });
    setShowStatus(true);
  };

  const alertUser = (message) => {
    console.log(`[Notification] ${message}`);
  };

  return (
    <div className="login">
      {showStatus && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo-container">
              <span className="logo-text">StockSync</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                <path d="M12 10v4"/>
                <path d="M9 10v4"/>
                <path d="M15 10v4"/>
              </svg>
            </div>
          </div>

          <div className="header-right">
            <div className="utility-buttons">
              <button 
                title="Aide" 
                className="utility-button"
                onClick={() => alertUser('Aide : Documentation utilisateur')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </button>
              <button 
                title="Paramètres" 
                className="utility-button"
                onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-logo-icon">
                  <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                  <path d="M12 10v4"/>
                  <path d="M9 10v4"/>
                  <path d="M15 10v4"/>
                </svg>
                <h1 className="login-title">StockSync</h1>
              </div>
              <p className="login-subtitle">Système de Gestion des Stocks E-commerce</p>
            </div>

            <div className="login-form-section">
              <h2 className="login-form-title">Connexion</h2>
              
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Email ou Identifiant
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="form-input"
                    placeholder="Entrez votre email ou identifiant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-options">
                  <div className="checkbox-group">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="checkbox-input"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className="checkbox-label">
                      Se souvenir de moi
                    </label>
                  </div>
                  <a href="#" className="forgot-password" onClick={() => alertUser('Mot de passe oublié : Fonctionnalité à développer')}>
                    Mot de passe oublié ?
                  </a>
                </div>

                <button type="submit" className="login-button">
                  <span>Se Connecter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Optimisation Logistique. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;