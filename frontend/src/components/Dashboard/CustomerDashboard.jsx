import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/authService';
import { getMyOrders } from '../../services/orderService';
import OrderForm from '../Order/OrderForm';
import InvoiceModal from '../Invoices/InvoiceModal';
import CustomerNotification from '../Notification/CustomerNotification';
import OrderHistory from '../Order/CustomerOrderHistory';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('newOrder');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const navigate = useNavigate();
  const user = getCurrentUser();

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyOrders();
      setOrders(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const pending = response.data.filter(order => order.status === 'pending').length;
      const accepted = response.data.filter(order => order.status === 'accepted').length;
      const completed = response.data.filter(order => order.status === 'completed').length;
      const rejected = response.data.filter(order => order.status === 'rejected').length;
      
      setStats({
        total,
        pending,
        accepted,
        completed,
        rejected
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  // Fetch orders on component mount and periodically
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    fetchOrders();
    
    // Refresh orders every 2 minutes to check for status updates
    const interval = setInterval(fetchOrders, 120000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch orders when active tab changes
  useEffect(() => {
    if (['orders', 'pending', 'accepted', 'completed'].includes(activeTab)) {
      fetchOrders();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewInvoice = (order) => {
    setCurrentOrder(order);
    setShowInvoice(true);
  };

  const handleOrderSubmit = (orderData) => {
    fetchOrders();
    setActiveTab('orders');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = activeTab === 'orders' ? orders : 
    activeTab === 'pending' ? orders.filter(order => order.status === 'pending') :
    activeTab === 'accepted' ? orders.filter(order => order.status === 'accepted') :
    activeTab === 'completed' ? orders.filter(order => order.status === 'completed') :
    [];

  return (
    <div className="dashboard-container">
      {/* Add Customer Notification Component */}
      <CustomerNotification orders={orders} />
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">Amanzi Ordering System</div>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Student'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-card">
            <div className="user-profile">
              <div className="user-name">{user?.name || 'Student'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
            
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'newOrder' ? 'active' : ''}`}
                  onClick={() => setActiveTab('newOrder')}
                >
                  New Order
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  My Orders
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'accepted' ? 'active' : ''}`}
                  onClick={() => setActiveTab('accepted')}
                >
                  Accepted
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <h3>Order Summary</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.accepted}</div>
                <div className="stat-label">Accepted</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === 'newOrder' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Order Water</h2>
              </div>

              {success && (
                <div className="alert-success">{success}</div>
              )}
              
              {error && (
                <div className="alert-error">{error}</div>
              )}

              <OrderForm 
                onOrderSubmit={handleOrderSubmit}
                setSuccess={setSuccess}
                setError={setError}
              />
            </div>
          )}

          {(activeTab === 'orders' || activeTab === 'pending' || activeTab === 'accepted' || activeTab === 'completed') && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  {activeTab === 'orders' ? 'Order History' : 
                   activeTab === 'pending' ? 'Pending Orders' : 
                   activeTab === 'accepted' ? 'Accepted Orders' : 
                   'Completed Orders'}
                </h2>
                <button className="refresh-btn" onClick={fetchOrders}>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="loading-state">Loading orders...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <OrderHistory 
                  orders={filteredOrders} 
                  onViewInvoice={handleViewInvoice}
                />
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Profile Settings</h2>
              </div>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={user?.name || ""}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label>Residence</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user?.residence || ""}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && currentOrder && (
        <InvoiceModal 
          order={currentOrder} 
          user={user} 
          onClose={() => setShowInvoice(false)} 
        />
      )}
    </div>
  );
};

export default CustomerDashboard;