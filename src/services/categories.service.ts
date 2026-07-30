import { eq, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import { categories, products } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/categories.js';

export class CategoriesService {
  async findAll() {
    return db.select().from(categories).orderBy(categories.name);
  }

  async findById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    if (!category) throw new AppError(404, 'Category not found');
    return category;
  }

  async create(input: CreateCategoryInput) {
    await db.insert(categories).values(input);
    return input;
  }

  async update(id: string, input: UpdateCategoryInput) {
    const result = await db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(categories.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Category not found');
    return this.findById(id);
  }

  async delete(id: string) {
    // Check for products using this category
    const [productCount] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.categoryId, id));
    if (productCount && productCount.value > 0) {
      throw new AppError(
        409,
        `Cannot delete: ${productCount.value} product(s) are using this category`,
      );
    }

    // Check for child categories
    const [childCount] = await db
      .select({ value: count() })
      .from(categories)
      .where(eq(categories.parentId, id));
    if (childCount && childCount.value > 0) {
      throw new AppError(
        409,
        `Cannot delete: ${childCount.value} sub-category(s) depend on this category`,
      );
    }

    const category = await this.findById(id);
    await db.delete(categories).where(eq(categories.id, id));
    return category;
  }
}

export const categoriesService = new CategoriesService();