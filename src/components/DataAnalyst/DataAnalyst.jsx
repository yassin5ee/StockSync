import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataAnalyst.css';

const DataAnalyst = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('username') || 'Data Analyst');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  // Sample data
  const [metrics] = useState({
    rotationStocks: 8.4,
    delaiPreparation: '1h 15m',
    tauxErreur: 0.21,
    remplissageEntrepot: 78
  });

  const [topReferences] = useState([
    { id: 'REF-001X', name: 'Câbles USB C', quantity: 1250 },
    { id: 'REF-045Y', name: 'Batterie Externe', quantity: 980 },
    { id: 'REF-007Z', name: 'Support Téléphone', quantity: 712 },
    { id: 'REF-112A', name: 'Écouteurs sans fil', quantity: 650 },
    { id: 'REF-205B', name: 'Clavier mécanique', quantity: 490 }
  ]);

  // Navigation functions
  const navigateToRole = (roleKey, event) => {
    if (event) event.preventDefault();
    const roleName = getRoleName(roleKey);
    alertUser(`Accès au rôle : ${roleName}`);
  };

  const getRoleName = (roleKey) => {
    switch(roleKey) {
      case 'home': return 'Accueil';
      case 'data_analyst': return 'Data Analyst / Analyse données';
      case 'admin_logistique': return 'Administrateur Logistique / Administration logistique';
      case 'preparateur_commandes': return 'Préparateur de Commandes / Sorties';
      case 'agent_reception': return 'Agent de Réception / Entrées';
      case 'gestionnaire_entrepot': return 'Gestionnaire d\'Entrepôt / Gestion d\'entrepôts';
      default: return 'Rôle Inconnu';
    }
  };

  const alertUser = (message) => {
    console.log(`[Notification] ${message}`);
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    navigate('/');
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setShowStatus(true);
    
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  const applyFilters = () => {
    alertUser('Application des filtres de données');
    showMessage('Filtres appliqués avec succès', 'info');
  };

  const exportData = () => {
    alertUser('Export des données analytiques');
    showMessage('Export des données lancé', 'info');
  };

  return (
    <div className="data-analyst">
      {/* Status Message */}
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-container">
          
          {/* Left Section: Back + Logo + Navigation */}
          <div className="header-left">
            
            {/* Back Link */}
            <a 
              href="#" 
              onClick={(e) => navigateToRole('home', e)} 
              title="Retour à l'Accueil" 
              className="back-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Retour
            </a>

            {/* Logo and Navigation Container */}
            <div className="header-left">
              {/* Logo */}
              <div className="logo-container">
                <span className="logo-text">StockSync</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                  <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                  <path d="M12 10v4"/>
                  <path d="M9 10v4"/>
                  <path d="M15 10v4"/>
                </svg>
              </div>
              
              {/* Main Navigation */}
              <nav className="navigation">
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>
                  Accueil
                </a>
                <a href="#" className="nav-link active">
                  Analyse données
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('gestionnaire_entrepot', e)}>
                  Gestion d'entrepôts
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('agent_reception', e)}>
                  Entrées
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('preparateur_commandes', e)}>
                  Sorties
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('admin_logistique', e)}>
                  Administration logistique
                </a>
              </nav>
            </div>
          </div>

          {/* Right Section: Utilities and User */}
          <div className="header-right">
            {/* Notifications and Settings */}
            <div className="utility-buttons">
              <button 
                title="Notifications" 
                className="utility-button"
                onClick={() => alertUser('Notifications : Fonctionnalité à développer')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <button 
                title="Paramètres" 
                className="utility-button"
                onClick={() => alertUser('Paramètres : Fonctionnalité à développer')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
            
            {/* User Info and Logout */}
            <div className="user-info">
              <span className="user-text">
                Connecté en tant que: <span className="user-name">{userName}</span>
              </span>
              <button 
                onClick={logout} 
                className="logout-button"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard Title */}
        <div className="dashboard-title">
          <h1>Tableau de Bord : Analyse de Performance</h1>
          <p>Visualisation des indicateurs logistiques en temps réel.</p>
        </div>
        
        {/* Performance Metrics */}
        <div className="metrics-grid">
          
          {/* Rotation des Stocks */}
          <div className="metric-card green">
            <h3>Rotation des Stocks (Annuel)</h3>
            <p className="metric-value green">{metrics.rotationStocks}x</p>
            <div className="metric-change positive">+12%</div>
            <p className="metric-subtext">Cible: 9.0x</p>
          </div>

          {/* Délai de Préparation Moyen */}
          <div className="metric-card blue">
            <h3>Délai de Préparation Moyen</h3>
            <p className="metric-value blue">{metrics.delaiPreparation}</p>
            <div className="metric-change negative">-5%</div>
            <p className="metric-subtext">Mois Dernier: 1h 19m</p>
          </div>

          {/* Taux d'Erreur */}
          <div className="metric-card red">
            <h3>Taux d'Erreur (Picking/Shipping)</h3>
            <p className="metric-value red">{metrics.tauxErreur}%</p>
            <div className="metric-change positive">+0.03% (Amélioration)</div>
            <p className="metric-subtext">Cible: moins de 0.25%</p>
          </div>

          {/* Remplissage Entrepôt */}
          <div className="metric-card orange">
            <h3>Remplissage Entrepôt A</h3>
            <p className="metric-value orange">{metrics.remplissageEntrepot}%</p>
            <div className="metric-change negative">-2%</div>
            <p className="metric-subtext">Capacité Max: 90%</p>
          </div>
        </div>

        {/* Charts and Top References Section */}
        <div className="analytics-section">
          <div className="chart-container">
            <div className="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10"/>
                <path d="M18 20V4"/>
                <path d="M6 20v-4"/>
              </svg>
              <h3>Volume de Commandes Traitées (Mois)</h3>
            </div>
            <div className="chart-placeholder">
              <p>Espace réservé pour le graphique de volume (ex: D3.js ou Chart.js)</p>
              <div className="chart-bars">
                <div className="chart-bar" style={{height: '80%'}}></div>
                <div className="chart-bar" style={{height: '60%'}}></div>
                <div className="chart-bar" style={{height: '90%'}}></div>
                <div className="chart-bar" style={{height: '70%'}}></div>
                <div className="chart-bar" style={{height: '85%'}}></div>
              </div>
            </div>
          </div>

          <div className="references-container">
            <div className="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 18 6-6-6-6"/>
                <path d="M8 6v12"/>
              </svg>
              <h3>Top 5 Références (Semaine)</h3>
            </div>
            <div className="references-list">
              {topReferences.map((ref, index) => (
                <div key={ref.id} className="reference-item">
                  <div className="reference-rank">{index + 1}</div>
                  <div className="reference-info">
                    <div className="reference-id">{ref.id}</div>
                    <div className="reference-name">{ref.name}</div>
                  </div>
                  <div className="reference-quantity">{ref.quantity.toLocaleString()} unités</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="filters-section">
          <div className="section-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <h3>Filtres et Segmentation</h3>
          </div>
          
          <div className="filters-controls">
            <select className="select-control">
              <option>Sélectionner Entrepôt</option>
              <option>Entrepôt A</option>
              <option>Entrepôt B</option>
              <option>Entrepôt C</option>
            </select>
            
            <select className="select-control">
              <option>Période</option>
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>3 derniers mois</option>
              <option>Année en cours</option>
            </select>
            
            <input 
              type="date" 
              className="date-input"
              placeholder="Date de début"
            />
            
            <input 
              type="date" 
              className="date-input"
              placeholder="Date de fin"
            />
            
            <div className="filter-actions">
              <button 
                onClick={applyFilters}
                className="apply-button"
              >
                Appliquer les Filtres
              </button>
              
              <button 
                onClick={exportData}
                className="export-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exporter
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Optimisation Logistique. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default DataAnalyst;