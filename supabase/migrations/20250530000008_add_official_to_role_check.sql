-- Add 'official' to the profiles_role_check constraint
-- Previously allowed: admin, user, inspector, or NULL
-- Now allows: admin, user, inspector, official, or NULL

alter table public.profiles
  drop constraint if exists profiles_role_check,
  add constraint profiles_role_check
    check (role is null or role in ('admin', 'user', 'inspector', 'official'));

-- Update chatbot knowledge: include official in the roles answer
update public.chatbot_knowledge
set answer = 'There are four role levels: regular user (resident, role is null), inspector, official, and admin. Regular users can report issues and engage with the community. Inspectors can manage waste records. Officials can create announcements. Admins have full access to the dashboard.',
    updated_at = now()
where question = 'What user roles are there?';

-- Update the profiles_role_check error Q&A to reflect the fix
update public.chatbot_knowledge
set answer = 'This error means the database rejected an invalid role value for the profiles.role column. The column now allows admin, user, inspector, official, or NULL. If you see this error, the value being inserted does not match these allowed values (e.g., it might be capitalized like "Official" instead of lowercase "official").',
    updated_at = now()
where question like '%profiles_role_check%';
