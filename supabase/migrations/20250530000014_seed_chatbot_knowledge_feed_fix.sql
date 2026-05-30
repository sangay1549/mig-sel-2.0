-- Seed chatbot knowledge base entries about community feed fix

insert into public.chatbot_knowledge (question, answer, keywords) values

('Why does the Community feed show "No activity yet. Be the first!" even when there are reports?',
 'This happened because of two issues that have now been fixed: (1) The feed query was filtering to only show official announcements due to an accidental filter, and (2) grievance reports were not being added to the community_feed table when submitted. After the fix, new grievance reports automatically appear in the feed alongside official announcements.',
 array['community feed empty', 'no activity', 'feed not showing', 'empty feed', 'feed bug', 'community feed not working', 'reports not showing']),

('How do grievance reports appear in the Community feed?',
 'When you submit a grievance report, it is now automatically added to the Community feed. Your username and initials from your profile are displayed alongside the report title. The feed shows all content (grievances + official announcements) sorted by newest first.',
 array['feed grievance showing', 'how feed works', 'feed content', 'report in feed', 'community feed grievance']),

('Can I delete a feed item?',
 'You can delete your own feed items. The delete action now correctly removes the entry from the community_feed table. Only the feed entry author can delete their own posts due to Row-Level Security policies.',
 array['delete feed', 'remove feed item', 'delete post', 'remove post']);
