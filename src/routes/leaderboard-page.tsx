import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Upload,
  LoaderPinwheel,
  CheckCheck,
  Camera,
  Loader2,
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaderboard } from '@/features/gamification/components/leaderboard';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';
import { useUpdateProfile } from '@/features/gamification/api/use-update-profile';
import { uploadAvatar } from '@/features/gamification/api/use-upload-avatar';
import { useCurrentUser } from '@/features/auth/api/use-current-user';

const POINTS_BREAKDOWN = [
  { icon: Upload, label: 'Submit a report', points: 1, color: 'text-blue-600', bg: 'bg-blue-50' },
  {
    icon: LoaderPinwheel,
    label: 'Status \u2192 In Progress',
    points: 1,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: CheckCheck,
    label: 'Status \u2192 Resolved',
    points: 2,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
];

export const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const { user } = useCurrentUser();
  const mutation = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.username ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const hasUsername = !!profile?.username;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }
      await mutation.mutateAsync({
        userId: user.id,
        ...(hasUsername ? {} : { username: displayName.trim() || null }),
        avatar_url: avatarUrl,
      });
      setSidebarOpen(false);
    } catch {
      // error handled by mutation
    }
  };

  const isSaving = mutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Top contributors ranked by points earned from complaints
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Leaderboard />
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200/50 transition-all hover:bg-gray-50"
        title="Open settings"
      >
        <Settings className="h-5 w-5 text-gray-600" />
      </button>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 z-50 flex h-full w-80 flex-col border-r bg-white shadow-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Profile</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90 absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full text-white shadow transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="text-sm font-medium text-gray-700">Display Name</label>
            {hasUsername ? (
              <>
                <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  {profile?.username}
                </div>
                <p className="text-xs text-gray-400">Username can only be set once.</p>
              </>
            ) : (
              <Input
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            )}
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>

          <hr className="my-6" />

          {profile && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-50 p-4">
              <span className="text-sm font-medium text-gray-600">Your Points</span>
              <span className="text-2xl font-bold text-gray-900">{profile.points}</span>
            </div>
          )}

          <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-400 uppercase">
            How points work
          </h3>
          <div className="space-y-2">
            {POINTS_BREAKDOWN.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">+{item.points}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Max <strong className="text-gray-600">4 points</strong> per report that reaches
            resolution.
          </p>
        </div>
      </div>
    </div>
  );
};
