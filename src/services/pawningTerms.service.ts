import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pawningTerms } from '../db/schema.js';

export class PawningTermsService {
  async getAll() {
    const rows = await db
      .select()
      .from(pawningTerms)
      .orderBy(asc(pawningTerms.sortOrder), asc(pawningTerms.language));

    const grouped: Record<
      number,
      { groupId: number; sortOrder: number; en?: string; si?: string; ta?: string }
    > = {};

    for (const row of rows) {
      if (!grouped[row.groupId]) {
        grouped[row.groupId] = { groupId: row.groupId, sortOrder: row.sortOrder };
      }
      grouped[row.groupId][row.language as 'en' | 'si' | 'ta'] = row.termText;
    }

    return Object.values(grouped).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getFlat(lang: string) {
    const rows = await db
      .select()
      .from(pawningTerms)
      .where(eq(pawningTerms.language, lang as any))
      .orderBy(asc(pawningTerms.sortOrder));

    return rows.map((r) => r.termText);
  }

  async create(body: {
    groupId: number;
    sortOrder: number;
    en: string;
    si?: string;
    ta?: string;
  }) {
    const rows = await db
      .select()
      .from(pawningTerms)
      .orderBy(asc(pawningTerms.sortOrder));
    const maxGroup = rows.reduce((m, r) => Math.max(m, r.groupId), 0);
    const groupId = body.groupId || maxGroup + 1;
    const sortOrder = body.sortOrder || maxGroup + 1;

    const toInsert = [
      {
        id: `pt-en-${String(groupId).padStart(2, '0')}-${Date.now()}`,
        groupId,
        sortOrder,
        language: 'en' as const,
        termText: body.en,
      },
      ...(body.si
        ? [
            {
              id: `pt-si-${String(groupId).padStart(2, '0')}-${Date.now()}`,
              groupId,
              sortOrder,
              language: 'si' as const,
              termText: body.si,
            },
          ]
        : []),
      ...(body.ta
        ? [
            {
              id: `pt-ta-${String(groupId).padStart(2, '0')}-${Date.now()}`,
              groupId,
              sortOrder,
              language: 'ta' as const,
              termText: body.ta,
            },
          ]
        : []),
    ];

    await db.insert(pawningTerms).values(toInsert);
    return { groupId, sortOrder, en: body.en, si: body.si, ta: body.ta };
  }

  async update(
    groupId: number,
    body: {
      en?: string;
      si?: string;
      ta?: string;
      sortOrder?: number;
    },
  ) {
    if (body.en !== undefined) {
      await db.delete(pawningTerms).where(eq(pawningTerms.groupId, groupId));
      const sortOrder = body.sortOrder || groupId;
      const toInsert = [
        {
          id: `pt-en-${String(groupId).padStart(2, '0')}-${Date.now()}`,
          groupId,
          sortOrder,
          language: 'en' as const,
          termText: body.en,
        },
        ...(body.si
          ? [
              {
                id: `pt-si-${String(groupId).padStart(2, '0')}-${Date.now()}`,
                groupId,
                sortOrder,
                language: 'si' as const,
                termText: body.si,
              },
            ]
          : []),
        ...(body.ta
          ? [
              {
                id: `pt-ta-${String(groupId).padStart(2, '0')}-${Date.now()}`,
                groupId,
                sortOrder,
                language: 'ta' as const,
                termText: body.ta,
              },
            ]
          : []),
      ];
      await db.insert(pawningTerms).values(toInsert);
    }

    return { groupId, ...body };
  }

  async delete(groupId: number) {
    await db.delete(pawningTerms).where(eq(pawningTerms.groupId, groupId));
    return { deleted: groupId };
  }
}

export const pawningTermsService = new PawningTermsService();