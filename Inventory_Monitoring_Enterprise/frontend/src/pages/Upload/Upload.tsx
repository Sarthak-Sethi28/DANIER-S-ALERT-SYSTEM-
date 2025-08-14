import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const Upload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    status: 'success' | 'error';
    message: string;
  }>>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate file upload process
    acceptedFiles.forEach((file, index) => {
      const timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setUploadStatus('success');
            
            // Add file to uploaded files list
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              size: file.size,
              status: 'success',
              message: 'File uploaded successfully and processed by ETL pipeline'
            }]);
            
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: true,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: 'success' | 'error') => {
    return status === 'success' ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const getStatusColor = (status: 'success' | 'error') => {
    return status === 'success' ? 'success' : 'error';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        File Upload
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Area */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Inventory Files
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Upload Excel files (.xlsx, .xls) or CSV files to process inventory data through the ETL pipeline.
              </Typography>

              <Paper
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  or click to select files
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Select Files
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Supported formats: .xlsx, .xls, .csv
                </Typography>
              </Paper>

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploading files...
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" color="textSecondary">
                    {uploadProgress}% complete
                  </Typography>
                </Box>
              )}

              {/* Upload Status */}
              {uploadStatus === 'success' && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  Files uploaded successfully! The ETL pipeline is processing your data.
                </Alert>
              )}

              {uploadStatus === 'error' && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  Upload failed. Please try again.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upload History */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload History
              </Typography>
              
              {uploadedFiles.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                  No files uploaded yet
                </Typography>
              ) : (
                <List>
                  {uploadedFiles.map((file, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(file.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {formatFileSize(file.size)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {file.message}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={file.status.toUpperCase()}
                        color={getStatusColor(file.status) as any}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Instructions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    File Requirements:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="Excel files (.xlsx, .xls) or CSV files" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="Maximum file size: 50MB" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="Must contain inventory data columns" />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Processing Steps:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="File validation and format check" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="ETL pipeline processing" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Intelligent categorization and alerts" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Results available in dashboard" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload; 