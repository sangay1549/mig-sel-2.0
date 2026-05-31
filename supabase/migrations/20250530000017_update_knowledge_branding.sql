-- Update chatbot knowledge base with rebranding Q&A

-- Update chatbot knowledge with rebranding info

update public.chatbot_knowledge
set
  answer = 'mig-sel is a community connection platform for the Gelephu Mindfulness City (GMC) in Bhutan. It helps GMC residents stay connected — share updates, report civic issues, earn points, and engage with the community through a feed, leaderboard, and rewards shop.',
  keywords = array['app', 'about', 'what is', 'platform', 'community', 'engage', 'gmc family']
where question = 'What is mig-sel?';

insert into public.chatbot_knowledge (question, answer, keywords) values
  ('What is on the login page?',
   'The login page shows "migsel" branding with the tagline "keeping us connected", a "Continue with Google" button, and the GMC logo as a subtle background image over a black background.',
   array['login', 'login page', 'sign in page', 'landing page', 'black background']),
  ('Why does the login page have a black background?',
   'The login page uses a black background with the GMC logo as a subtle faded background image, giving it a clean, modern dark look.',
   array['black background', 'dark theme', 'login design', 'login style', 'dark mode']);
