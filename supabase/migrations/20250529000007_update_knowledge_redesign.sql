-- Update chatbot knowledge base with GMC Civic Connect 2.0 redesign info

insert into public.chatbot_knowledge (question, answer, keywords) values

('What is GMC Civic Connect 2.0?',
 'GMC Civic Connect 2.0 is the redesigned version of mig-sel featuring a modern smart city interface with a green-plus-white minimalist theme, glassmorphism accents, mobile-first responsive design, and a professional government-tech aesthetic for Gelephu Mindfulness City.',
 array['civic connect', '2.0', 'redesign', 'new version', 'smart city', 'modern ui']),

('How does the new bottom navigation work?',
 'The bottom navigation bar gives you quick access to Discover (Map), Community, Report (center FAB), Rankings (Leaderboard), and Chat. A secondary row below provides access to Shop and Profile/Admin. The center FAB button is elevated with a green gradient for quick report access.',
 array['navigation', 'bottom nav', 'menu', 'navigate', 'fab', 'bottom bar']),

('What is the emergency alert section?',
 'The emergency alert banner on the Community page shows real-time urgent notifications from GMC, such as weather warnings or public safety alerts. It appears at the top of the feed with a distinctive amber styling and live indicator.',
 array['emergency', 'alert', 'warning', 'weather', 'safety alert', 'urgent']),

('How do I use the live city updates?',
 'The Community page features live city stats showing reports today, active alerts, and resolution rate. The header also displays a pulsing "Live" indicator to show the platform is receiving real-time updates.',
 array['live', 'city updates', 'stats', 'real time', 'dashboard stats', 'live indicator']),

('What design system does GMC Civic Connect 2.0 use?',
 'The new design uses a green and white minimalist theme with Manrope font, soft shadows, rounded cards (radius-xl), glassmorphism accents on navigation elements, gradient green surfaces for primary actions, and subtle animations throughout the interface.',
 array['design', 'theme', 'green theme', 'ui design', 'style', 'glassmorphism', 'gradient']);

on conflict (question) do update set
  answer = excluded.answer,
  keywords = excluded.keywords;
