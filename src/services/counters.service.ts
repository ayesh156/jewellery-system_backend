import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { counters } from '../db/schema.js';
import { DEFAULT_PREFIXES, ENTITY_TYPES } from '../config/constants.js';

export class CountersService {
  async list(shopCode?: string) {
    const conditions = shopCode ? eq(counters.shopCode, shopCode) : undefined;
    const allCounters = await db.select().from(counters).where(conditions);

    return allCounters.map((c) => ({
      ...c,
      nextNumber: c.lastNumber + 1,
      nextFormatted: `${c.shopCode}${(c.lastNumber + 1).toString().padStart(c.paddingLength, '0')}`,
      nextFormattedId: `${c.shopCode}-${c.prefix}-${(c.lastNumber + 1).toString().padStart(c.paddingLength, '0')}`,
    }));
  }

  async getNext(entityType: string, shopCode: string) {
    const prefix = DEFAULT_PREFIXES[entityType] || entityType.toUpperCase().slice(0, 4);

    // Check if counter exists
    const [existing] = await db
      .select()
      .from(counters)
      .where(and(eq(counters.entityType, entityType), eq(counters.shopCode, shopCode)));

    if (existing) {
      await db
        .update(counters)
        .set({ lastNumber: sql`${counters.lastNumber} + 1` })
        .where(and(eq(counters.entityType, entityType), eq(counters.shopCode, shopCode)));
    } else {
      try {
        await db.insert(counters).values({
          id: `counter-${shopCode}-${entityType}`,
          entityType,
          shopCode,
          prefix,
          lastNumber: 1,
          paddingLength: 5,
        });
      } catch (insertErr: any) {
        if (insertErr?.errno === 1062 || insertErr?.code === 'ER_DUP_ENTRY') {
          await db
            .update(counters)
            .set({ lastNumber: sql`${counters.lastNumber} + 1` })
            .where(and(eq(counters.entityType, entityType), eq(counters.shopCode, shopCode)));
        } else {
          throw insertErr;
        }
      }
    }

    const [counter] = await db
      .select()
      .from(counters)
      .where(and(eq(counters.entityType, entityType), eq(counters.shopCode, shopCode)));

    const paddedNumber = counter.lastNumber.toString().padStart(counter.paddingLength, '0');
    return {
      entityType: counter.entityType,
      shopCode: counter.shopCode,
      prefix: counter.prefix,
      number: counter.lastNumber,
      formatted: `${shopCode}${paddedNumber}`,
      formattedId: `${shopCode}-${counter.prefix}-${paddedNumber}`,
    };
  }

  async initShop(shopCode: string) {
    const existing = await db
      .select()
      .from(counters)
      .where(eq(counters.shopCode, shopCode));

    const existingTypes = new Set(existing.map((c) => c.entityType));
    const toCreate = ENTITY_TYPES.filter((t) => !existingTypes.has(t));

    if (toCreate.length > 0) {
      await db.insert(counters).values(
        toCreate.map((entityType) => ({
          id: `counter-${shopCode}-${entityType}`,
          entityType,
          shopCode,
          prefix: DEFAULT_PREFIXES[entityType],
          lastNumber: 0,
          paddingLength: 5,
        })),
      );
    }

    const allCounters = await db
      .select()
      .from(counters)
      .where(eq(counters.shopCode, shopCode));

    return {
      data: allCounters.map((c) => ({
        ...c,
        nextNumber: c.lastNumber + 1,
        nextFormatted: `${c.shopCode}${(c.lastNumber + 1).toString().padStart(c.paddingLength, '0')}`,
        nextFormattedId: `${c.shopCode}-${c.prefix}-${(c.lastNumber + 1).toString().padStart(c.paddingLength, '0')}`,
      })),
      created: toCreate.length,
    };
  }

  async update(
    entityType: string,
    input: { shopCode: string; prefix?: string; paddingLength?: number; lastNumber?: number },
  ) {
    const setFields: Record<string, any> = {};
    if (input.prefix !== undefined) setFields.prefix = input.prefix;
    if (input.paddingLength !== undefined) setFields.paddingLength = input.paddingLength;
    if (input.lastNumber !== undefined) setFields.lastNumber = input.lastNumber;

    if (Object.keys(setFields).length === 0) {
      throw new Error('No fields to update');
    }

    const result = await db
      .update(counters)
      .set(setFields)
      .where(and(eq(counters.entityType, entityType), eq(counters.shopCode, input.shopCode)));

    if ((result as any)[0].affectedRows === 0) {
      throw new Error(`Counter not found for ${entityType} / ${input.shopCode}`);
    }

    const [updated] = await db
      .select()
      .from(counters)
      .where(and(eq(counters.entityType, entityType), eq(counters.shopCode, input.shopCode)));

    return {
      ...updated,
      nextNumber: updated.lastNumber + 1,
      nextFormatted: `${updated.shopCode}${(updated.lastNumber + 1).toString().padStart(updated.paddingLength, '0')}`,
      nextFormattedId: `${updated.shopCode}-${updated.prefix}-${(updated.lastNumber + 1).toString().padStart(updated.paddingLength, '0')}`,
    };
  }
}

export const countersService = new CountersService();