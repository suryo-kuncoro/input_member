import React, { useState, useEffect } from 'react';
import { Users, LogOut, Edit2, Trash2, Send, X, Save } from 'lucide-react';

export default function UserDashboard({ currentUser, setCurrentUser }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [lockedOrders, setLockedOrders] = useState(new Set());
  const [orderForm, setOrderForm] = useState({ 
    productId: '', 
    size: '', 
    color: '', 
    quantity: 1, 
    period: '', 
    dropshipAddress: '' 
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, p, pr, l] = await Promise.all([
        window.storage.get('orders').catch(() => null),
        window.storage.get('products').catch(() => null),
        window.storage.get('periods').catch(() => null),
        window.storage.get('locked_orders').catch(() => null)
      ]);

      if (o?.value) setOrders(JSON.parse(o.value));
      if (p?.value) setProducts(JSON.parse(p.value));
      if (pr?.value) setPeriods(JSON.parse(pr.value));
      if (l?.value) setLockedOrders(new Set(JSON.parse(l.value)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const save = async (key, data) => {
    await window.storage.set(key, JSON.stringify(data));
  };

  const addOrder = async () => {
    // Validasi
    if (!orderForm.productId) {
      alert('Pilih produk terlebih dahulu');
      return;
    }
    if (!orderForm.period) {
      alert('Pilih periode terlebih dahulu');
      return;
    }
    if (orderForm.quantity < 1) {
      alert('Quantity minimal 1');
      return;
    }

    const product = products.find(p => p.id === orderForm.productId);
    if (!product) {
      alert('Produk tidak ditemukan');
      return;
    }

    // Validasi ukuran jika produk memiliki pilihan ukuran
    if (product.sizes && product.sizes.length > 0 && !orderForm.size) {
      alert('Pilih ukuran');
      return;
    }

    // Validasi warna jika produk memiliki pilihan warna
    if (product.colors && product.colors.length > 0 && !orderForm.color) {
      alert('Pilih warna');
      return;
    }

    const newOrder = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      productId: product.id,
      productName: product.name,
      size: orderForm.size || '-',
      color: orderForm.color || '-',
      quantity: parseInt(orderForm.quantity),
      price: product.price,
      total: product.price * parseInt(orderForm.quantity),
      period: orderForm.period,
      dropshipAddress: orderForm.dropshipAddress || currentUser.address || '',
      status: 'draft',
      timestamp: new Date().toISOString()
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    await save('orders', updatedOrders);
    
    // Reset form
    setOrderForm({ 
      productId: '', 
      size: '', 
      color: '', 
      quantity: 1, 
      period: orderForm.period, // Keep selected period
      dropshipAddress: '' 
    });
    
    alert('Pesanan ditambahkan ke draft');
  };

  const updateOrder = async () => {
    if (!editingOrder) return;

    // Validasi quantity
    if (editingOrder.quantity < 1) {
      alert('Quantity minimal 1');
      return;
    }

    // Update total based on new quantity
    const updatedEditingOrder = {
      ...editingOrder,
      total: editingOrder.price * editingOrder.quantity
    };

    const updatedOrders = orders.map(o => 
      o.id === updatedEditingOrder.id ? updatedEditingOrder : o
    );
    
    setOrders(updatedOrders);
    await save('orders', updatedOrders);
    setEditingOrder(null);
    alert('Pesanan berhasil diupdate');
  };

  const deleteOrder = async (id) => {
    // Check if order is locked
    if (lockedOrders.has(id)) {
      alert('Pesanan ini dikunci oleh admin dan tidak bisa dihapus');
      return;
    }

    if (!window.confirm('Yakin ingin menghapus pesanan ini?')) return;

    const updatedOrders = orders.filter(o => o.id !== id);
    setOrders(updatedOrders);
    await save('orders', updatedOrders);
    alert('Pesanan berhasil dihapus');
  };

  const sendToAdmin = async () => {
    const draftOrders = orders.filter(
      o => o.userId === currentUser.id && o.status === 'draft'
    );

    if (draftOrders.length === 0) {
      alert('Tidak ada pesanan draft untuk dikirim');
      return;
    }

    if (!window.confirm(`Kirim ${draftOrders.length} pesanan ke admin?`)) return;

    // Update status to 'sent'
    const updatedOrders = orders.map(o =>
      o.userId === currentUser.id && o.status === 'draft'
        ? { ...o, status: 'sent', sentAt: new Date().toISOString() }
        : o
    );

    setOrders(updatedOrders);
    await save('orders', updatedOrders);

    // Add notification
    try {
      const notifResult = await window.storage.get('notifications', true).catch(() => null);
      const notifications = notifResult?.value ? JSON.parse(notifResult.value) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        message: `${currentUser.name} mengirim ${draftOrders.length} pesanan`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id
      };
      
      notifications.push(newNotification);
      await window.storage.set('notifications', JSON.stringify(notifications), true);
    } catch (error) {
      console.error('Error adding notification:', error);
    }

    alert('Pesanan berhasil dikirim ke admin!');
  };

  // Safety check for currentUser
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User tidak ditemukan. Silakan login kembali.</p>
          <button 
            onClick={() => setCurrentUser(null)}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  // Filter orders
  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const drafts = userOrders.filter(o => o.status === 'draft');
  const sent = userOrders.filter(o => o.status === 'sent');
  const allSent = orders.filter(o => o.status === 'sent');

  // Get selected product for form
  const selectedProduct = products.find(p => p.id === orderForm.productId);

  // Calculate totals
  const draftTotal = drafts.reduce((sum, o) => sum + o.total, 0);
  const sentTotal = sent.reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-indigo-100">{currentUser.name || 'User'}</p>
          </div>
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
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Draft</div>
            <div className="text-2xl font-bold text-yellow-600">{drafts.length} pesanan</div>
            <div className="text-sm text-gray-500">Rp {draftTotal.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Terkirim</div>
            <div className="text-2xl font-bold text-green-600">{sent.length} pesanan</div>
            <div className="text-sm text-gray-500">Rp {sentTotal.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-indigo-600">{userOrders.length} pesanan</div>
            <div className="text-sm text-gray-500">Rp {(draftTotal + sentTotal).toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* Add Order Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Tambah Pesanan Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-sm font-medium mb-1">Periode *</label>
              <select
                value={orderForm.period}
                onChange={e => setOrderForm({ ...orderForm, period: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Pilih Periode</option>
                {periods.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Produk *</label>
              <select
                value={orderForm.productId}
                onChange={e => setOrderForm({ 
                  ...orderForm, 
                  productId: e.target.value,
                  size: '',
                  color: ''
                })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={!orderForm.period}
              >
                <option value="">Pilih Produk</option>
                {products.filter(p => p.period === orderForm.period).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - Rp {p.price.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Ukuran *</label>
                <select
                  value={orderForm.size}
                  onChange={e => setOrderForm({ ...orderForm, size: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Pilih Ukuran</option>
                  {selectedProduct.sizes.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedProduct?.colors && selectedProduct.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Warna *</label>
                <select
                  value={orderForm.color}
                  onChange={e => setOrderForm({ ...orderForm, color: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Pilih Warna</option>
                  {selectedProduct.colors.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                value={orderForm.quantity}
                onChange={e => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat Dropship (Opsional)</label>
              <input
                type="text"
                value={orderForm.dropshipAddress}
                onChange={e => setOrderForm({ ...orderForm, dropshipAddress: e.target.value })}
                placeholder="Kosongkan jika sama dengan alamat akun"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="font-semibold">Total: Rp {(selectedProduct.price * orderForm.quantity).toLocaleString('id-ID')}</div>
            </div>
          )}

          <button
            onClick={addOrder}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
          >
            Tambah ke Draft
          </button>
        </div>

        {/* Draft Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Draft Pesanan ({drafts.length})</h2>
            {drafts.length > 0 && (
              <button
                onClick={sendToAdmin}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                Kirim ke Admin ({drafts.length})
              </button>
            )}
          </div>

          {drafts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada pesanan draft
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map(order => (
                editingOrder?.id === order.id ? (
                  // Edit Mode
                  <div key={order.id} className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <h3 className="font-bold mb-3">{order.productName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Ukuran</label>
                        <input
                          value={editingOrder.size}
                          onChange={e => setEditingOrder({ ...editingOrder, size: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Warna</label>
                        <input
                          value={editingOrder.color}
                          onChange={e => setEditingOrder({ ...editingOrder, color: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={editingOrder.quantity}
                          onChange={e => setEditingOrder({ 
                            ...editingOrder, 
                            quantity: parseInt(e.target.value) || 1 
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Total</label>
                        <div className="px-3 py-2 bg-gray-100 rounded font-bold">
                          Rp {(editingOrder.price * editingOrder.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Alamat Dropship</label>
                        <textarea
                          value={editingOrder.dropshipAddress}
                          onChange={e => setEditingOrder({ ...editingOrder, dropshipAddress: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          rows="2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={updateOrder}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
                      >
                        <Save className="w-4 h-4" />
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingOrder(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition"
                      >
                        <X className="w-4 h-4" />
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{order.productName}</h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p>Periode: {order.period}</p>
                        <p>Ukuran: {order.size} | Warna: {order.color} | Qty: {order.quantity}</p>
                        <p className="text-gray-500">Dropship: {order.dropshipAddress}</p>
                      </div>
                      <div className="mt-2 font-bold text-indigo-600">
                        Rp {order.total.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Sent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Pesanan Terkirim ({sent.length})</h2>
          {sent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada pesanan yang dikirim
            </div>
          ) : (
            <div className="space-y-3">
              {sent.map(order => (
                <div key={order.id} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{order.productName}</h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p>Periode: {order.period}</p>
                        <p>Ukuran: {order.size} | Warna: {order.color} | Qty: {order.quantity}</p>
                        <p className="text-gray-500">Dropship: {order.dropshipAddress}</p>
                        {lockedOrders.has(order.id) && (
                          <p className="text-orange-600 font-semibold">🔒 Dikunci oleh Admin</p>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-green-600">
                      Rp {order.total.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Sent Orders (Recap) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Rekapan Semua Pesanan ({allSent.length})</h2>
          {allSent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada pesanan yang dikirim
            </div>
          ) : (
            <div className="space-y-2">
              {allSent.map(order => (
                <div key={order.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold">{order.userName}</p>
                    <p className="text-sm text-gray-600">
                      {order.productName} | {order.size} | {order.color} | Qty: {order.quantity}
                    </p>
                    <p className="text-xs text-gray-500">Dropship: {order.dropshipAddress}</p>
                  </div>
                  <p className="font-bold text-gray-700">
                    Rp {order.total.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
