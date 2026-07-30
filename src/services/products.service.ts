import { eq, like, or, sql, asc, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { products, productGemstones, categories } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';
import type { CreateProductInput, UpdateProductInput, StockUpdateInput } from '../validators/products.js';

export class ProductsService {
  /**
   * Get product counts grouped by category and karat.
   */
  async getCounts() {
    const byCategory = await db
      .select({ categoryId: products.categoryId, count: sql<number>`count(*)` })
      .from(products)
      .groupBy(products.categoryId);

    const byKarat = await db
      .select({ karat: products.karat, count: sql<number>`count(*)` })
      .from(products)
      .groupBy(products.karat);

    const categoryMap: Record<string, number> = {};
    for (const row of byCategory) categoryMap[row.categoryId] = row.count;

    const karatMap: Record<string, number> = {};
    for (const row of byKarat) {
      if (row.karat) karatMap[row.karat] = row.count;
    }

    return { byCategory: categoryMap, byKarat: karatMap };
  }

  /**
   * List products with search, filter, and pagination.
   */
  async findAll(query: Record<string, string>) {
    const {
      search,
      categoryId,
      metalType,
      karat,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
      page = '1',
      limit = String(DEFAULT_PAGE_SIZE),
    } = query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit) || DEFAULT_PAGE_SIZE));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof sql>[] = [];
    if (search) {
      conditions.push(
        or(like(products.name, `%${search}%`), like(products.sku, `%${search}%`)) as any,
      );
    }
    if (categoryId) conditions.push(eq(products.categoryId, categoryId) as any);
    if (metalType) conditions.push(eq(products.metalType, metalType as any) as any);
    if (karat) conditions.push(eq(products.karat, karat as any) as any);
    if (isActive !== undefined)
      conditions.push(eq(products.isActive, isActive === 'true') as any);

    const where =
      conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortColumn = (products as any)[sortBy] || products.name;
    const orderByClause =
      sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const [allProducts, [{ count }]] = await Promise.all([
      db
        .select({
          product: products,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .orderBy(orderByClause)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(where),
    ]);

    return {
      data: allProducts.map(({ product, categoryName }) => ({
        ...product,
        categoryName,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    };
  }

  /**
   * Get a single product with its gemstones.
   */
  async findById(id: string) {
    const [product] = await db
      .select({
        product: products,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!product) throw new AppError(404, 'Product not found');

    const gemstones = await db
      .select()
      .from(productGemstones)
      .where(eq(productGemstones.productId, id));

    return {
      ...product.product,
      categoryName: product.categoryName,
      gemstones,
    };
  }

  /**
   * Create a product with optional gemstones.
   */
  async create(input: CreateProductInput) {
    const { gemstones: gemstonesData, ...productData } = input;

    // Verify category exists
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, input.categoryId));
    if (!category) throw new AppError(400, 'Category not found');

    await db.insert(products).values({
      ...productData,
      dateAdded: new Date(),
      lastUpdated: new Date(),
    });

    const [created] = await db
      .select()
      .from(products)
      .where(eq(products.id, productData.id));

    if (gemstonesData?.length) {
      await db
        .insert(productGemstones)
        .values(gemstonesData.map((g) => ({ ...g, productId: created.id })));
    }

    const gemstones = gemstonesData?.length
      ? await db
          .select()
          .from(productGemstones)
          .where(eq(productGemstones.productId, created.id))
      : [];

    return { ...created, categoryName: category.name, gemstones };
  }

  /**
   * Update a product with optional gemstones replacement.
   */
  async update(id: string, input: UpdateProductInput) {
    const { gemstones: gemstonesData, ...productData } = input;

    if (input.categoryId) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, input.categoryId));
      if (!category) throw new AppError(400, 'Category not found');
    }

    const result = await db
      .update(products)
      .set({ ...productData, lastUpdated: new Date() })
      .where(eq(products.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Product not found');

    const [updated] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (gemstonesData) {
      await db
        .delete(productGemstones)
        .where(eq(productGemstones.productId, id));
      if (gemstonesData.length) {
        await db
          .insert(productGemstones)
          .values(gemstonesData.map((g) => ({ ...g, productId: id })));
      }
    }

    const gemstones = await db
      .select()
      .from(productGemstones)
      .where(eq(productGemstones.productId, id));

    return { ...updated, gemstones };
  }

  /**
   * Delete a product and its gemstones.
   */
  async delete(id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (!product) throw new AppError(404, 'Product not found');
    await db.delete(products).where(eq(products.id, id));
    return product;
  }

  /**
   * Update stock quantity for a product.
   */
  async updateStock(id: string, input: StockUpdateInput) {
    const result = await db
      .update(products)
      .set({ stockQuantity: input.quantity, lastUpdated: new Date() })
      .where(eq(products.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Product not found');

    const [updated] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return updated;
  }
}

export const productsService = new ProductsService();