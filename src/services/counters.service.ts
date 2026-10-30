import { prisma } from '../lib/prisma.ts';
import { DEFAULT_PREFIXES, ENTITY_TYPES } from '../config/constants.ts';

function formatCounter(c: any) {
  if (!c) return null;
  const nextNum = c.last_number + 1;
  const padded = nextNum.toString().padStart(c.padding_length, '0');
  return {
    id: c.id,
    entityType: c.entity_type,
    shopCode: c.shop_code,
    prefix: c.prefix,
    lastNumber: c.last_number,
    paddingLength: c.padding_length,
    nextNumber: nextNum,
    nextFormatted: `${c.shop_code}${padded}`,
    nextFormattedId: `${c.shop_code}-${c.prefix}-${padded}`,
  };
}

export class CountersService {
  async list(shopCode?: string) {
    const where = shopCode ? { shop_code: shopCode } : {};
    const allCounters = await prisma.counters.findMany({ where });
    return allCounters.map(formatCounter);
  }

  async getNext(entityType: string, shopCode: string) {
    const prefix = DEFAULT_PREFIXES[entityType] || entityType.toUpperCase().slice(0, 4);

    const counter = await prisma.counters.upsert({
      where: {
        entity_type_shop_code: {
          entity_type: entityType,
          shop_code: shopCode,
        },
      },
      update: {
        last_number: { increment: 1 },
      },
      create: {
        id: `counter-${shopCode}-${entityType}`,
        entity_type: entityType,
        shop_code: shopCode,
        prefix,
        last_number: 1,
        padding_length: 5,
      },
    });

    const paddedNumber = counter.last_number.toString().padStart(counter.padding_length, '0');
    return {
      entityType: counter.entity_type,
      shopCode: counter.shop_code,
      prefix: counter.prefix,
      number: counter.last_number,
      formatted: `${shopCode}${paddedNumber}`,
      formattedId: `${shopCode}-${counter.prefix}-${paddedNumber}`,
    };
  }

  async initShop(shopCode: string) {
    const existing = await prisma.counters.findMany({
      where: { shop_code: shopCode },
    });

    const existingTypes = new Set(existing.map((c) => c.entity_type));
    const toCreate = ENTITY_TYPES.filter((t) => !existingTypes.has(t));

    if (toCreate.length > 0) {
      await prisma.counters.createMany({
        data: toCreate.map((entityType) => ({
          id: `counter-${shopCode}-${entityType}`,
          entity_type: entityType,
          shop_code: shopCode,
          prefix: DEFAULT_PREFIXES[entityType] || entityType.toUpperCase().slice(0, 4),
          last_number: 0,
          padding_length: 5,
        })),
      });
    }

    const allCounters = await prisma.counters.findMany({
      where: { shop_code: shopCode },
    });

    return {
      data: allCounters.map(formatCounter),
      created: toCreate.length,
    };
  }

  async update(
    entityType: string,
    input: { shopCode: string; prefix?: string; paddingLength?: number; lastNumber?: number },
  ) {
    const updateData: any = {};
    if (input.prefix !== undefined) updateData.prefix = input.prefix;
    if (input.paddingLength !== undefined) updateData.padding_length = input.paddingLength;
    if (input.lastNumber !== undefined) updateData.last_number = input.lastNumber;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    const updated = await prisma.counters.update({
      where: {
        entity_type_shop_code: {
          entity_type: entityType,
          shop_code: input.shopCode,
        },
      },
      data: updateData,
    });

    return formatCounter(updated);
  }
}

export const countersService = new CountersService();
