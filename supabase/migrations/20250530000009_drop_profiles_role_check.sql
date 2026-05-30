-- Drop the profiles_role_check constraint to allow any role value

alter table public.profiles
  drop constraint if exists profiles_role_check;

-- Update chatbot knowledge about roles
update public.chatbot_knowledge
set answer = 'There are four role levels: regular user (resident, role is null), inspector, official, and admin. Regular users can report issues and engage with the community. Inspectors can manage waste records. Officials can create announcements. Admins have full access to the dashboard.',
    updated_at = now()
where question = 'What user roles are there?';

-- Remove the Q&A about profiles_role_check error since the constraint no longer exists
delete from public.chatbot_knowledge
where question like '%profiles_role_check%';
