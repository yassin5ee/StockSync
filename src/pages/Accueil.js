import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Accueil.css';

function Accueil() {
  const [username, setUsername] = useState('Utilisateur Test');
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le nom d'utilisateur depuis le localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Si pas de nom d'utilisateur, rediriger vers la page de connexion
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    // Rediriger vers la page de connexion
    navigate('/');
  };

  const navigateToRole = (roleKey, event) => {
    if (event) event.preventDefault();
    console.log(`Navigation vers le rôle : ${getRoleName(roleKey)}`);
    alertUser(`Accès au rôle : ${getRoleName(roleKey)}`);
  };

  const getRoleName = (roleKey) => {
    const roles = {
      'home': 'Accueil',
      'data_analyst': 'Data Analyst / Analyse données',
      'admin_logistique': 'Administrateur Logistique / Administration logistique',
      'preparateur_commandes': 'Préparateur de Commandes / Sorties',
      'agent_reception': 'Agent de Réception / Entrées',
      'gestionnaire_entrepot': 'Gestionnaire d\'Entrepôt / Gestion d\'entrepôts'
    };
    return roles[roleKey] || 'Rôle Inconnu';
  };

  const alertUser = (message) => {
    console.log(`[Notification] ${message}`);
  };

  return (
    <div className="accueil-container">
      {/* En-tête */}
      <header className="accueil-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <span className="logo-text">StockFlow</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                <path d="M12 10v4"/>
                <path d="M9 10v4"/>
                <path d="M15 10v4"/>
              </svg>
            </div>

            <nav className="header-nav">
              <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>Accueil</a>
              <a href="#" className="nav-link" onClick={(e) => navigateToRole('data_analyst', e)}>Analyse données</a>
              <a href="#" className="nav-link" onClick={(e) => navigateToRole('gestionnaire_entrepot', e)}>Gestion d'entrepôts</a>
              <a href="#" className="nav-link" onClick={(e) => navigateToRole('agent_reception', e)}>Entrées</a>
              <a href="#" className="nav-link" onClick={(e) => navigateToRole('preparateur_commandes', e)}>Sorties</a>
              <a href="#" className="nav-link" onClick={(e) => navigateToRole('admin_logistique', e)}>Administration logistique</a>
            </nav>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button title="Notifications" className="icon-button" onClick={() => alertUser('Notifications : Fonctionnalité à développer')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <button title="Paramètres" className="icon-button" onClick={() => alertUser('Paramètres : Fonctionnalité à développer')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.82 1.51 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>

            <div className="user-info">
              <span className="user-text">
                Connecté en tant que: <span className="user-name">{username}</span>
              </span>
              <button onClick={logout} className="logout-button">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="accueil-main">
        <div className="welcome-section">
          <h2 className="welcome-title">
            Bienvenue sur le Tableau de Bord StockFlow
          </h2>
          <p className="welcome-text">
            Sélectionnez votre rôle pour accéder aux outils et aux données qui vous sont nécessaires pour optimiser la gestion de nos entrepôts et le flux logistique de notre société e-commerce.
          </p>
        </div>

        <h3 className="roles-title">Accès Rapide par Rôle</h3>

        <div className="roles-grid">
          <div className="role-card" onClick={() => navigateToRole('data_analyst')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-icon green">
              <path d="M12 20V10"/>
              <path d="M18 20V4"/>
              <path d="M6 20v-4"/>
            </svg>
            <h4 className="role-name">Data Analyst</h4>
            <p className="role-description">Visualisation des performances, rapports de stock et prévisions.</p>
          </div>

          <div className="role-card" onClick={() => navigateToRole('admin_logistique')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-icon purple">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.21.37a2 2 0 0 0 0 2.73l.15.08a2 2 0 0 1 1 1.73v.44a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0 0 2.73l.21.37a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.21-.37a2 2 0 0 0 0-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.44a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 0-2.73l-.21-.37a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <h4 className="role-name">Admin Logistique</h4>
            <p className="role-description">Configuration des entrepôts, gestion des utilisateurs et des règles de flux.</p>
          </div>

          <div className="role-card" onClick={() => navigateToRole('preparateur_commandes')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-icon blue">
              <path d="M12.8 2.2a2.3 2.3 0 0 0-1.6 0L4.4 6.7a2.1 2.1 0 0 0-1.2 1.9v8.8a2.1 2.1 0 0 0 1.2 1.9l6.8 4.5a2.3 2.3 0 0 0 1.6 0l6.8-4.5a2.1 2.1 0 0 0 1.2-1.9V8.6a2.1 2.1 0 0 0-1.2-1.9z"/>
              <path d="m10 13 2 2 4-4"/>
            </svg>
            <h4 className="role-name">Préparateur de Commandes</h4>
            <p className="role-description">Listes de picking, validation d'expédition et optimisation des trajets.</p>
          </div>

          <div className="role-card" onClick={() => navigateToRole('agent_reception')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-icon yellow">
              <path d="M5 18H3c-1.1 0-2-.9-2-2V7a2 2 0 0 1 2-2h10c1.1 0 2 .9 2 2v.5"/>
              <path d="M22 20h-4"/>
              <path d="M18 10h3l1 2v3h-2"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
            <h4 className="role-name">Agent de Réception</h4>
            <p className="role-description">Enregistrement des livraisons, contrôle qualité et mise en stock (putaway).</p>
          </div>

          <div className="role-card" onClick={() => navigateToRole('gestionnaire_entrepot')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-icon red">
              <rect width="16" height="18" x="4" y="2" rx="2" ry="2"/>
              <path d="M9.5 10c.5-1.5 1.5-2.5 2.5-2.5s2 1 2.5 2.5"/>
              <path d="M9.5 14c.5-1.5 1.5-2.5 2.5-2.5s2 1 2.5 2.5"/>
            </svg>
            <h4 className="role-name">Gestionnaire d'Entrepôt</h4>
            <p className="role-description">Vue globale du stock, inventaires, réapprovisionnement interne.</p>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="accueil-footer">
        <p>&copy; 2025 StockFlow. Optimisation Logistique. Version 1.0</p>
      </footer>
    </div>
  );
}

export default Accueil;

