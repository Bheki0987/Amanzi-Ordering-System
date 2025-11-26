import React, { useState, useMemo } from 'react';
import './OrderHistory.css';

const ProviderOrderHistory = ({ orders, onOrderUpdate }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
    sortBy: 'newest'
  });

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filter by date range
    const now = new Date();
    if (filters.dateRange !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            return daysDiff === 0;
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          case 'quarter':
            return daysDiff <= 90;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(query) ||
        order.customerId?.name?.toLowerCase().includes(query) ||
        order.residence?.toLowerCase().includes(query) ||
        order.deliverySlot?.toLowerCase().includes(query)
      );
    }

    // Sort orders
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
        break;
      case 'quantity-high':
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      case 'quantity-low':
        filtered.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      default:
        break;
    }

    return filtered;
  }, [orders, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: filteredOrders.length,
      totalLiters: filteredOrders.reduce((sum, order) => sum + order.quantity, 0),
      totalRevenue: filteredOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + order.totalPrice, 0),
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      accepted: filteredOrders.filter(o => o.status === 'accepted').length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      rejected: filteredOrders.filter(o => o.status === 'rejected').length,
    };
  }, [filteredOrders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      searchQuery: '',
      sortBy: 'newest'
    });
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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      accepted: '#3b82f6',
      completed: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // ADDED: Handler functions for order actions
  const handleAcceptOrder = async (orderId) => {
    if (window.confirm('Accept this order?')) {
      try {
        await onOrderUpdate(orderId, 'accepted');
      } catch (error) {
        console.error('Error accepting order:', error);
        alert('Failed to accept order. Please try again.');
      }
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (window.confirm('Reject this order? This action cannot be undone.')) {
      try {
        await onOrderUpdate(orderId, 'rejected');
      } catch (error) {
        console.error('Error rejecting order:', error);
        alert('Failed to reject order. Please try again.');
      }
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (window.confirm('Mark this order as completed/delivered?')) {
      try {
        await onOrderUpdate(orderId, 'completed');
      } catch (error) {
        console.error('Error completing order:', error);
        alert('Failed to complete order. Please try again.');
      }
    }
  };

  return (
    <div className="order-history">
      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by ID, customer, location..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="quantity-high">Quantity (High to Low)</option>
              <option value="quantity-low">Quantity (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="price-low">Price (Low to High)</option>
            </select>
          </div>

          <button onClick={resetFilters} className="reset-btn">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalLiters}L</div>
            <div className="stat-label">Total Water</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">R{stats.totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>Try adjusting your filters or wait for new orders.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Delivery Slot</th>
                <th>Location</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">
                    <span className="id-badge">#{order._id.substring(0, 8)}</span>
                  </td>
                  <td>
                    <div>
                      <strong>{order.customerId?.name || 'Unknown'}</strong>
                      <br />
                      <small style={{ color: '#6b7280' }}>{order.customerId?.email}</small>
                    </div>
                  </td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <strong>{order.quantity}</strong> Liters
                  </td>
                  <td className="price">R{order.totalPrice?.toFixed(2)}</td>
                  <td>
                    <span className="time-badge">{order.deliverySlot}</span>
                  </td>
                  <td>{order.residence}</td>
                  <td>
                    <span className="payment-badge">
                      {order.paymentMethod === 'card' ? '💳 Card' : '💵 Cash'}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* PENDING ORDERS - Show Accept and Reject buttons */}
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order._id)}
                            className="action-btn accept"
                            style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order._id)}
                            className="action-btn reject"
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}

                      {/* ACCEPTED ORDERS - Show Complete button */}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteOrder(order._id)}
                          className="action-btn complete"
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          ✓✓ Mark as Delivered
                        </button>
                      )}

                      {/* COMPLETED ORDERS - Show status only */}
                      {order.status === 'completed' && (
                        <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                          ✓ Delivered
                        </span>
                      )}

                      {/* REJECTED ORDERS - Show status only */}
                      {order.status === 'rejected' && (
                        <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '500' }}>
                          ✕ Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Results Summary */}
      {filteredOrders.length > 0 && (
        <div className="results-summary">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      )}
    </div>
  );
};

export default ProviderOrderHistory;