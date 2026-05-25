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
  Heart,
  BookOpen,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
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
  {
    icon: Recycle,
    title: 'Eco-Friendly Kit',
    description: 'Reusable bags, bottles, and sustainable goodies',
    cost: 40,
    comingSoon: true,
  },
  {
    icon: TreePine,
    title: 'Tree Planting Voucher',
    description: 'Plant a tree in your name in the city park',
    cost: 60,
    comingSoon: true,
  },
  {
    icon: Heart,
    title: 'Health Checkup Pass',
    description: 'Free basic health screening at city clinics',
    cost: 35,
    comingSoon: true,
  },
  {
    icon: BookOpen,
    title: 'Library Membership',
    description: 'Premium library membership with extended borrowing',
    cost: 25,
    comingSoon: true,
  },
  {
    icon: Award,
    title: 'Volunteer Badge',
    description: 'Exclusive profile badge and recognition certificate',
    cost: 15,
    comingSoon: true,
  },
  {
    icon: Building2,
    title: 'Parking Permit',
    description: 'Discounted city parking permit for 3 months',
    cost: 45,
    comingSoon: true,
  },
];

const ITEMS_PER_PAGE = 3;

export const ShopPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ITEMS.length / ITEMS_PER_PAGE);
  const paginatedItems = ITEMS.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Points Shop</h1>
          <p className="mt-1 text-sm text-gray-500">
            Redeem your points for city services and partner rewards
          </p>
        </div>

        <div className="space-y-4">
          {paginatedItems.map((item) => {
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        <ShoppingBag className="h-3 w-3" />
                        {item.cost} points
                      </span>
                      <Button
                        disabled={item.comingSoon}
                        size="sm"
                        className="bg-green-600 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
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

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={ITEMS.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={() => {}}
          />
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
