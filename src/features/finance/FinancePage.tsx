import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  RefreshCw,
  DollarSign,
  Package,
  Wallet,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useFinanceStore } from '@/stores';
import type { Stock, Asset, CashAccount } from '@/types';

type TabType = 'stocks' | 'assets' | 'cash';

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('stocks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TabType>('stocks');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<Stock | Asset | CashAccount | null>(null);

  // Stock form
  const [stockTicker, setStockTicker] = useState('');
  const [stockName, setStockName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockPurchasePrice, setStockPurchasePrice] = useState('');
  const [stockCurrentPrice, setStockCurrentPrice] = useState('');
  const [stockPurchaseDate, setStockPurchaseDate] = useState('');

  // Asset form
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetPurchasePrice, setAssetPurchasePrice] = useState('');
  const [assetCurrentValue, setAssetCurrentValue] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [assetPurchaseDate, setAssetPurchaseDate] = useState('');

  // Cash form
  const [cashName, setCashName] = useState('');
  const [cashBalance, setCashBalance] = useState('');
  const [cashCurrency, setCashCurrency] = useState('EUR');

  const {
    stocks,
    assets,
    cashAccounts,
    fetchStocks,
    fetchAssets,
    fetchCashAccounts,
    addStock,
    updateStock,
    removeStock,
    fetchStockPrices,
    addAsset,
    updateAsset,
    removeAsset,
    addCashAccount,
    updateCashAccount,
    removeCashAccount,
  } = useFinanceStore();

  useEffect(() => {
    fetchStocks();
    fetchAssets();
    fetchCashAccounts();
  }, [fetchStocks, fetchAssets, fetchCashAccounts]);

  const resetForms = () => {
    setStockTicker('');
    setStockName('');
    setStockQuantity('');
    setStockPurchasePrice('');
    setStockCurrentPrice('');
    setStockPurchaseDate('');
    setAssetName('');
    setAssetDescription('');
    setAssetPurchasePrice('');
    setAssetCurrentValue('');
    setAssetCategory('');
    setAssetPurchaseDate('');
    setCashName('');
    setCashBalance('');
    setCashCurrency('EUR');
    setEditingItem(null);
  };

  const openAddModal = (type: TabType) => {
    resetForms();
    setModalType(type);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Stock | Asset | CashAccount, type: TabType) => {
    resetForms();
    setEditingItem(item);
    setModalType(type);

    if (type === 'stocks') {
      const stock = item as Stock;
      setStockTicker(stock.ticker);
      setStockName(stock.name);
      setStockQuantity(stock.quantity.toString());
      setStockPurchasePrice((stock.purchasePrice / 100).toString());
      setStockCurrentPrice(stock.currentPrice ? (stock.currentPrice / 100).toString() : '');
      setStockPurchaseDate(stock.purchaseDate);
    } else if (type === 'assets') {
      const asset = item as Asset;
      setAssetName(asset.name);
      setAssetDescription(asset.description || '');
      setAssetPurchasePrice((asset.purchasePrice / 100).toString());
      setAssetCurrentValue((asset.currentValue / 100).toString());
      setAssetCategory(asset.category || '');
      setAssetPurchaseDate(asset.purchaseDate || '');
    } else {
      const cash = item as CashAccount;
      setCashName(cash.name);
      setCashBalance((cash.balance / 100).toString());
      setCashCurrency(cash.currency);
    }

    setIsModalOpen(true);
  };

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    await fetchStockPrices();
    setIsRefreshing(false);
  };

  const handleSubmitStock = async () => {
    if (!stockTicker || !stockName || !stockQuantity || !stockPurchasePrice) return;

    const stockData: Stock = {
      id: (editingItem as Stock)?.id || crypto.randomUUID(),
      ticker: stockTicker.toUpperCase(),
      name: stockName,
      quantity: parseFloat(stockQuantity),
      purchasePrice: Math.round(parseFloat(stockPurchasePrice) * 100),
      purchaseDate: stockPurchaseDate || new Date().toISOString().split('T')[0],
      currentPrice: stockCurrentPrice ? Math.round(parseFloat(stockCurrentPrice) * 100) : undefined,
      lastUpdated: stockCurrentPrice ? new Date().toISOString() : undefined,
      createdAt: (editingItem as Stock)?.createdAt || new Date().toISOString(),
    };

    if (editingItem) {
      await updateStock(editingItem.id, stockData);
    } else {
      await addStock(stockData);
    }

    setIsModalOpen(false);
    resetForms();
  };

  const handleSubmitAsset = async () => {
    if (!assetName || !assetPurchasePrice || !assetCurrentValue) return;

    const assetData: Asset = {
      id: (editingItem as Asset)?.id || crypto.randomUUID(),
      name: assetName,
      description: assetDescription || undefined,
      purchasePrice: Math.round(parseFloat(assetPurchasePrice) * 100),
      currentValue: Math.round(parseFloat(assetCurrentValue) * 100),
      purchaseDate: assetPurchaseDate || undefined,
      category: assetCategory || undefined,
      createdAt: (editingItem as Asset)?.createdAt || new Date().toISOString(),
    };

    if (editingItem) {
      await updateAsset(editingItem.id, assetData);
    } else {
      await addAsset(assetData);
    }

    setIsModalOpen(false);
    resetForms();
  };

  const handleSubmitCash = async () => {
    if (!cashName || !cashBalance) return;

    const cashData: CashAccount = {
      id: (editingItem as CashAccount)?.id || crypto.randomUUID(),
      name: cashName,
      balance: Math.round(parseFloat(cashBalance) * 100),
      currency: cashCurrency,
      createdAt: (editingItem as CashAccount)?.createdAt || new Date().toISOString(),
    };

    if (editingItem) {
      await updateCashAccount(editingItem.id, cashData);
    } else {
      await addCashAccount(cashData);
    }

    setIsModalOpen(false);
    resetForms();
  };


  // Calculations
  const calculateStockValue = (stock: Stock) => {
    const price = stock.currentPrice || stock.purchasePrice;
    return price * stock.quantity;
  };

  const calculateStockGain = (stock: Stock) => {
    if (!stock.currentPrice) return null;
    const currentValue = stock.currentPrice * stock.quantity;
    const purchaseValue = stock.purchasePrice * stock.quantity;
    return currentValue - purchaseValue;
  };

  const calculateStockGainPercent = (stock: Stock) => {
    if (!stock.currentPrice) return null;
    return ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
  };

  const calculateAssetGain = (asset: Asset) => asset.currentValue - asset.purchasePrice;
  const calculateAssetGainPercent = (asset: Asset) =>
    ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100;

  // Totals
  const totalStocksValue = stocks.reduce((sum, s) => sum + calculateStockValue(s), 0);
  const totalStocksGain = stocks.reduce((sum, s) => sum + (calculateStockGain(s) || 0), 0);
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalAssetsGain = assets.reduce((sum, a) => sum + calculateAssetGain(a), 0);
  const totalCash = cashAccounts.reduce((sum, c) => sum + c.balance, 0);
  const totalNetWorth = totalStocksValue + totalAssetsValue + totalCash;

  const tabs = [
    { id: 'stocks' as TabType, label: 'Bourse', icon: TrendingUp, count: stocks.length },
    { id: 'assets' as TabType, label: 'Objets', icon: Package, count: assets.length },
    { id: 'cash' as TabType, label: 'Cash', icon: Wallet, count: cashAccounts.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Finance</h1>
          <p className="text-dark-400 mt-1">Gérez vos investissements et actifs</p>
        </div>
        <Button onClick={() => openAddModal(activeTab)}>
          <Plus className="w-5 h-5 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glow className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-accent-400" />
            <span className="text-sm text-dark-400">Patrimoine total</span>
          </div>
          <p className="text-2xl font-bold text-accent-400">
            {(totalNetWorth / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-dark-400">Bourse</span>
          </div>
          <p className="text-xl font-bold text-dark-100">
            {(totalStocksValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className={`text-sm ${totalStocksGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalStocksGain >= 0 ? '+' : ''}{(totalStocksGain / 100).toFixed(2)} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-dark-400">Objets</span>
          </div>
          <p className="text-xl font-bold text-dark-100">
            {(totalAssetsValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className={`text-sm ${totalAssetsGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalAssetsGain >= 0 ? '+' : ''}{(totalAssetsGain / 100).toFixed(2)} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-dark-400">Cash</span>
          </div>
          <p className="text-xl font-bold text-dark-100">
            {(totalCash / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-500/20 text-accent-400'
                  : 'text-dark-400 hover:bg-dark-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-xs bg-dark-700 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Stocks Tab */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-100">Actions</h2>
            <Button variant="secondary" size="sm" onClick={handleRefreshPrices} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser les prix
            </Button>
          </div>

          <div className="bg-dark-700/30 rounded-lg p-3 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-dark-300">
              <strong className="text-dark-200">API Yahoo Finance :</strong> Les prix sont récupérés automatiquement.
              Si l'API ne fonctionne pas, vous pouvez saisir les prix manuellement.
            </div>
          </div>

          {stocks.length === 0 ? (
            <Card className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">Aucune action</p>
              <button onClick={() => openAddModal('stocks')} className="text-accent-400 text-sm mt-2">
                + Ajouter une action
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {stocks.map((stock) => {
                const value = calculateStockValue(stock);
                const gain = calculateStockGain(stock);
                const gainPercent = calculateStockGainPercent(stock);
                const hasCurrentPrice = stock.currentPrice !== undefined;

                return (
                  <Card key={stock.id} padding="sm" hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">{stock.ticker}</span>
                        </div>
                        <div>
                          <p className="font-medium text-dark-100">{stock.name}</p>
                          <p className="text-sm text-dark-400">
                            {stock.quantity} × {(stock.purchasePrice / 100).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-dark-100">
                            {(value / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </p>
                          {hasCurrentPrice && gain !== null && gainPercent !== null ? (
                            <div className={`flex items-center gap-1 text-sm ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              <span>{gain >= 0 ? '+' : ''}{(gain / 100).toFixed(2)} €</span>
                              <span>({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)</span>
                            </div>
                          ) : (
                            <p className="text-xs text-dark-500">Prix actuel non défini</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(stock, 'stocks')}
                            className="text-dark-400 hover:text-accent-400 transition-colors p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeStock(stock.id)}
                            className="text-dark-400 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100">Objets de valeur</h2>

          {assets.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">Aucun objet</p>
              <button onClick={() => openAddModal('assets')} className="text-accent-400 text-sm mt-2">
                + Ajouter un objet
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => {
                const gain = calculateAssetGain(asset);
                const gainPercent = calculateAssetGainPercent(asset);

                return (
                  <Card key={asset.id} padding="sm" hover>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-dark-100">{asset.name}</p>
                          {asset.category && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                              {asset.category}
                            </span>
                          )}
                        </div>
                        {asset.description && (
                          <p className="text-sm text-dark-400 mb-2">{asset.description}</p>
                        )}
                        <p className="text-xs text-dark-500">
                          Acheté: {(asset.purchasePrice / 100).toFixed(2)} €
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-right">
                          <p className="font-semibold text-dark-100">
                            {(asset.currentValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </p>
                          <div className={`flex items-center justify-end gap-1 text-sm ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {gain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{gain >= 0 ? '+' : ''}{(gain / 100).toFixed(2)} €</span>
                            <span>({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => openEditModal(asset, 'assets')}
                            className="text-dark-400 hover:text-accent-400 transition-colors p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeAsset(asset.id)}
                            className="text-dark-400 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cash Tab */}
      {activeTab === 'cash' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100">Comptes cash</h2>

          {cashAccounts.length === 0 ? (
            <Card className="text-center py-12">
              <Wallet className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-dark-400">Aucun compte</p>
              <button onClick={() => openAddModal('cash')} className="text-accent-400 text-sm mt-2">
                + Ajouter un compte
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cashAccounts.map((account) => (
                <Card key={account.id} padding="sm" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">{account.name}</p>
                        <p className="text-xs text-dark-500">{account.currency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-emerald-400 text-lg">
                        {(account.balance / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(account, 'cash')}
                          className="text-dark-400 hover:text-accent-400 transition-colors p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeCashAccount(account.id)}
                          className="text-dark-400 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stock Modal */}
      <Modal
        isOpen={isModalOpen && modalType === 'stocks'}
        onClose={() => { setIsModalOpen(false); resetForms(); }}
        title={editingItem ? 'Modifier l\'action' : 'Nouvelle action'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ticker (symbole)"
              value={stockTicker}
              onChange={(e) => setStockTicker(e.target.value.toUpperCase())}
              placeholder="AAPL"
            />
            <Input
              label="Nom de l'entreprise"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              placeholder="Apple Inc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantité"
              type="number"
              step="0.001"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="10"
            />
            <Input
              label="Prix d'achat (€)"
              type="number"
              step="0.01"
              value={stockPurchasePrice}
              onChange={(e) => setStockPurchasePrice(e.target.value)}
              placeholder="150.00"
            />
          </div>
          <Input
            label="Date d'achat"
            type="date"
            value={stockPurchaseDate}
            onChange={(e) => setStockPurchaseDate(e.target.value)}
          />
          <div className="border-t border-dark-700 pt-4">
            <Input
              label="Prix actuel (€) - Optionnel, sinon via API"
              type="number"
              step="0.01"
              value={stockCurrentPrice}
              onChange={(e) => setStockCurrentPrice(e.target.value)}
              placeholder="Laisser vide pour utiliser l'API"
            />
            <p className="text-xs text-dark-500 mt-1">
              Si vous laissez vide, cliquez sur "Actualiser les prix" pour récupérer le prix via Yahoo Finance.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmitStock}>
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Asset Modal */}
      <Modal
        isOpen={isModalOpen && modalType === 'assets'}
        onClose={() => { setIsModalOpen(false); resetForms(); }}
        title={editingItem ? 'Modifier l\'objet' : 'Nouvel objet de valeur'}
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Rolex Submariner"
          />
          <Input
            label="Description (optionnel)"
            value={assetDescription}
            onChange={(e) => setAssetDescription(e.target.value)}
            placeholder="Détails..."
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Catégorie</label>
            <select
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
              className="input"
            >
              <option value="">Sélectionner...</option>
              <option value="Montre">Montre</option>
              <option value="Voiture">Voiture</option>
              <option value="Art">Art</option>
              <option value="Bijoux">Bijoux</option>
              <option value="Electronique">Électronique</option>
              <option value="Collection">Collection</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix d'achat (€)"
              type="number"
              step="0.01"
              value={assetPurchasePrice}
              onChange={(e) => setAssetPurchasePrice(e.target.value)}
              placeholder="5000.00"
            />
            <Input
              label="Valeur actuelle (€)"
              type="number"
              step="0.01"
              value={assetCurrentValue}
              onChange={(e) => setAssetCurrentValue(e.target.value)}
              placeholder="6500.00"
            />
          </div>
          <Input
            label="Date d'achat (optionnel)"
            type="date"
            value={assetPurchaseDate}
            onChange={(e) => setAssetPurchaseDate(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmitAsset}>
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cash Modal */}
      <Modal
        isOpen={isModalOpen && modalType === 'cash'}
        onClose={() => { setIsModalOpen(false); resetForms(); }}
        title={editingItem ? 'Modifier le compte' : 'Nouveau compte'}
      >
        <div className="space-y-4">
          <Input
            label="Nom du compte"
            value={cashName}
            onChange={(e) => setCashName(e.target.value)}
            placeholder="Compte courant BNP"
          />
          <Input
            label="Solde (€)"
            type="number"
            step="0.01"
            value={cashBalance}
            onChange={(e) => setCashBalance(e.target.value)}
            placeholder="1500.00"
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Devise</label>
            <select
              value={cashCurrency}
              onChange={(e) => setCashCurrency(e.target.value)}
              className="input"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmitCash}>
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
