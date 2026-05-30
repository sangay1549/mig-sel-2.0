-- Update chatbot knowledge: fix role description and add signup error Q&A

update public.chatbot_knowledge
set answer = 'There are three role levels: regular user (resident, role is null), inspector, and admin. Regular users can report issues and engage with the community. Inspectors can manage waste records. Admins have full access to the dashboard.',
    updated_at = now()
where question = 'What user roles are there?';

insert into public.chatbot_knowledge (question, answer, keywords) values
('Why do I get "profiles_role_check" error on signup?',
 'This error means the signup trigger tried to insert an invalid role value. The profiles.role column only allows admin, inspector, official, or NULL (regular user). If you see this error, the database trigger function handle_new_user() needs to insert NULL instead of "user". This was fixed in a recent database migration.',
 array['signup error', 'profile error', 'role check', 'constraint violation', 'profiles_role_check', 'cannot sign up']);
