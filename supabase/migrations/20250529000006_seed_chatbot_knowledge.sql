-- Seed data for chatbot knowledge base

insert into public.chatbot_knowledge (question, answer, keywords) values

('What is mig-sel?',
 'mig-sel is a community connection platform for the Gelephu Mindfulness City (GMC) in Bhutan. It helps GMC residents stay connected — share updates, report civic issues, earn points, and engage with the community through a feed, leaderboard, and rewards shop.',
 array['app', 'about', 'what is', 'platform', 'community', 'engage', 'gmc family']),

('How do I get started?',
 'Create an account using your email or phone number. Once logged in, you can explore the Map to see reports near you, submit new reports via the Camera button, browse the Community feed, and earn points for contributing.',
 array['start', 'getting started', 'sign up', 'register', 'begin', 'new']),

('How do I report an issue?',
 'Tap the Camera button (FAB) in the center of the bottom navigation bar, or go to the Report page from the Map. Fill in the details, add a photo, and submit. Your report will appear on the Map and in the Community feed.',
 array['report', 'reporting', 'submit', 'issue', 'problem', 'complaint', 'grievance', 'file']),

('What kind of issues can I report?',
 'You can report issues like road damage, garbage dumping, broken streetlights, drainage problems, or any other civic concern. Choose the appropriate category when submitting.',
 array['category', 'type', 'kinds', 'issues', 'report category', 'road', 'garbage', 'lighting', 'drainage']),

('How do I add a photo to my report?',
 'When submitting a report, you will be prompted to take a photo or select one from your gallery. Photos help authorities understand the issue better.',
 array['photo', 'picture', 'image', 'camera', 'upload', 'attach']),

('Can I edit or delete my report?',
 'Currently, reports cannot be edited or deleted after submission. Please double-check your details before submitting. If you made a mistake, contact an admin for assistance.',
 array['edit report', 'delete report', 'remove', 'change', 'update report', 'modify']),

('What does the Map show?',
 'The Map displays all reported grievances as markers. Each marker shows the location and status of the issue. You can tap a marker to view details, including the description, photo, and current status.',
 array['map', 'markers', 'grievances map', 'locations', 'view reports']),

('How do I filter reports on the Map?',
 'Use the filter options to view reports by status (pending, in-progress, resolved) or by category. The Map will update to show only matching markers.',
 array['filter', 'filter map', 'filter reports', 'status filter', 'category filter']),

('What is the Community feed?',
 'The Community feed shows a chronological list of all user activity — new reports, comments, and updates. It is like a social feed for civic engagement in your city.',
 array['community', 'feed', 'activity', 'social', 'timeline', 'posts']),

('How do I upvote a post?',
 'Tap the upvote arrow on any feed card. Upvoting helps highlight important issues. You can only upvote once per post.',
 array['upvote', 'like', 'vote', 'upvote post', 'support']),

('How do I comment on a post?',
 'Tap the comment icon on a feed card or open the full post. Type your comment and press send. Only administrators can create comments.',
 array['comment', 'reply', 'discuss', 'feedback', 'add comment']),

('How do I view a post with an image?',
 'Tap on a feed card that has an image. It will open a full-screen image viewer where you can see the photo, read details, and view comments.',
 array['view image', 'image viewer', 'expand post', 'photo view']),

('What happens when I tap a post without an image?',
 'Tapping a post without an image opens a comment dialog where you can read existing comments and add your own.',
 array['text post', 'no image', 'comment dialog', 'view post']),

('How does the Leaderboard work?',
 'The Leaderboard ranks users by total points earned. The more reports you submit that get resolved, the higher your rank. Compete with others to reach the top spot!',
 array['leaderboard', 'rank', 'ranking', 'top users', 'scoreboard', 'compete']),

('How are points calculated on the Leaderboard?',
 'Points are awarded when your reported issue is marked as resolved. The number of points may vary based on the severity and type of issue.',
 array['points leaderboard', 'points calculation', 'rank points', 'score']),

('How do I earn points?',
 'You earn points when your reported issues are resolved by authorities. The more issues you report that get resolved, the more points you earn.',
 array['points', 'earn points', 'get points', 'rewards points', 'score']),

('How do I check my points?',
 'Go to your Profile page to see your current point balance, achievements, and recent activity.',
 array['check points', 'my points', 'points balance', 'profile points', 'view points']),

('What can I do with my points?',
 'You can redeem your points in the Shop for rewards. Available rewards may include vouchers, discounts, or other incentives offered by the city.',
 array['redeem points', 'use points', 'shop rewards', 'spend points', 'rewards']),

('How does the Shop work?',
 'The Shop displays available rewards you can purchase with your points. Browse items, check the point cost, and redeem what you like.',
 array['shop', 'rewards', 'redeem', 'store', 'buy', 'items', 'vouchers']),

('How do I edit my profile?',
 'Go to your Profile page and tap the Edit button. You can update your name, profile picture, and other settings.',
 array['profile', 'edit profile', 'settings', 'account', 'update profile', 'avatar', 'name']),

('How do I sign out?',
 'Go to your Profile page and tap the Sign Out button at the bottom. You will be returned to the login screen.',
 array['sign out', 'logout', 'log out', 'signout', 'exit']),

('How do I create an account?',
 'On the landing page, choose Sign Up. Enter your email or phone number, set a password, and follow the verification steps.',
 array['sign up', 'register', 'create account', 'join', 'new user', 'registration']),

('I forgot my password. What should I do?',
 'On the login screen, tap "Forgot Password" and enter your email address. You will receive a link to reset your password.',
 array['forgot password', 'reset password', 'password', 'recover', 'forgot']),

('Can I use the app without an account?',
 'No, you need to be signed in to submit reports, view the Community feed, earn points, or use most features. The Landing page is the only public page.',
 array['no account', 'guest', 'without login', 'public access', 'anonymous']),

('What user roles are there?',
 'There are three role levels: regular user (resident, role is null), inspector, and admin. Regular users can report issues and engage with the community. Inspectors can manage waste records. Admins have full access to the dashboard.',
 array['roles', 'permissions', 'admin role', 'inspector role', 'user role', 'access']),

('How do I become an admin?',
 'Admin roles are assigned by existing admins through the Admin Dashboard. Contact an admin if you need role changes.',
 array['become admin', 'admin access', 'role assignment', 'get admin']),

('What can I do in the Admin Dashboard?',
 'Admins can monitor complaints, manage waste records, assign user roles, view analytics, upload inspector waste records, and manage the chatbot knowledge base.',
 array['admin dashboard', 'admin panel', 'dashboard features', 'admin tools']),

('How do I manage user roles as an admin?',
 'In the Admin Dashboard, go to "Role Assignment". Search for a user by email and select their new role. The change takes effect immediately.',
 array['manage roles', 'assign role', 'role assignment admin', 'change user role', 'update role']),

('What is the Chat Assistant?',
 'The Chat Assistant (this bot!) helps you find answers about using mig-sel. Ask questions in natural language and get instant answers from the knowledge base.',
 array['chat', 'chatbot', 'assistant', 'bot', 'help bot', 'ai', 'knowledge']),

('How is the chatbot trained?',
 'Admins manage the chatbot knowledge base from the Admin Dashboard under "Knowledge Base". They can add, edit, or delete Q&A pairs. The chatbot searches these pairs to answer your questions.',
 array['train chatbot', 'knowledge base', 'training', 'teach bot', 'add questions', 'admin training']),

('Is the app available on iOS or Android?',
 'mig-sel is a Progressive Web App (PWA). You can access it from any modern browser on your phone or desktop. For the best experience, add it to your home screen.',
 array['mobile app', 'ios', 'android', 'download app', 'pwa', 'phone', 'smartphone']),

('Which browsers are supported?',
 'mig-sel works on all modern browsers: Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date for the best experience.',
 array['browser', 'chrome', 'firefox', 'safari', 'edge', 'supported browsers']),

('Is my data secure?',
 'Yes. All data is transmitted over HTTPS and stored securely in Supabase. Authentication is handled by Supabase Auth. Row-Level Security ensures users can only access authorized data.',
 array['security', 'data', 'private', 'secure', 'privacy', 'safe', 'encryption']),

('What does the Inspector do?',
 'Inspectors can submit waste collection records through the Inspector page. This helps track waste management activities in the city.',
 array['inspector', 'waste record', 'waste collection', 'inspector role', 'submit waste']),

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

('What is the Discover page?',
 'The Discover page (accessible from the Map icon in the bottom nav) shows an interactive map with a glassmorphism bottom card overlay displaying active reports in your area. Use the layer and location buttons to customize your view.',
 array['discover', 'map overlay', 'glassmorphism', 'map widgets', 'interactive map']),

('How has the profile page changed?',
 'The redesigned profile page features a modern card layout with a gradient avatar section, prominent points display with trophy icon, stats grid (rank, reports, resolved), and a redesigned points breakdown section with green color accents.',
 array['profile redesign', 'new profile', 'points display', 'avatar', 'stats']),

('What is the new community feed look like?',
 'The community feed now has a cleaner, more social-media-like layout with quick stats cards at the top (reports today, active alerts, resolution rate), an emergency alert banner, and beautifully styled feed cards with subtle shadows and rounded corners.',
 array['community redesign', 'feed layout', 'social feed', 'feed cards', 'new community']),

('How does the new admin dashboard look?',
 'The admin dashboard has been modernized with a cleaner sidebar layout, summary stat cards, gradient green accent styling, and improved visual hierarchy. The sidebar has a glassmorphism effect with a compact, professional design.',
 array['admin redesign', 'new admin', 'dashboard layout', 'admin panel redesign', 'admin sidebar']),

 ('What design system does GMC Civic Connect 2.0 use?',
  'The new design uses a green and white minimalist theme with Manrope font, soft shadows, rounded cards (radius-xl), glassmorphism accents on navigation elements, gradient green surfaces for primary actions, and subtle animations throughout the interface.',
  array['design', 'theme', 'green theme', 'ui design', 'style', 'glassmorphism', 'gradient']),

('Why do I get "profiles_role_check" error on signup?',
  'This error means the signup trigger tried to insert an invalid role value. The profiles.role column only allows admin, inspector, official, or NULL (regular user). If you see this error, the database trigger function handle_new_user() needs to insert NULL instead of "user". This was fixed in a recent database migration.',
  array['signup error', 'profile error', 'role check', 'constraint violation', 'profiles_role_check', 'cannot sign up']),

('I was assigned the official role but the app still shows the regular user page. What should I do?',
  'After an admin assigns you the official role, try refreshing the page (full browser refresh). If that does not work, sign out and sign back in. The role update needs to refresh your session to take full effect. The app now also queries the database directly as a fallback, so a page refresh should resolve it.',
  array['official role not working', 'role not applied', 'still regular user', 'official role stuck', 'role change not reflecting', 'session refresh', 'role assignment not working']),

('Why does the Community feed show "No activity yet. Be the first!" even when there are reports?',
  'This happened because of two issues that have now been fixed: (1) The feed query was filtering to only show official announcements due to an accidental filter, and (2) grievance reports were not being added to the community_feed table when submitted. After the fix, new grievance reports automatically appear in the feed alongside official announcements.',
  array['community feed empty', 'no activity', 'feed not showing', 'empty feed', 'feed bug', 'community feed not working', 'reports not showing']),

('How do grievance reports appear in the Community feed?',
  'When you submit a grievance report, it is now automatically added to the Community feed. Your username and initials from your profile are displayed alongside the report title. The feed shows all content (grievances + official announcements) sorted by newest first.',
  array['feed grievance showing', 'how feed works', 'feed content', 'report in feed', 'community feed grievance']),

 ('Can I delete a feed item?',
   'You can delete your own feed items. The delete action now correctly removes the entry from the community_feed table. Only the feed entry author can delete their own posts due to Row-Level Security policies.',
   array['delete feed', 'remove feed item', 'delete post', 'remove post']),

('What is on the login page?',
   'The login page features the GMC logo, "GMC Family" branding with the tagline "Keeping us connected", and a "Continue with Google" button on a clean black background.',
   array['login', 'login page', 'sign in page', 'landing page', 'gmc family login', 'black background']),

('Why does the login page have a black background?',
   'The login page uses a solid black background with a subtle gradient overlay to give the app a clean, modern look that puts the focus on the GMC logo and the sign-in button.',
   array['black background', 'dark theme', 'login design', 'login style', 'dark mode']),

('What happened to the migration theme?',
   'The app was rebranded from "mig-sel" (Migration Assistant) to "GMC Family" to better reflect its purpose — connecting GMC residents as a small family rather than an immigration tool.',
   array['rebrand', 'migration removed', 'mig-sel removed', 'new branding', 'gmc family rebrand']);
