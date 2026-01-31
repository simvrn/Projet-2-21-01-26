import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Search,
  Loader2,
  BadgeDollarSign,
  History,
  Bitcoin,
  Undo2,
  Settings,
} from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useFinanceStore, useExchangeRatesStore } from '@/stores';
import type { Stock, Asset, CashAccount, Crypto } from '@/types';

type TabType = 'stocks' | 'crypto' | 'assets' | 'cash' | 'sold';

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('stocks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TabType>('stocks');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<Stock | Asset | CashAccount | Crypto | null>(null);

  // Stock form
  const [stockTicker, setStockTicker] = useState('');
  const [stockName, setStockName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockPurchasePrice, setStockPurchasePrice] = useState('');
  const [stockCurrentPrice, setStockCurrentPrice] = useState('');
  const [stockPurchaseDate, setStockPurchaseDate] = useState('');

  // Stock search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string; exchange: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Crypto form
  const [cryptoSymbol, setCryptoSymbol] = useState('');
  const [cryptoName, setCryptoName] = useState('');
  const [cryptoQuantity, setCryptoQuantity] = useState('');
  const [cryptoPurchasePrice, setCryptoPurchasePrice] = useState('');
  const [cryptoCurrentPrice, setCryptoCurrentPrice] = useState('');
  const [cryptoPurchaseDate, setCryptoPurchaseDate] = useState('');

  // Sell modal
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellingItem, setSellingItem] = useState<Stock | Asset | Crypto | null>(null);
  const [sellingType, setSellingType] = useState<'stock' | 'asset' | 'crypto'>('stock');
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState('');

  // Sold tab filter
  const [soldFilter, setSoldFilter] = useState<'all' | 'stocks' | 'crypto' | 'assets'>('all');

  // Exchange rates modal
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({});

  const {
    stocks,
    assets,
    cryptos,
    cashAccounts,
    fetchStocks,
    fetchAssets,
    fetchCryptos,
    fetchCashAccounts,
    addStock,
    updateStock,
    removeStock,
    fetchStockPrices,
    addAsset,
    updateAsset,
    removeAsset,
    addCrypto,
    updateCrypto,
    removeCrypto,
    addCashAccount,
    updateCashAccount,
    removeCashAccount,
  } = useFinanceStore();

  const {
    lastUpdated: ratesLastUpdated,
    fetchRates,
    saveRate,
    convertToEUR,
    getRate,
  } = useExchangeRatesStore();

  useEffect(() => {
    fetchStocks();
    fetchAssets();
    fetchCryptos();
    fetchCashAccounts();
    fetchRates(); // Fetch exchange rates on mount
  }, [fetchStocks, fetchAssets, fetchCryptos, fetchCashAccounts, fetchRates]);

  // Détecter toutes les devises utilisées dans le portefeuille
  const usedCurrencies = useMemo(() => {
    const currencies = new Set<string>();

    // Devises des stocks
    stocks.forEach(s => {
      if (s.purchaseCurrency && s.purchaseCurrency !== 'EUR') currencies.add(s.purchaseCurrency);
      if (s.currentPriceCurrency && s.currentPriceCurrency !== 'EUR') currencies.add(s.currentPriceCurrency);
    });

    // Devises des cryptos
    cryptos.forEach(c => {
      if (c.purchaseCurrency && c.purchaseCurrency !== 'EUR') currencies.add(c.purchaseCurrency);
      if (c.currentPriceCurrency && c.currentPriceCurrency !== 'EUR') currencies.add(c.currentPriceCurrency);
    });

    // Devises des comptes cash
    cashAccounts.forEach(ca => {
      if (ca.currency && ca.currency !== 'EUR') currencies.add(ca.currency);
    });

    // Ajouter les devises courantes si pas déjà présentes
    ['USD', 'GBP', 'CHF', 'JPY'].forEach(c => currencies.add(c));

    return Array.from(currencies).sort();
  }, [stocks, cryptos, cashAccounts]);

  // Ouvrir la modale des taux avec les valeurs actuelles
  const openRatesModal = () => {
    const inputs: Record<string, string> = {};
    usedCurrencies.forEach(currency => {
      const rate = getRate(currency);
      inputs[currency] = rate ? rate.toString() : '';
    });
    setRateInputs(inputs);
    setIsRatesModalOpen(true);
  };

  // Sauvegarder tous les taux
  const handleSaveRates = async () => {
    for (const [currency, value] of Object.entries(rateInputs)) {
      if (value && !isNaN(parseFloat(value))) {
        await saveRate(currency, parseFloat(value));
      }
    }
    setIsRatesModalOpen(false);
  };

  const resetForms = () => {
    setStockTicker('');
    setStockName('');
    setStockQuantity('');
    setStockPurchasePrice('');
    setStockCurrentPrice('');
    setStockPurchaseDate('');
    setSearchQuery('');
    setSearchResults([]);
    setCryptoSymbol('');
    setCryptoName('');
    setCryptoQuantity('');
    setCryptoPurchasePrice('');
    setCryptoCurrentPrice('');
    setCryptoPurchaseDate('');
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

  // Recherche d'actions
  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiUrl = import.meta.env.DEV
        ? `http://localhost:3001/api/stock-search?query=${encodeURIComponent(query)}`
        : `/api/stock-search?query=${encodeURIComponent(query)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchStocks(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchStocks]);

  const selectStock = (symbol: string, name: string) => {
    setStockTicker(symbol);
    setStockName(name);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Sell functions
  const openSellModal = (item: Stock | Asset | Crypto, type: 'stock' | 'asset' | 'crypto') => {
    setSellingItem(item);
    setSellingType(type);
    setSellPrice('');
    setSellDate(new Date().toISOString().split('T')[0]);
    setIsSellModalOpen(true);
  };

  const handleSell = async () => {
    console.log('handleSell called', { sellingItem, sellPrice, sellingType });
    if (!sellingItem || !sellPrice) {
      console.log('handleSell: missing sellingItem or sellPrice');
      return;
    }

    const salePriceInCents = Math.round(parseFloat(sellPrice) * 100);
    console.log('Selling:', { id: sellingItem.id, salePriceInCents, sellDate, sellingType });

    if (sellingType === 'stock') {
      await updateStock(sellingItem.id, {
        sold: true,
        salePrice: salePriceInCents,
        saleDate: sellDate,
      });
    } else if (sellingType === 'crypto') {
      await updateCrypto(sellingItem.id, {
        sold: true,
        salePrice: salePriceInCents,
        saleDate: sellDate,
      });
    } else {
      await updateAsset(sellingItem.id, {
        sold: true,
        salePrice: salePriceInCents,
        saleDate: sellDate,
      });
    }

    console.log('Sale completed, closing modal');
    setIsSellModalOpen(false);
    setSellingItem(null);
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
    await fetchRates(); // Also refresh exchange rates
    setIsRefreshing(false);
  };

  // Cancel sale - restore item to active portfolio
  const handleCancelSale = async (item: Stock | Crypto | Asset, type: 'stock' | 'crypto' | 'asset') => {
    if (type === 'stock') {
      await updateStock(item.id, { sold: false });
    } else if (type === 'crypto') {
      await updateCrypto(item.id, { sold: false });
    } else {
      await updateAsset(item.id, { sold: false });
    }
  };

  const handleSubmitStock = async () => {
    console.log('handleSubmitStock called', { stockTicker, stockName, stockQuantity, stockPurchasePrice });
    if (!stockTicker || !stockName || !stockQuantity || !stockPurchasePrice) {
      console.log('handleSubmitStock: missing required fields');
      return;
    }

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

    console.log('Submitting stock data:', stockData);

    if (editingItem) {
      await updateStock(editingItem.id, stockData);
    } else {
      await addStock(stockData);
    }

    console.log('Stock submitted successfully');
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
      id: (editingItem as CashAccount)?.id || window.crypto.randomUUID(),
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

  const handleSubmitCrypto = async () => {
    console.log('handleSubmitCrypto called', { cryptoSymbol, cryptoName, cryptoQuantity, cryptoPurchasePrice });
    if (!cryptoSymbol || !cryptoName || !cryptoQuantity || !cryptoPurchasePrice) {
      console.log('handleSubmitCrypto: missing required fields');
      return;
    }

    const cryptoData: Crypto = {
      id: (editingItem as Crypto)?.id || window.crypto.randomUUID(),
      symbol: cryptoSymbol.toUpperCase(),
      name: cryptoName,
      quantity: parseFloat(cryptoQuantity),
      purchasePrice: Math.round(parseFloat(cryptoPurchasePrice) * 100),
      purchaseDate: cryptoPurchaseDate || new Date().toISOString().split('T')[0],
      currentPrice: cryptoCurrentPrice ? Math.round(parseFloat(cryptoCurrentPrice) * 100) : undefined,
      lastUpdated: cryptoCurrentPrice ? new Date().toISOString() : undefined,
      createdAt: (editingItem as Crypto)?.createdAt || new Date().toISOString(),
    };

    console.log('Submitting crypto data:', cryptoData);

    if (editingItem) {
      await updateCrypto(editingItem.id, cryptoData);
    } else {
      await addCrypto(cryptoData);
    }

    console.log('Crypto submitted successfully');
    setIsModalOpen(false);
    resetForms();
  };


  // Calculations - all converted to EUR
  const calculateStockValueEUR = (stock: Stock) => {
    const price = stock.currentPrice || stock.purchasePrice;
    const currency = stock.currentPrice ? (stock.currentPriceCurrency || 'EUR') : (stock.purchaseCurrency || 'EUR');
    const priceInEUR = convertToEUR(price, currency);
    return priceInEUR * stock.quantity;
  };

  const calculateStockPurchaseValueEUR = (stock: Stock) => {
    const priceInEUR = convertToEUR(stock.purchasePrice, stock.purchaseCurrency || 'EUR');
    return priceInEUR * stock.quantity;
  };

  const calculateStockGainEUR = (stock: Stock) => {
    if (!stock.currentPrice) return null;
    const currentValueEUR = calculateStockValueEUR(stock);
    const purchaseValueEUR = calculateStockPurchaseValueEUR(stock);
    return currentValueEUR - purchaseValueEUR;
  };

  const calculateStockGainPercent = (stock: Stock) => {
    if (!stock.currentPrice) return null;
    const currentValueEUR = calculateStockValueEUR(stock);
    const purchaseValueEUR = calculateStockPurchaseValueEUR(stock);
    if (purchaseValueEUR === 0) return 0;
    return ((currentValueEUR - purchaseValueEUR) / purchaseValueEUR) * 100;
  };

  // For backward compatibility, keep original functions
  const calculateStockValue = calculateStockValueEUR;
  const calculateStockGain = calculateStockGainEUR;

  const calculateAssetGain = (asset: Asset) => asset.currentValue - asset.purchasePrice;
  const calculateAssetGainPercent = (asset: Asset) =>
    ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100;

  // Crypto calculations - all converted to EUR
  const calculateCryptoValueEUR = (crypto: Crypto) => {
    const price = crypto.currentPrice || crypto.purchasePrice;
    const currency = crypto.currentPrice ? (crypto.currentPriceCurrency || 'EUR') : (crypto.purchaseCurrency || 'EUR');
    const priceInEUR = convertToEUR(price, currency);
    return priceInEUR * crypto.quantity;
  };

  const calculateCryptoPurchaseValueEUR = (crypto: Crypto) => {
    const priceInEUR = convertToEUR(crypto.purchasePrice, crypto.purchaseCurrency || 'EUR');
    return priceInEUR * crypto.quantity;
  };

  const calculateCryptoGainEUR = (crypto: Crypto) => {
    if (!crypto.currentPrice) return null;
    const currentValueEUR = calculateCryptoValueEUR(crypto);
    const purchaseValueEUR = calculateCryptoPurchaseValueEUR(crypto);
    return currentValueEUR - purchaseValueEUR;
  };

  const calculateCryptoGainPercent = (crypto: Crypto) => {
    if (!crypto.currentPrice) return null;
    const currentValueEUR = calculateCryptoValueEUR(crypto);
    const purchaseValueEUR = calculateCryptoPurchaseValueEUR(crypto);
    if (purchaseValueEUR === 0) return 0;
    return ((currentValueEUR - purchaseValueEUR) / purchaseValueEUR) * 100;
  };

  // For backward compatibility
  const calculateCryptoValue = calculateCryptoValueEUR;
  const calculateCryptoGain = calculateCryptoGainEUR;

  // Separate active and sold items
  const activeStocks = stocks.filter(s => !s.sold);
  const soldStocks = stocks.filter(s => s.sold);
  const activeCryptos = cryptos.filter(c => !c.sold);
  const soldCryptos = cryptos.filter(c => c.sold);
  const activeAssets = assets.filter(a => !a.sold);
  const soldAssets = assets.filter(a => a.sold);

  // Totals - Only count active (unsold) items
  const totalStocksValue = activeStocks.reduce((sum, s) => sum + calculateStockValue(s), 0);
  const totalStocksGain = activeStocks.reduce((sum, s) => sum + (calculateStockGain(s) || 0), 0);
  const totalCryptosValue = activeCryptos.reduce((sum, c) => sum + calculateCryptoValue(c), 0);
  const totalCryptosGain = activeCryptos.reduce((sum, c) => sum + (calculateCryptoGain(c) || 0), 0);
  const totalAssetsValue = activeAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalAssetsGain = activeAssets.reduce((sum, a) => sum + calculateAssetGain(a), 0);
  const totalCash = cashAccounts.reduce((sum, c) => sum + c.balance, 0);
  const totalNetWorth = totalStocksValue + totalCryptosValue + totalAssetsValue + totalCash;

  // Calculate sold items profit - all in EUR
  const soldStocksProfit = soldStocks.reduce((sum, s) => {
    if (s.salePrice) {
      const salePriceEUR = convertToEUR(s.salePrice, s.saleCurrency || 'EUR');
      const purchasePriceEUR = convertToEUR(s.purchasePrice, s.purchaseCurrency || 'EUR');
      return sum + (salePriceEUR - purchasePriceEUR) * s.quantity;
    }
    return sum;
  }, 0);

  const soldCryptosProfit = soldCryptos.reduce((sum, c) => {
    if (c.salePrice) {
      const salePriceEUR = convertToEUR(c.salePrice, c.saleCurrency || 'EUR');
      const purchasePriceEUR = convertToEUR(c.purchasePrice, c.purchaseCurrency || 'EUR');
      return sum + (salePriceEUR - purchasePriceEUR) * c.quantity;
    }
    return sum;
  }, 0);

  const soldAssetsProfit = soldAssets.reduce((sum, a) => {
    if (a.salePrice) {
      // Assets are assumed to be in EUR
      return sum + (a.salePrice - a.purchasePrice);
    }
    return sum;
  }, 0);

  const totalSoldProfit = soldStocksProfit + soldCryptosProfit + soldAssetsProfit;
  const totalSoldCount = soldStocks.length + soldCryptos.length + soldAssets.length;

  const tabs = [
    { id: 'stocks' as const, label: 'Actions', icon: TrendingUp, count: activeStocks.length },
    { id: 'crypto' as const, label: 'Crypto', icon: Bitcoin, count: activeCryptos.length },
    { id: 'assets' as const, label: 'Objets', icon: Package, count: activeAssets.length },
    { id: 'cash' as const, label: 'Cash', icon: Wallet, count: cashAccounts.length },
    { id: 'sold' as const, label: 'Vendus', icon: History, count: totalSoldCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ivory-100">Finance</h1>
          <p className="text-ivory-500 mt-1">Gérez vos investissements et actifs</p>
        </div>
        {activeTab !== 'sold' && (
          <Button onClick={() => openAddModal(activeTab)}>
            <Plus className="w-5 h-5 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card glow className="text-center col-span-2 md:col-span-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gold-400" />
            <span className="text-sm text-ivory-500">Patrimoine total</span>
          </div>
          <p className="text-2xl font-serif text-gold-400">
            {(totalNetWorth / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-gold-400/70" />
            <span className="text-sm text-ivory-500">Bourse</span>
          </div>
          <p className="text-xl font-serif text-ivory-100">
            {(totalStocksValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className={`text-sm ${totalStocksGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalStocksGain >= 0 ? '+' : ''}{(totalStocksGain / 100).toFixed(2)} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-ivory-500">Crypto</span>
          </div>
          <p className="text-xl font-serif text-ivory-100">
            {(totalCryptosValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className={`text-sm ${totalCryptosGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalCryptosGain >= 0 ? '+' : ''}{(totalCryptosGain / 100).toFixed(2)} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-5 h-5 text-ivory-400" />
            <span className="text-sm text-ivory-500">Objets</span>
          </div>
          <p className="text-xl font-serif text-ivory-100">
            {(totalAssetsValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className={`text-sm ${totalAssetsGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalAssetsGain >= 0 ? '+' : ''}{(totalAssetsGain / 100).toFixed(2)} €
          </p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-ivory-500">Cash</span>
          </div>
          <p className="text-xl font-serif text-ivory-100">
            {(totalCash / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-noir-700 pb-2">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-ivory-500 hover:bg-noir-800/50 hover:text-ivory-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-xs bg-noir-800 px-2 py-0.5 rounded-full">{tab.count}</span>
              </button>
            );
          })}
        </div>
        <Button variant="secondary" size="sm" onClick={openRatesModal}>
          <Settings className="w-4 h-4 mr-2" />
          💱 Taux de change
        </Button>
      </div>

      {/* Stocks Tab */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ivory-200">Actions</h2>
            <Button variant="secondary" size="sm" onClick={handleRefreshPrices} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser les prix
            </Button>
          </div>

          <div className="bg-noir-800/50 border border-gold-400/20 rounded-lg p-3 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <div className="text-ivory-400">
              <strong className="text-ivory-300">Prix en temps réel :</strong> Cliquez sur "Actualiser les prix" pour récupérer les cours via Yahoo Finance.
              {ratesLastUpdated && (
                <span className="text-ivory-500 ml-1">
                  Taux manuels du {new Date(ratesLastUpdated).toLocaleDateString('fr-FR')}.
                </span>
              )}
              <span className="text-gold-400 ml-1">💱 Gérez vos taux de change en haut à droite.</span>
            </div>
          </div>

          {activeStocks.length === 0 ? (
            <Card className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-ivory-600 mx-auto mb-4" />
              <p className="text-ivory-500">Aucune action</p>
              <button onClick={() => openAddModal('stocks')} className="text-gold-400 text-sm mt-2">
                + Ajouter une action
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeStocks.map((stock) => {
                const value = calculateStockValue(stock);
                const gain = calculateStockGain(stock);
                const gainPercent = calculateStockGainPercent(stock);
                const hasCurrentPrice = stock.currentPrice !== undefined;
                const lastUpdated = stock.lastUpdated ? new Date(stock.lastUpdated) : null;
                const currentCurrency = stock.currentPriceCurrency || 'EUR';
                const purchaseCurrency = stock.purchaseCurrency || 'EUR';
                const hasCurrencyConversion = currentCurrency !== 'EUR' || purchaseCurrency !== 'EUR';

                return (
                  <Card key={stock.id} padding="sm" hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center">
                          <span className="text-gold-400 font-bold text-sm">{stock.ticker}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-ivory-100">{stock.name}</p>
                            {hasCurrencyConversion && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                {currentCurrency}→EUR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-ivory-500">
                              {stock.quantity} × {(stock.purchasePrice / 100).toFixed(2)} {purchaseCurrency}
                            </span>
                            {hasCurrentPrice && (
                              <>
                                <span className="text-ivory-600">→</span>
                                <span className="text-gold-400 font-medium">
                                  {(stock.currentPrice! / 100).toFixed(2)} {currentCurrency}
                                </span>
                              </>
                            )}
                          </div>
                          {lastUpdated && (
                            <p className="text-xs text-ivory-600 mt-1">
                              Mis à jour : {lastUpdated.toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-ivory-100 text-lg">
                            {(value / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </p>
                          {hasCurrentPrice && gain !== null && gainPercent !== null ? (
                            <div className={`flex items-center justify-end gap-2 text-sm ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span className="font-medium">{gain >= 0 ? '+' : ''}{(gain / 100).toFixed(2)} €</span>
                              <span className="text-xs opacity-80">({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)</span>
                            </div>
                          ) : (
                            <p className="text-xs text-ivory-600">Cliquez sur "Actualiser" pour le prix</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openSellModal(stock, 'stock')}
                            className="text-ivory-500 hover:text-emerald-400 transition-colors p-1"
                            title="Vendre"
                          >
                            <BadgeDollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(stock, 'stocks')}
                            className="text-ivory-500 hover:text-gold-400 transition-colors p-1"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeStock(stock.id)}
                            className="text-ivory-500 hover:text-red-400 transition-colors p-1"
                            title="Supprimer"
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
        <div className="space-y-6">
          <h2 className="font-semibold text-ivory-200">Objets de valeur</h2>

          {activeAssets.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="w-12 h-12 text-ivory-600 mx-auto mb-4" />
              <p className="text-ivory-500">Aucun objet</p>
              <button onClick={() => openAddModal('assets')} className="text-gold-400 text-sm mt-2">
                + Ajouter un objet
              </button>
            </Card>
          ) : (
            <>
              {/* Group assets by category */}
              {(() => {
                const categories = [...new Set(activeAssets.map(a => a.category || 'Sans catégorie'))].sort();
                return categories.map(category => {
                  const categoryAssets = activeAssets.filter(a => (a.category || 'Sans catégorie') === category);
                  const categoryTotal = categoryAssets.reduce((sum, a) => sum + a.currentValue, 0);
                  const categoryGain = categoryAssets.reduce((sum, a) => sum + calculateAssetGain(a), 0);

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-noir-700 pb-2">
                        <h3 className="font-medium text-gold-400 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {category}
                          <span className="text-xs bg-noir-800 text-ivory-400 px-2 py-0.5 rounded-full">
                            {categoryAssets.length}
                          </span>
                        </h3>
                        <div className="text-right text-sm">
                          <span className="text-ivory-300">{(categoryTotal / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                          <span className={`ml-2 ${categoryGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ({categoryGain >= 0 ? '+' : ''}{(categoryGain / 100).toFixed(2)} €)
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryAssets.map((asset) => {
                          const gain = calculateAssetGain(asset);
                          const gainPercent = calculateAssetGainPercent(asset);

                          return (
                            <Card key={asset.id} padding="sm" hover>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-ivory-100">{asset.name}</p>
                                  {asset.description && (
                                    <p className="text-sm text-ivory-500 mb-2">{asset.description}</p>
                                  )}
                                  <p className="text-xs text-ivory-600">
                                    Acheté: {(asset.purchasePrice / 100).toFixed(2)} €
                                  </p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="text-right">
                                    <p className="font-semibold text-ivory-100">
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
                                      onClick={() => openSellModal(asset, 'asset')}
                                      className="text-ivory-500 hover:text-emerald-400 transition-colors p-1"
                                      title="Vendre"
                                    >
                                      <BadgeDollarSign className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openEditModal(asset, 'assets')}
                                      className="text-ivory-500 hover:text-gold-400 transition-colors p-1"
                                      title="Modifier"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => removeAsset(asset.id)}
                                      className="text-ivory-500 hover:text-red-400 transition-colors p-1"
                                      title="Supprimer"
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
                    </div>
                  );
                });
              })()}
            </>
          )}
        </div>
      )}

      {/* Cash Tab */}
      {activeTab === 'cash' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-ivory-200">Comptes cash</h2>

          {cashAccounts.length === 0 ? (
            <Card className="text-center py-12">
              <Wallet className="w-12 h-12 text-ivory-600 mx-auto mb-4" />
              <p className="text-ivory-500">Aucun compte</p>
              <button onClick={() => openAddModal('cash')} className="text-gold-400 text-sm mt-2">
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
                        <p className="font-medium text-ivory-100">{account.name}</p>
                        <p className="text-xs text-ivory-600">{account.currency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-emerald-400 text-lg">
                        {(account.balance / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(account, 'cash')}
                          className="text-ivory-500 hover:text-gold-400 transition-colors p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeCashAccount(account.id)}
                          className="text-ivory-500 hover:text-red-400 transition-colors p-1"
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

      {/* Crypto Tab */}
      {activeTab === 'crypto' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-ivory-200">Cryptomonnaies</h2>

          {activeCryptos.length === 0 ? (
            <Card className="text-center py-12">
              <Bitcoin className="w-12 h-12 text-ivory-600 mx-auto mb-4" />
              <p className="text-ivory-500">Aucune crypto</p>
              <button onClick={() => openAddModal('crypto')} className="text-gold-400 text-sm mt-2">
                + Ajouter une crypto
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeCryptos.map((crypto) => {
                const value = calculateCryptoValue(crypto);
                const gain = calculateCryptoGain(crypto);
                const gainPercent = calculateCryptoGainPercent(crypto);
                const hasCurrentPrice = crypto.currentPrice !== undefined;

                return (
                  <Card key={crypto.id} padding="sm" hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                          <Bitcoin className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-ivory-100">{crypto.name}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gold-400 font-bold">{crypto.symbol}</span>
                            <span className="text-ivory-500">
                              {crypto.quantity} × {(crypto.purchasePrice / 100).toFixed(2)} €
                            </span>
                            {hasCurrentPrice && (
                              <>
                                <span className="text-ivory-600">→</span>
                                <span className="text-gold-400 font-medium">
                                  {(crypto.currentPrice! / 100).toFixed(2)} €
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-ivory-100 text-lg">
                            {(value / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </p>
                          {hasCurrentPrice && gain !== null && gainPercent !== null ? (
                            <div className={`flex items-center justify-end gap-2 text-sm ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span className="font-medium">{gain >= 0 ? '+' : ''}{(gain / 100).toFixed(2)} €</span>
                              <span className="text-xs opacity-80">({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)</span>
                            </div>
                          ) : (
                            <p className="text-xs text-ivory-600">Prix actuel non défini</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openSellModal(crypto, 'crypto')}
                            className="text-ivory-500 hover:text-emerald-400 transition-colors p-1"
                            title="Vendre"
                          >
                            <BadgeDollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              resetForms();
                              setEditingItem(crypto as unknown as Stock);
                              setCryptoSymbol(crypto.symbol);
                              setCryptoName(crypto.name);
                              setCryptoQuantity(crypto.quantity.toString());
                              setCryptoPurchasePrice((crypto.purchasePrice / 100).toString());
                              setCryptoCurrentPrice(crypto.currentPrice ? (crypto.currentPrice / 100).toString() : '');
                              setCryptoPurchaseDate(crypto.purchaseDate);
                              setModalType('crypto');
                              setIsModalOpen(true);
                            }}
                            className="text-ivory-500 hover:text-gold-400 transition-colors p-1"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeCrypto(crypto.id)}
                            className="text-ivory-500 hover:text-red-400 transition-colors p-1"
                            title="Supprimer"
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

          {/* Summary */}
          {activeCryptos.length > 0 && (
            <Card className="mt-6 bg-orange-500/5 border-orange-500/20">
              <div className="flex justify-between items-center">
                <span className="text-ivory-300">Total Crypto</span>
                <div className="text-right">
                  <p className="text-lg font-semibold text-ivory-100">
                    {(totalCryptosValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                  <p className={`text-sm ${totalCryptosGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {totalCryptosGain >= 0 ? '+' : ''}{(totalCryptosGain / 100).toFixed(2)} €
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Sold Tab */}
      {activeTab === 'sold' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ivory-200">Historique des ventes</h2>
            <div className="flex gap-2">
              {(['all', 'stocks', 'crypto', 'assets'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSoldFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    soldFilter === filter
                      ? 'bg-gold-400/10 text-gold-400'
                      : 'text-ivory-500 hover:bg-noir-800/50'
                  }`}
                >
                  {filter === 'all' ? 'Tout' : filter === 'stocks' ? 'Actions' : filter === 'crypto' ? 'Crypto' : 'Objets'}
                </button>
              ))}
            </div>
          </div>

          {totalSoldCount === 0 ? (
            <Card className="text-center py-12">
              <History className="w-12 h-12 text-ivory-600 mx-auto mb-4" />
              <p className="text-ivory-500">Aucune vente enregistrée</p>
            </Card>
          ) : (
            <>
              {/* Sold Stocks */}
              {(soldFilter === 'all' || soldFilter === 'stocks') && soldStocks.length > 0 && (
                <div>
                  <h3 className="font-medium text-ivory-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold-400" />
                    Actions vendues ({soldStocks.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-noir-700">
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Ticker</th>
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Nom</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Qté</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Prix achat</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Prix vente</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Plus-value (EUR)</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">%</th>
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Date</th>
                          <th className="text-center py-3 px-4 text-ivory-500 text-xs uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldStocks.map((stock) => {
                          const purchasePriceEUR = convertToEUR(stock.purchasePrice, stock.purchaseCurrency || 'EUR');
                          const salePriceEUR = convertToEUR(stock.salePrice || 0, stock.saleCurrency || 'EUR');
                          const totalBuyEUR = purchasePriceEUR * stock.quantity;
                          const totalSellEUR = salePriceEUR * stock.quantity;
                          const profitEUR = totalSellEUR - totalBuyEUR;
                          const profitPercent = totalBuyEUR > 0 ? ((totalSellEUR - totalBuyEUR) / totalBuyEUR * 100) : 0;

                          return (
                            <tr key={stock.id} className="border-b border-noir-800/50 hover:bg-noir-800/30">
                              <td className="py-3 px-4 font-medium text-gold-400">{stock.ticker}</td>
                              <td className="py-3 px-4 text-ivory-300">{stock.name}</td>
                              <td className="py-3 px-4 text-right text-ivory-400">{stock.quantity}</td>
                              <td className="py-3 px-4 text-right text-ivory-400">
                                {(stock.purchasePrice / 100).toFixed(2)} {stock.purchaseCurrency || '€'}
                              </td>
                              <td className="py-3 px-4 text-right text-ivory-200">
                                {((stock.salePrice || 0) / 100).toFixed(2)} {stock.saleCurrency || '€'}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${profitEUR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {profitEUR >= 0 ? '+' : ''}{(profitEUR / 100).toFixed(2)} €
                              </td>
                              <td className={`py-3 px-4 text-right ${profitEUR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                              </td>
                              <td className="py-3 px-4 text-ivory-500">{stock.saleDate || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleCancelSale(stock, 'stock')}
                                  className="text-ivory-500 hover:text-orange-400 transition-colors p-1"
                                  title="Annuler la vente"
                                >
                                  <Undo2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Card className="mt-3 bg-gold-400/5 border-gold-400/20">
                    <div className="flex justify-between items-center">
                      <span className="text-ivory-400">Total plus-values Actions</span>
                      <span className={`font-semibold ${soldStocksProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {soldStocksProfit >= 0 ? '+' : ''}{(soldStocksProfit / 100).toFixed(2)} €
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* Sold Cryptos */}
              {(soldFilter === 'all' || soldFilter === 'crypto') && soldCryptos.length > 0 && (
                <div>
                  <h3 className="font-medium text-ivory-300 mb-3 flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-orange-400" />
                    Crypto vendues ({soldCryptos.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-noir-700">
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Symbol</th>
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Nom</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Qté</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Prix achat</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Prix vente</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Plus-value (EUR)</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">%</th>
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Date</th>
                          <th className="text-center py-3 px-4 text-ivory-500 text-xs uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldCryptos.map((crypto) => {
                          const purchasePriceEUR = convertToEUR(crypto.purchasePrice, crypto.purchaseCurrency || 'EUR');
                          const salePriceEUR = convertToEUR(crypto.salePrice || 0, crypto.saleCurrency || 'EUR');
                          const totalBuyEUR = purchasePriceEUR * crypto.quantity;
                          const totalSellEUR = salePriceEUR * crypto.quantity;
                          const profitEUR = totalSellEUR - totalBuyEUR;
                          const profitPercent = totalBuyEUR > 0 ? ((totalSellEUR - totalBuyEUR) / totalBuyEUR * 100) : 0;

                          return (
                            <tr key={crypto.id} className="border-b border-noir-800/50 hover:bg-noir-800/30">
                              <td className="py-3 px-4 font-medium text-orange-400">{crypto.symbol}</td>
                              <td className="py-3 px-4 text-ivory-300">{crypto.name}</td>
                              <td className="py-3 px-4 text-right text-ivory-400">{crypto.quantity}</td>
                              <td className="py-3 px-4 text-right text-ivory-400">
                                {(crypto.purchasePrice / 100).toFixed(2)} {crypto.purchaseCurrency || '€'}
                              </td>
                              <td className="py-3 px-4 text-right text-ivory-200">
                                {((crypto.salePrice || 0) / 100).toFixed(2)} {crypto.saleCurrency || '€'}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${profitEUR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {profitEUR >= 0 ? '+' : ''}{(profitEUR / 100).toFixed(2)} €
                              </td>
                              <td className={`py-3 px-4 text-right ${profitEUR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                              </td>
                              <td className="py-3 px-4 text-ivory-500">{crypto.saleDate || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleCancelSale(crypto, 'crypto')}
                                  className="text-ivory-500 hover:text-orange-400 transition-colors p-1"
                                  title="Annuler la vente"
                                >
                                  <Undo2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Card className="mt-3 bg-orange-500/5 border-orange-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-ivory-400">Total plus-values Crypto</span>
                      <span className={`font-semibold ${soldCryptosProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {soldCryptosProfit >= 0 ? '+' : ''}{(soldCryptosProfit / 100).toFixed(2)} €
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* Sold Assets */}
              {(soldFilter === 'all' || soldFilter === 'assets') && soldAssets.length > 0 && (
                <div>
                  <h3 className="font-medium text-ivory-300 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-ivory-400" />
                    Objets vendus ({soldAssets.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-noir-700">
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Nom</th>
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Catégorie</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Prix achat</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Prix vente</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">Plus-value</th>
                          <th className="text-right py-3 px-4 text-ivory-500 text-xs uppercase">%</th>
                          <th className="text-left py-3 px-4 text-ivory-500 text-xs uppercase">Date</th>
                          <th className="text-center py-3 px-4 text-ivory-500 text-xs uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldAssets.map((asset) => {
                          const profit = (asset.salePrice || 0) - asset.purchasePrice;
                          const profitPercent = asset.purchasePrice > 0 ? ((asset.salePrice || 0) - asset.purchasePrice) / asset.purchasePrice * 100 : 0;

                          return (
                            <tr key={asset.id} className="border-b border-noir-800/50 hover:bg-noir-800/30">
                              <td className="py-3 px-4 font-medium text-ivory-200">{asset.name}</td>
                              <td className="py-3 px-4 text-ivory-400">{asset.category || '-'}</td>
                              <td className="py-3 px-4 text-right text-ivory-400">{(asset.purchasePrice / 100).toFixed(2)} €</td>
                              <td className="py-3 px-4 text-right text-ivory-200">{((asset.salePrice || 0) / 100).toFixed(2)} €</td>
                              <td className={`py-3 px-4 text-right font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {profit >= 0 ? '+' : ''}{(profit / 100).toFixed(2)} €
                              </td>
                              <td className={`py-3 px-4 text-right ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                              </td>
                              <td className="py-3 px-4 text-ivory-500">{asset.saleDate || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleCancelSale(asset, 'asset')}
                                  className="text-ivory-500 hover:text-orange-400 transition-colors p-1"
                                  title="Annuler la vente"
                                >
                                  <Undo2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Card className="mt-3 bg-ivory-500/5 border-ivory-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-ivory-400">Total plus-values Objets</span>
                      <span className={`font-semibold ${soldAssetsProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {soldAssetsProfit >= 0 ? '+' : ''}{(soldAssetsProfit / 100).toFixed(2)} €
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* Grand Total */}
              <Card glow className="mt-6">
                <h3 className="text-lg font-semibold text-ivory-100 mb-4">Résumé Total des Plus-Values</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-noir-700">
                    <span className="text-ivory-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gold-400" />
                      Actions
                    </span>
                    <span className={`font-medium ${soldStocksProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {soldStocksProfit >= 0 ? '+' : ''}{(soldStocksProfit / 100).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-noir-700">
                    <span className="text-ivory-400 flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-orange-400" />
                      Crypto
                    </span>
                    <span className={`font-medium ${soldCryptosProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {soldCryptosProfit >= 0 ? '+' : ''}{(soldCryptosProfit / 100).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-noir-700">
                    <span className="text-ivory-400 flex items-center gap-2">
                      <Package className="w-4 h-4 text-ivory-400" />
                      Objets
                    </span>
                    <span className={`font-medium ${soldAssetsProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {soldAssetsProfit >= 0 ? '+' : ''}{(soldAssetsProfit / 100).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gold-400/30">
                    <span className="text-ivory-200 font-semibold text-lg">TOTAL</span>
                    <span className={`text-2xl font-bold ${totalSoldProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalSoldProfit >= 0 ? '+' : ''}{(totalSoldProfit / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              </Card>
            </>
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
          {/* Search section */}
          {!editingItem && (
            <div className="relative">
              <label className="label">Rechercher une entreprise</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Apple, Microsoft, Tesla..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-noir-300 rounded-lg text-noir-900 placeholder-noir-400 focus:outline-none focus:ring-1 focus:ring-gold-400/30 focus:border-gold-400/40"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 animate-spin" />
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-noir-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => selectStock(result.symbol, result.name)}
                      className="w-full px-4 py-2 text-left hover:bg-gold-50 flex justify-between items-center border-b border-noir-100 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-noir-900">{result.symbol}</span>
                        <span className="text-noir-500 ml-2 text-sm">{result.name}</span>
                      </div>
                      <span className="text-xs text-noir-400">{result.exchange}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
          <div className="border-t border-noir-700 pt-4">
            <Input
              label="Prix actuel (€) - Optionnel, sinon via API"
              type="number"
              step="0.01"
              value={stockCurrentPrice}
              onChange={(e) => setStockCurrentPrice(e.target.value)}
              placeholder="Laisser vide pour utiliser l'API"
            />
            <p className="text-xs text-ivory-600 mt-1">
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
            <label className="label">Catégorie</label>
            <input
              type="text"
              list="asset-categories"
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
              placeholder="Ex: Montre, Voiture, Art..."
              className="w-full px-4 py-2.5 bg-white border border-noir-300 rounded-lg text-noir-900 placeholder-noir-400 focus:outline-none focus:ring-1 focus:ring-gold-400/30 focus:border-gold-400/40"
            />
            <datalist id="asset-categories">
              {/* Suggestions from existing categories */}
              {[...new Set(assets.map(a => a.category).filter(Boolean))].map(cat => (
                <option key={cat} value={cat} />
              ))}
              {/* Default suggestions */}
              <option value="Montre" />
              <option value="Voiture" />
              <option value="Art" />
              <option value="Bijoux" />
              <option value="Electronique" />
              <option value="Collection" />
              <option value="Immobilier" />
              <option value="Mode" />
            </datalist>
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
            <label className="label">Devise</label>
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

      {/* Crypto Modal */}
      <Modal
        isOpen={isModalOpen && modalType === 'crypto'}
        onClose={() => { setIsModalOpen(false); resetForms(); }}
        title={editingItem ? 'Modifier la crypto' : 'Nouvelle crypto'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Symbole"
              value={cryptoSymbol}
              onChange={(e) => setCryptoSymbol(e.target.value.toUpperCase())}
              placeholder="BTC"
            />
            <Input
              label="Nom"
              value={cryptoName}
              onChange={(e) => setCryptoName(e.target.value)}
              placeholder="Bitcoin"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantité"
              type="number"
              step="0.00000001"
              value={cryptoQuantity}
              onChange={(e) => setCryptoQuantity(e.target.value)}
              placeholder="0.5"
            />
            <Input
              label="Prix d'achat unitaire (€)"
              type="number"
              step="0.01"
              value={cryptoPurchasePrice}
              onChange={(e) => setCryptoPurchasePrice(e.target.value)}
              placeholder="45000.00"
            />
          </div>
          <Input
            label="Date d'achat"
            type="date"
            value={cryptoPurchaseDate}
            onChange={(e) => setCryptoPurchaseDate(e.target.value)}
          />
          <div className="border-t border-noir-700 pt-4">
            <Input
              label="Prix actuel unitaire (€) - Optionnel"
              type="number"
              step="0.01"
              value={cryptoCurrentPrice}
              onChange={(e) => setCryptoCurrentPrice(e.target.value)}
              placeholder="50000.00"
            />
            <p className="text-xs text-ivory-600 mt-1">
              Entrez manuellement le prix actuel pour calculer vos gains.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmitCrypto}>
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sell Modal */}
      <Modal
        isOpen={isSellModalOpen}
        onClose={() => { setIsSellModalOpen(false); setSellingItem(null); }}
        title="Vendre"
      >
        <div className="space-y-4">
          {sellingItem && (
            <div className="bg-noir-800/50 rounded-lg p-4 mb-4">
              <p className="text-ivory-200 font-medium">
                {'ticker' in sellingItem ? `${sellingItem.ticker} - ${sellingItem.name}` : sellingItem.name}
              </p>
              <p className="text-sm text-ivory-500 mt-1">
                Prix d'achat : {(sellingItem.purchasePrice / 100).toFixed(2)} €
                {'quantity' in sellingItem && ` × ${sellingItem.quantity}`}
              </p>
            </div>
          )}
          <Input
            label="Prix de vente (€)"
            type="number"
            step="0.01"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Date de vente"
            type="date"
            value={sellDate}
            onChange={(e) => setSellDate(e.target.value)}
          />
          {sellingItem && sellPrice && (
            <div className="bg-noir-800/50 rounded-lg p-4">
              <p className="text-sm text-ivory-500">Plus-value estimée :</p>
              {(() => {
                const salePriceNum = parseFloat(sellPrice) * 100;
                const quantity = 'quantity' in sellingItem ? sellingItem.quantity : 1;
                const profit = (salePriceNum - sellingItem.purchasePrice) * quantity;
                const profitPercent = (salePriceNum - sellingItem.purchasePrice) / sellingItem.purchasePrice * 100;
                return (
                  <p className={`text-xl font-semibold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}{(profit / 100).toFixed(2)} € ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                  </p>
                );
              })()}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsSellModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSell}>
              Confirmer la vente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exchange Rates Modal */}
      <Modal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        title="💱 Taux de change vers EUR"
      >
        <div className="space-y-4">
          <p className="text-sm text-ivory-500">
            Saisissez le taux de conversion de chaque devise vers l'EUR.
            <br />
            <span className="text-ivory-400">Exemple : si 1 USD = 0.92 EUR, entrez 0.92</span>
          </p>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {usedCurrencies.map((currency) => (
              <div key={currency} className="flex items-center gap-3">
                <div className="w-16 text-center">
                  <span className="font-mono text-lg font-semibold text-gold-400">{currency}</span>
                </div>
                <span className="text-ivory-500">→</span>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={rateInputs[currency] || ''}
                  onChange={(e) => setRateInputs(prev => ({ ...prev, [currency]: e.target.value }))}
                  placeholder="0.92"
                  className="flex-1"
                />
                <span className="text-ivory-500">EUR</span>
              </div>
            ))}
          </div>

          {ratesLastUpdated && (
            <p className="text-xs text-ivory-600">
              Dernière mise à jour : {new Date(ratesLastUpdated).toLocaleDateString('fr-FR')}
            </p>
          )}

          <div className="flex gap-3 pt-4 border-t border-noir-700">
            <Button variant="secondary" className="flex-1" onClick={() => setIsRatesModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSaveRates}>
              Sauvegarder les taux
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
