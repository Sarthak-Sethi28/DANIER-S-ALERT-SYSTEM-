import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const Analytics: React.FC = () => {
  // Mock data - in real app, this would come from API
  const tierData = [
    { name: 'Best Sellers', value: 855, color: '#4caf50' },
    { name: 'Doing Good', value: 125, color: '#2196f3' },
    { name: 'Making Progress', value: 20, color: '#ff9800' },
  ];

  const categoryData = [
    { name: "Women's Leather Jackets", value: 45, color: '#f44336' },
    { name: "Women's Handbags", value: 35, color: '#e91e63' },
    { name: "Men's Laptop Bags", value: 15, color: '#9c27b0' },
    { name: "Women's Coats", value: 5, color: '#673ab7' },
  ];

  const monthlyTrends = [
    { month: 'Jan', value: 120000, alerts: 45 },
    { month: 'Feb', value: 135000, alerts: 52 },
    { month: 'Mar', value: 142000, alerts: 48 },
    { month: 'Apr', value: 158000, alerts: 61 },
    { month: 'May', value: 165000, alerts: 55 },
    { month: 'Jun', value: 172000, alerts: 67 },
    { month: 'Jul', value: 185000, alerts: 73 },
  ];

  const topPerformers = [
    { name: 'MONACO Jacket', value: 338798, quantity: 441 },
    { name: 'AERYN Jacket', value: 314785, quantity: 397 },
    { name: 'ALYSON Jacket', value: 298456, quantity: 356 },
    { name: 'MARIAM Bag', value: 245678, quantity: 523 },
    { name: 'EDITH Bag', value: 198234, quantity: 412 },
  ];

  const alertTrends = [
    { day: 'Mon', critical: 12, low: 25, reorder: 45 },
    { day: 'Tue', critical: 8, low: 18, reorder: 38 },
    { day: 'Wed', critical: 15, low: 22, reorder: 52 },
    { day: 'Thu', critical: 10, low: 20, reorder: 41 },
    { day: 'Fri', critical: 18, low: 28, reorder: 58 },
    { day: 'Sat', critical: 5, low: 12, reorder: 25 },
    { day: 'Sun', critical: 3, low: 8, reorder: 15 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics & Insights
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Inventory Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(116723068.85)}
              </Typography>
              <Typography variant="body2" color="success.main">
                +5.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4">
                {formatNumber(1000)}
              </Typography>
              <Typography variant="body2" color="success.main">
                +2.5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatNumber(882)}
              </Typography>
              <Typography variant="body2" color="error.main">
                +12 new today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Best Sellers
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatNumber(855)}
              </Typography>
              <Typography variant="body2" color="success.main">
                85.5% of inventory
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Tier Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tier Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Inventory Value Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="value" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Trends */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Alert Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alertTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="critical" stroke="#f44336" strokeWidth={2} />
                  <Line type="monotone" dataKey="low" stroke="#ff9800" strokeWidth={2} />
                  <Line type="monotone" dataKey="reorder" stroke="#2196f3" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Items by Value
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topPerformers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 