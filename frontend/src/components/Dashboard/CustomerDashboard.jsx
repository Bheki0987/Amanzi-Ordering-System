import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const user = getCurrentUser();

  // Define fetchOrders function
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching orders...');
      const data = await getMyOrders();
      
      // Ensure data is an array
      const ordersArray = Array.isArray(data) ? data : [];
      console.log('Orders fetched:', ordersArray.length);
      setOrders(ordersArray);
      
      // Calculate stats
      setStats({
        total: ordersArray.length,
        pending: ordersArray.filter(order => order.status === 'pending').length,
        accepted: ordersArray.filter(order => order.status === 'accepted').length,
        completed: ordersArray.filter(order => order.status === 'completed').length,
        rejected: ordersArray.filter(order => order.status === 'rejected').length
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and periodically
  useEffect(() => {
    // Request notification permission on user interaction only
    const requestNotificationPermission = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };
    
    // Add click listener to request permission on first interaction
    document.addEventListener('click', requestNotificationPermission, { once: true });
    
    // Check for success messages from navigation state or query params
    if (location.state?.orderSuccess) {
      setSuccess(location.state.message || 'Order placed successfully!');
      setActiveTab('orders');
      // Clear the state
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
      // Fetch orders immediately
      fetchOrders();
    }
    
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment') === 'success') {
      console.log('Payment successful - refreshing orders');
      setSuccess('Payment successful! Your order has been confirmed.');
      setActiveTab('orders');
      
      // Clear query params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
      // Fetch orders immediately after payment success
      fetchOrders();
    } else {
      // Initial fetch if not from payment redirect
      fetchOrders();
    }
    
    // Refresh orders every 2 minutes to check for status updates
    const interval = setInterval(fetchOrders, 120000);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('click', requestNotificationPermission);
    };
  }, [location.search, location.state]); // Added dependencies

  // Fetch orders when active tab changes to orders
  useEffect(() => {
    if (activeTab === 'orders') {
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
    console.log('Order submitted:', orderData);
    // Fetch orders immediately after submission
    fetchOrders();
    setActiveTab('orders');
  };

  return (
    <div className="dashboard-container">
      <CustomerNotification orders={orders} />
      
      <header className="dashboard-header">
        <div className="header-title">
          <img src="/images/Amanzi Logo.png" alt="Amanzi Logo" className="dashboard-logo" />
          <span>Amanzi Ordering System</span>
        </div>
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
          {/* Global success/error messages */}
          {success && (
            <div className="alert-success" style={{ marginBottom: '1rem' }}>
              {success}
            </div>
          )}
          
          {error && activeTab !== 'newOrder' && (
            <div className="alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {activeTab === 'newOrder' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Order Water</h2>
              </div>

              <OrderForm 
                onOrderSubmit={handleOrderSubmit}
                setSuccess={setSuccess}
                setError={setError}
              />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Order History</h2>
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
                  orders={orders} 
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