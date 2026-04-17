import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  land_size: number;
  land_unit: string;
  main_crops: string[];
  language: string;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      // Get profile from localStorage
      const profiles = JSON.parse(localStorage.getItem('kisan_profiles') || '{}');
      return profiles[user!.id] || {
        id: user!.id,
        user_id: user!.id,
        name: '',
        village: '',
        district: '',
        state: '',
        land_size: 0,
        land_unit: 'acres',
        main_crops: [],
        language: 'en',
      };
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, "id" | "user_id">>) => {
      // Update profile in localStorage
      const profiles = JSON.parse(localStorage.getItem('kisan_profiles') || '{}');
      profiles[user!.id] = {
        ...profiles[user!.id],
        ...updates,
        id: user!.id,
        user_id: user!.id,
      };
      localStorage.setItem('kisan_profiles', JSON.stringify(profiles));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
