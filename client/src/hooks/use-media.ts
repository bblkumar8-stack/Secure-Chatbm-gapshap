import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateStoryRequest, type CreateAudioRequest } from "@shared/routes";

// STORIES
export function useStories() {
  return useQuery({
    queryKey: [api.stories.list.path],
    queryFn: async () => {
      const res = await fetch(api.stories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stories");
      return api.stories.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CreateStoryRequest, "userId" | "expiresAt">) => {
      const validated = api.stories.create.input.parse(data);
      const res = await fetch(api.stories.create.path, {
        method: api.stories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create story");
      return api.stories.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stories.list.path] });
    },
  });
}

// AUDIO
export function useAudios() {
  return useQuery({
    queryKey: [api.audios.list.path],
    queryFn: async () => {
      const res = await fetch(api.audios.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audios");
      return api.audios.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CreateAudioRequest, "uploaderId">) => {
      const validated = api.audios.create.input.parse(data);
      const res = await fetch(api.audios.create.path, {
        method: api.audios.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create audio");
      return api.audios.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.audios.list.path] });
    },
  });
}
