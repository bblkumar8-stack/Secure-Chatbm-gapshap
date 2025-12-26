import { z } from 'zod';
import { insertChatSchema, insertMessageSchema, insertStorySchema, insertAudioSchema, chats, messages, stories, audios, users } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  users: {
    search: {
      method: 'GET' as const,
      path: '/api/users/search',
      input: z.object({ query: z.string() }),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  chats: {
    list: {
      method: 'GET' as const,
      path: '/api/chats',
      responses: {
        200: z.array(z.custom<any>()), // Typed as ChatResponse[] in frontend
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/chats',
      input: z.object({
        type: z.enum(["dm", "group"]),
        name: z.string().optional(),
        memberIds: z.array(z.string()),
        iconUrl: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof chats.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/chats/:id',
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/chats/:chatId/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/chats/:chatId/messages',
      input: insertMessageSchema.omit({ chatId: true, senderId: true }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  stories: {
    list: {
      method: 'GET' as const,
      path: '/api/stories',
      responses: {
        200: z.array(z.custom<typeof stories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stories',
      input: insertStorySchema.omit({ userId: true, expiresAt: true }),
      responses: {
        201: z.custom<typeof stories.$inferSelect>(),
      },
    },
  },
  audios: {
    list: {
      method: 'GET' as const,
      path: '/api/audios',
      responses: {
        200: z.array(z.custom<typeof audios.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/audios',
      input: insertAudioSchema.omit({ uploaderId: true }),
      responses: {
        201: z.custom<typeof audios.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
