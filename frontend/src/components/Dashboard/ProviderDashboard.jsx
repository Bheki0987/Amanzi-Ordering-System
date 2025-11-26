import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/authService';
import { getProviderOrders, updateOrderStatus, getOrderStats } from '../../services/orderService';
import { updateProviderAvailability, getProviderProfile } from '../../services/providerService';
import ProviderOrderHistory from '../Order/ProviderOrderHistory';
import RevenueChart from '../Charts/RevenueChart';
import DeliverySlotChart from '../Charts/DeliverySlotChart';
import './ProviderDashboard.css';

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

  // Availability state
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [providerDetails, setProviderDetails] = useState({});

  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch provider profile (includes availability status)
      try {
        const profileResponse = await getProviderProfile();
        console.log('Profile response:', profileResponse);
        setProviderDetails(profileResponse.data || profileResponse);
        
        // ✅ HANDLE MIGRATION: Convert old statuses to new format on frontend
        const fetchedStatus = profileResponse.data?.providerDetails?.availabilityStatus || 'available';
        
        let normalizedStatus = fetchedStatus;
        if (fetchedStatus === 'busy' || fetchedStatus === 'offline') {
          console.log(`Converting old status "${fetchedStatus}" to "unavailable"`);
          normalizedStatus = 'unavailable';
        }
        
        setAvailabilityStatus(normalizedStatus);
        setIsAvailable(normalizedStatus === 'available');
        
      } catch (profileErr) {
        console.log('Profile fetch failed:', profileErr);
        // Set default values
        setAvailabilityStatus('available');
        setIsAvailable(true);
      }
      
      // Fetch orders
      try {
        const ordersResponse = await getProviderOrders();
        console.log('Orders response:', ordersResponse);
        
        let ordersArray = [];
        if (Array.isArray(ordersResponse)) {
          ordersArray = ordersResponse;
        } else if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
          ordersArray = ordersResponse.data;
        } else if (ordersResponse.orders && Array.isArray(ordersResponse.orders)) {
          ordersArray = ordersResponse.orders;
        }
        
        console.log('Orders array:', ordersArray.length, ordersArray);
        setOrders(ordersArray);
        
        // Calculate stats
        const calculatedStats = {
          total: ordersArray.length,
          pending: ordersArray.filter(o => o.status === 'pending').length,
          accepted: ordersArray.filter(o => o.status === 'accepted').length,
          completed: ordersArray.filter(o => o.status === 'completed').length,
          rejected: ordersArray.filter(o => o.status === 'rejected').length,
          totalRevenue: ordersArray
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
            .toFixed(2)
        };
        
        setStats(calculatedStats);
        
      } catch (ordersErr) {
        console.error('Orders fetch failed:', ordersErr);
        setOrders([]);
        setError('Failed to load orders. Please refresh.');
      }
      
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrderAction = async (orderId, status) => {
    try {
      setError('');
      await updateOrderStatus(orderId, status);
      // Refresh data after update
      await fetchProviderData();
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order status');
    }
  };

  const handleAvailabilityChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      setError('');
      
      console.log('Attempting to change status to:', newStatus); // Debug log
      
      const response = await updateProviderAvailability(newStatus);
      
      console.log('Status update response:', response); // Debug log
      
      // ✅ Update local state
      setAvailabilityStatus(newStatus);
      setIsAvailable(newStatus === 'available');
      
      // ✅ Show success message
      alert(`Status successfully updated to: ${newStatus === 'available' ? 'Available ✅' : 'Unavailable 🚫'}`);
      
      // ✅ Refresh provider data
      await fetchProviderData();
      
    } catch (err) {
      console.error('Error updating availability:', err);
      
      // ✅ Better error handling
      const errorMessage = err.response?.data?.message || 'Failed to update availability status';
      setError(errorMessage);
      
      alert(`Error: ${errorMessage}\n\nPlease refresh the page and try again.`);
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981'; // Green
      case 'unavailable': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <img src="/images/Amanzi Logo.png" alt="Amanzi Logo" className="dashboard-logo" />
          <h1>Provider Dashboard</h1>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Provider'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && (
        <div className="error-message" style={{ 
          padding: '12px', 
          margin: '16px', 
          backgroundColor: '#FEE2E2', 
          color: '#991B1B', 
          borderRadius: '8px' 
        }}>
          {error}
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="sidebar">
          {/* User Profile Card */}
          <div className="sidebar-card">
            <div className="user-profile">
              <div className="user-name">{user?.name || 'Provider'}</div>
              <div className="user-email">{user?.email}</div>
              {/* Availability Status in Sidebar */}
              <div className="availability-status" style={{ marginTop: '12px' }}>
                <div className="status-indicator">
                  <div 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor(availabilityStatus) }}
                  ></div>
                  <span className="status-text">
                    {availabilityStatus.charAt(0).toUpperCase() + availabilityStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Overview
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'availability' ? 'active' : ''}`}
                  onClick={() => setActiveTab('availability')}
                >
                  🟢 Availability
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  📦 Orders ({orders.length})
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  📈 Analytics
                </button>
              </li>
              <li className="sidebar-menu-item">
                <button 
                  className={`sidebar-menu-button ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Stats Card */}
          <div className="sidebar-card stats-card">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item stat-total">
                <div className="stat-label">Total</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-item stat-pending">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="stat-item stat-completed">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
              <div className="stat-item stat-revenue">
                <div className="stat-label">Revenue</div>
                <div className="stat-value">R{stats.totalRevenue}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {activeTab === 'dashboard' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Dashboard Overview</h2>
                <button onClick={fetchProviderData} className="refresh-btn">
                  🔄 Refresh
                </button>
              </div>

              <div className="recent-orders">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <p>No orders assigned to you yet</p>
                    <small>Orders will appear here when students place orders</small>
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order._id}>
                            <td>{order.customerId?.name || 'Unknown'}</td>
                            <td>{order.quantity}L</td>
                            <td>R{order.totalPrice?.toFixed(2)}</td>
                            <td>
                              <span className={`status-badge status-${order.status}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              {order.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleOrderAction(order._id, 'accepted')}
                                    className="action-btn accept"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleOrderAction(order._id, 'rejected')}
                                    className="action-btn reject"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <button 
                                  onClick={() => handleOrderAction(order._id, 'completed')}
                                  className="action-btn complete"
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
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Availability Management</h2>
              </div>
              
              <div className="availability-section">
                <p>Update your availability to let customers know when you can accept orders</p>
                
                <div className="availability-controls">
                  {/* ✅ AVAILABLE BUTTON */}
                  <button
                    className={`status-btn ${availabilityStatus === 'available' ? 'active' : ''}`}
                    onClick={() => handleAvailabilityChange('available')}
                    disabled={statusLoading}
                    style={{ 
                      backgroundColor: availabilityStatus === 'available' ? '#10B981' : '#E5E7EB',
                      color: availabilityStatus === 'available' ? 'white' : '#6B7280',
                      flex: 1,
                      padding: '20px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      border: availabilityStatus === 'available' ? '3px solid #059669' : '2px solid #D1D5DB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    <span className="status-icon" style={{ fontSize: '1.5rem' }}>✅</span>
                    <span>Available - Accepting Orders</span>
                  </button>
                  
                  {/* ✅ UNAVAILABLE BUTTON */}
                  <button
                    className={`status-btn ${availabilityStatus === 'unavailable' ? 'active' : ''}`}
                    onClick={() => handleAvailabilityChange('unavailable')}
                    disabled={statusLoading}
                    style={{ 
                      backgroundColor: availabilityStatus === 'unavailable' ? '#EF4444' : '#E5E7EB',
                      color: availabilityStatus === 'unavailable' ? 'white' : '#6B7280',
                      flex: 1,
                      padding: '20px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      border: availabilityStatus === 'unavailable' ? '3px solid #DC2626' : '2px solid #D1D5DB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    <span className="status-icon" style={{ fontSize: '1.5rem' }}>🚫</span>
                    <span>Unavailable - Not Accepting Orders</span>
                  </button>
                </div>
                
                {statusLoading && (
                  <div className="status-loading" style={{ 
                    textAlign: 'center', 
                    marginTop: '20px',
                    color: '#6B7280'
                  }}>
                    <span>Updating status...</span>
                  </div>
                )}
                
                <div className="availability-info" style={{ 
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#4B5563' }}>
                    <strong>Current Status:</strong> {availabilityStatus === 'available' ? '✅ Available' : '🚫 Unavailable'}
                  </p>
                  <small style={{ color: '#6B7280', display: 'block', marginTop: '8px' }}>
                    Last updated: {providerDetails.providerDetails?.lastStatusUpdate ? 
                      new Date(providerDetails.providerDetails.lastStatusUpdate).toLocaleString() : 
                      'Never'
                    }
                  </small>
                  {availabilityStatus === 'unavailable' && (
                    <p style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      backgroundColor: '#FEF3C7', 
                      color: '#92400E',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}>
                      ⚠️ <strong>Note:</strong> You will NOT appear in the customer order form while unavailable.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Order Management</h2>
              </div>
              <ProviderOrderHistory 
                orders={orders} 
                onOrderUpdate={handleOrderAction}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Analytics</h2>
              </div>
              <div className="charts-row">
                <div className="chart-box">
                  <RevenueChart orders={orders} />
                </div>
                <div className="chart-box">
                  <DeliverySlotChart orders={orders} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Provider Profile</h2>
              </div>
              <div className="profile-section">
                <div className="profile-info">
                  <p><strong>Business Name:</strong> {providerDetails.providerDetails?.businessName || 'Not set'}</p>
                  <p><strong>Description:</strong> {providerDetails.providerDetails?.description || 'Not set'}</p>
                  <p><strong>Service Areas:</strong> {providerDetails.providerDetails?.serviceArea?.join(', ') || 'Not set'}</p>
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