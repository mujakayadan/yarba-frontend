import React from 'react';
import { Box, Container, Divider, Link, List, ListItem, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_DOCUMENTS,
  LEGAL_NAV_ITEMS,
  type LegalDocumentKey,
} from '../../content/legalDocuments';

interface LegalDocumentPageProps {
  documentKey: LegalDocumentKey;
}

const renderText = (text: string) => {
  const emailIndex = text.indexOf(LEGAL_CONTACT_EMAIL);
  if (emailIndex === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, emailIndex)}
      <Link href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</Link>
      {text.slice(emailIndex + LEGAL_CONTACT_EMAIL.length)}
    </>
  );
};

const LegalDocumentPage: React.FC<LegalDocumentPageProps> = ({ documentKey }) => {
  const document = LEGAL_DOCUMENTS[documentKey];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Box component="header" sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {document.title}
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            maxWidth: 720,
            mx: 'auto',
            mb: 2,
          }}
        >
          {document.summary}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Version {document.version} · Last updated {document.lastUpdated}
        </Typography>
      </Box>

      <Paper component="article" variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
        {document.sections.map((section, index) => (
          <Box
            component="section"
            key={section.title}
            sx={{ mb: index === document.sections.length - 1 ? 0 : 5 }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              {section.title}
            </Typography>
            {section.paragraphs?.map((paragraph) => (
              <Typography
                key={paragraph}
                variant="body1"
                sx={{
                  marginBottom: '16px',
                }}
              >
                {renderText(paragraph)}
              </Typography>
            ))}
            {section.items ? (
              <List component="ul" sx={{ pl: 3, py: 0, listStyleType: 'disc' }}>
                {section.items.map((item) => (
                  <ListItem component="li" key={item} sx={{ display: 'list-item', pl: 0, py: 0.5 }}>
                    <Typography variant="body1">{renderText(item)}</Typography>
                  </ListItem>
                ))}
              </List>
            ) : null}
          </Box>
        ))}
      </Paper>

      <Divider sx={{ my: 4 }} />
      <Box
        component="nav"
        aria-label="Legal policies"
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}
      >
        {LEGAL_NAV_ITEMS.filter((item) => item.key !== documentKey).map((item) => (
          <Link key={item.key} component={RouterLink} to={item.path} underline="hover">
            {item.label}
          </Link>
        ))}
      </Box>
    </Container>
  );
};

export default LegalDocumentPage;
