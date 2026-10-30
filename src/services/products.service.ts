import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.ts';
import type { CreateProductInput, UpdateProductInput, StockUpdateInput } from '../validators/products.ts';

function toKaratString(k: string | null | undefined): string | null {
  if (!k) return null;
  return k.replace(/^K(\d+)$/, '$1K');
}

function toPrismaKarat(k: string | null | undefined): any {
  if (!k) return null;
  if (k.startsWith('K')) return k;
  return `K${k.replace('K', '')}`;
}

export class ProductsService {
  /**
   * Get product counts grouped by category and karat.
   */
  async getCounts() {
    const byCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
    });

    const byKarat = await prisma.product.groupBy({
      by: ['gold_karat'],
      _count: { id: true },
    });

    const categoryMap: Record<string, number> = {};
    for (const row of byCategory) {
      categoryMap[row.categoryId] = row._count.id;
    }

    const karatMap: Record<string, number> = {};
    for (const row of byKarat) {
      if (row.gold_karat) {
        const displayKarat = toKaratString(row.gold_karat);
        if (displayKarat) karatMap[displayKarat] = row._count.id;
      }
    }

    return { byCategory: categoryMap, byKarat: karatMap };
  }

  /**
   * List products with search, filter, and pagination.
   * Note: Out-of-stock items (stockQuantity = 0) are NOT filtered out.
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

    const where: any = {};

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
        { barcode: { contains: searchTerm } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (metalType) where.metalType = metalType as any;
    if (karat) where.gold_karat = toPrismaKarat(karat);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // No filter on stockQuantity — out-of-stock products remain visible for invoicing

    const orderByField = sortBy === 'karat' ? 'gold_karat' : sortBy;
    const orderBy: any = {};
    orderBy[orderByField] = sortOrder === 'desc' ? 'desc' : 'asc';

    const [allProducts, count] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: limitNum,
        skip: offset,
        include: {
          categories: { select: { name: true } },
          product_gemstones: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: allProducts.map((p: any) => ({
        ...p,
        karat: toKaratString(p.gold_karat),
        categoryName: p.categories?.name,
        gemstones: (p.product_gemstones || []).map((g: any) => ({
          ...g,
          type: g.gemstone_type,
          certificateNumber: g.certificate_number,
        })),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  /**
   * Get a single product with its gemstones.
   */
  async findById(id: string) {
    const product: any = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: { select: { name: true } },
        product_gemstones: true,
      },
    });

    if (!product) throw new AppError(404, 'Product not found');

    return {
      ...product,
      karat: toKaratString(product.gold_karat),
      categoryName: product.categories?.name,
      gemstones: (product.product_gemstones || []).map((g: any) => ({
        ...g,
        type: g.gemstone_type,
        certificateNumber: g.certificate_number,
      })),
    };
  }

  /**
   * Create a product with optional gemstones.
   */
  async create(input: CreateProductInput) {
    const { gemstones: gemstonesData, karat, ...productData } = input;

    // Verify category exists
    const category = await prisma.categories.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new AppError(400, 'Category not found');

    const prismaKarat = toPrismaKarat(karat);

    const created: any = await prisma.product.create({
      data: {
        ...productData,
        images: productData.images ? (productData.images as any) : undefined,
        gold_karat: prismaKarat,
        metalType: productData.metalType as any,
        metalWeight: productData.metalWeight as any,
        metalRate: productData.metalRate as any,
        sellingPrice: productData.sellingPrice as any,
        costPrice: productData.costPrice as any,
        makingCharges: (productData.makingCharges || '0.00') as any,
        reorderLevel: productData.reorderLevel ?? 0,
        product_gemstones: gemstonesData?.length
          ? {
              create: gemstonesData.map((g) => ({
                id: g.id || `gem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                name: g.name,
                gemstone_type: g.type as any,
                carat: g.carat ? (g.carat as any) : undefined,
                clarity: g.clarity,
                cut: g.cut,
                color: g.color,
                origin: g.origin,
                certified: g.certified,
                certificate_number: g.certificateNumber,
              })),
            }
          : undefined,
      } as any,
      include: {
        categories: { select: { name: true } },
        product_gemstones: true,
      },
    });

    return {
      ...created,
      karat: toKaratString(created.gold_karat),
      categoryName: category.name,
      gemstones: (created.product_gemstones || []).map((g: any) => ({
        ...g,
        type: g.gemstone_type,
        certificateNumber: g.certificate_number,
      })),
    };
  }

  /**
   * Update a product with optional gemstones replacement.
   */
  async update(id: string, input: UpdateProductInput) {
    const { gemstones: gemstonesData, karat, ...productData } = input;

    if (input.categoryId) {
      const category = await prisma.categories.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) throw new AppError(400, 'Category not found');
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Product not found');

    const prismaKarat = karat !== undefined ? toPrismaKarat(karat) : undefined;

    if (gemstonesData) {
      await prisma.product_gemstones.deleteMany({ where: { product_id: id } });
      if (gemstonesData.length) {
        await prisma.product_gemstones.createMany({
          data: gemstonesData.map((g) => ({
            id: g.id || `gem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            product_id: id,
            name: g.name,
            gemstone_type: g.type as any,
            carat: g.carat ? (g.carat as any) : undefined,
            clarity: g.clarity,
            cut: g.cut,
            color: g.color,
            origin: g.origin,
            certified: g.certified,
            certificate_number: g.certificateNumber,
          })),
        });
      }
    }

    const updated: any = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        images: productData.images ? (productData.images as any) : undefined,
        ...(prismaKarat !== undefined ? { gold_karat: prismaKarat } : {}),
        metalType: productData.metalType ? (productData.metalType as any) : undefined,
        metalWeight: productData.metalWeight ? (productData.metalWeight as any) : undefined,
        metalRate: productData.metalRate ? (productData.metalRate as any) : undefined,
        sellingPrice: productData.sellingPrice ? (productData.sellingPrice as any) : undefined,
        costPrice: productData.costPrice ? (productData.costPrice as any) : undefined,
        makingCharges: productData.makingCharges !== undefined ? (productData.makingCharges as any) : undefined,
      } as any,
      include: {
        categories: { select: { name: true } },
        product_gemstones: true,
      },
    });

    return {
      ...updated,
      karat: toKaratString(updated.gold_karat),
      categoryName: updated.categories?.name,
      gemstones: (updated.product_gemstones || []).map((g: any) => ({
        ...g,
        type: g.gemstone_type,
        certificateNumber: g.certificate_number,
      })),
    };
  }

  /**
   * Delete a product and its gemstones.
   */
  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError(404, 'Product not found');
    await prisma.product_gemstones.deleteMany({ where: { product_id: id } });
    await prisma.product.delete({ where: { id } });
    return product;
  }

  /**
   * Update stock quantity for a product.
   */
  async updateStock(id: string, input: StockUpdateInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Product not found');

    const updated = await prisma.product.update({
      where: { id },
      data: { stockQuantity: input.quantity },
    });
    return updated;
  }
}

export const productsService = new ProductsService();
