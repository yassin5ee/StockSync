import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreparateurCommandes.css';
import api from '../../utils/api';

const PreparateurCommandes = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('username') || 'Préparateur');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [transfers, setTransfers] = useState(null);
  const [warehousesSummary, setWarehousesSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('username')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transfersData, warehousesData] = await Promise.all([
          api.getTransfersSummary(),
          api.getWarehousesSummary()
        ]);
        
        setTransfers(transfersData);
        setWarehousesSummary(warehousesData || []);
      } catch (err) {
        console.error('Failed to fetch picking data:', err);
        showMessage('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const metrics = {
    commandesAPreparer: transfers?.byStatus?.in_transit || 0,
    lignesTerminees: Math.floor((transfers?.totalItems || 0) * 0.48),
    totalLignes: transfers?.totalItems || 0,
    tempsMoyen: 45
  };

  const tasks = transfers?.transfers?.slice(0, 4).map((t, idx) => ({
    id: `CMD-${new Date().toISOString().split('T')[0]}-${String(idx + 1).padStart(3, '0')}`,
    priorite: idx === 0 ? 'Urgent' : idx === 1 ? 'Haute' : 'Standard',
    emplacements: `${t.fromWarehouse?.slice(0, 15)} → ${t.toWarehouse?.slice(0, 15)}`,
    lignesTerminees: Math.floor((t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0) * 0.6),
    totalLignes: t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0,
    statut: t.status === 'in_transit' ? 'En cours' : t.status === 'completed' ? 'Complétée' : 'À commencer',
    rowClass: t.status === 'completed' ? 'row-opacity' : (idx === 0 ? 'row-blue-bg' : '')
  })) || [];

  const shipmentStats = {
    pretsAEmballer: transfers?.byStatus?.completed || 0,
    enCoursExpedition: transfers?.byStatus?.in_transit || 0,
    prevuCamion: transfers?.total || 0
  };

  const navigateToRole = (roleKey, event) => {
    if (event) event.preventDefault();
    const roleName = getRoleName(roleKey);
    alertUser(`Accès au rôle : ${roleName}`);
    switch (roleKey) {
      case 'data_analyst':
        navigate('/data-analyst');
        break;
      case 'gestionnaire_entrepot':
        navigate('/gestionnaire-entrepot');
        break;
      case 'preparateur_commandes':
        navigate('/preparateur-commandes');
        break;
      case 'admin_logistique':
        navigate('/administration-logistique');
        break;
      case 'agent_reception':
        navigate('/agent-reception');
        break;
      case 'parametres':
        navigate('/parametres');
        break;
      case 'home':
      default:
        navigate('/');
    }
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
    navigate('/login');
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setShowStatus(true);
    
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  const startPicking = async (commandeId) => {
    try {
      showMessage(`Démarrage de la préparation pour ${commandeId}...`, 'info');
      const transfer = transfers?.transfers?.find(t => t._id === commandeId);
      if (transfer) {
        await api.updateTransfer(transfer._id, { status: 'in_transit' });
        // Refresh data
        const [transfersData] = await Promise.all([api.getTransfersSummary()]);
        setTransfers(transfersData);
        showMessage(`Préparation démarrée pour ${commandeId}`, 'success');
      } else {
        showMessage('Transfert non trouvé', 'error');
      }
    } catch (err) {
      console.error('Error starting picking:', err);
      showMessage('Erreur au démarrage de la préparation', 'error');
    }
  };

  const continuePicking = async (commandeId) => {
    try {
      showMessage(`Reprise de la préparation pour ${commandeId}...`, 'info');
      const transfer = transfers?.transfers?.find(t => t._id === commandeId);
      if (transfer && transfer.status === 'in_transit') {
        showMessage(`Préparation continuée pour ${commandeId}`, 'success');
      } else {
        showMessage('Impossible de continuer - vérifiez le statut du transfert', 'error');
      }
    } catch (err) {
      console.error('Error continuing picking:', err);
      showMessage('Erreur lors de la reprise', 'error');
    }
  };

  const viewDetails = async (commandeId) => {
    try {
      showMessage(`Chargement des détails pour ${commandeId}...`, 'info');
      const transfer = transfers?.transfers?.find(t => t._id === commandeId);
      if (transfer) {
        const details = `Transfert ${commandeId}\nDe: ${transfer.fromWarehouse}\nVers: ${transfer.toWarehouse}\nArticles: ${transfer.items?.length || 0}\nStatut: ${transfer.status}`;
        showMessage(details, 'info');
      }
    } catch (err) {
      console.error('Error viewing details:', err);
      showMessage('Erreur lors du chargement des détails', 'error');
    }
  };

  const launchWave = async () => {
    try {
      showMessage('Lancement d\'une nouvelle vague de picking...', 'info');
      const plannedTransfers = transfers?.transfers?.filter(t => t.status === 'planned') || [];
      
      if (plannedTransfers.length === 0) {
        showMessage('Aucun transfert planifié à traiter', 'warning');
        return;
      }

      const updatePromises = plannedTransfers.slice(0, 5).map(t => 
        api.updateTransfer(t._id, { status: 'in_transit' })
      );
      
      await Promise.all(updatePromises);
      
      // Refresh data
      const [transfersData] = await Promise.all([api.getTransfersSummary()]);
      setTransfers(transfersData);
      
      showMessage(`Vague lancée: ${plannedTransfers.slice(0, 5).length} transfert(s) en préparation`, 'success');
    } catch (err) {
      console.error('Error launching wave:', err);
      showMessage('Erreur lors du lancement de la vague', 'error');
    }
  };

  // Status badge component
  const StatusBadge = ({ status, priority }) => {
    if (priority) {
      const priorityClass = `badge-${priority.toLowerCase()}`;
      return (
        <span className={`status-badge ${priorityClass}`}>
          {priority}
        </span>
      );
    }

    const statusClass = `badge-${status.toLowerCase().replace('é', 'e').replace('è', 'e').replace(' ', '-')}`;
    return (
      <span className={`status-badge ${statusClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="preparateur-commandes">
      {/* Status Message */}
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

      {loading && (
        <div className="status-message default">Chargement des données de préparation...</div>
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
                  <circle cx="8" cy="20" r="1"/>
                  <circle cx="17" cy="20" r="1"/>
                  <path d="M20 4.4 17 6H4l-1.5 8h17l-2.7-8h-11"/>
                  <path d="M10 9l.9 3.4"/>
                </svg>
              </div>
              
              {/* Main Navigation */}
              <nav className="navigation">
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>
                  Accueil
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('data_analyst', e)}>
                  Analyse données
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('gestionnaire_entrepot', e)}>
                  Gestion d'entrepôts
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('agent_reception', e)}>
                  Entrées
                </a>
                <a href="#" className="nav-link active">
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
                onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}
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
          <h1>Pilotage des Préparations et Expéditions</h1>
          <p>Liste des commandes à préparer pour l'expédition du jour.</p>
        </div>
        
        {/* Performance Metrics */}
        <div className="metrics-grid">
          
          {/* Commandes à préparer */}
          <div className="metric-card blue">
            <h3>Commandes à Préparer</h3>
            <p className="metric-value blue">{metrics.commandesAPreparer}</p>
            <p className="metric-subtext">Total pour la vague d'aujourd'hui</p>
          </div>

          {/* Lignes de Picking Terminées */}
          <div className="metric-card green">
            <h3>Lignes Terminées</h3>
            <p className="metric-value green">
              {metrics.lignesTerminees} <span style={{fontSize: '1.5rem', fontWeight: '600', color: '#6b7280'}}>/{metrics.totalLignes}</span>
            </p>
            <p className="metric-subtext">Lignes de produits "pickées" aujourd'hui</p>
          </div>

          {/* Temps moyen de Picking */}
          <div className="metric-card orange">
            <h3>Temps Moyen (Ligne)</h3>
            <p className="metric-value orange">
              {metrics.tempsMoyen} <span style={{fontSize: '1.5rem', fontWeight: '600', color: '#6b7280'}}>sec</span>
            </p>
            <p className="metric-subtext">Objectif : 40 sec</p>
          </div>
        </div>
        
        {/* Tasks List */}
        <div className="tasks-section">
          <div className="tasks-header">
            <h3>Liste des Tâches de Picking</h3>
            <div className="tasks-controls">
              <select className="select-control">
                <option>Toutes les priorités</option>
                <option>Urgent (J+0)</option>
                <option>Standard (J+1)</option>
              </select>
              <select className="select-control">
                <option>Toutes les étapes</option>
                <option>À commencer</option>
                <option>En cours</option>
              </select>
              <button 
                onClick={launchWave}
                className="launch-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Lancer vague
              </button>
            </div>
          </div>
          
          {/* Tasks Table */}
          <div className="table-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Commande ID</th>
                  <th>Priorité</th>
                  <th>Emplacements à Visiter</th>
                  <th className="text-right">Lignes (Produits)</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index} className={task.rowClass || ''}>
                    <td>
                      <span className={`command-id ${task.statut === 'Complétée' ? 'completed' : 'active'}`}>
                        {task.id}
                      </span>
                    </td>
                    <td>
                      <StatusBadge priority={task.priorite} />
                    </td>
                    <td>{task.emplacements}</td>
                    <td className="text-right">{task.lignesTerminees}/{task.totalLignes}</td>
                    <td>
                      <StatusBadge status={task.statut} />
                    </td>
                    <td>
                      {task.statut === 'En cours' && (
                        <button 
                          onClick={() => continuePicking(task.id)}
                          className="action-button action-continue"
                        >
                          Continuer
                        </button>
                      )}
                      {task.statut === 'À commencer' && (
                        <button 
                          onClick={() => startPicking(task.id)}
                          className="action-button action-start"
                        >
                          Démarrer
                        </button>
                      )}
                      {task.statut === 'Complétée' && (
                        <button 
                          onClick={() => viewDetails(task.id)}
                          className="action-button action-details"
                        >
                          Détails
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Shipment Status */}
        <div className="shipment-section">
          <div className="shipment-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15"/>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              <path d="m3.3 7 8.7 5 9-5"/>
              <path d="M12 22V12"/>
            </svg>
            <h3>Statut des Colis et Expéditions</h3>
          </div>
          
          <div className="shipment-stats">
            <div className="shipment-stat">
              <p>Prêts à être emballés</p>
              <p className="value purple">{shipmentStats.pretsAEmballer} Colis</p>
            </div>
            <div className="shipment-stat">
              <p>En cours d'expédition (scan)</p>
              <p className="value indigo">{shipmentStats.enCoursExpedition} Colis</p>
            </div>
            <div className="shipment-stat">
              <p>Prévu pour le camion à 16:00</p>
              <p className="value gray">{shipmentStats.prevuCamion} Colis</p>
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

export default PreparateurCommandes;