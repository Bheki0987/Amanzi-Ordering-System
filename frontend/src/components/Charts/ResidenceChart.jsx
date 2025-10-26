import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResidenceChart = ({ orders }) => {
  // Process data for the chart
  const residenceCounts = orders.reduce((acc, order) => {
    const residence = order.residence || 'Unknown';
    acc[residence] = (acc[residence] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(residenceCounts);
  const data = Object.values(residenceCounts);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders by Residence',
        data,
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: '#2563eb',
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
        text: 'Orders by Residence',
        font: {
          size: 16,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ResidenceChart;