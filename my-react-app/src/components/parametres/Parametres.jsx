import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Parametres.css';
import api from '../../utils/api';

const Parametres = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [activeSection, setActiveSection] = useState('profil');
  const [loading, setLoading] = useState(true);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = currentUser.name || 'Admin';

  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('username') && !localStorage.getItem('user')) {
      navigate('/login');
      return;
    }
    
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const config = await api.getConfig();
        setConfigData(config.data || {});
      } catch (err) {
        console.error('Failed to fetch config:', err);
        showMessage('Erreur lors du chargement de la configuration', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [navigate]);

  const [userProfile, setUserProfile] = useState({
    nom: currentUser.name?.split(' ')[1] || 'User',
    prenom: currentUser.name?.split(' ')[0] || 'Admin',
    email: currentUser.email || 'user@stocksync.com',
    telephone: '+33 6 12 34 56 78',
    role: currentUser.role || 'Admin',
    entrepot: 'N/A',
    dateEmbauche: '2023-03-15',
    notificationsEmail: true,
    notificationsSMS: false,
    langue: 'fr',
    fuseauHoraire: 'Europe/Paris'
  });

  // Préférences d'affichage
  const [displayPreferences, setDisplayPreferences] = useState({
    theme: 'clair',
    densite: 'comfortable',
    taillePolice: 'moyenne',
    afficherImages: true,
    animations: true,
    sidebarReduite: false,
    ordreColonnes: 'defaut'
  });

  const [systemSettings, setSystemSettings] = useState({
    lowStockThreshold: configData?.lowStockThreshold || 50,
    performanceAlertThreshold: configData?.performanceAlertThreshold || 90,
    autoReorder: configData?.autoReorder !== false,
    transferAutoApprove: configData?.transferAutoApprove === true,
    integrationEcommerce: configData?.integrationEcommerce || ['Shopify', 'WooCommerce', 'PrestaShop'],
    backupFrequency: configData?.backupFrequency || 'daily'
  });

  // Fonctions de navigation
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
    showMessage("Vous avez été déconnecté.", 'info');
    navigate('/login');
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setShowStatus(true);
    
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  // Gestion des mises à jour du profil
  const updateProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
    showMessage(`Profil mis à jour: ${field}`, 'success');
  };

  const updateDisplayPreferences = (field, value) => {
    setDisplayPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    showMessage(`Préférence mise à jour: ${field}`, 'success');
  };

  const updateSystemSettings = async (field, value) => {
    try {
      const newSettings = { ...systemSettings, [field]: value };
      setSystemSettings(newSettings);
      
      await api.updateConfig(newSettings);
      showMessage(`Paramètre mis à jour: ${field}`, 'success');
    } catch (err) {
      console.error('Failed to update config:', err);
      showMessage('Erreur lors de la sauvegarde', 'error');
    }
  };

  const exporterDonnees = () => {
    alertUser('Export des données utilisateur');
    showMessage('Export des données initié', 'info');
  };

  const supprimerCompte = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      alertUser('Suppression du compte utilisateur');
      showMessage('Demande de suppression du compte envoyée', 'warning');
    }
  };

  // Composants de section
  const ProfilSection = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Profil Utilisateur</h3>
        <p>Gérez vos informations personnelles et préférences de compte</p>
      </div>

      <div className="settings-grid">
        <div className="setting-card">
          <h4>Informations Personnelles</h4>
          <div className="form-group">
            <label>Nom</label>
            <input 
              type="text" 
              value={userProfile.nom}
              onChange={(e) => updateProfile('nom', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Prénom</label>
            <input 
              type="text" 
              value={userProfile.prenom}
              onChange={(e) => updateProfile('prenom', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={userProfile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input 
              type="tel" 
              value={userProfile.telephone}
              onChange={(e) => updateProfile('telephone', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="setting-card">
          <h4>Informations Professionnelles</h4>
          <div className="info-group">
            <label>Rôle</label>
            <span className="info-value">{userProfile.role}</span>
          </div>
          <div className="info-group">
            <label>Entrepôt Principal</label>
            <span className="info-value">{userProfile.entrepot}</span>
          </div>
          <div className="info-group">
            <label>Date d'Embauche</label>
            <span className="info-value">{userProfile.dateEmbauche}</span>
          </div>
        </div>

        <div className="setting-card">
          <h4>Préférences de Notification</h4>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={userProfile.notificationsEmail}
                onChange={(e) => updateProfile('notificationsEmail', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Notifications par Email
            </label>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={userProfile.notificationsSMS}
                onChange={(e) => updateProfile('notificationsSMS', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Notifications SMS
            </label>
          </div>
        </div>

        <div className="setting-card">
          <h4>Paramètres Régionaux</h4>
          <div className="form-group">
            <label>Langue</label>
            <select 
              value={userProfile.langue}
              onChange={(e) => updateProfile('langue', e.target.value)}
              className="form-select"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fuseau Horaire</label>
            <select 
              value={userProfile.fuseauHoraire}
              onChange={(e) => updateProfile('fuseauHoraire', e.target.value)}
              className="form-select"
            >
              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="danger-zone">
        <h4>Zone de Danger</h4>
        <div className="danger-actions">
          <button className="action-button secondary" onClick={exporterDonnees}>
            Exporter Mes Données
          </button>
          <button className="action-button danger" onClick={supprimerCompte}>
            Supprimer Mon Compte
          </button>
        </div>
      </div>
    </div>
  );

  const AffichageSection = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Préférences d'Affichage</h3>
        <p>Personnalisez l'apparence et le comportement de l'interface</p>
      </div>

      <div className="settings-grid">
        <div className="setting-card">
          <h4>Thème et Apparence</h4>
          <div className="form-group">
            <label>Thème</label>
            <div className="theme-options">
              <label className="theme-option">
                <input 
                  type="radio" 
                  name="theme"
                  value="clair"
                  checked={displayPreferences.theme === 'clair'}
                  onChange={(e) => updateDisplayPreferences('theme', e.target.value)}
                />
                <span className="theme-preview clair">
                  <span className="theme-name">Clair</span>
                </span>
              </label>
              <label className="theme-option">
                <input 
                  type="radio" 
                  name="theme"
                  value="sombre"
                  checked={displayPreferences.theme === 'sombre'}
                  onChange={(e) => updateDisplayPreferences('theme', e.target.value)}
                />
                <span className="theme-preview sombre">
                  <span className="theme-name">Sombre</span>
                </span>
              </label>
              <label className="theme-option">
                <input 
                  type="radio" 
                  name="theme"
                  value="auto"
                  checked={displayPreferences.theme === 'auto'}
                  onChange={(e) => updateDisplayPreferences('theme', e.target.value)}
                />
                <span className="theme-preview auto">
                  <span className="theme-name">Auto</span>
                </span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Densité d'Affichage</label>
            <select 
              value={displayPreferences.densite}
              onChange={(e) => updateDisplayPreferences('densite', e.target.value)}
              className="form-select"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Confortable</option>
              <option value="spacieux">Spacieux</option>
            </select>
          </div>

          <div className="form-group">
            <label>Taille de Police</label>
            <select 
              value={displayPreferences.taillePolice}
              onChange={(e) => updateDisplayPreferences('taillePolice', e.target.value)}
              className="form-select"
            >
              <option value="petite">Petite</option>
              <option value="moyenne">Moyenne</option>
              <option value="grande">Grande</option>
              <option value="tres-grande">Très Grande</option>
            </select>
          </div>
        </div>

        <div className="setting-card">
          <h4>Comportement de l'Interface</h4>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={displayPreferences.afficherImages}
                onChange={(e) => updateDisplayPreferences('afficherImages', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Afficher les images des produits
            </label>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={displayPreferences.animations}
                onChange={(e) => updateDisplayPreferences('animations', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Activer les animations
            </label>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={displayPreferences.sidebarReduite}
                onChange={(e) => updateDisplayPreferences('sidebarReduite', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Sidebar réduite par défaut
            </label>
          </div>
        </div>

        <div className="setting-card">
          <h4>Personnalisation des Tableaux</h4>
          <div className="form-group">
            <label>Ordre des Colonnes</label>
            <select 
              value={displayPreferences.ordreColonnes}
              onChange={(e) => updateDisplayPreferences('ordreColonnes', e.target.value)}
              className="form-select"
            >
              <option value="defaut">Défaut</option>
              <option value="alphabethique">Alphabétique</option>
              <option value="frequence">Fréquence d'utilisation</option>
              <option value="personnalise">Personnalisé</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Colonnes Visibles</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkbox-custom"></span>
                Statut
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkbox-custom"></span>
                Date
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkbox-custom"></span>
                Priorité
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkbox-custom"></span>
                Notes
              </label>
            </div>
          </div>
        </div>

        <div className="setting-card">
          <h4>Aperçu en Temps Réel</h4>
          <div className="preview-area">
            <div className={`preview-content ${displayPreferences.theme} ${displayPreferences.densite}`}>
              <div className="preview-header">
                <span>Aperçu de l'interface</span>
              </div>
              <div className="preview-table">
                <div className="preview-row">
                  <span>Commande #001</span>
                  <span className="preview-badge">En cours</span>
                </div>
                <div className="preview-row">
                  <span>Commande #002</span>
                  <span className="preview-badge">Terminé</span>
                </div>
              </div>
            </div>
          </div>
          <button className="action-button primary" onClick={() => showMessage('Préférences d\'affichage appliquées', 'success')}>
            Appliquer les Changements
          </button>
        </div>
      </div>
    </div>
  );

  const SystemeSection = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Paramètres Système</h3>
        <p>Configuration logistique et des opérations</p>
      </div>

      {loading && <p>Chargement de la configuration...</p>}

      <div className="settings-grid">
        <div className="setting-card">
          <h4>Gestion des Stocks</h4>
          <div className="form-group">
            <label>Seuil de Stock Bas (unités)</label>
            <input 
              type="number" 
              value={systemSettings.lowStockThreshold}
              onChange={(e) => updateSystemSettings('lowStockThreshold', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="1000"
            />
            <small>Alerte lorsque le stock passe sous ce seuil</small>
          </div>

          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={systemSettings.autoReorder}
                onChange={(e) => updateSystemSettings('autoReorder', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Réapprovisionnement automatique
            </label>
          </div>
        </div>

        <div className="setting-card">
          <h4>Transferts</h4>
          <div className="form-group">
            <label>Seuil d'Alerte Performance (%)</label>
            <input 
              type="number" 
              value={systemSettings.performanceAlertThreshold}
              onChange={(e) => updateSystemSettings('performanceAlertThreshold', parseInt(e.target.value))}
              className="form-input"
              min="1"
              max="100"
            />
            <small>Alerte lorsque l'utilisation dépasse ce pourcentage</small>
          </div>

          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={systemSettings.transferAutoApprove}
                onChange={(e) => updateSystemSettings('transferAutoApprove', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              Approbation automatique des transferts
            </label>
          </div>
        </div>

        <div className="setting-card">
          <h4>Intégrations E-commerce</h4>
          <div className="form-group">
            <label>Plateformes Actives</label>
            <div className="checkbox-group">
              {systemSettings.integrationEcommerce?.map((platform, idx) => (
                <label key={idx} className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkbox-custom"></span>
                  {platform}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="setting-card">
          <h4>Sauvegarde</h4>
          <div className="form-group">
            <label>Fréquence de Sauvegarde</label>
            <select 
              value={systemSettings.backupFrequency}
              onChange={(e) => updateSystemSettings('backupFrequency', e.target.value)}
              className="form-select"
            >
              <option value="hourly">Horaire</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>
        </div>

        <div className="setting-card">
          <h4>Actions Système</h4>
          <div className="system-actions">
            <button className="action-button secondary" onClick={() => showMessage('Cache vidé avec succès', 'success')}>
              Vider le Cache
            </button>
            <button className="action-button secondary" onClick={() => showMessage('Configuration exportée', 'success')}>
              Exporter Configuration
            </button>
            <button className="action-button warning" onClick={() => showMessage('Synchronisation en cours...', 'info')}>
              Synchroniser Données
            </button>
            <button className="action-button danger" onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
                showMessage('Paramètres réinitialisés par défaut', 'info');
              }
            }}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AideSection = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Aide & Documentation</h3>
        <p>Ressources et support pour utiliser StockSync</p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <div className="help-icon">📚</div>
          <h4>Documentation</h4>
          <p>Guide complet d'utilisation de StockSync avec des exemples pratiques</p>
          <button className="action-button primary">Accéder à la Documentation</button>
        </div>

        <div className="help-card">
          <div className="help-icon">🎥</div>
          <h4>Tutoriels Vidéo</h4>
          <p>Vidéos explicatives pour maîtriser toutes les fonctionnalités</p>
          <button className="action-button primary">Voir les Tutoriels</button>
        </div>

        <div className="help-card">
          <div className="help-icon">❓</div>
          <h4>FAQ</h4>
          <p>Réponses aux questions fréquentes sur l'utilisation de la plateforme</p>
          <button className="action-button primary">Consulter la FAQ</button>
        </div>

        <div className="help-card">
          <div className="help-icon">🛠️</div>
          <h4>Support Technique</h4>
          <p>Contactez notre équipe de support pour toute assistance</p>
          <button className="action-button primary">Contacter le Support</button>
        </div>

        <div className="help-card">
          <div className="help-icon">📞</div>
          <h4>Contact Urgent</h4>
          <p>Support téléphonique pour les situations critiques</p>
          <div className="contact-info">
            <strong>+33 1 23 45 67 89</strong>
            <span>Disponible 24h/24</span>
          </div>
        </div>

        <div className="help-card">
          <div className="help-icon">💡</div>
          <h4>Suggestions</h4>
          <p>Proposez vos idées pour améliorer StockSync</p>
          <button className="action-button secondary">Faire une Suggestion</button>
        </div>
      </div>

      <div className="quick-links">
        <h4>Liens Rapides</h4>
        <div className="links-grid">
          <a href="#" className="quick-link">Guide de démarrage</a>
          <a href="#" className="quick-link">Bonnes pratiques</a>
          <a href="#" className="quick-link">Dépannage technique</a>
          <a href="#" className="quick-link">Mises à jour</a>
          <a href="#" className="quick-link">API Documentation</a>
          <a href="#" className="quick-link">Politique de confidentialité</a>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch(activeSection) {
      case 'profil': return <ProfilSection />;
      case 'affichage': return <AffichageSection />;
      case 'systeme': return <SystemeSection />;
      case 'aide': return <AideSection />;
      default: return <ProfilSection />;
    }
  };

  return (
    <div className="parametres-page">
      {/* Status Message */}
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
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

          <div className="header-right">
            <div className="utility-buttons">
              <button 
                title="Paramètres" 
                className="utility-button active"
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
      <main className="settings-main">
        <div className="settings-container">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <h3>Paramètres</h3>
            <nav className="settings-nav">
              <button 
                className={`nav-item ${activeSection === 'profil' ? 'active' : ''}`}
                onClick={() => setActiveSection('profil')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Profil utilisateur
              </button>
              <button 
                className={`nav-item ${activeSection === 'affichage' ? 'active' : ''}`}
                onClick={() => setActiveSection('affichage')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><circle cx="8" cy="10" r="1"/><circle cx="16" cy="10" r="1"/><line x1="9" y1="16" x2="15.01" y2="16"/><line x1="12" y1="13" x2="12" y2="16"/>
                </svg>
                Préférences d'affichage
              </button>
              <button 
                className={`nav-item ${activeSection === 'systeme' ? 'active' : ''}`}
                onClick={() => setActiveSection('systeme')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Paramètres système
              </button>
              <button 
                className={`nav-item ${activeSection === 'aide' ? 'active' : ''}`}
                onClick={() => setActiveSection('aide')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Aide & Documentation
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {renderSectionContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Paramètres et Configuration. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default Parametres;