import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Gift, UtensilsCrossed, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';

const ITEMS = [
  {
    icon: Building2,
    title: 'City Service Priority',
    description: 'Skip the line for municipal permit applications',
    cost: 50,
    comingSoon: true,
  },
  {
    icon: UtensilsCrossed,
    title: 'Restaurant Discount',
    description: 'Special discount at partnered local restaurants',
    cost: 30,
    comingSoon: true,
  },
  {
    icon: Gift,
    title: 'Community Reward',
    description: 'Exclusive Migsel merchandise and vouchers',
    cost: 20,
    comingSoon: true,
  },
];

export const ShopPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {profile && (
            <div className="rounded-xl border bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                Your Points
              </p>
              <p className="text-xl font-bold text-gray-900">{profile.points}</p>
            </div>
          )}
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Points Shop</h1>
          <p className="mt-1 text-sm text-gray-500">
            Redeem your points for city services and partner rewards
          </p>
        </div>

        <div className="space-y-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all"
              >
                {item.comingSoon && (
                  <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                    <Lock className="h-3 w-3" />
                    Coming Soon
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                        <ShoppingBag className="h-3 w-3" />
                        {item.cost} points
                      </span>
                      <Button
                        disabled={item.comingSoon}
                        size="sm"
                        className="bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        {item.comingSoon ? 'Unavailable' : 'Redeem'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(!profile || profile.points < 20) && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">Earn more points!</p>
            <p className="mt-1 text-blue-600">
              Submit complaints on the map and get them resolved to earn points. Each resolved
              report can earn you up to 4 points.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/map')}
              className="mt-1 h-auto p-0 text-xs text-blue-600"
            >
              Go to map →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
