import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './warehouse.css';
import useAdminData from '../../utils/useAdminData';
import api from '../../utils/api';

const Warehouse = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('username') || 'Gestionnaire');
  const { warehouses, loading: loadingFromHook } = useAdminData();
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [warehouse, setWarehouse] = useState('');
  const [warehouseData, setWarehouseData] = useState(null);
  const [warehousesSummary, setWarehousesSummary] = useState([]);
  const [transfersSummary, setTransfersSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState('externe');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [transferItems, setTransferItems] = useState([{ sku: '', quantity: 1 }]);
  const [isCreatingTransfer, setIsCreatingTransfer] = useState(false);

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

  const handleTransfer = () => {
    if (!warehouse) {
      showMessage('Veuillez sélectionner un entrepôt', 'warning');
      return;
    }
    setShowTransferModal(true);
    setTransferType('externe');
    setDestinationWarehouse('');
    setDestinationLocation('');
    setTransferItems([{ sku: '', quantity: 1 }]);
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setTransferItems([{ sku: '', quantity: 1 }]);
    setDestinationWarehouse('');
    setDestinationLocation('');
  };

  const addTransferItem = () => {
    setTransferItems([...transferItems, { sku: '', quantity: 1 }]);
  };

  const removeTransferItem = (index) => {
    const newItems = transferItems.filter((_, i) => i !== index);
    setTransferItems(newItems.length > 0 ? newItems : [{ sku: '', quantity: 1 }]);
  };

  const updateTransferItem = (index, field, value) => {
    const newItems = [...transferItems];
    if (field === 'quantity') {
      newItems[index][field] = parseInt(value) || 1;
    } else {
      newItems[index][field] = value;
    }
    setTransferItems(newItems);
  };

  const createTransfer = async () => {
    if (!warehouse) {
      showMessage('Veuillez sélectionner un entrepôt source', 'warning');
      return;
    }

    if (transferType === 'externe' && !destinationWarehouse) {
      showMessage('Veuillez sélectionner un entrepôt de destination', 'warning');
      return;
    }

    if (transferType === 'interne' && !destinationLocation) {
      showMessage('Veuillez saisir un emplacement de destination', 'warning');
      return;
    }

    const validItems = transferItems.filter(item => item.sku && item.quantity > 0);
    if (validItems.length === 0) {
      showMessage('Veuillez ajouter au moins un produit avec une quantité valide', 'warning');
      return;
    }

    setIsCreatingTransfer(true);
    try {
      const payload = {
        fromWarehouse: warehouse,
        toWarehouse: transferType === 'externe' ? destinationWarehouse : warehouse,
        items: validItems.map(item => ({
          sku: item.sku,
          quantity: item.quantity
        })),
        status: 'planned',
        type: transferType
      };
      
      if (transferType === 'interne' && destinationLocation) {
        payload.destinationLocation = destinationLocation;
      }

      await api.createTransfer(payload);
      showMessage(`Transfert ${transferType === 'externe' ? 'externe' : 'interne'} créé avec succès`, 'success');
      
      const [summary, transfers] = await Promise.all([
        api.getWarehousesSummary(),
        api.getTransfersSummary()
      ]);
      setWarehousesSummary(summary || []);
      setTransfersSummary(transfers);
      
      closeTransferModal();
    } catch (err) {
      console.error('Error creating transfer:', err);
      showMessage('Erreur lors de la création du transfert', 'error');
    } finally {
      setIsCreatingTransfer(false);
    }
  };

  const handleWarehouseChange = (e) => {
    setWarehouse(e.target.value);
    showMessage(`Entrepôt changé pour ${e.target.value}`, 'info');
  };

  useEffect(() => {
    if (!localStorage.getItem('username')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summary, transfers] = await Promise.all([
          api.getWarehousesSummary(),
          api.getTransfersSummary()
        ]);

        setWarehousesSummary(summary || []);
        setTransfersSummary(transfers);

        if (!warehouse && summary && summary.length > 0) {
          setWarehouse(summary[0].name);
          setWarehouseData(summary[0]);
        } else if (warehouse && summary) {
          const selected = summary.find(w => w.name === warehouse);
          setWarehouseData(selected || summary[0]);
        }

        if (summary && summary.length > 0) {
          const selected = summary.find(w => w.name === warehouse) || summary[0];
          if (selected && selected.id) {
            try {
              const stockList = await api.getStockByWarehouse(selected.id);
              const formattedStock = stockList.map((item, index) => {
                const product = item.product || {};
                const quantity = item.quantity || 0;
                const minQuantity = product.min_quantity || 0;
                
                let status = 'ok';
                if (quantity === 0) {
                  status = 'rupture';
                } else if (quantity < minQuantity) {
                  status = 'low';
                }
                
                return {
                  location: `Aisle-${String(index + 1).padStart(2, '0')}-R${String(Math.floor(index / 5) + 1).padStart(2, '0')}-L${String((index % 5) + 1)}`,
                  sku: product.sku || 'N/A',
                  description: product.name || 'Produit inconnu',
                  quantity: quantity,
                  status: status,
                  category: product.category || '',
                  unit: product.unit || 'unité'
                };
              });
              setStockData(formattedStock);
            } catch (err) {
              console.error('Failed to fetch stock data:', err);
              setStockData([]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch warehouse data:', err);
        showMessage('Erreur lors du chargement des données entrepôt', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [warehouse]);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      ok: { label: 'OK', class: 'badge-ok' },
      low: { label: 'Faible', class: 'badge-low' },
      rupture: { label: 'Rupture', class: 'badge-rupture' }
    };

    const config = statusConfig[status] || { label: 'Inconnu', class: 'badge-unknown' };

    return (
      <span className={`status-badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="warehouse">
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

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
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              
              <nav className="navigation">
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>
                  Accueil
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('data_analyst', e)}>
                  Analyse données
                </a>
                <a href="#" className="nav-link active">
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

      <main className="main-content">
        <div className="dashboard-title">
          <h1>Gestion Opérationnelle des Entrepôts</h1>
          <p>Vue en temps réel des stocks, emplacements et inventaires en cours.</p>
        </div>

        <div className="warehouse-actions">
          <div className="warehouse-select">
            <label className="select-label">Entrepôt Actuel :</label>
            <select 
              value={warehouse} 
              onChange={handleWarehouseChange}
              className="select-control"
            >
              {warehousesSummary.map(w => (
                <option key={w.id} value={w.name}>{w.name} - {w.location}</option>
              ))}
            </select>
          </div>
          <div className="action-buttons">
            <button 
              onClick={handleTransfer}
              className="action-button primary"
              style={{ width: '100%', justifyContent: 'center', backgroundColor: '#2563eb' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="6" height="12" rx="1"/><rect x="16" y="6" width="6" height="12" rx="1"/><path d="M8 12h8"/><path d="m10 9-2 3 2 3"/><path d="m14 9 2 3-2 3"/>
              </svg>
              Nouveau Transfert / Déplacement
            </button>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card blue">
            <h3>Stock Général</h3>
            <p className="metric-value blue">{warehouseData?.totalProducts?.toLocaleString() || '0'}</p>
            <p className="metric-subtext">Total Unités Physiques</p>
            <div className="metric-details">
              <div className="metric-detail">
                <span>Capacité / Utilisée:</span>
                <strong>{warehouseData?.capacity?.toLocaleString() || 0} / {warehouseData?.used?.toLocaleString() || 0}</strong>
              </div>
              <div className="metric-detail">
                <span>Taux d'occupation:</span>
                <strong>{warehouseData?.occupancyRate || 0}%</strong>
              </div>
            </div>
          </div>

          <div className="metric-card orange">
            <h3>Transferts Opérationnels</h3>
            <p className="metric-value orange">{transfersSummary?.byStatus?.in_transit || 0}</p>
            <p className="metric-subtext">Transferts en Cours</p>
            <div className="metric-details">
              <div className="metric-detail">
                <span>Planifiés:</span>
                <strong>{transfersSummary?.byStatus?.planned || 0}</strong>
              </div>
              <div className="metric-detail">
                <span>Complétés (Session):</span>
                <strong>{transfersSummary?.byStatus?.completed || 0}</strong>
              </div>
            </div>
          </div>

          <div className="metric-card red">
            <h3>Statut Entrepôt</h3>
            <p className="metric-value red">{warehouseData?.status === 'operational' ? '🟢 Opérationnel' : '⚠️ ' + warehouseData?.status}</p>
            <p className="metric-subtext">Gestionnaire: {warehouseData?.manager || 'N/A'}</p>
            <div className="metric-details">
              <div className="metric-detail">
                <span>Emplacements disponibles:</span>
                <strong>{Math.max(0, (warehouseData?.capacity || 0) - (warehouseData?.used || 0))}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="stock-section">
          <div className="section-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="3" x2="21" y1="9" y2="9"/>
              <line x1="9" x2="9" y1="21" y2="9"/>
            </svg>
            <h3>Liste des Emplacements - {warehouse}</h3>
          </div>
          
          <div className="table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Localisation</th>
                  <th>Réf. SKU</th>
                  <th>Description</th>
                  <th className="text-right">Qté. Disponible</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className="location-id">{item.location}</span>
                    </td>
                    <td>
                      <span className="sku-id">{item.sku}</span>
                    </td>
                    <td>
                      <span className="item-description">{item.description}</span>
                    </td>
                    <td className="text-right">
                      <span className="quantity">{item.quantity.toLocaleString()}</span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showTransferModal && (
        <div className="modal-overlay" onClick={closeTransferModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau Transfert / Déplacement</h2>
              <button className="modal-close" onClick={closeTransferModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Type de transfert</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="transferType"
                      value="externe"
                      checked={transferType === 'externe'}
                      onChange={(e) => setTransferType(e.target.value)}
                    />
                    <span>Transfert externe (vers un autre entrepôt)</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="transferType"
                      value="interne"
                      checked={transferType === 'interne'}
                      onChange={(e) => setTransferType(e.target.value)}
                    />
                    <span>Déplacement interne (même entrepôt)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Entrepôt source</label>
                <input
                  type="text"
                  className="form-input"
                  value={warehouse}
                  disabled
                />
              </div>

              {transferType === 'externe' ? (
                <div className="form-group">
                  <label className="form-label">Entrepôt de destination *</label>
                  <select
                    className="form-input"
                    value={destinationWarehouse}
                    onChange={(e) => setDestinationWarehouse(e.target.value)}
                  >
                    <option value="">Sélectionnez un entrepôt</option>
                    {warehousesSummary
                      .filter(w => w.name !== warehouse)
                      .map(w => (
                        <option key={w.id} value={w.name}>
                          {w.name} - {w.location}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Emplacement de destination *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Aisle-05-R02-L3"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <div className="form-group-header">
                  <label className="form-label">Produits à transférer</label>
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={addTransferItem}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"/><path d="M5 12h14"/>
                    </svg>
                    Ajouter un produit
                  </button>
                </div>

                <div className="transfer-items-list">
                  {transferItems.map((item, index) => (
                    <div key={index} className="transfer-item-row">
                      <div className="transfer-item-input">
                        <label className="form-label-small">SKU *</label>
                        <input
                          type="text"
                          className="form-input-small"
                          placeholder="SKU-123"
                          value={item.sku}
                          onChange={(e) => updateTransferItem(index, 'sku', e.target.value)}
                          list={`sku-list-${index}`}
                        />
                        <datalist id={`sku-list-${index}`}>
                          {stockData.map((stock, idx) => (
                            <option key={idx} value={stock.sku} />
                          ))}
                        </datalist>
                      </div>
                      <div className="transfer-item-input">
                        <label className="form-label-small">Quantité *</label>
                        <input
                          type="number"
                          className="form-input-small"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateTransferItem(index, 'quantity', e.target.value)}
                        />
                      </div>
                      {transferItems.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeTransferItem(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-button secondary"
                onClick={closeTransferModal}
                disabled={isCreatingTransfer}
              >
                Annuler
              </button>
              <button
                className="action-button primary"
                onClick={createTransfer}
                disabled={isCreatingTransfer}
              >
                {isCreatingTransfer ? 'Création...' : 'Créer le transfert'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Optimisation Logistique. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default Warehouse;