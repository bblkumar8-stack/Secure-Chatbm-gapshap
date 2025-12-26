import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Message, type CreateMessageRequest } from "@shared/routes";

export function useMessages(chatId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, chatId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { chatId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!chatId,
    refetchInterval: 3000, // Poll every 3s for new messages (simple implementation)
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, ...data }: { chatId: number } & Omit<CreateMessageRequest, "chatId" | "senderId">) => {
      const url = buildUrl(api.messages.send.path, { chatId });
      const validated = api.messages.send.input.parse(data);
      
      const res = await fetch(url, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.send.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, variables.chatId] });
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] }); // Update last message in list
    },
  });
}
