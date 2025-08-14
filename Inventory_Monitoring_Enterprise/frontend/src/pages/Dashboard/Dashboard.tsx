import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Inventory,
  AttachMoney,
  Refresh,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard: React.FC = () => {
  // Mock data - in real app, this would come from API
  const mockData = {
    totalItems: 1000,
    totalValue: 116723068.85,
    totalQuantity: 338287,
    alerts: 882,
    tierDistribution: [
      { name: 'Best Sellers', value: 855, color: '#4caf50' },
      { name: 'Doing Good', value: 125, color: '#2196f3' },
      { name: 'Making Progress', value: 20, color: '#ff9800' },
    ],
    topItems: [
      { name: 'MONACO Jacket', value: 338798, quantity: 441 },
      { name: 'AERYN Jacket', value: 314785, quantity: 397 },
      { name: 'ALYSON Jacket', value: 298456, quantity: 356 },
      { name: 'MARIAM Bag', value: 245678, quantity: 523 },
      { name: 'EDITH Bag', value: 198234, quantity: 412 },
    ],
    alertSummary: [
      { type: 'Critical Stock', count: 45, color: '#f44336' },
      { type: 'Low Stock', count: 156, color: '#ff9800' },
      { type: 'Reorder', count: 681, color: '#2196f3' },
    ],
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Inventory color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Items
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {formatNumber(mockData.totalItems)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  +2.5%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {formatCurrency(mockData.totalValue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  +5.2%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Inventory color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Quantity
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {formatNumber(mockData.totalQuantity)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDown color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2" color="error.main">
                  -1.8%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Active Alerts
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {mockData.alerts}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Warning color="warning" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2" color="warning.main">
                  +12 new
                </Typography>
              </Box>
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
                    data={mockData.tierDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockData.tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Items by Value */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Items by Value
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alert Summary
              </Typography>
              <Grid container spacing={2}>
                {mockData.alertSummary.map((alert) => (
                  <Grid item xs={12} sm={4} key={alert.type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: alert.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {alert.type}
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      {alert.count}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(alert.count / mockData.alerts) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 