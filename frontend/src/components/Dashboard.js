import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  TruckIcon,
  ArchiveBoxIcon 
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalProducts: 0,
      lowStockItems: 0,
      totalSuppliers: 0,
      totalValue: 0
    },
    stockData: {
      labels: [],
      datasets: []
    },
    recentTransactions: [],
    stockDistribution: {
      labels: [],
      datasets: []
    },
    lowStockProducts: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/dashboard');
      
      // Transform the data for charts
      const stockData = {
        labels: response.data.stockHistory.map(item => item.date),
        datasets: [{
          label: 'Stock Value',
          data: response.data.stockHistory.map(item => item.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4
        }]
      };

      const stockDistribution = {
        labels: response.data.categoryDistribution.map(item => item.category),
        datasets: [{
          data: response.data.categoryDistribution.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderWidth: 1
        }]
      };

      setDashboardData({
        summary: response.data.summary,
        stockData,
        recentTransactions: response.data.recentTransactions,
        stockDistribution,
        lowStockProducts: response.data.lowStockProducts
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-red-800">{error}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Products"
          value={dashboardData.summary.totalProducts}
          icon={<ArchiveBoxIcon className="h-6 w-6" />}
          trend={"+5%"}
          bgColor="bg-blue-500"
        />
        <SummaryCard
          title="Low Stock Items"
          value={dashboardData.summary.lowStockItems}
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          trend={dashboardData.summary.lowStockItems > 5 ? "Critical" : "Normal"}
          bgColor="bg-red-500"
          isAlert={true}
        />
        <SummaryCard
          title="Total Suppliers"
          value={dashboardData.summary.totalSuppliers}
          icon={<TruckIcon className="h-6 w-6" />}
          trend={"+2"}
          bgColor="bg-green-500"
        />
        <SummaryCard
          title="Inventory Value"
          value={`$${dashboardData.summary.totalValue.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          trend={"+12.5%"}
          bgColor="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Value Trend</h3>
          <div className="h-64">
            <Line
              data={dashboardData.stockData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      drawBorder: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={dashboardData.stockDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {dashboardData.lowStockProducts.map((product, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Current Stock: {product.currentStock} (Min: {product.minStock})
                        </p>
                      </div>
                      <div>
                        <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                          Reorder
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {dashboardData.recentTransactions.map((transaction, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">
                          {transaction.type === 'IN' ? '📥' : '📤'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.type === 'IN' ? 'Received' : 'Shipped'}: {transaction.quantity} units
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, trend, bgColor, isAlert = false }) => (
  <div className={`rounded-lg shadow overflow-hidden`}>
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
          <div className="text-white">{icon}</div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className={`text-2xl font-semibold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>
                {value}
              </div>
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                isAlert ? 'text-red-600' : 'text-green-600'
              }`}>
                {trend}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;