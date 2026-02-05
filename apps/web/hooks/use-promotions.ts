import { useQuery } from '@tanstack/react-query';
import { promotionsService } from '@/services/promotions.service';

export function useActivePromotions() {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: promotionsService.getActivePromotions,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
