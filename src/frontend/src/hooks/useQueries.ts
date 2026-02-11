import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useCreateHub() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, teamName }: { userId: string; teamName: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.createHub(userId, teamName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hubs'] });
    }
  });
}

export function useGetHub(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['hub', userId],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getHub(userId);
    },
    enabled: !!actor && !isFetching && !!userId
  });
}

export function useGetAllHubs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['hubs'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllHubs();
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetDashboardData(teamName: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboard', teamName],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getDashboardData(teamName);
    },
    enabled: !!actor && !isFetching && !!teamName,
    refetchInterval: 3000, // Auto-refetch every 3 seconds for real-time updates
    staleTime: 1000, // Consider data stale after 1 second
  });
}

export function useGetFeatureSectionData(teamName: string, enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['featureSection', teamName],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getFeatureSectionData(teamName);
    },
    enabled: !!actor && !isFetching && !!teamName && enabled,
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

export function useGetNextFiveFixtures(teamName: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['nextFiveFixtures', teamName],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getNextFiveFixtures(teamName);
    },
    enabled: !!actor && !isFetching && !!teamName,
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

export function useAddPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamName, post }: { teamName: string; post: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.addPost(teamName, post);
    },
    onSuccess: (_, variables) => {
      // Invalidate to trigger immediate refetch on all components watching this query
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.teamName] });
      queryClient.invalidateQueries({ queryKey: ['featureSection', variables.teamName] });
    }
  });
}

export function useAddPrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamName, prediction }: { teamName: string; prediction: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.addPrediction(teamName, prediction);
    },
    onSuccess: (_, variables) => {
      // Invalidate to trigger immediate refetch on all components watching this query
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.teamName] });
      queryClient.invalidateQueries({ queryKey: ['featureSection', variables.teamName] });
    }
  });
}

export function useUpdateNews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamName, news }: { teamName: string; news: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.updateNews(teamName, news);
    },
    onSuccess: (_, variables) => {
      // Invalidate to trigger immediate refetch on all components watching this query
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.teamName] });
      queryClient.invalidateQueries({ queryKey: ['featureSection', variables.teamName] });
    }
  });
}

export function useAddFixture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamName, fixture }: { teamName: string; fixture: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.addFixture(teamName, fixture);
    },
    onSuccess: (_, variables) => {
      // Invalidate to trigger immediate refetch on all components watching this query
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.teamName] });
      queryClient.invalidateQueries({ queryKey: ['featureSection', variables.teamName] });
      queryClient.invalidateQueries({ queryKey: ['nextFiveFixtures', variables.teamName] });
    }
  });
}

// Player rating hooks
export function useRatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamName, playerId, rating }: { teamName: string; playerId: bigint; rating: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.ratePlayer(teamName, playerId, rating);
    },
    onSuccess: (_, variables) => {
      // Invalidate player rating query to refresh the display
      queryClient.invalidateQueries({ queryKey: ['playerRating', variables.teamName, variables.playerId] });
    }
  });
}

export function useGetPlayerRating(teamName: string, playerId: number) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['playerRating', teamName, playerId],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getPlayerRating(teamName, BigInt(playerId));
    },
    enabled: !!actor && !isFetching && !!teamName && playerId !== undefined,
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

export function useGetTopRatedPlayers(teamName: string, limit: number = 5) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['topRatedPlayers', teamName, limit],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getTopRatedPlayers(teamName, BigInt(limit));
    },
    enabled: !!actor && !isFetching && !!teamName,
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

// News ticker hooks
export function useGetNewsTickerHeadlines() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['newsTickerHeadlines'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getNewsTickerHeadlines();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 25000, // Auto-refetch every 25 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

export function useRefreshNewsTicker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.refreshNewsTicker();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsTickerHeadlines'] });
    }
  });
}
