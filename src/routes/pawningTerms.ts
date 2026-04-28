import { Router } from 'express';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { pawningTerms } from '../db/schema.js';

const router = Router();

const termSchema = z.object({
  groupId: z.number().int().min(1),
  sortOrder: z.number().int().min(1),
  en: z.string().min(1).max(1000),
  si: z.string().max(1000).optional(),
  ta: z.string().max(1000).optional(),
});

// GET /api/pawning-terms — all terms grouped by sortOrder
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(pawningTerms)
      .orderBy(asc(pawningTerms.sortOrder), asc(pawningTerms.language));

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

// GET /api/pawning-terms/flat?lang=si
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

// POST /api/pawning-terms — add new term group (EN + SI + TA)
router.post('/', async (req, res, next) => {
  try {
    const body = termSchema.parse(req.body);

    // Get next groupId if not provided
    const rows = await db.select().from(pawningTerms).orderBy(asc(pawningTerms.sortOrder));
    const maxGroup = rows.reduce((m, r) => Math.max(m, r.groupId), 0);
    const groupId = body.groupId || maxGroup + 1;
    const sortOrder = body.sortOrder || maxGroup + 1;

    const toInsert = [
      { id: `pt-en-${String(groupId).padStart(2,'0')}-${Date.now()}`, groupId, sortOrder, language: 'en' as const, termText: body.en },
      ...(body.si ? [{ id: `pt-si-${String(groupId).padStart(2,'0')}-${Date.now()}`, groupId, sortOrder, language: 'si' as const, termText: body.si }] : []),
      ...(body.ta ? [{ id: `pt-ta-${String(groupId).padStart(2,'0')}-${Date.now()}`, groupId, sortOrder, language: 'ta' as const, termText: body.ta }] : []),
    ];

    await db.insert(pawningTerms).values(toInsert);
    res.status(201).json({ status: 'success', data: { groupId, sortOrder, en: body.en, si: body.si, ta: body.ta } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
      return;
    }
    next(err);
  }
});

// PUT /api/pawning-terms/:groupId — update all languages for a group
router.put('/:groupId', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const body = termSchema.partial().parse(req.body);

    if (body.en !== undefined) {
      await db.delete(pawningTerms).where(eq(pawningTerms.groupId, groupId));
      const sortOrder = body.sortOrder || groupId;
      const toInsert = [
        { id: `pt-en-${String(groupId).padStart(2,'0')}-${Date.now()}`, groupId, sortOrder, language: 'en' as const, termText: body.en },
        ...(body.si ? [{ id: `pt-si-${String(groupId).padStart(2,'0')}-${Date.now()}`, groupId, sortOrder, language: 'si' as const, termText: body.si }] : []),
        ...(body.ta ? [{ id: `pt-ta-${String(groupId).padStart(2,'0')}-${Date.now()}`, groupId, sortOrder, language: 'ta' as const, termText: body.ta }] : []),
      ];
      await db.insert(pawningTerms).values(toInsert);
    }

    res.json({ status: 'success', data: { groupId, ...body } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
      return;
    }
    next(err);
  }
});

// DELETE /api/pawning-terms/:groupId — delete all languages for a group
router.delete('/:groupId', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    await db.delete(pawningTerms).where(eq(pawningTerms.groupId, groupId));
    res.json({ status: 'success', data: { deleted: groupId } });
  } catch (err) {
    next(err);
  }
});

export default router;
