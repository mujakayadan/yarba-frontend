import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { EventAvailable, Forum } from '@mui/icons-material';
import {
  PortfolioChatConversationDetailResponse,
  PortfolioChatConversationSummary,
  PortfolioChatStats,
} from '../../types/models';
import { getChatConversation, listChatConversations } from '../../services/websiteService';

interface WebsiteChatInsightsProps {
  enabled: boolean;
  storageEnabled: boolean;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const StatsRow: React.FC<{ stats: PortfolioChatStats }> = ({ stats }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Total conversations
      </Typography>
      <Typography variant="h5">{stats.total_conversations}</Typography>
    </Paper>
    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        This week
      </Typography>
      <Typography variant="h5">{stats.conversations_this_week}</Typography>
    </Paper>
    <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Messages stored
      </Typography>
      <Typography variant="h5">{stats.total_messages}</Typography>
    </Paper>
  </Stack>
);

const ConversationDialog: React.FC<{
  open: boolean;
  detail: PortfolioChatConversationDetailResponse | null;
  loading: boolean;
  onClose: () => void;
}> = ({ open, detail, loading, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Visitor conversation</DialogTitle>
    <DialogContent dividers>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && detail && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Started ${formatDate(detail.started_at)}`} />
            <Chip size="small" label={`${detail.message_count} messages`} />
            {detail.calendly_mentioned && (
              <Chip
                size="small"
                color="success"
                icon={<EventAvailable />}
                label="Scheduling mentioned"
              />
            )}
          </Stack>
          {(detail.referrer || detail.user_agent) && (
            <Typography variant="caption" color="text.secondary" display="block">
              {detail.referrer ? `Referrer: ${detail.referrer}` : null}
              {detail.referrer && detail.user_agent ? ' · ' : null}
              {detail.user_agent ? `Browser: ${detail.user_agent}` : null}
            </Typography>
          )}
          <Divider />
          {detail.messages.map((message, index) => (
            <Box
              key={`${message.created_at}-${index}`}
              sx={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {message.role === 'user' ? 'Visitor' : 'Assistant'} ·{' '}
                {formatDate(message.created_at)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </DialogContent>
  </Dialog>
);

export const WebsiteChatInsights: React.FC<WebsiteChatInsightsProps> = ({
  enabled,
  storageEnabled,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PortfolioChatStats | null>(null);
  const [conversations, setConversations] = useState<PortfolioChatConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PortfolioChatConversationDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!enabled || !storageEnabled) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await listChatConversations();
      setStats(data.stats);
      setConversations(data.conversations);
    } catch {
      setError('Unable to load chat conversations.');
    } finally {
      setLoading(false);
    }
  }, [enabled, storageEnabled]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const openConversation = async (conversationId: string) => {
    setSelectedId(conversationId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getChatConversation(conversationId);
      setDetail(data);
    } catch {
      setDetail(null);
      setError('Unable to load conversation details.');
    } finally {
      setDetailLoading(false);
    }
  };

  if (!enabled || !storageEnabled) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 3 }} />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Forum color="primary" />
        <Typography variant="h6">Visitor Conversations</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review what visitors asked your portfolio chatbot. Conversations are kept for 90 days.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && stats && <StatsRow stats={stats} />}

      {!loading && conversations.length === 0 && (
        <Alert severity="info">No stored conversations yet. They will appear after visitors chat.</Alert>
      )}

      {!loading && conversations.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Last active</TableCell>
                <TableCell>Preview</TableCell>
                <TableCell align="right">Messages</TableCell>
                <TableCell align="center">Scheduling</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conversations.map((conversation) => (
                <TableRow
                  key={conversation.conversation_id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => void openConversation(conversation.conversation_id)}
                >
                  <TableCell>{formatDate(conversation.last_message_at)}</TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="body2" noWrap title={conversation.preview}>
                      {conversation.preview || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{conversation.message_count}</TableCell>
                  <TableCell align="center">
                    {conversation.calendly_mentioned ? (
                      <Chip size="small" color="success" label="Yes" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConversationDialog
        open={Boolean(selectedId)}
        detail={detail}
        loading={detailLoading}
        onClose={() => {
          setSelectedId(null);
          setDetail(null);
        }}
      />
    </Box>
  );
};

export default WebsiteChatInsights;
