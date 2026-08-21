export const LEGAL_VERSION = '2026-08-19';
export const LEGAL_LAST_UPDATED = 'August 19, 2026';
export const LEGAL_CONTACT_EMAIL = 'admin@yarba.app';

export type LegalDocumentKey =
  'terms' | 'privacy' | 'acceptable-use' | 'copyright' | 'ai-data-use' | 'site-privacy';

export interface LegalSection {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
}

export interface LegalDocument {
  key: LegalDocumentKey;
  title: string;
  summary: string;
  version: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
}

const sharedContact = `Questions, rights requests, and legal notices may be sent to ${LEGAL_CONTACT_EMAIL}.`;

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  terms: {
    key: 'terms',
    title: 'Terms of Service',
    summary:
      'These Terms govern Yarba accounts, AI-assisted career tools, application automation, and public portfolio websites.',
    version: LEGAL_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: '1. Agreement and related policies',
        paragraphs: [
          'These Terms of Service govern access to services operated under the Yarba name, including our applications, APIs, AI-assisted tools, document services, application automation, and public portfolio hosting.',
          'By creating an account or using the Services, you agree to these Terms and the Acceptable Use Policy and acknowledge the Privacy Policy, AI Data Use Notice, Copyright Policy, and any feature-specific notice shown when information is collected.',
        ],
      },
      {
        title: '2. Eligibility and accounts',
        paragraphs: [
          'You must be at least 13 years old. If you have not reached the age of legal majority where you live, you confirm that a parent or legal guardian has reviewed these Terms with you and has given any permission required by applicable law.',
          'You must provide accurate account information, protect your credentials and agent tokens, and promptly notify Yarba of suspected unauthorized access. You are responsible for activity performed through credentials or tokens you issue unless applicable law provides otherwise.',
        ],
      },
      {
        title: '3. The Services',
        paragraphs: [
          'Yarba provides tools for profiles, portfolios, resumes, cover letters, document parsing, public portfolio websites, visitor chat, job tracking, and authorized job-application assistance. Features may change, be limited, or be discontinued.',
          'Application automation acts only on your instructions. You are responsible for reviewing every answer and submission, complying with employer and third-party website rules, and completing any legally significant, eligibility, demographic, verification, or consent question yourself.',
        ],
      },
      {
        title: '4. AI-assisted output',
        paragraphs: [
          'AI output can be incomplete, inaccurate, biased, outdated, or unsuitable. Yarba does not guarantee employment, interviews, application outcomes, factual accuracy, legal compliance, or compatibility with applicant-tracking systems.',
          'You must review and approve generated material before using or publishing it. Do not present generated statements as true unless you have verified them. Yarba does not provide legal, immigration, financial, medical, or employment advice.',
        ],
      },
      {
        title: '5. Your content and permissions',
        paragraphs: [
          'You retain ownership of content you submit or create, subject to rights held by others. You grant Yarba a worldwide, non-exclusive, royalty-free license to host, copy, process, adapt, transmit, display, and generate derivative technical formats from that content only as needed to operate, secure, improve, and support the Services and your requested public website.',
          'You represent that you have the rights and permissions needed for your content, including information about employers, clients, references, collaborators, images, trademarks, and other people. You must not upload confidential or personal information that you are not authorized to process.',
        ],
      },
      {
        title: '6. Public portfolio websites',
        paragraphs: [
          'Publishing a portfolio makes selected profile and portfolio information publicly available at a yarba.app subdomain. Public information may be viewed globally, indexed, cached, copied, or archived by third parties. Deleting or unpublishing a site does not control copies already made by others.',
          'You are the publisher of your site content. Yarba does not endorse user sites. Subdomains remain controlled by Yarba, are not property, and may be renamed, reclaimed, suspended, or removed for security, legal, operational, trademark, inactivity, or policy reasons.',
        ],
      },
      {
        title: '7. Acceptable use and reports',
        paragraphs: [
          'You must follow the Acceptable Use Policy. Illegal content and sexually explicit content are prohibited. You may not use the Services for exploitation, non-consensual intimate imagery, infringement, impersonation, fraud, harassment, malware, credential theft, or evasion of safety controls.',
          'Yarba may investigate reports, preserve relevant evidence where lawful, restrict distribution, place content under review, suspend public access, remove content, limit features, or terminate accounts. Reporting content does not guarantee a particular outcome. Users may request review of ordinary moderation decisions by contacting Yarba.',
        ],
      },
      {
        title: '8. Intellectual property',
        paragraphs: [
          'Yarba and its licensors retain all rights in the Services, software, designs, models, documentation, and branding, excluding your content. No rights are granted except those expressly stated in these Terms.',
          'Copyright complaints and counter-notices are handled under the Copyright Policy. Yarba may terminate repeat infringers where appropriate.',
        ],
      },
      {
        title: '9. Third-party services',
        paragraphs: [
          'The Services may interact with identity providers, AI providers, hosting and storage providers, job websites, calendar links, and other third-party services. Their separate terms and privacy practices apply. Yarba is not responsible for third-party services or changes they make.',
        ],
      },
      {
        title: '10. Suspension and termination',
        paragraphs: [
          'You may stop using the Services at any time and may request account deletion through available settings. Yarba may restrict or terminate access when reasonably necessary to address a violation, security threat, legal request, nonpayment, operational risk, or harm to users or third parties.',
          'Where appropriate, Yarba will provide notice and an opportunity to appeal. Immediate action may be taken for urgent safety, security, exploitation, fraud, or legal risks. Provisions that by their nature should survive termination remain effective, including ownership, licenses already needed for legal compliance, disclaimers, liability limits, and dispute terms.',
        ],
      },
      {
        title: '11. Disclaimers',
        paragraphs: [
          'TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” YARBA DISCLAIMS IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
          'Yarba does not warrant uninterrupted or error-free operation, permanent storage, successful deployment, or that content will be immune from unauthorized access or third-party copying. Nothing in these Terms excludes a warranty or right that cannot lawfully be excluded.',
        ],
      },
      {
        title: '12. Limitation of liability',
        paragraphs: [
          'TO THE MAXIMUM EXTENT PERMITTED BY LAW, YARBA WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, OPPORTUNITIES, DATA, GOODWILL, OR BUSINESS INTERRUPTION.',
          'TO THE MAXIMUM EXTENT PERMITTED BY LAW, YARBA’S AGGREGATE LIABILITY ARISING FROM THE SERVICES WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID YARBA DURING THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR US$100. These limits do not apply where prohibited by law.',
        ],
      },
      {
        title: '13. Indemnity',
        paragraphs: [
          'To the extent permitted by law, you will defend and indemnify Yarba from third-party claims arising from your content, public site, misuse of the Services, violation of these Terms, or infringement of another person’s rights. This obligation does not apply to the extent a claim was caused by Yarba’s own unlawful conduct.',
        ],
      },
      {
        title: '14. Changes and disputes',
        paragraphs: [
          'Yarba may update these Terms prospectively. Material changes will be communicated through the Services or other reasonable means and may require renewed agreement. Changes do not retroactively authorize materially different uses of previously collected personal information.',
          'These Terms are governed by laws that apply to the relationship without overriding mandatory protections available where you live. Claims may be brought in a court or forum with lawful jurisdiction. Nothing here prevents either party from seeking urgent injunctive relief or using a legally available consumer dispute process.',
        ],
      },
      {
        title: '15. Contact',
        paragraphs: [sharedContact],
      },
    ],
  },
  privacy: {
    key: 'privacy',
    title: 'Privacy Policy',
    summary:
      'This Policy explains how Yarba collects, uses, shares, retains, and protects information about account holders and visitors.',
    version: LEGAL_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: '1. Scope and operator',
        paragraphs: [
          'Yarba operates the Services described in the Terms of Service. This Policy covers Yarba applications, APIs, support channels, public yarba.app portfolio sites, visitor chat, abuse reports, and related account and document services.',
          'A portfolio owner selects what to publish and receives contact initiated through their site. Yarba operates the hosting, public chat, reporting, and security infrastructure. Depending on the activity and applicable law, the portfolio owner and Yarba may each have responsibilities for personal information.',
        ],
      },
      {
        title: '2. Information we collect',
        items: [
          'Account and identity information, including name, email, username, authentication provider, verification state, and login activity.',
          'Profile and professional information, including contact details, employment, education, skills, projects, publications, life story, preferences, profile images, and signatures.',
          'Documents and generation inputs, including resumes, cover letters, job descriptions and URLs, uploaded PDF or DOCX files, extracted text, generated output, templates, and usage metadata.',
          'Application-automation information, including job records, work eligibility, salary and logistics preferences, optional demographic information, encrypted application credentials, consent records, and agent-token metadata.',
          'Public-site and visitor information, including published content, subdomain, configuration, chat messages, conversation identifiers, user agent, referrer, scheduling signals, and abuse-report details.',
          'Technical and security information, including IP address where needed for security or legal evidence, browser and device information, logs, cookie or local-storage identifiers, session data, and diagnostics.',
          'Communications and rights requests, including support messages, copyright notices, appeals, exports, deletion requests, and records needed to respond.',
        ],
      },
      {
        title: '3. Sources',
        paragraphs: [
          'We collect information directly from you, from visitors who interact with a public site, from identity providers you choose, from documents and URLs you ask us to process, from authorized agents using your tokens, and automatically from devices and service infrastructure.',
          'If you provide information about another person, you are responsible for having authority to do so and for giving any notice required by law.',
        ],
      },
      {
        title: '4. How and why we use information',
        items: [
          'Provide accounts, authentication, profiles, document tools, portfolio publishing, chat, application assistance, downloads, support, and requested exports or deletion.',
          'Generate and improve requested output, troubleshoot failures, measure feature performance, and maintain service reliability.',
          'Protect accounts and the public, prevent abuse and fraud, enforce policies, investigate reports, preserve evidence, and comply with law.',
          'Send transactional, security, policy, and support communications.',
          'Understand product use through optional analytics when enabled.',
        ],
        paragraphs: [
          'Where law requires a legal basis, processing may be necessary to perform our agreement with you, comply with law, protect legitimate interests in operating and securing the Services, protect vital interests, or act with consent. You may withdraw consent for future processing where consent is the basis.',
        ],
      },
      {
        title: '5. AI processing',
        paragraphs: [
          'Content you submit for generation, parsing, moderation, or public chat may be sent to AI providers through LiteLLM routing. Depending on configuration and the selected model, providers may include OpenAI, Anthropic, Google, Microsoft Azure, Cohere, or Mistral.',
          'Yarba does not operate a general-purpose foundation model trained on your private documents. Provider handling, retention, and model-improvement terms can vary by provider and account configuration, so you should not submit secrets or third-party confidential information that is unnecessary for your request.',
          'Yarba uses AI to draft and transform content and to support safety review. Yarba does not use AI to make employment decisions about you. You must review AI output before relying on it.',
        ],
      },
      {
        title: '6. Public information',
        paragraphs: [
          'Information selected for a public portfolio is disclosed publicly. Public sites may include contact links, professional history, projects, social links, images, and chatbot responses based on profile or portfolio information. Search engines and other parties may copy or retain public information.',
          'Visitor chat may disclose messages to the portfolio owner through the Yarba dashboard when conversation storage is enabled. A notice is shown before stored chat is used.',
        ],
      },
      {
        title: '7. Sharing',
        items: [
          'Service providers for hosting, storage, authentication, email, analytics, security, AI processing, document generation, and support.',
          'Portfolio owners, when visitors intentionally contact or chat with their public site.',
          'Authorities, courts, advisers, or affected parties when reasonably necessary to comply with law, protect rights and safety, or investigate abuse.',
          'A successor in a merger, financing, reorganization, or sale, subject to appropriate confidentiality and notice requirements.',
          'Other parties at your direction or with your consent.',
        ],
        paragraphs: [
          'Yarba does not sell personal information for money and does not use it for cross-context behavioral advertising. If this practice changes, we will provide legally required notice and choices before the change applies.',
        ],
      },
      {
        title: '8. Cookies, local storage, and analytics',
        paragraphs: [
          'Necessary storage includes authentication tokens, secure refresh cookies, OAuth state, session-recovery data, and temporary onboarding data needed to operate requested features. Disabling necessary storage may prevent the Services from working.',
          'Optional product analytics are disabled when you opt out in Privacy settings. Vercel Analytics may process limited page and device data when enabled. Firebase Analytics is not used unless it is separately enabled and disclosed.',
        ],
      },
      {
        title: '9. Retention',
        items: [
          'Account and user-created content: while the account is active and until deleted, subject to backups, legal holds, and security requirements.',
          'Stored public-chat conversations: 90 days after the most recent conversation activity.',
          'Temporary account-export archives: up to 7 days after completion.',
          'Closed abuse, copyright, and moderation records: generally up to 3 years, longer when required for a legal hold, repeat-infringer record, or active dispute.',
          'Security and authentication logs: generally up to 12 months unless a longer period is needed to investigate an incident.',
          'Backups and deletion queues: generally removed or overwritten within 30 days unless technically or legally required for longer.',
        ],
        paragraphs: [
          'Retention can be shorter or longer where required by law, needed to resolve a dispute, necessary to protect users, or requested through available deletion controls.',
        ],
      },
      {
        title: '10. Security',
        paragraphs: [
          'Yarba uses access controls, encryption in transit, encryption or hashing for designated sensitive fields, scoped tokens, logging controls, and service monitoring. No system can guarantee absolute security. Keep local downloads and public-site settings under your control and report suspected compromise promptly.',
        ],
      },
      {
        title: '11. Your choices and rights',
        items: [
          'Access, download, correct, or delete information through available account tools.',
          'Request a portable account export and request or cancel account deletion.',
          'Disable optional analytics and revoke agent tokens or optional demographic consent.',
          'Object to or restrict certain processing, withdraw consent, or appeal a denied privacy request where applicable.',
          'Complain to a data-protection authority or authorized regulator.',
        ],
        paragraphs: [
          'We may verify your identity and authority before completing a request. Some information may be retained when required by law, needed for security or legal claims, or exempt from deletion. We will not discriminate against you for exercising a privacy right.',
        ],
      },
      {
        title: '12. International transfers',
        paragraphs: [
          'Yarba and its providers may process information in countries other than your own. Where required, we rely on approved contractual safeguards, adequacy decisions, consent, or another lawful transfer mechanism.',
        ],
      },
      {
        title: '13. Children and teens',
        paragraphs: [
          'The Services are not for children under 13, and Yarba does not knowingly collect their personal information. Users aged 13 through 17 should review public publishing, chatbot storage, agent access, credentials, demographics, and application automation with a parent or guardian before enabling them.',
          'If you believe a child under 13 provided personal information, contact Yarba so we can investigate and delete it where required.',
        ],
      },
      {
        title: '14. Regional disclosures',
        paragraphs: [
          'Privacy rights differ by location. California and other applicable U.S. state laws may provide rights to know, correct, delete, obtain a copy, limit certain sensitive-data uses, opt out of sale or targeted advertising, and appeal. Yarba does not currently sell personal information or use it for targeted advertising.',
          'EEA, UK, and similar laws may provide rights of access, correction, erasure, portability, restriction, objection, consent withdrawal, and complaint. No solely automated Yarba decision produces a legal or similarly significant effect about a user.',
        ],
      },
      {
        title: '15. Changes and contact',
        paragraphs: [
          'We will update the version and date when this Policy changes. Material changes will be communicated before they take effect where required. We will not rely on a quiet policy update to retroactively authorize a materially different use of previously collected information.',
          sharedContact,
        ],
      },
    ],
  },
  'acceptable-use': {
    key: 'acceptable-use',
    title: 'Acceptable Use Policy',
    summary:
      'This Policy protects Yarba users, public-site visitors, employers, third parties, and service infrastructure.',
    version: LEGAL_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'This Policy applies to all Yarba accounts, content, uploads, generated output, agent activity, public portfolio sites, subdomains, chat messages, and uses of Yarba APIs or infrastructure.',
        ],
      },
      {
        title: '2. Prohibited content and conduct',
        items: [
          'Any content or conduct that violates applicable law or facilitates illegal activity.',
          'Pornography, sexually explicit content, sexual services, fetish content, or content primarily intended for sexual gratification, whether real or generated.',
          'Any sexual content involving a person under 18, grooming, exploitation, trafficking, or material that sexualizes minors.',
          'Non-consensual intimate imagery, threatened disclosure, voyeuristic material, or sexual deepfakes.',
          'Credible threats, incitement, targeted harassment, stalking, doxxing, or content that unlawfully promotes violence or hatred.',
          'Impersonation, deceptive affiliation, fabricated credentials, fraudulent applications, phishing, scams, spam, or manipulation of employers or visitors.',
          'Copyright, trademark, privacy, publicity, database, or other rights violations.',
          'Malware, credential theft, unauthorized access, destructive code, security testing without permission, or evasion of safeguards and rate limits.',
          'Illegal goods, controlled-substance sales, weapons trafficking, terrorism support, or instructions whose primary purpose is serious wrongdoing.',
          'Collection or publication of personal, confidential, health, financial, or employment information without adequate authority and safeguards.',
        ],
      },
      {
        title: '3. Career-content integrity',
        paragraphs: [
          'Do not invent qualifications, employment, education, licenses, clearances, eligibility, demographic answers, references, or application facts. AI-generated text must be reviewed and corrected before use.',
          'Do not automate acceptance of legally binding terms, attestations, background-check disclosures, voluntary self-identification, or questions requiring personal judgment. Follow employer and third-party website rules.',
        ],
      },
      {
        title: '4. Enforcement',
        paragraphs: [
          'Yarba may use automated and human review, limit distribution, reject processing, place a site under review, preserve evidence, suspend public access, remove content, revoke tokens, restrict features, or terminate accounts. Severe exploitation, security, fraud, or legal risks may be acted on immediately.',
          'Reports alone do not automatically establish a violation. Yarba considers available context, applicable law, safety, and repeat behavior. Ordinary moderation decisions may be appealed through the contact address below.',
        ],
      },
      {
        title: '5. Reporting',
        paragraphs: [
          'Use the public Report Abuse page to identify the specific site, URL, content, and reason for a report. For imminent danger, contact local emergency services first. For copyright claims, use the Copyright Policy process.',
          sharedContact,
        ],
      },
    ],
  },
  copyright: {
    key: 'copyright',
    title: 'Copyright and Takedown Policy',
    summary:
      'This Policy explains how to report copyright infringement and respond to a removal notice.',
    version: LEGAL_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: '1. Respect for intellectual property',
        paragraphs: [
          'Yarba prohibits use of the Services to infringe copyright or related rights. Account holders must have permission to publish text, images, logos, documents, code, and other protected material.',
        ],
      },
      {
        title: '2. Copyright notice',
        paragraphs: [
          `Send a written notice to ${LEGAL_CONTACT_EMAIL} with the subject “Copyright Notice.” Include: identification of the protected work; the exact Yarba URL or subdomain and material to be removed; your contact information; a good-faith statement that the use is not authorized; a statement under penalty of perjury that the notice is accurate and you are authorized to act; and your physical or electronic signature.`,
          'A knowingly false notice may create legal liability. Yarba may provide the notice to the affected user and to transparency or legal-reporting services where lawful.',
        ],
      },
      {
        title: '3. Counter-notice',
        paragraphs: [
          `If content was removed by mistake or misidentification, send a counter-notice to ${LEGAL_CONTACT_EMAIL} with the subject “Copyright Counter-Notice.” Include the removed material and prior location; your name, address, and telephone number; the legally required good-faith and jurisdiction statements applicable to your request; consent to service of process where required; and your signature.`,
          'Yarba may restore content after the legally required waiting period unless the claimant provides notice of a court action. Restoration remains subject to the Terms and Acceptable Use Policy.',
        ],
      },
      {
        title: '4. Repeat infringement',
        paragraphs: [
          'Yarba may terminate accounts or public sites of repeat infringers in appropriate circumstances and may consider valid notices, retractions, counter-notices, court findings, and other reliable evidence.',
        ],
      },
      {
        title: '5. Other rights',
        paragraphs: [
          'Trademark, privacy, impersonation, non-consensual imagery, and other complaints should use the Report Abuse page rather than a copyright notice.',
        ],
      },
    ],
  },
  'ai-data-use': {
    key: 'ai-data-use',
    title: 'AI Data Use Notice',
    summary:
      'This Notice describes what Yarba sends to AI services, why it is sent, and what users should review.',
    version: LEGAL_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: '1. AI-assisted features',
        items: [
          'Resume, cover-letter, portfolio, and career-content generation or revision.',
          'PDF and DOCX text extraction and structured portfolio import.',
          'Job-description extraction and tailoring.',
          'Public portfolio chatbot responses and scheduling assistance.',
          'Content-safety classification for public or submitted material.',
        ],
      },
      {
        title: '2. Information sent',
        paragraphs: [
          'A request may include the prompt, relevant profile and portfolio fields, life story, job description, document text, selected chat history, requested preferences, and operational metadata needed to route and secure the request. Yarba limits context to what the feature is designed to use, but generated features can involve substantial personal information.',
        ],
      },
      {
        title: '3. Providers and model improvement',
        paragraphs: [
          'Yarba routes requests through LiteLLM to configured providers that may include OpenAI, Anthropic, Google, Microsoft Azure, Cohere, or Mistral. The provider used can depend on configuration, availability, and the selected model.',
          'Yarba does not train its own general-purpose foundation model on private user documents. Third-party API retention and model-improvement practices depend on the provider, contract, and account configuration. Yarba sends information to providers to deliver and secure the requested feature, subject to the provider arrangements in effect for that service.',
        ],
      },
      {
        title: '4. User controls and responsibilities',
        paragraphs: [
          'Do not submit passwords, authentication tokens, unnecessary government identifiers, medical records, third-party confidential data, or information you lack authority to process. Remove unnecessary details before uploading a document.',
          'AI output is a draft. Verify facts, dates, qualifications, links, eligibility answers, legal statements, and claims before publishing or submitting it. You remain responsible for how output is used.',
        ],
      },
      {
        title: '5. Automated decisions and safety',
        paragraphs: [
          'Yarba does not make hiring or employment decisions. Safety systems may automatically reject content or place a public site under review. You may request human review of an ordinary moderation decision.',
        ],
      },
      {
        title: '6. Contact',
        paragraphs: [sharedContact],
      },
    ],
  },
  'site-privacy': {
    key: 'site-privacy',
    title: 'Public Site Visitor Privacy Notice',
    summary:
      'This Notice applies when you visit or interact with a public portfolio hosted on a yarba.app subdomain.',
    version: LEGAL_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: '1. Public portfolio content',
        paragraphs: [
          'The portfolio owner chooses the professional information displayed on their site. Yarba hosts the site and provides security, chat, and abuse-report infrastructure. Contact and social links may send you to third-party services.',
        ],
      },
      {
        title: '2. Contact forms',
        paragraphs: [
          'A portfolio contact form may open your own email application. In that case, your message is sent directly using your email provider to the portfolio owner and is not stored as a Yarba contact-form submission. Your email provider and the recipient independently process the message.',
        ],
      },
      {
        title: '3. AI chat',
        paragraphs: [
          'If chat is enabled, Yarba sends your message and limited conversation context to an AI provider to answer from the portfolio owner’s information. Do not include sensitive or confidential information.',
          'When conversation storage is enabled, messages, a conversation identifier, user agent, referrer, and scheduling signals may be retained for 90 days and made available to the portfolio owner. The chat interface identifies when storage is enabled before you send a message.',
        ],
      },
      {
        title: '4. Security and abuse prevention',
        paragraphs: [
          'Yarba may process IP address, request timing, browser information, and security events to rate-limit requests, investigate abuse, and protect the site. Reports may be retained as described in the Privacy Policy.',
        ],
      },
      {
        title: '5. Choices and contact',
        paragraphs: [
          'You may browse without using chat or contact features. You may ask Yarba about stored chat or report data, subject to identity verification and applicable law. To report a site, use the Report Abuse page.',
          sharedContact,
        ],
      },
    ],
  },
};

export const LEGAL_NAV_ITEMS: readonly { key: LegalDocumentKey; label: string; path: string }[] = [
  { key: 'terms', label: 'Terms', path: '/terms' },
  { key: 'privacy', label: 'Privacy', path: '/privacy' },
  { key: 'acceptable-use', label: 'Acceptable Use', path: '/acceptable-use' },
  { key: 'copyright', label: 'Copyright', path: '/copyright' },
  { key: 'ai-data-use', label: 'AI Data Use', path: '/ai-data-use' },
  { key: 'site-privacy', label: 'Site Visitor Privacy', path: '/site-privacy' },
];
