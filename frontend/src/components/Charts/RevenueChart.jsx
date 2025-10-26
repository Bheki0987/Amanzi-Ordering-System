import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueChart = ({ orders }) => {
  // Group orders by date and calculate revenue
  const revenueByDate = orders.reduce((acc, order) => {
    // Format date to YYYY-MM-DD
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const revenue = order.totalPrice || (order.quantity * 4); // R4 per liter if totalPrice not available
    
    if (!acc[orderDate]) {
      acc[orderDate] = 0;
    }
    
    acc[orderDate] += revenue;
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(revenueByDate).sort();
  
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Daily Revenue (R)',
        data: sortedDates.map(date => revenueByDate[date]),
        borderColor: '#10b981', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Revenue',
        font: {
          size: 16,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R${value}`
        }
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;