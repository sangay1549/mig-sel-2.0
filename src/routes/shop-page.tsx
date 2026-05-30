import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Gift,
  UtensilsCrossed,
  Building2,
  Lock,
  Recycle,
  TreePine,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';

const ITEMS = [
  { icon: Building2, title: 'City Service Priority', description: 'Skip the line for municipal permit applications', cost: 50, comingSoon: true },
  { icon: UtensilsCrossed, title: 'Restaurant Discount', description: 'Special discount at partnered local restaurants', cost: 30, comingSoon: true },
  { icon: Gift, title: 'Community Reward', description: 'Exclusive Migsel merchandise and vouchers', cost: 20, comingSoon: true },
  { icon: Recycle, title: 'Eco-Friendly Kit', description: 'Reusable bags, bottles, and sustainable goodies', cost: 40, comingSoon: true },
  { icon: TreePine, title: 'Tree Planting Voucher', description: 'Plant a tree in your name in the city park', cost: 60, comingSoon: true },
  { icon: BookOpen, title: 'Library Membership', description: 'Premium library membership with extended borrowing', cost: 25, comingSoon: true },
  { icon: Award, title: 'Volunteer Badge', description: 'Exclusive profile badge and recognition certificate', cost: 15, comingSoon: true },
  { icon: Building2, title: 'Parking Permit', description: 'Discounted city parking permit for 3 months', cost: 45, comingSoon: true },
];

const ITEMS_PER_PAGE = 3;

export const ShopPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ITEMS.length / ITEMS_PER_PAGE);
  const paginatedItems = ITEMS.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground">Points Shop</h1>
          <p className="text-xs text-muted-foreground">Redeem points for city rewards</p>
        </div>
      </div>

      {profile && (
        <div className="animate-slide-up flex items-center justify-between rounded-2xl gradient-green-soft p-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Your Balance
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-2xl font-black text-primary">{profile.points}</span>
              <span className="text-xs font-semibold text-muted-foreground">pts</span>
            </div>
          </div>
          <Button size="sm" className="rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
            Earn More
          </Button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {paginatedItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="animate-slide-up relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all card-hover"
            >
              {item.comingSoon && (
                <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-xl bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                  <Lock className="h-3 w-3" />
                  Coming Soon
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <ShoppingBag className="h-3 w-3" />
                      {item.cost} points
                    </span>
                    <Button
                      disabled={item.comingSoon}
                      size="sm"
                      className="rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={ITEMS.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {(!profile || profile.points < 20) && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="font-bold text-blue-700">Earn more points!</p>
          <p className="mt-1 text-xs text-blue-600">
            Submit complaints on the map and get them resolved to earn points.
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
  );
};
