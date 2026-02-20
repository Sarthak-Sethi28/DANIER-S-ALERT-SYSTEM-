import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailGroup {
  name: string;
  emails: string[];
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedAlertType, setSelectedAlertType] = useState('critical_stock');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock data - in real app, this would come from API
  const [emailRecipients, setEmailRecipients] = useState({
    critical_stock: [
      { email: 'inventory-manager@danier.com', name: 'Inventory Manager' },
      { email: 'operations-director@danier.com', name: 'Operations Director' },
    ],
    low_stock: [
      { email: 'inventory-team@danier.com', name: 'Inventory Team' },
      { email: 'purchasing@danier.com', name: 'Purchasing Team' },
    ],
    reorder: [
      { email: 'purchasing@danier.com', name: 'Purchasing Team' },
      { email: 'supply-chain@danier.com', name: 'Supply Chain' },
    ],
    daily_digest: [
      { email: 'management@danier.com', name: 'Management' },
      { email: 'inventory-manager@danier.com', name: 'Inventory Manager' },
    ],
  });

  const [emailGroups, setEmailGroups] = useState<EmailGroup[]>([
    {
      name: 'management',
      emails: ['ceo@danier.com', 'operations-director@danier.com', 'inventory-director@danier.com'],
    },
    {
      name: 'inventory_team',
      emails: ['inventory-manager@danier.com', 'inventory-specialist@danier.com'],
    },
    {
      name: 'purchasing_team',
      emails: ['purchasing-manager@danier.com', 'purchasing-specialist@danier.com'],
    },
  ]);

  const alertTypes = [
    { key: 'critical_stock', label: 'Critical Stock Alerts', description: 'Items with ≤10 units' },
    { key: 'low_stock', label: 'Low Stock Alerts', description: 'Items with ≤50 units' },
    { key: 'reorder', label: 'Reorder Alerts', description: 'Items below tier thresholds' },
    { key: 'daily_digest', label: 'Daily Digest', description: 'Morning summary reports' },
  ];

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    if (!isValidEmail(newEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    const newRecipient: EmailRecipient = {
      email: newEmail.trim(),
      name: newName.trim() || undefined,
    };

    setEmailRecipients(prev => ({
      ...prev,
      [selectedAlertType]: [...(prev[selectedAlertType] || []), newRecipient],
    }));

    setNewEmail('');
    setNewName('');
    setMessage({ type: 'success', text: 'Email added successfully!' });
  };

  const handleRemoveEmail = (alertType: string, email: string) => {
    setEmailRecipients(prev => ({
      ...prev,
      [alertType]: prev[alertType].filter(recipient => recipient.email !== email),
    }));
    setMessage({ type: 'success', text: 'Email removed successfully!' });
  };

  const handleAddGroup = () => {
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a group name' });
      return;
    }

    if (emailGroups.some(group => group.name === newName.trim())) {
      setMessage({ type: 'error', text: 'Group name already exists' });
      return;
    }

    setEmailGroups(prev => [...prev, { name: newName.trim(), emails: [] }]);
    setNewName('');
    setMessage({ type: 'success', text: 'Group added successfully!' });
  };

  const handleAddEmailToGroup = (groupName: string, email: string) => {
    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setEmailGroups(prev =>
      prev.map(group =>
        group.name === groupName
          ? { ...group, emails: [...group.emails, email] }
          : group
      )
    );
    setMessage({ type: 'success', text: 'Email added to group successfully!' });
  };

  const handleRemoveEmailFromGroup = (groupName: string, email: string) => {
    setEmailGroups(prev =>
      prev.map(group =>
        group.name === groupName
          ? { ...group, emails: group.emails.filter(e => e !== email) }
          : group
      )
    );
    setMessage({ type: 'success', text: 'Email removed from group successfully!' });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveSettings = () => {
    // In real app, this would save to backend
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Email Recipients" icon={<EmailIcon />} />
          <Tab label="Email Groups" icon={<GroupIcon />} />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alert Types
                </Typography>
                <List>
                  {alertTypes.map((alertType) => (
                    <ListItem
                      key={alertType.key}
                      button
                      selected={selectedAlertType === alertType.key}
                      onClick={() => setSelectedAlertType(alertType.key)}
                    >
                      <ListItemText
                        primary={alertType.label}
                        secondary={alertType.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recipients for {alertTypes.find(t => t.key === selectedAlertType)?.label}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Name (Optional)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddEmail}
                        sx={{ height: '56px' }}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List>
                  {emailRecipients[selectedAlertType]?.map((recipient, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={recipient.email}
                        secondary={recipient.name}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveEmail(selectedAlertType, recipient.email)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {(!emailRecipients[selectedAlertType] || emailRecipients[selectedAlertType].length === 0) && (
                  <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                    No recipients configured for this alert type
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add New Group
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Group Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddGroup}
                >
                  Create Group
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Email Groups
                </Typography>
                <List>
                  {emailGroups.map((group) => (
                    <ListItem key={group.name}>
                      <ListItemText
                        primary={group.name.replace('_', ' ').toUpperCase()}
                        secondary={`${group.emails.length} members`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manage Group Members
                </Typography>

                {emailGroups.map((group) => (
                  <Box key={group.name} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {group.name.replace('_', ' ').toUpperCase()}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="Add Email to Group"
                            placeholder="Enter email address"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                handleAddEmailToGroup(group.name, target.value);
                                target.value = '';
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input') as HTMLInputElement;
                              if (input) {
                                handleAddEmailToGroup(group.name, input.value);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {group.emails.map((email, index) => (
                        <Chip
                          key={index}
                          label={email}
                          onDelete={() => handleRemoveEmailFromGroup(group.name, email)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    {group.emails.length === 0 && (
                      <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                        No members in this group
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          size="large"
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 