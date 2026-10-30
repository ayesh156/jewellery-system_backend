import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/categories.ts';

function formatCategory(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    parentId: c.parent_id,
    icon: c.icon,
    isActive: c.is_active,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export class CategoriesService {
  async findAll() {
    const list = await prisma.categories.findMany({
      orderBy: { name: 'asc' },
    });
    return list.map(formatCategory);
  }

  async findById(id: string) {
    const category = await prisma.categories.findUnique({
      where: { id },
    });
    if (!category) throw new AppError(404, 'Category not found');
    return formatCategory(category);
  }

  async create(input: CreateCategoryInput) {
    const trimmedName = input.name ? input.name.trim() : '';
    if (!trimmedName) throw new AppError(400, 'Category name is required');

    const parentId = input.parentId && input.parentId.trim() ? input.parentId.trim() : null;
    if (parentId) {
      const parentExists = await prisma.categories.findUnique({ where: { id: parentId } });
      if (!parentExists) throw new AppError(400, `Parent category '${parentId}' does not exist`);
    }

    const created = await prisma.categories.create({
      data: {
        id: input.id.trim(),
        name: trimmedName,
        description: input.description && input.description.trim() ? input.description.trim() : null,
        parent_id: parentId,
        icon: input.icon && input.icon.trim() ? input.icon.trim() : '💎',
        is_active: input.isActive !== undefined ? input.isActive : true,
      },
    });
    return formatCategory(created);
  }

  async update(id: string, input: UpdateCategoryInput) {
    const existing = await prisma.categories.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Category not found');

    const updateData: any = {};
    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) throw new AppError(400, 'Category name cannot be empty');
      updateData.name = trimmedName;
    }
    if (input.description !== undefined) {
      updateData.description = input.description && input.description.trim() ? input.description.trim() : null;
    }
    if (input.parentId !== undefined) {
      const parentId = input.parentId && input.parentId.trim() ? input.parentId.trim() : null;
      if (parentId) {
        if (parentId === id) throw new AppError(400, 'A category cannot be its own parent');
        const parentExists = await prisma.categories.findUnique({ where: { id: parentId } });
        if (!parentExists) throw new AppError(400, `Parent category '${parentId}' does not exist`);
      }
      updateData.parent_id = parentId;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon && input.icon.trim() ? input.icon.trim() : '💎';
    }
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const updated = await prisma.categories.update({
      where: { id },
      data: updateData,
    });
    return formatCategory(updated);
  }

  async delete(id: string) {
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new AppError(
        409,
        `Cannot delete: ${productCount} product(s) are using this category`,
      );
    }

    const childCount = await prisma.categories.count({
      where: { parent_id: id },
    });
    if (childCount > 0) {
      throw new AppError(
        409,
        `Cannot delete: ${childCount} sub-category(s) depend on this category`,
      );
    }

    const category = await this.findById(id);
    await prisma.categories.delete({ where: { id } });
    return category;
  }
}

export const categoriesService = new CategoriesService();
