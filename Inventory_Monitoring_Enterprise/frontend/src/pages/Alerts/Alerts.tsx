import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Alerts: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data - in real app, this would come from API
  const mockAlerts = [
    {
      id: 1,
      type: 'critical_stock',
      severity: 'critical',
      title: 'Critical Stock Alert',
      message: 'MONACO Jacket (549.L) has only 5 units remaining!',
      item: 'MONACO - 549.L',
      currentStock: 5,
      recommendedAction: 'Immediate reorder of 660 units recommended.',
      timestamp: '2025-07-22 14:30:00',
      status: 'pending',
    },
    {
      id: 2,
      type: 'low_stock',
      severity: 'warning',
      title: 'Low Stock Alert',
      message: 'AERYN Jacket (730.S) has 25 units remaining.',
      item: 'AERYN - 730.S',
      currentStock: 25,
      recommendedAction: 'Consider reordering 660 units.',
      timestamp: '2025-07-22 14:25:00',
      status: 'pending',
    },
    {
      id: 3,
      type: 'reorder',
      severity: 'info',
      title: 'Reorder Alert',
      message: 'MARIAM Bag (440NS) needs reorder.',
      item: 'MARIAM - 440NS',
      currentStock: 45,
      recommendedAction: 'Reorder 390 units based on best_sellers tier analysis.',
      timestamp: '2025-07-22 14:20:00',
      status: 'acknowledged',
    },
    {
      id: 4,
      type: 'critical_stock',
      severity: 'critical',
      title: 'Critical Stock Alert',
      message: 'EDITH Bag (620.NS) has only 3 units remaining!',
      item: 'EDITH - 620.NS',
      currentStock: 3,
      recommendedAction: 'Immediate reorder of 300 units recommended.',
      timestamp: '2025-07-22 14:15:00',
      status: 'pending',
    },
    {
      id: 5,
      type: 'reorder',
      severity: 'info',
      title: 'Reorder Alert',
      message: 'ELIAM Laptop Bag (660.NS) needs reorder.',
      item: 'ELIAM - 660.NS',
      currentStock: 78,
      recommendedAction: 'Reorder 240 units based on making_progress tier analysis.',
      timestamp: '2025-07-22 14:10:00',
      status: 'resolved',
    },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'error';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ErrorIcon color="error" />;
      case 'acknowledged':
        return <WarningIcon color="warning" />;
      case 'resolved':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesSeverity && matchesType;
  });

  const alertStats = {
    total: mockAlerts.length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
    warning: mockAlerts.filter(a => a.severity === 'warning').length,
    info: mockAlerts.filter(a => a.severity === 'info').length,
    pending: mockAlerts.filter(a => a.status === 'pending').length,
    acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
    resolved: mockAlerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Alert Management
        </Typography>
        <Tooltip title="Refresh Alerts">
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Alert Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Alerts
              </Typography>
              <Typography variant="h4">
                {alertStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Alerts
              </Typography>
              <Typography variant="h4" color="error.main">
                {alertStats.critical}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {alertStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h4" color="success.main">
                {alertStats.resolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Severity Filter</InputLabel>
                <Select
                  value={filterSeverity}
                  label="Severity Filter"
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type Filter</InputLabel>
                <Select
                  value={filterType}
                  label="Type Filter"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="critical_stock">Critical Stock</MenuItem>
                  <MenuItem value="low_stock">Low Stock</MenuItem>
                  <MenuItem value="reorder">Reorder</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setFilterSeverity('all');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alerts ({filteredAlerts.length} items)
          </Typography>
          <List>
            {filteredAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          color={getSeverityColor(alert.severity) as any}
                          size="small"
                        />
                        <Chip
                          label={alert.status.toUpperCase()}
                          color={getStatusColor(alert.status) as any}
                          size="small"
                          icon={getStatusIcon(alert.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          {alert.message}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Item:</strong> {alert.item} | <strong>Current Stock:</strong> {alert.currentStock} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Action:</strong> {alert.recommendedAction}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredAlerts.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
          {filteredAlerts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No alerts match the current filters
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Alerts; 