import React, { useState, useMemo } from 'react';
import './OrderHistory.css';

const ProviderOrderHistory = ({ orders, onUpdateStatus }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
    sortBy: 'newest',
    residence: 'all'
  });

  // Get unique residences
  const residences = useMemo(() => {
    const uniqueResidences = [...new Set(orders.map(order => order.residence))];
    return uniqueResidences.sort();
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filter by residence
    if (filters.residence !== 'all') {
      filtered = filtered.filter(order => order.residence === filters.residence);
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
        order.customerId.name.toLowerCase().includes(query) ||
        order.customerId.email.toLowerCase().includes(query) ||
        order.residence.toLowerCase().includes(query)
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
      case 'revenue-high':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'revenue-low':
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
      totalRevenue: filteredOrders.reduce((sum, order) => 
        order.status === 'completed' ? sum + order.totalPrice : sum, 0
      ),
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
      sortBy: 'newest',
      residence: 'all'
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
            <label>Residence</label>
            <select
              value={filters.residence}
              onChange={(e) => handleFilterChange('residence', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Residences</option>
              {residences.map(res => (
                <option key={res} value={res}>{res}</option>
              ))}
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
              <option value="revenue-high">Revenue (High to Low)</option>
              <option value="revenue-low">Revenue (Low to High)</option>
            </select>
          </div>

          <button onClick={resetFilters} className="reset-btn">
            Reset
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
            <div className="stat-label">Water Delivered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">R{stats.totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Revenue</div>
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
            <p>Try adjusting your filters.</p>
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
                <th>Slot</th>
                <th>Location</th>
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
                      <div style={{ fontWeight: 500 }}>{order.customerId.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {order.customerId.email}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <strong>{order.quantity}</strong>L
                  </td>
                  <td className="price">R{order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span className="time-badge">{order.deliverySlot}</span>
                  </td>
                  <td>{order.residence}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {order.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn-sm accept"
                            onClick={() => onUpdateStatus(order._id, 'accepted')}
                            title="Accept Order"
                          >
                            ✓
                          </button>
                          <button 
                            className="action-btn-sm reject"
                            onClick={() => onUpdateStatus(order._id, 'rejected')}
                            title="Reject Order"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <button 
                          className="action-btn-sm complete"
                          onClick={() => onUpdateStatus(order._id, 'completed')}
                          title="Mark as Completed"
                        >
                          ✓✓
                        </button>
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