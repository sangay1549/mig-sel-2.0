-- Seed chatbot knowledge entries about official users

insert into public.chatbot_knowledge (question, answer, keywords) values

('What is an Official user?',
 'Official users are verified GMC department and public office accounts. They include departments like GMC Roads Division, GMC Water Department, and GMC Waste Management. These accounts have a verified badge and can publish official announcements to the community feed.',
 array['official', 'verified', 'department', 'GMC department', 'public office', 'government account']),

('How is an Official different from a regular user?',
 'Official users have a verified blue badge, can publish announcements to the community feed, pin important posts, mark emergency alerts, and have their own publishing portal. They use the same mobile app and see the same feed as everyone else.',
 array['official vs user', 'difference', 'verified badge', 'permissions', 'official features']),

('How do I become an Official user?',
 'Official roles are assigned by administrators through the Admin Dashboard. Contact an admin if your GMC department needs an official account.',
 array['become official', 'official role', 'get verified', 'department account', 'admin assign']),

('Can Officials use the Admin Dashboard?',
 'No. Officials have their own publishing portal at /official where they can create and manage announcements. They do not use the Admin Dashboard for announcements. The Admin Dashboard is only for administrators.',
 array['official dashboard', 'official portal', 'admin dashboard', 'announcement portal']),

('What types of announcements can Officials post?',
 'Officials can post four types of announcements: General Announcements, Emergency Alerts, Project Updates, and Maintenance Notices. Emergency alerts appear with a red badge and can be pinned to the top of the feed.',
 array['announcement types', 'categories', 'emergency alert', 'project update', 'maintenance notice', 'post types']),

('How do Officials publish announcements?',
 'Officials log into their account and navigate to the Official Portal from their Profile page or are redirected there after login. They can write a title, body, select a category, and publish directly to the community feed.',
 array['publish', 'create announcement', 'official portal', 'how to post', 'make announcement']),

('What does the verified badge look like?',
 'The verified badge appears as a blue checkmark icon next to the department name on official announcements in the community feed. It helps residents identify authentic GMC communications.',
 array['verified badge', 'blue checkmark', 'badge icon', 'official badge', 'trusted posts']),

('Can Officials pin announcements?',
 'Yes. Officials can pin important announcements from their publishing portal. Pinned announcements display a pin icon in the feed. Emergency alerts are automatically pinned.',
 array['pin', 'pinned post', 'important announcement', 'pin feature', 'sticky post']),

('Can Official accounts comment on posts?',
 'Yes, Official accounts can respond publicly to community feed posts. All replies from official accounts show the verified badge, making it clear that the response is from an official GMC source.',
 array['official comment', 'respond publicly', 'reply', 'official response', 'public reply']);
