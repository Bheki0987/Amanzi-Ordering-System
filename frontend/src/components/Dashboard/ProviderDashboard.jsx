import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/authService';
import { getProviderOrders, updateOrderStatus, getOrderStats } from '../../services/orderService';
import './ProviderDashboard.css';
import ProviderOrderHistory from '../Order/ProviderOrderHistory';
import Chart from 'chart.js/auto';

const ProviderDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    totalRevenue: 0
  });

  const navigate = useNavigate();
  const user = getCurrentUser();

  // Fetch orders and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersResponse = await getProviderOrders();
      setOrders(ordersResponse.data);
      
      // Fetch stats
      const statsResponse = await getOrderStats();
      setStats(statsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  // Fetch data on component mount and when active tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh data
      fetchData();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders based on active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">Amanzi Ordering System</div>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Provider'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-card">
            <div className="user-profile">
              <div className="user-name">{user?.name || 'Water Provider'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
            
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending Orders
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'accepted' ? 'active' : ''}`}
                  onClick={() => setActiveTab('accepted')}
                >
                  Accepted Orders
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed Orders
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'rejected' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rejected')}
                >
                  Rejected Orders
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Orders
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Settings
                </button>
              </li>
            </ul>
          </div>

          <div className="stats-card">
            <h3 className="card-title" style={{marginBottom: '1rem'}}>Order Summary</h3>
            <div className="stats-grid">
              <div className="stat-item stat-total">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-item stat-pending">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="stat-item stat-accepted">
                <div className="stat-label">Accepted</div>
                <div className="stat-value">{stats.accepted}</div>
              </div>
              <div className="stat-item stat-completed">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>
            
            <div className="revenue-summary">
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">R{stats.totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">Dashboard Overview</h2>
                </div>
                
                {loading ? (
                  <div className="empty-state">Loading data...</div>
                ) : error ? (
                  <div className="empty-state">{error}</div>
                ) : (
                  <div>
                    <div className="revenue-overview">
                      <div className="revenue-card">
                        <h3>Total Revenue</h3>
                        <div className="revenue-amount">R{stats.totalRevenue.toFixed(2)}</div>
                        <div className="revenue-period">All Time</div>
                      </div>
                      <div className="revenue-card">
                        <h3>Total Water Sold</h3>
                        <div className="revenue-amount">
                          {orders.reduce((total, order) => {
                            if (order.status === 'completed' || order.status === 'accepted') {
                              return total + order.quantity;
                            }
                            return total;
                          }, 0)} Liters
                        </div>
                        <div className="revenue-period">All Time</div>
                      </div>
                      <div className="revenue-card">
                        <h3>Pending Orders</h3>
                        <div className="revenue-amount">{stats.pending}</div>
                        <div className="revenue-period">Require Action</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">Recent Orders</h2>
                  <button 
                    className="refresh-btn"
                    onClick={fetchData}
                  >
                    Refresh
                  </button>
                </div>
                
                {loading ? (
                  <div className="empty-state">Loading orders...</div>
                ) : error ? (
                  <div className="empty-state">{error}</div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">No orders found.</div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Location</th>
                          <th>Quantity</th>
                          <th>Amount</th>
                          <th>Delivery Slot</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order._id}>
                            <td>{order.customerId.name}</td>
                            <td>{order.residence}</td>
                            <td>{order.quantity} L</td>
                            <td>R{order.totalPrice.toFixed(2)}</td>
                            <td>{order.deliverySlot}</td>
                            <td>
                              <span className={`status-badge status-${order.status}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              {order.status === 'pending' && (
                                <>
                                  <button 
                                    className="action-btn accept"
                                    onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    className="action-btn reject"
                                    onClick={() => handleUpdateOrderStatus(order._id, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <button 
                                  className="action-btn complete"
                                  onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                                >
                                  Complete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {(activeTab === 'pending' || activeTab === 'accepted' || activeTab === 'completed' || activeTab === 'rejected' || activeTab === 'all') && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  {activeTab === 'pending' ? 'Pending Orders' :
                   activeTab === 'accepted' ? 'Accepted Orders' :
                   activeTab === 'completed' ? 'Completed Orders' :
                   activeTab === 'rejected' ? 'Rejected Orders' :
                   'Order History'}
                </h2>
                <button className="refresh-btn" onClick={fetchData}>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="empty-state">Loading orders...</div>
              ) : error ? (
                <div className="empty-state">{error}</div>
              ) : (
                <ProviderOrderHistory 
                  orders={filteredOrders}
                  onUpdateStatus={handleUpdateOrderStatus}
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
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.name || ""}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Location/Service Area</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={user?.location || ""}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;