import { Router } from 'express';
import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pawningTerms } from '../db/schema.js';

const router = Router();

// GET /api/pawning-terms — all terms grouped by sortOrder
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(pawningTerms)
      .orderBy(asc(pawningTerms.sortOrder), asc(pawningTerms.language));

    // Group by groupId → { groupId, sortOrder, en, si, ta }
    const grouped: Record<number, { groupId: number; sortOrder: number; en?: string; si?: string; ta?: string }> = {};
    for (const row of rows) {
      if (!grouped[row.groupId]) {
        grouped[row.groupId] = { groupId: row.groupId, sortOrder: row.sortOrder };
      }
      grouped[row.groupId][row.language as 'en' | 'si' | 'ta'] = row.termText;
    }

    res.json({ status: 'success', data: Object.values(grouped).sort((a, b) => a.sortOrder - b.sortOrder) });
  } catch (err) {
    next(err);
  }
});

// GET /api/pawning-terms/flat?lang=si  — flat list for a single language
router.get('/flat', async (req, res, next) => {
  try {
    const lang = (req.query.lang as string) || 'en';
    const rows = await db
      .select()
      .from(pawningTerms)
      .where(eq(pawningTerms.language, lang as any))
      .orderBy(asc(pawningTerms.sortOrder));

    res.json({ status: 'success', data: rows.map(r => r.termText) });
  } catch (err) {
    next(err);
  }
});

export default router;
