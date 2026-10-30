import { prisma } from '../lib/prisma.ts';

export class PawningTermsService {
  async getAll() {
    const rows = await prisma.pawning_terms.findMany({
      orderBy: [
        { sort_order: 'asc' },
        { pawning_terms_language: 'asc' },
      ],
    });

    const grouped: Record<
      number,
      { groupId: number; sortOrder: number; en?: string; si?: string; ta?: string }
    > = {};

    for (const row of rows) {
      if (!grouped[row.group_id]) {
        grouped[row.group_id] = { groupId: row.group_id, sortOrder: row.sort_order };
      }
      grouped[row.group_id][row.pawning_terms_language as 'en' | 'si' | 'ta'] = row.term_text;
    }

    return Object.values(grouped).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getFlat(lang: string) {
    const rows = await prisma.pawning_terms.findMany({
      where: { pawning_terms_language: lang as any },
      orderBy: { sort_order: 'asc' },
    });

    return rows.map((r) => r.term_text);
  }

  async create(body: {
    groupId: number;
    sortOrder: number;
    en: string;
    si?: string;
    ta?: string;
  }) {
    const rows = await prisma.pawning_terms.findMany({
      orderBy: { sort_order: 'asc' },
    });
    const maxGroup = rows.reduce((m, r) => Math.max(m, r.group_id), 0);
    const groupId = body.groupId || maxGroup + 1;
    const sortOrder = body.sortOrder || maxGroup + 1;

    const toInsert = [
      {
        id: `pt-en-${String(groupId).padStart(2, '0')}-${Date.now()}`,
        group_id: groupId,
        sort_order: sortOrder,
        pawning_terms_language: 'en' as const,
        term_text: body.en,
      },
      ...(body.si
        ? [
            {
              id: `pt-si-${String(groupId).padStart(2, '0')}-${Date.now()}`,
              group_id: groupId,
              sort_order: sortOrder,
              pawning_terms_language: 'si' as const,
              term_text: body.si,
            },
          ]
        : []),
      ...(body.ta
        ? [
            {
              id: `pt-ta-${String(groupId).padStart(2, '0')}-${Date.now()}`,
              group_id: groupId,
              sort_order: sortOrder,
              pawning_terms_language: 'ta' as const,
              term_text: body.ta,
            },
          ]
        : []),
    ];

    await prisma.pawning_terms.createMany({ data: toInsert });
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
      await prisma.pawning_terms.deleteMany({ where: { group_id: groupId } });
      const sortOrder = body.sortOrder || groupId;
      const toInsert = [
        {
          id: `pt-en-${String(groupId).padStart(2, '0')}-${Date.now()}`,
          group_id: groupId,
          sort_order: sortOrder,
          pawning_terms_language: 'en' as const,
          term_text: body.en,
        },
        ...(body.si
          ? [
              {
                id: `pt-si-${String(groupId).padStart(2, '0')}-${Date.now()}`,
                group_id: groupId,
                sort_order: sortOrder,
                pawning_terms_language: 'si' as const,
                term_text: body.si,
              },
            ]
          : []),
        ...(body.ta
          ? [
              {
                id: `pt-ta-${String(groupId).padStart(2, '0')}-${Date.now()}`,
                group_id: groupId,
                sort_order: sortOrder,
                pawning_terms_language: 'ta' as const,
                term_text: body.ta,
              },
            ]
          : []),
      ];
      await prisma.pawning_terms.createMany({ data: toInsert });
    }

    return { groupId, ...body };
  }

  async delete(groupId: number) {
    await prisma.pawning_terms.deleteMany({ where: { group_id: groupId } });
    return { deleted: groupId };
  }
}

export const pawningTermsService = new PawningTermsService();
