import { z } from 'zod';
import {
  insertDsaTopicSchema,
  insertCsTopicSchema,
  insertProjectSchema,
  insertMockInterviewSchema,
  insertDailyLogSchema,
  dsaTopics, csTopics, projects, mockInterviews, dailyLogs,
  insertCustomSectionSchema, insertCustomTopicSchema,
  customSections, customTopics,
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
      path: '/api/dsa',
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
      path: '/api/cs',
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
      path: '/api/projects',
      input: insertProjectSchema.partial().omit({ userId: true }),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects',
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
      path: '/api/mocks',
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
  customSections: {
    list: {
      method: 'GET' as const,
      path: '/api/custom-sections',
      responses: {
        200: z.array(z.custom<typeof customSections.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/custom-sections',
      input: insertCustomSectionSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof customSections.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/custom-sections',
      responses: {
        204: z.void(),
      },
    },
  },
  customTopics: {
    list: {
      method: 'GET' as const,
      path: '/api/custom-topics',
      responses: {
        200: z.array(z.custom<typeof customTopics.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/custom-topics',
      input: insertCustomTopicSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof customTopics.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/custom-topics',
      input: insertCustomTopicSchema.partial().omit({ userId: true }),
      responses: {
        200: z.custom<typeof customTopics.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/custom-topics',
      responses: {
        204: z.void(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  const queryParams: string[] = [];
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      } else {
        queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    });
  }
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  return url;
}
