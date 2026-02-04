import { z } from 'zod';
import {
  insertDsaTopicSchema,
  insertCsTopicSchema,
  insertProjectSchema,
  insertMockInterviewSchema,
  insertDailyLogSchema,
  dsaTopics, csTopics, projects, mockInterviews, dailyLogs
} from './schema';

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
};

export const api = {
  dsa: {
    list: {
      method: 'GET' as const,
      path: '/api/dsa',
      responses: {
        200: z.array(z.custom<typeof dsaTopics.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/dsa',
      input: insertDsaTopicSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof dsaTopics.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/dsa/:id',
      input: insertDsaTopicSchema.partial().omit({ userId: true }),
      responses: {
        200: z.custom<typeof dsaTopics.$inferSelect>(),
      },
    },
  },
  cs: {
    list: {
      method: 'GET' as const,
      path: '/api/cs',
      responses: {
        200: z.array(z.custom<typeof csTopics.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cs',
      input: insertCsTopicSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof csTopics.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/cs/:id',
      input: insertCsTopicSchema.partial().omit({ userId: true }),
      responses: {
        200: z.custom<typeof csTopics.$inferSelect>(),
      },
    },
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial().omit({ userId: true }),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  mocks: {
    list: {
      method: 'GET' as const,
      path: '/api/mocks',
      responses: {
        200: z.array(z.custom<typeof mockInterviews.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/mocks',
      input: insertMockInterviewSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof mockInterviews.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/mocks/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof dailyLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertDailyLogSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof dailyLogs.$inferSelect>(),
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
