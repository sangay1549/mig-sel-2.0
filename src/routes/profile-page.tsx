import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Loader2,
  LogOut,
  Trophy,
  ShoppingBag,
  ChevronRight,
  Settings,
  FileText,
  UserPen,
  Megaphone,
  Building2,
  Edit3,
  X,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';
import { useUpdateProfile } from '@/features/gamification/api/use-update-profile';
import { uploadAvatar } from '@/features/gamification/api/use-upload-avatar';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useSignOut } from '@/features/auth/api/use-sign-out';
import { useIsOfficial } from '@/features/announcements/api/use-is-official';

interface MenuItemProps {
  icon: typeof FileText;
  label: string;
  subtitle?: string;
  onClick: () => void;
}

const MenuItem = ({ icon: Icon, label, subtitle, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 active:bg-muted/80"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="min-w-0 flex-1 text-left">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
  </button>
);

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const { user } = useCurrentUser();
  const { data: isOfficial } = useIsOfficial();
  const mutation = useUpdateProfile();
  const signOut = useSignOut();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.username ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }
      await mutation.mutateAsync({
        userId: user.id,
        username: displayName.trim() || null,
        avatar_url: avatarUrl,
      });
      setEditing(false);
    } catch { /* handled by mutation */ }
  };

  return (
    <div className="space-y-0 pb-8">
      {/* ── Profile Header ── */}
      <div className="gradient-green relative overflow-hidden px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 h-24 w-24 -translate-y-1/2 rounded-full bg-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative shrink-0"
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/60 shadow-xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/20 text-white">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/25">
                <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </button>

            {/* Name + rank */}
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                    className="h-10 flex-1 bg-white/20 text-base font-bold text-white placeholder:text-white/60"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={mutation.isPending}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Edit3 className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setDisplayName(profile?.username ?? ''); setAvatarPreview(profile?.avatar_url ?? null); setAvatarFile(null); }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="truncate text-xl font-bold text-white">{profile?.username ?? 'Set your name'}</h1>
                  <p className="mt-0.5 text-sm text-white/70">GMC Resident</p>
                </>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => setEditing((v) => !v)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>


        </div>
      </div>

      {/* ── My Activities ── */}
      <div className="mt-6 px-4">
        <h2 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          My Activities
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          <MenuItem
            icon={FileText}
            label="My Reports"
            subtitle="Reports you've submitted"
            onClick={() => navigate('/my-reports')}
          />
          <div className="mx-3 border-t border-border/50" />
          <MenuItem
            icon={UserPen}
            label="My Posts"
            subtitle="Your activity in the feed"
            onClick={() => navigate('/my-posts')}
          />
          <div className="mx-3 border-t border-border/50" />
          <MenuItem
            icon={Trophy}
            label="Leaderboard"
            subtitle="See how you rank"
            onClick={() => navigate('/leaderboard')}
          />
          <div className="mx-3 border-t border-border/50" />
          <MenuItem
            icon={ShoppingBag}
            label="Shop"
            subtitle="Redeem your points"
            onClick={() => navigate('/shop')}
          />
        </div>
      </div>

      {/* ── Official Section ── */}
      {isOfficial && (
        <div className="mt-6 px-4">
          <h2 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Official
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
            <MenuItem
              icon={Building2}
              label="Official Portal"
              subtitle="Manage announcements"
              onClick={() => navigate('/official')}
            />
            <div className="mx-3 border-t border-border/50" />
            <MenuItem
              icon={Megaphone}
              label="My Announcements"
              subtitle="View your published posts"
              onClick={() => navigate('/official')}
            />
          </div>
        </div>
      )}

      {/* ── Sign Out ── */}
      <div className="mt-8 px-4">
        <button
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signOut.isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};
