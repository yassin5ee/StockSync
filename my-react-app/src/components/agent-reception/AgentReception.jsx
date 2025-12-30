import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentReception.css';
import api from '../../utils/api';

const AgentReception = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('username') || 'Agent Réception');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('reception');
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
        console.error('Failed to fetch reception data:', err);
        showMessage('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const receptionMetrics = {
    livraisonsAttendues: transfers?.byStatus?.planned || 0,
    palettesReceptionnees: transfers?.byStatus?.in_transit || 0,
    produitsVerifies: transfers?.totalItems || 0,
    tauxQualite: '99.4%'
  };

  const livraisonsAttendues = transfers?.transfers?.slice(0, 4).map((t, idx) => ({
    id: `LIV-${new Date().toISOString().split('T')[0]}-${String(idx + 1).padStart(3, '0')}`,
    transferId: t._id,
    fournisseur: 'Logistique Auto',
    reference: t._id ? t._id.toString().slice(-6) : `PO-${idx}`,
    produits: t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0,
    palettes: Math.ceil((t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0) / 100),
    heureEstimee: new Date(t.scheduledDate || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    statut: t.status === 'in_transit' ? 'en_route' : 'programme',
    retard: false
  })) || [];

  const receptionsEnCours = transfers?.transfers?.filter(t => t.status === 'in_transit').slice(0, 2).map((t, idx) => ({
    id: `REC-${new Date().toISOString().split('T')[0]}-${String(idx + 1).padStart(3, '0')}`,
    livraisonId: t._id,
    fournisseur: 'Source Auto',
    produitsScannes: Math.floor((t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0) * 0.8),
    totalProduits: t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0,
    palettes: Math.ceil((t.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0) / 100),
    responsable: userName,
    heureDebut: new Date(t.scheduledDate || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    statut: 'en_cours'
  })) || [];

  const quaisReception = [
    { id: 1, numero: 'Quai A1', statut: 'occupe', livraison: livraisonsAttendues[0]?.id, vehicule: 'FR-789-XY', heureArrivee: '08:10' },
    { id: 2, numero: 'Quai A2', statut: 'occupe', livraison: livraisonsAttendues[1]?.id, vehicule: 'BE-456-AB', heureArrivee: '07:40' },
    { id: 3, numero: 'Quai B1', statut: 'libre', livraison: null, vehicule: null, heureArrivee: null },
    { id: 4, numero: 'Quai B2', statut: 'libre', livraison: null, vehicule: null, heureArrivee: null },
    { id: 5, numero: 'Quai C1', statut: 'maintenance', livraison: null, vehicule: null, heureArrivee: null }
  ];

  const alertesReception = [
    { id: 1, type: 'qualite', severite: 'moyenne', message: `Carton potentiellement endommagé - ${transfers?.transfers?.[0]?.fromWarehouse}`, produit: transfers?.transfers?.[0]?.items?.[0]?.sku || 'SKU-000', timestamp: new Date().toLocaleString('fr-FR') },
    { id: 2, type: 'quantite', severite: 'faible', message: 'Écart quantité possible sur transfert', produit: transfers?.transfers?.[1]?.items?.[0]?.sku || 'SKU-000', timestamp: new Date().toLocaleString('fr-FR') },
    { id: 3, type: 'document', severite: 'elevee', message: 'Bon de livraison à vérifier', produit: null,     timestamp: new Date().toLocaleString('fr-FR') }
  ];

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

  const demarrerReception = async (livraisonId) => {
    try {
      showMessage(`Démarrage réception pour ${livraisonId}...`, 'info');
      const transfer = transfers?.transfers?.find(t => t._id === livraisonId);
      if (transfer) {
        await api.updateTransfer(transfer._id, { status: 'in_transit' });
        // Refresh data
        const [transfersData] = await Promise.all([api.getTransfersSummary()]);
        setTransfers(transfersData);
        showMessage(`Réception démarrée pour ${livraisonId}`, 'success');
      }
    } catch (err) {
      console.error('Error starting reception:', err);
      showMessage('Erreur au démarrage de la réception', 'error');
    }
  };

  const scannerProduit = async (receptionId) => {
    try {
      showMessage(`Produit scanné - Réception ${receptionId}`, 'info');
    } catch (err) {
      console.error('Error scanning product:', err);
      showMessage('Erreur lors du scan du produit', 'error');
    }
  };

  const terminerReception = async (receptionId) => {
    try {
      showMessage(`Finalisation réception ${receptionId}...`, 'info');
      const transfer = receptionsEnCours.find(r => r.id === receptionId);
      if (transfer && transfer.livraisonId) {
        await api.updateTransfer(transfer.livraisonId, { status: 'completed' });
        // Refresh data
        const [transfersData] = await Promise.all([api.getTransfersSummary()]);
        setTransfers(transfersData);
        showMessage(`Réception terminée pour ${receptionId}`, 'success');
      }
    } catch (err) {
      console.error('Error completing reception:', err);
      showMessage('Erreur lors de la finalisation', 'error');
    }
  };

  const signalerProbleme = async (livraisonId, type) => {
    try {
      showMessage(`Problème ${type} signalé pour ${livraisonId}...`, 'warning');
      const alertPayload = {
        type: 'reception_problem',
        severity: type === 'retard' ? 'medium' : 'high',
        message: `Problème ${type} sur livraison ${livraisonId}`,
        timestamp: new Date(),
        relatedTransferId: livraisonId
      };
      await api.createAlert(alertPayload);
      showMessage(`Problème ${type} signalé et enregistré`, 'success');
    } catch (err) {
      console.error('Error reporting problem:', err);
      showMessage('Erreur lors du signalement du problème', 'error');
    }
  };

  const assignerQuai = async (quaiId, livraisonId) => {
    try {
      showMessage(`Assignation du quai ${quaiId}...`, 'info');
      const alertPayload = {
        type: 'quai_assignment',
        severity: 'low',
        message: `Livraison ${livraisonId} assignée au quai ${quaiId}`,
        timestamp: new Date(),
        relatedTransferId: livraisonId
      };
      await api.createAlert(alertPayload);
      showMessage(`Quai ${quaiId} assigné avec succès`, 'success');
    } catch (err) {
      console.error('Error assigning quai:', err);
      showMessage('Erreur lors de l\'assignation du quai', 'error');
    }
  };

  // Composants de statut
  const StatusBadge = ({ status, type }) => {
    const getStatusConfig = () => {
      switch(status) {
        case 'en_route':
        case 'programme':
        case 'libre':
        case 'faible':
          return { bg: 'badge-info', text: 'badge-info-text' };
        case 'en_cours':
        case 'occupe':
        case 'moyenne':
          return { bg: 'badge-warning', text: 'badge-warning-text' };
        case 'verification':
        case 'elevee':
          return { bg: 'badge-warning', text: 'badge-warning-text' };
        case 'retarde':
        case 'critique':
          return { bg: 'badge-error', text: 'badge-error-text' };
        case 'termine':
        case 'complete':
          return { bg: 'badge-success', text: 'badge-success-text' };
        case 'maintenance':
          return { bg: 'badge-default', text: 'badge-default-text' };
        default:
          return { bg: 'badge-default', text: 'badge-default-text' };
      }
    };

    const config = getStatusConfig();
    const statusText = getStatusText(status);
    return (
      <span className={`status-badge ${config.bg} ${config.text}`}>
        {statusText}
      </span>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      'en_route': 'En route',
      'programme': 'Programmé',
      'retarde': 'Retardé',
      'en_cours': 'En cours',
      'verification': 'Vérification',
      'termine': 'Terminé',
      'complete': 'Complété',
      'occupe': 'Occupé',
      'libre': 'Libre',
      'maintenance': 'Maintenance',
      'faible': 'Faible',
      'moyenne': 'Moyenne',
      'elevee': 'Élevée',
      'critique': 'Critique'
    };
    return statusMap[status] || status;
  };

  const TypeBadge = ({ type }) => {
    const typeConfig = {
      'qualite': { bg: 'badge-warning', text: 'badge-warning-text', icon: '⚠️' },
      'quantite': { bg: 'badge-info', text: 'badge-info-text', icon: '📊' },
      'document': { bg: 'badge-error', text: 'badge-error-text', icon: '📄' }
    };

    const config = typeConfig[type] || { bg: 'badge-default', text: 'badge-default-text', icon: '📦' };
    const typeText = {
      'qualite': 'Qualité',
      'quantite': 'Quantité',
      'document': 'Document'
    }[type] || type;

    return (
      <span className={`status-badge ${config.bg} ${config.text}`}>
        {config.icon} {typeText}
      </span>
    );
  };

  // Composants de section
  const ReceptionSection = () => (
    <div className="tab-content">
      <div className="metrics-grid">
        <div className="metric-card blue">
          <h3>Livraisons Attendues</h3>
          <p className="metric-value blue">{receptionMetrics.livraisonsAttendues}</p>
          <p className="metric-subtext">Aujourd'hui</p>
        </div>

        <div className="metric-card green">
          <h3>Palettes Reçues</h3>
          <p className="metric-value green">{receptionMetrics.palettesReceptionnees}</p>
          <p className="metric-subtext">Ce mois</p>
        </div>

        <div className="metric-card purple">
          <h3>Produits Vérifiés</h3>
          <p className="metric-value purple">{receptionMetrics.produitsVerifies.toLocaleString()}</p>
          <p className="metric-subtext">Unités contrôlées</p>
        </div>

        <div className="metric-card orange">
          <h3>Taux de Qualité</h3>
          <p className="metric-value orange">{receptionMetrics.tauxQualite}</p>
          <p className="metric-subtext">Réceptions sans incident</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Livraisons en Attente</h4>
          <div className="livraisons-list">
            {livraisonsAttendues.map(livraison => (
              <div key={livraison.id} className="livraison-item">
                <div className="livraison-header">
                  <div className="livraison-info">
                    <strong>{livraison.id}</strong>
                    <span className="fournisseur">{livraison.fournisseur}</span>
                  </div>
                  <StatusBadge status={livraison.statut} />
                </div>
                <div className="livraison-details">
                  <div className="detail">
                    <span className="label">Référence:</span>
                    <span className="value">{livraison.reference}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Produits:</span>
                    <span className="value">{livraison.produits} unités</span>
                  </div>
                  <div className="detail">
                    <span className="label">Palettes:</span>
                    <span className="value">{livraison.palettes}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Heure:</span>
                    <span className={`value ${livraison.retard ? 'retard' : ''}`}>
                      {livraison.heureEstimee}
                      {livraison.retard && ` (+${livraison.retardMinutes}min)`}
                    </span>
                  </div>
                </div>
                <div className="livraison-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => demarrerReception(livraison.transferId)}
                  >
                    Démarrer Réception
                  </button>
                  <button 
                    className="action-button secondary"
                    onClick={() => signalerProbleme(livraison.transferId, 'retard')}
                  >
                    Signaler Retard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h4>Réceptions en Cours</h4>
          <div className="receptions-list">
            {receptionsEnCours.map(reception => (
              <div key={reception.id} className="reception-item">
                <div className="reception-header">
                  <div className="reception-info">
                    <strong>{reception.livraisonId}</strong>
                    <span className="fournisseur">{reception.fournisseur}</span>
                  </div>
                  <StatusBadge status={reception.statut} />
                </div>
                <div className="reception-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${(reception.produitsScannes / reception.totalProduits) * 100}%`}}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {reception.produitsScannes}/{reception.totalProduits} produits
                  </span>
                </div>
                <div className="reception-details">
                  <div className="detail">
                    <span className="label">Palettes:</span>
                    <span className="value">{reception.palettes}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Responsable:</span>
                    <span className="value">{reception.responsable}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Début:</span>
                    <span className="value">{reception.heureDebut}</span>
                  </div>
                </div>
                <div className="reception-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => scannerProduit(reception.id)}
                  >
                    Scanner Produit
                  </button>
                  <button 
                    className="action-button success"
                    onClick={() => terminerReception(reception.id)}
                  >
                    Terminer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const QuaisSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Gestion des Quais de Réception</h3>
        <div className="section-controls">
          <select className="select-control">
            <option>Tous les statuts</option>
            <option>Occupé</option>
            <option>Libre</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      <div className="quais-grid">
        {quaisReception.map(quai => (
          <div key={quai.id} className={`quai-card ${quai.statut}`}>
            <div className="quai-header">
              <h4>{quai.numero}</h4>
              <StatusBadge status={quai.statut} />
            </div>
            
            {quai.statut === 'occupe' && (
              <div className="quai-occupation">
                <div className="occupation-info">
                  <strong>{quai.livraison}</strong>
                  <span className="vehicule">{quai.vehicule}</span>
                  <span className="heure">Arrivé: {quai.heureArrivee}</span>
                </div>
                <div className="occupation-actions">
                  <button className="action-button secondary">Détails</button>
                  <button className="action-button warning">Libérer</button>
                </div>
              </div>
            )}

            {quai.statut === 'libre' && (
              <div className="quai-libre">
                <p>Quai disponible</p>
                <select className="select-control">
                  <option>Assigner une livraison</option>
                  {livraisonsAttendues.map(liv => (
                    <option key={liv.id} value={liv.id}>{liv.id} - {liv.fournisseur}</option>
                  ))}
                </select>
                <button 
                  className="action-button primary"
                  onClick={() => assignerQuai(quai.id, 'LIV-SELECTED')}
                >
                  Assigner
                </button>
              </div>
            )}

            {quai.statut === 'maintenance' && (
              <div className="quai-maintenance">
                <p>🛠️ En maintenance</p>
                <span className="maintenance-info">Retour prévu: 16:00</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const AlertesSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Alertes et Incidents</h3>
        <div className="section-controls">
          <select className="select-control">
            <option>Tous les types</option>
            <option>Qualité</option>
            <option>Quantité</option>
            <option>Document</option>
          </select>
        </div>
      </div>

      <div className="alertes-container">
        {alertesReception.map(alerte => (
          <div key={alerte.id} className="alerte-card">
            <div className="alerte-header">
              <TypeBadge type={alerte.type} />
              <StatusBadge status={alerte.severite} />
            </div>
            <div className="alerte-content">
              <p className="alerte-message">{alerte.message}</p>
              {alerte.produit && (
                <span className="alerte-produit">Produit: {alerte.produit}</span>
              )}
              <span className="alerte-timestamp">{alerte.timestamp}</span>
            </div>
            <div className="alerte-actions">
              <button className="action-button secondary">Marquer comme vu</button>
              <button className="action-button primary">Résoudre</button>
              <button className="action-button warning">Escalader</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'reception': return <ReceptionSection />;
      case 'quais': return <QuaisSection />;
      case 'alertes': return <AlertesSection />;
      default: return <ReceptionSection />;
    }
  };

  return (
    <div className="agent-reception">
      {/* Status Message */}
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

      {loading && (
        <div className="status-message default">Chargement des données de réception...</div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-container">
          
          <div className="header-left">
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

            <div className="header-left">
              <div className="logo-container">
                <span className="logo-text">StockSync</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                  <circle cx="8" cy="20" r="1"/>
                  <circle cx="17" cy="20" r="1"/>
                  <path d="M20 4.4 17 6H4l-1.5 8h17l-2.7-8h-11"/>
                  <path d="M10 9l.9 3.4"/>
                </svg>
              </div>
              
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
                <a href="#" className="nav-link active">
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

          <div className="header-right">
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
          <h1>Réception des Marchandises</h1>
          <p>Gestion des livraisons entrantes et contrôle qualité</p>
        </div>

        {/* Navigation Tabs */}
        <div className="reception-tabs">
          <button 
            className={`tab-button ${activeTab === 'reception' ? 'active' : ''}`}
            onClick={() => setActiveTab('reception')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 16H6"/><path d="M18 8H6"/><path d="M20 6 12 2 4 6"/><path d="M20 18l-8 4-8-4"/><path d="m4 6 8 4 8-4"/><path d="m4 18 8 4 8-4"/><path d="M8 2v4"/><path d="M16 2v4"/>
            </svg>
            Réception
          </button>
          <button 
            className={`tab-button ${activeTab === 'quais' ? 'active' : ''}`}
            onClick={() => setActiveTab('quais')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
            </svg>
            Quais
          </button>
          <button 
            className={`tab-button ${activeTab === 'alertes' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertes')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
            Alertes
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Module Réception - Entrées. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default AgentReception;