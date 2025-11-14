import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Masquer les messages précédents
    setStatusMessage({ text: '', type: '' });

    // Validation simple
    if (username.trim() === '') {
      setStatusMessage({ text: 'Veuillez entrer votre identifiant.', type: 'error' });
      return;
    }

    // Simuler l'appel API / Logique d'authentification
    // En production, vous feriez un appel fetch() à votre backend
    if (username.toLowerCase() === 'admin') {
      // Simuler une connexion réussie
      setStatusMessage({ text: 'Connexion réussie ! Redirection vers la page d\'accueil...', type: 'success' });
      
      // Stocker le nom d'utilisateur dans localStorage
      localStorage.setItem('username', username);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirection après 1.5 secondes
      setTimeout(() => {
        navigate('/accueil');
      }, 1500);
    } else {
      // Simuler une erreur de connexion
      setStatusMessage({ text: 'Identifiant ou mot de passe incorrect.', type: 'error' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">StockFlow</h1>
          <p className="login-subtitle">Système de Gestion des Stocks E-commerce</p>
        </div>

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
            <a href="#" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" className="login-button">
            Se Connecter
          </button>

          {statusMessage.text && (
            <div className={`status-message ${statusMessage.type}`} role="alert">
              {statusMessage.text}
            </div>
          )}
        </form>
      </div>

      <p className="login-footer">
        &copy; 2025 StockFlow. Tous droits réservés.
      </p>
    </div>
  );
}

export default Login;

