import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DeliverySlotChart = ({ orders }) => {
  // Process data for the chart
  const slotCounts = orders.reduce((acc, order) => {
    const slot = order.deliverySlot || 'Unknown';
    acc[slot] = (acc[slot] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(slotCounts);
  const data = Object.values(slotCounts);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders by Delivery Slot',
        data,
        backgroundColor: [
          'rgba(37, 99, 235, 0.7)', // Blue
          'rgba(245, 158, 11, 0.7)', // Amber
        ],
        borderColor: [
          '#2563eb',
          '#d97706',
        ],
        borderWidth: 1,
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
        text: 'Orders by Delivery Slot',
        font: {
          size: 16,
        }
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default DeliverySlotChart;