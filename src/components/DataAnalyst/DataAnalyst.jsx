import React from 'react';
import './DataAnalyst.css';

const DataAnalyst = () => {
  const navigateToRole = (roleKey) => {
    console.log(`Navigating to role: ${roleKey}`);
  };

  const logout = () => {
    console.log('User logged out.');
  };

  return (
    <div className="data-analyst-container">
      {/* Header */}
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
            <button className="active">Analyse données</button>
            <button onClick={() => navigateToRole('gestionnaire_entrepot')}>Gestion d'entrepôts</button>
            <button onClick={() => navigateToRole('agent_reception')}>Entrées</button>
            <button onClick={() => navigateToRole('preparateur_commandes')}>Sorties</button>
            <button onClick={() => navigateToRole('admin_logistique')}>Administration logistique</button>
          </nav>
        </div>
        <div className="header-right">
          <span>Connecté en tant que: <strong>Data Analyst</strong></span>
          <button className="logout-btn" onClick={logout}>Déconnexion</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1>Tableau de Bord : Analyse de Performance</h1>
        <p>Visualisation des indicateurs logistiques en temps réel.</p>

        <section className="kpi-section">
          <div className="kpi-card">
            <p className="kpi-title">Rotation des Stocks (Annuel)</p>
            <div className="kpi-value">8.4x</div>
            <div className="kpi-change positive">+12%</div>
            <p className="kpi-target">Cible: 9.0x</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-title">Délai de Préparation Moyen</p>
            <div className="kpi-value">1h 15m</div>
            <div className="kpi-change negative">-5%</div>
            <p className="kpi-target">Mois Dernier: 1h 19m</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-title">Taux d'Erreur (Picking/Shipping)</p>
            <div className="kpi-value">0.21%</div>
            <div className="kpi-change positive">+0.03% (Amélioration)</div>
            <p className="kpi-target">Cible: moins de 0.25%</p>
          </div>

          <div className="kpi-card">
            <p className="kpi-title">Remplissage Entrepôt A</p>
            <div className="kpi-value">78%</div>
            <div className="kpi-change negative">-2%</div>
            <p className="kpi-target">Capacité Max: 90%</p>
          </div>
        </section>

        <section className="chart-section">
          <div className="chart">
            <h2>Volume de Commandes Traitées (Mois)</h2>
            <p>Espace réservé pour le graphique de volume (ex: D3.js ou Chart.js)</p>
          </div>

          <div className="top-references">
            <h2>Top 5 Références (Semaine)</h2>
            <ul>
              <li>REF-001X - Câbles USB C <span>1,250 unités</span></li>
              <li>REF-045Y - Batterie Externe <span>980 unités</span></li>
              <li>REF-007Z - Support Téléphone <span>712 unités</span></li>
              <li>REF-112A - Écouteurs sans fil <span>650 unités</span></li>
              <li>REF-205B - Clavier mécanique <span>490 unités</span></li>
            </ul>
          </div>
        </section>

        <section className="filters-section">
          <h2>Filtres et Segmentation</h2>
          <div className="filters">
            <select>
              <option>Sélectionner Entrepôt</option>
              <option>Entrepôt A</option>
              <option>Entrepôt B</option>
              <option>Entrepôt C</option>
            </select>
            <input type="date" />
            <button>Appliquer les Filtres</button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 StockSync. Optimisation Logistique. Version 1.0</p>
      </footer>
    </div>
  );
};

export default DataAnalyst;
