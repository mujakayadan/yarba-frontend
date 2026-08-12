import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { isChunkLoadError } from '../../utils/chunkLoadRecovery';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('ErrorBoundary');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    debug.error(
      `Unhandled application error: ${error.message}\n${error.stack ?? ''}\n${
        errorInfo.componentStack ?? ''
      }`
    );
  }

  handleRetry = (): void => {
    if (isChunkLoadError({ message: this.state.message })) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const chunkStale = isChunkLoadError({ message: this.state.message });

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 560, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {chunkStale ? 'Update required' : 'Something went wrong'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {chunkStale
                ? 'The app was updated while you had this page open. Refresh to load the latest version.'
                : this.state.message || 'An unexpected error occurred.'}
            </Typography>
            <Button variant="outlined" color="inherit" onClick={this.handleRetry}>
              {chunkStale ? 'Refresh page' : 'Try again'}
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
