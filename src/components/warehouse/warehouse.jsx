import React, { useState, useEffect } from 'react';
import './warehouse.css';

const Warehouse = () => {
  const [currentPage, setCurrentPage] = useState('gestionnaire_entrepot');
  const [warehouse, setWarehouse] = useState('A');

  const navigateToRole = (roleKey) => {
    setCurrentPage(roleKey);
    alertUser(`Accès au rôle : ${getRoleName(roleKey)}`);
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
    console.log('Déconnexion de l\'utilisateur.');
    alertUser('Vous avez été déconnecté.');
  };

  useEffect(() => {
    console.log("Page Gestionnaire d'Entrepôt chargée. Tableau de bord prêt.");
  }, []);

  return (
    <div className="warehouse-container">
      <header className="header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigateToRole('home')}>
            ← Retour
          </button>
          <div className="logo">
            <span>StockSync</span>
          </div>
          <nav className="nav-links">
            <button onClick={() => navigateToRole('home')}>Accueil</button>
            <button onClick={() => navigateToRole('data_analyst')}>Analyse données</button>
            <button className="active">Gestion d'entrepôts</button>
            <button onClick={() => navigateToRole('agent_reception')}>Entrées</button>
            <button onClick={() => navigateToRole('preparateur_commandes')}>Sorties</button>
            <button onClick={() => navigateToRole('admin_logistique')}>Administration logistique</button>
          </nav>
        </div>
        <div className="header-right">
          <span>Connecté en tant que: <strong>Gestionnaire</strong></span>
          <button className="logout-btn" onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <main className="main-content">
        <h1>Gestion Opérationnelle des Entrepôts</h1>
        <p>Vue en temps réel des stocks, emplacements et inventaires en cours.</p>

        <div className="warehouse-actions">
          <div className="warehouse-select">
            <label>Entrepôt Actuel :</label>
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
              <option value="A">Entrepôt A - Paris (Principal)</option>
              <option value="B">Entrepôt B - Lyon</option>
              <option value="C">Entrepôt C - Bordeaux</option>
            </select>
          </div>
          <div className="action-buttons">
            <button onClick={() => alertUser("Action: Lancement d'un nouvel inventaire")}>Nouvel Inventaire</button>
            <button onClick={() => alertUser("Action: Consultation des emplacements")}>Planification des Emplacements</button>
          </div>
        </div>

        <div className="stock-overview">
          <div className="status-card blue">
            <h3>Stock Général</h3>
            <div><span>Total Unités Physiques:</span><strong>125,400</strong></div>
            <div><span>Nombre de Références (SKUs):</span><strong>4,120</strong></div>
            <div><span>Valorisation Estimée:</span><strong>€ 4,5 M</strong></div>
          </div>

          <div className="status-card orange">
            <h3>Inventaires Cycliques</h3>
            <div><span>Inventaires à Traiter (Aujourd'hui):</span><strong>8</strong></div>
            <div><span>Références Contrôlées (Semaine):</span><strong>450</strong></div>
            <div><span>Taux de Précision Moyen:</span><strong>99.8%</strong></div>
          </div>

          <div className="status-card red">
            <h3>Alerte Stock / Capacité</h3>
            <div><span>Références en rupture imminente:</span><strong>12</strong></div>
            <div><span>Emplacements saturés (&gt;95%):</span><strong>48</strong></div>
            <div><span>Mouvements de stock en attente:</span><strong>210</strong></div>
          </div>
        </div>

        <div className="stock-table">
          <h3>Liste des Emplacements Actuels (Entrepôt A)</h3>
          <table>
            <thead>
              <tr>
                <th>Localisation</th>
                <th>Réf. SKU</th>
                <th>Description</th>
                <th>Qté. Disponible</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aisle-05-R03-L2</td>
                <td>REF-007Z</td>
                <td>Support Téléphone Premium</td>
                <td>850</td>
                <td className="ok">OK</td>
              </tr>
              <tr>
                <td>Aisle-12-R01-L1</td>
                <td>REF-112A</td>
                <td>Écouteurs sans fil (BLEU)</td>
                <td>120</td>
                <td className="low">Faible</td>
              </tr>
              <tr>
                <td>Aisle-03-R05-L3</td>
                <td>REF-045Y</td>
                <td>Batterie Externe 10000mAh</td>
                <td>2,100</td>
                <td className="ok">OK</td>
              </tr>
              <tr>
                <td>Aisle-07-R02-L4</td>
                <td>REF-999K</td>
                <td>Rupture (Commande en cours)</td>
                <td>0</td>
                <td className="rupture">Rupture</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 StockSync. Optimisation Logistique. Version 1.0</p>
      </footer>
    </div>
  );
};

export default Warehouse;
