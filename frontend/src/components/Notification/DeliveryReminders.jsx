import React, { useState, useEffect } from 'react';
import './DeliveryReminders.css';

const DeliveryReminders = ({ orders }) => {
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  
  // Group orders by delivery slot for today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter orders for today that are accepted (not completed/rejected)
    const todaysOrders = orders.filter(order => {
      const orderDate = new Date(order.time).toISOString().split('T')[0];
      return orderDate === today && order.status === 'accepted';
    });
    
    // Group by delivery slot
    const groupedBySlot = todaysOrders.reduce((acc, order) => {
      const slot = order.deliverySlot || 'Unknown';
      if (!acc[slot]) {
        acc[slot] = [];
      }
      acc[slot].push(order);
      return acc;
    }, {});
    
    // Format for display
    const formattedDeliveries = Object.keys(groupedBySlot).map(slot => ({
      slot,
      orders: groupedBySlot[slot],
      count: groupedBySlot[slot].length
    }));
    
    setUpcomingDeliveries(formattedDeliveries);
    
    // Show notification if there are upcoming deliveries
    if (formattedDeliveries.length > 0) {
      setShowNotification(true);
      
      // Hide notification after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [orders]);
  
  if (upcomingDeliveries.length === 0) {
    return null;
  }
  
  return (
    <>
      {/* Notification popup */}
      {showNotification && (
        <div className="delivery-notification">
          <div className="notification-header">
            <h3>Upcoming Deliveries</h3>
            <button 
              className="close-notification"
              onClick={() => setShowNotification(false)}
            >
              ×
            </button>
          </div>
          <div className="notification-body">
            {upcomingDeliveries.map((delivery, index) => (
              <div key={index} className="delivery-slot-reminder">
                <p>
                  <strong>{delivery.slot}:</strong> {delivery.count} orders to deliver
                </p>
              </div>
            ))}
            <a href="#view-deliveries" className="view-all-btn">
              View All Deliveries
            </a>
          </div>
        </div>
      )}
      
      {/* Deliveries section */}
      <div id="view-deliveries" className="delivery-reminders">
        <h2>Today's Delivery Schedule</h2>
        
        {upcomingDeliveries.length === 0 ? (
          <p className="no-deliveries">No deliveries scheduled for today.</p>
        ) : (
          upcomingDeliveries.map((delivery, index) => (
            <div key={index} className="delivery-slot-card">
              <div className="slot-header">
                <h3>{delivery.slot}</h3>
                <span className="order-count">{delivery.count} orders</span>
              </div>
              
              <div className="order-list">
                {delivery.orders.map(order => (
                  <div key={order._id} className="delivery-order">
                    <div>
                      <strong>{order.location}</strong>
                      <div className="order-details">
                        {order.quantity} Liters • R{order.totalPrice?.toFixed(2) || (order.quantity * 4).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <button className="complete-delivery-btn">
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default DeliveryReminders;