-- Add unique constraint on question (required for ON CONFLICT)
alter table public.chatbot_knowledge
  add constraint chatbot_knowledge_question_key unique (question);

-- Update chatbot knowledge base with announcements feature info
insert into public.chatbot_knowledge (question, answer, keywords) values

('How do I create an announcement?',
 'Go to the Official page (accessible if you have the "official" role). Fill in the department, category, title, body, and optionally mark it as emergency. Click "Publish to Feed" to post. The announcement will appear in the Community feed with an official badge.',
 array['announcement', 'create announcement', 'official announcement', 'publish', 'post announcement', 'make announcement']),

('Who can post announcements?',
 'Only users with the "official" role can access the Official page and post announcements. If you are an official but cannot access the page, try refreshing or signing out and back in. Contact an admin if the issue persists.',
 array['official role', 'announcement permissions', 'who can post', 'announcement access', 'official only']),

('Why is my announcement not showing in the Community feed?',
 'Announcements appear in the Community feed mixed with regular grievance reports. They display with a blue verified badge and the department name. If you just posted and do not see it, try refreshing the community page. If it still does not appear, check that the database migration for community_feed columns (is_official, etc.) has been applied.',
 array['announcement not showing', 'feed not updating', 'missing announcement', 'announcement not visible', 'community feed announcement']),

('What announcement categories are available?',
 'There are four categories: Announcement (general), Emergency Alert (urgent situations), Project Update (infrastructure projects), and Maintenance Notice (scheduled maintenance). Emergency alerts get a red badge and are auto-pinned to the top of the feed.',
 array['announcement categories', 'category types', 'emergency alert', 'project update', 'maintenance notice', 'announcement type']),

('Can I edit an announcement after posting?',
 'Currently, announcements cannot be edited after posting. You can delete an announcement from the Official page by clicking the trash icon. Deletion removes it from both the official announcements list and the Community feed.',
 array['edit announcement', 'delete announcement', 'remove announcement', 'update announcement', 'modify announcement']),

('How do I pin an announcement?',
 'From the Official page, click the pin icon on any of your announcements to toggle pin status. Pinned announcements are marked with an amber pin badge.',
 array['pin announcement', 'unpin announcement', 'pin toggle', 'feature announcement']),

('What does the emergency alert checkbox do?',
 'Marking an announcement as an emergency alert gives it a red "Emergency" badge, auto-pins it to the top of the feed, and causes a pulsing red dot to appear next to the checkbox. Emergency alerts are visually distinct to draw immediate attention.',
 array['emergency checkbox', 'emergency alert', 'mark emergency', 'urgent announcement']),

('What happens when I delete an announcement?',
 'Deleting an announcement removes it from both the official announcements list and the Community feed. This action cannot be undone.',
 array['delete announcement', 'remove announcement', 'announcement deleted', 'undo delete'])

on conflict (question) do update set
  answer = excluded.answer,
  keywords = excluded.keywords;
