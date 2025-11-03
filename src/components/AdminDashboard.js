import React, { useState, useEffect } from 'react';
import { Package, LogOut, Trash2, Lock, Unlock, Download, Printer } from 'lucide-react';

// ===== SHARED.JS =====
const storage = {
  async get(key, shared = false) {
    try {
      const result = await window.storage.get(key, shared);
      return result ? JSON.parse(result.value) : null;
    } catch (error) {
      return null;
    }
  },
  
  async set(key, data, shared = false) {
    try {
      await window.storage.set(key, JSON.stringify(data), shared);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },
  
  async delete(key, shared = false) {
    try {
      await window.storage.delete(key, shared);
      return true;
    } catch (error) {
      return false;
    }
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const exportToCSV = (data, filename) => {
  let csv = 'User,Produk,Ukuran,Warna,Qty,Harga,Total,Periode,Alamat Dropship\n';
  data.forEach(order => {
    const address = (order.dropshipAddress || '').replace(/"/g, '""');
    csv += `${order.userName},${order.productName},${order.size},${order.color},${order.quantity},${order.price},${order.total},${order.period},"${address}"\n`;
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const addNotification = async (message) => {
  const notifications = await storage.get('notifications', true) || [];
  const newNotification = {
    id: Date.now().toString(),
    message,
    timestamp: new Date().toISOString()
  };
  notifications.push(newNotification);
  await storage.set('notifications', notifications, true);
};

// ===== MAIN COMPONENT =====
export default function AdminDashboard({ currentUser, setCurrentUser }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [activePeriod, setActivePeriod] = useState('');
  const [productForm, setProductForm] = useState({ 
    name: '', 
    sizes: '', 
    colors: '', 
    price: '' 
  });
  const [lockedOrders, setLockedOrders] = useState(new Set());
  const [filterUser, setFilterUser] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [u, p, o, n, pr, ap, l] = await Promise.all([
      storage.get('users'),
      storage.get('products'),
      storage.get('orders'),
      storage.get('notifications', true),
      storage.get('periods'),
      storage.get('active_period'),
      storage.get('locked_orders')
    ]);

    if (u) setUsers(u);
    if (p) setProducts(p);
    if (o) setOrders(o);
    if (n) setNotifications(n);
    if (pr) setPeriods(pr);
    if (ap) setActivePeriod(ap);
    if (l) setLockedOrders(new Set(l));
  };

  const addPeriod = async () => {
    if (!activePeriod.trim()) {
      return alert('Isi nama periode');
    }
    if (periods.includes(activePeriod)) {
      return alert('Periode sudah ada');
    }
    const updatedPeriods = [...periods, activePeriod];
    setPeriods(updatedPeriods);
    await storage.set('periods', updatedPeriods);
    await storage.set('active_period', activePeriod);
    await addNotification(`Periode baru ditambahkan: ${activePeriod}`);
  };

  const addProduct = async () => {
    if (!productForm.name || !productForm.price || !activePeriod) {
      return alert('Lengkapi data produk dan pilih periode aktif');
    }
    
    const newProduct = {
      id: Date.now().toString(),
      name: productForm.name,
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [],
      colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()) : [],
      price: parseFloat(productForm.price),
      period: activePeriod
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await storage.set('products', updatedProducts);
    await addNotification(`Produk baru ditambahkan: ${newProduct.name}`);
    setProductForm({ name: '', sizes: '', colors: '', price: '' });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    
    const product = products.find(p => p.id === id);
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    await storage.set('products', updatedProducts);
    await addNotification(`Produk dihapus: ${product.name}`);
  };

  const toggleLockOrder = async (orderId) => {
    const newLockedOrders = new Set(lockedOrders);
    if (newLockedOrders.has(orderId)) {
      newLockedOrders.delete(orderId);
    } else {
      newLockedOrders.add(orderId);
    }
    setLockedOrders(newLockedOrders);
    await storage.set('locked_orders', Array.from(newLockedOrders));
  };

  const handleExportCSV = () => {
    const sentOrders = orders.filter(o => o.status === 'sent');
    exportToCSV(sentOrders, 'Pesanan.csv');
  };

  const clearNotifications = async () => {
    setNotifications([]);
    await storage.set('notifications', [], true);
  };

  // Filtered data
  const allSentOrders = orders.filter(o => o.status === 'sent');
  const filteredOrders = allSentOrders.filter(o =>
    (!filterUser || o.userId === filterUser) &&
    (!filterProduct || o.productId === filterProduct) &&
    (!filterPeriod || o.period === filterPeriod)
  );
  
  const totalFiltered = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  
  const summaryByPeriod = filteredOrders.reduce((acc, order) => {
    if (!acc[order.period]) {
      acc[order.period] = { count: 0, total: 0 };
    }
    acc[order.period].count += 1;
    acc[order.period].total += order.total;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <button 
          onClick={() => setCurrentUser(null)} 
          className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Notifikasi</h3>
              <button 
                onClick={clearNotifications}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Hapus Semua
              </button>
            </div>
            <div className="space-y-1">
              {notifications.slice(-10).reverse().map(n => (
                <div key={n.id} className="text-sm text-gray-700">
                  • {n.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Period Management */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold text-xl mb-4">Kelola Periode</h2>
          <div className="flex gap-2 mb-4">
            <input 
              value={activePeriod} 
              onChange={e => setActivePeriod(e.target.value)} 
              placeholder="Nama Periode (contoh: Periode 1 2025)" 
              className="border border-gray-300 px-3 py-2 rounded flex-1"
            />
            <button 
              onClick={addPeriod} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition"
            >
              Tambah Periode
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {periods.map((period, i) => (
              <span 
                key={i} 
                onClick={() => setActivePeriod(period)} 
                className={`px-4 py-2 rounded-full cursor-pointer transition ${
                  activePeriod === period 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {period}
              </span>
            ))}
          </div>
        </div>

        {/* Product Management */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold text-xl mb-4">Kelola Produk</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            <input 
              value={productForm.name} 
              onChange={e => setProductForm({...productForm, name: e.target.value})} 
              placeholder="Nama Produk" 
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <input 
              value={productForm.sizes} 
              onChange={e => setProductForm({...productForm, sizes: e.target.value})} 
              placeholder="Ukuran (S,M,L)" 
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <input 
              value={productForm.colors} 
              onChange={e => setProductForm({...productForm, colors: e.target.value})} 
              placeholder="Warna (Merah,Biru)" 
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <input 
              type="number" 
              value={productForm.price} 
              onChange={e => setProductForm({...productForm, price: e.target.value})} 
              placeholder="Harga" 
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <button 
              onClick={addProduct} 
              className="bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Tambah Produk
            </button>
          </div>
          
          <div className="space-y-2">
            {products.filter(p => p.period === activePeriod).map(product => (
              <div key={product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <div>
                  <span className="font-bold">{product.name}</span>
                  <span className="text-gray-600"> | Ukuran: {product.sizes.join(', ') || '-'}</span>
                  <span className="text-gray-600"> | Warna: {product.colors.join(', ') || '-'}</span>
                  <span className="text-gray-600"> | {formatCurrency(product.price)}</span>
                </div>
                <button 
                  onClick={() => deleteProduct(product.id)} 
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl">Ringkasan Pesanan</h2>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <select 
              value={filterUser} 
              onChange={e => setFilterUser(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded"
            >
              <option value="">Semua User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select 
              value={filterProduct} 
              onChange={e => setFilterProduct(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded"
            >
              <option value="">Semua Produk</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select 
              value={filterPeriod} 
              onChange={e => setFilterPeriod(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded"
            >
              <option value="">Semua Periode</option>
              {periods.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Pesanan</div>
              <div className="text-2xl font-bold">{filteredOrders.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Nilai</div>
              <div className="text-2xl font-bold">{formatCurrency(totalFiltered)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Periode Aktif</div>
              <div className="text-2xl font-bold">{activePeriod || '-'}</div>
            </div>
          </div>

          {/* Period Summary */}
          {Object.keys(summaryByPeriod).length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Per Periode:</h3>
              <div className="space-y-1">
                {Object.entries(summaryByPeriod).map(([period, data]) => (
                  <div key={period} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{period}</span>
                    <span>{data.count} pesanan • {formatCurrency(data.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Produk</th>
                  <th className="p-2 text-left">Detail</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{order.userName}</td>
                    <td className="p-2">{order.productName}</td>
                    <td className="p-2 text-gray-600">
                      {order.size && `${order.size}`}
                      {order.color && ` • ${order.color}`}
                    </td>
                    <td className="p-2">{order.quantity}</td>
                    <td className="p-2 text-right">{formatCurrency(order.total)}</td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => toggleLockOrder(order.id)}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        {lockedOrders.has(order.id) ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
