import React, { useState, useEffect } from 'react';
import './CustomerNotification.css';

const CustomerNotification = ({ orders }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    // Check for upcoming deliveries every minute
    const checkUpcomingDeliveries = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Filter accepted orders for today
      const todaysAcceptedOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate === today && order.status === 'accepted';
      });
      
      // Check each order for upcoming delivery
      todaysAcceptedOrders.forEach(order => {
        const deliveryTime = parseDeliverySlot(order.deliverySlot);
        
        if (deliveryTime) {
          const timeDiff = deliveryTime.getTime() - now.getTime();
          const minutesUntilDelivery = Math.floor(timeDiff / (1000 * 60));
          
          // Notify 15 minutes before delivery
          if (minutesUntilDelivery === 15) {
            showDeliveryNotification(order);
          }
          
          // Also notify 5 minutes before
          if (minutesUntilDelivery === 5) {
            showDeliveryNotification(order, true);
          }
        }
      });
    };
    
    // Initial check
    checkUpcomingDeliveries();
    
    // Check every minute
    const interval = setInterval(checkUpcomingDeliveries, 60000);
    
    return () => clearInterval(interval);
  }, [orders]);
  
  const parseDeliverySlot = (slotString) => {
    // Parse slot like "10:00-12:00" or "18:00-22:00"
    if (!slotString) return null;
    
    const startTime = slotString.split('-')[0].trim();
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const deliveryDate = new Date();
    deliveryDate.setHours(hours, minutes, 0, 0);
    
    return deliveryDate;
  };
  
  const showDeliveryNotification = (order, isUrgent = false) => {
    const notification = {
      id: `${order._id}-${Date.now()}`,
      order,
      isUrgent,
      message: isUrgent 
        ? `Your water delivery will arrive in 5 minutes!` 
        : `Your water delivery will arrive in 15 minutes.`,
      timestamp: new Date()
    };
    
    setCurrentNotification(notification);
    setShowNotification(true);
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Amanzi Ordering System - Delivery Alert', {
        body: notification.message,
        icon: '/water-icon.png',   //Add mine later
        badge: '/water-badge.png',
        tag: `delivery-${order._id}`,
        requireInteraction: isUrgent
      });
    }
    
    setNotifications(prev => [notification, ...prev]);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 30000);
  };
  
  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  
  const dismissNotification = () => {
    setShowNotification(false);
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <>
      {/* Popup Notification */}
      {showNotification && currentNotification && (
        <div className={`notification-popup ${currentNotification.isUrgent ? 'urgent' : ''}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {currentNotification.isUrgent ? '🚨' : '🚰'}
            </div>
            <div className="notification-message">
              <h3>{currentNotification.isUrgent ? 'Urgent Delivery Alert!' : 'Delivery Reminder'}</h3>
              <p>{currentNotification.message}</p>
              <div className="notification-details">
                <p><strong>Quantity:</strong> {currentNotification.order.quantity} Liters</p>
                <p><strong>Delivery Slot:</strong> {currentNotification.order.deliverySlot}</p>
                <p><strong>Location:</strong> {currentNotification.order.residence}</p>
              </div>
              <p className="notification-instruction">
                Please be ready at your residence to receive your water delivery.
              </p>
            </div>
            <button 
              className="notification-close"
              onClick={dismissNotification}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Notification History */}
      {notifications.length > 0 && (
        <div className="notification-history">
          <h3>Recent Notifications</h3>
          <div className="notification-list">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-time">
                  {formatTime(notification.timestamp)}
                </div>
                <div className="notification-text">
                  {notification.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerNotification;