import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data - in real app, this would come from API
  const mockInventory = [
    {
      id: 1,
      style: 'MONACO',
      variantCode: '549.L',
      description: 'MONACO - WOMEN\'S LEATHER JACKETS IN DARK TAUPE',
      category: 'WOMEN\'S LEATHER JACKETS',
      price: 768.25,
      quantity: 441,
      value: 338798.25,
      tier: 'best_sellers',
      reorderQuantity: 660,
    },
    {
      id: 2,
      style: 'AERYN',
      variantCode: '730.S',
      description: 'AERYN - WOMEN\'S LEATHER JACKETS IN EGGPLANT',
      category: 'WOMEN\'S LEATHER JACKETS',
      price: 792.91,
      quantity: 397,
      value: 314785.27,
      tier: 'best_sellers',
      reorderQuantity: 660,
    },
    {
      id: 3,
      style: 'MARIAM',
      variantCode: '440NS',
      description: 'MARIAM - WOMEN\'S HANDBAGS IN BLACK',
      category: 'WOMEN\'S HANDBAGS',
      price: 199.00,
      quantity: 523,
      value: 104077.00,
      tier: 'best_sellers',
      reorderQuantity: 390,
    },
    {
      id: 4,
      style: 'EDITH',
      variantCode: '620.NS',
      description: 'EDITH - WOMEN\'S HANDBAGS IN SADDLE',
      category: 'WOMEN\'S HANDBAGS',
      price: 199.00,
      quantity: 412,
      value: 81988.00,
      tier: 'doing_good',
      reorderQuantity: 300,
    },
    {
      id: 5,
      style: 'ELIAM',
      variantCode: '660.NS',
      description: 'ELIAM - MEN\'S LAPTOP BAGS IN BROWN',
      category: 'MEN\'S LAPTOP BAGS',
      price: 349.00,
      quantity: 156,
      value: 54444.00,
      tier: 'making_progress',
      reorderQuantity: 240,
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'best_sellers':
        return 'success';
      case 'doing_good':
        return 'primary';
      case 'making_progress':
        return 'warning';
      case 'okay':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.replace('_', ' ').toUpperCase();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch = 
      item.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variantCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || item.tier === filterTier;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesTier && matchesCategory;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Box>
          <Tooltip title="Export Data">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Items"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tier Filter</InputLabel>
                <Select
                  value={filterTier}
                  label="Tier Filter"
                  onChange={(e) => setFilterTier(e.target.value)}
                >
                  <MenuItem value="all">All Tiers</MenuItem>
                  <MenuItem value="best_sellers">Best Sellers</MenuItem>
                  <MenuItem value="doing_good">Doing Good</MenuItem>
                  <MenuItem value="making_progress">Making Progress</MenuItem>
                  <MenuItem value="okay">Okay</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Category Filter</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category Filter"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="WOMEN'S LEATHER JACKETS">Women's Leather Jackets</MenuItem>
                  <MenuItem value="WOMEN'S HANDBAGS">Women's Handbags</MenuItem>
                  <MenuItem value="MEN'S LAPTOP BAGS">Men's Laptop Bags</MenuItem>
                  <MenuItem value="WOMEN'S COATS">Women's Coats</MenuItem>
                  <MenuItem value="WALLETS & ACCESSORIES">Wallets & Accessories</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterTier('all');
                  setFilterCategory('all');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4">
                {formatNumber(filteredInventory.length)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(filteredInventory.reduce((sum, item) => sum + item.value, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Quantity
              </Typography>
              <Typography variant="h4">
                {formatNumber(filteredInventory.reduce((sum, item) => sum + item.quantity, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Price
              </Typography>
              <Typography variant="h4">
                {formatCurrency(
                  filteredInventory.length > 0
                    ? filteredInventory.reduce((sum, item) => sum + item.price, 0) / filteredInventory.length
                    : 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventory Items ({filteredInventory.length} items)
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Style</TableCell>
                  <TableCell>Variant</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell align="right">Reorder Qty</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.style}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.variantCode}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {item.category}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={item.quantity <= 50 ? 'error' : item.quantity <= 100 ? 'warning' : 'success'}
                        fontWeight="bold"
                      >
                        {formatNumber(item.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.value)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTierLabel(item.tier)}
                        color={getTierColor(item.tier) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="textSecondary">
                        {formatNumber(item.reorderQuantity)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Inventory; 