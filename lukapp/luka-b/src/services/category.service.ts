import { categoryRepository } from "@/repositories/category.repository";
import { budgetRepository } from "@/repositories/budget.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category.schema";
import { NotFoundError, ConflictError } from "@/errors/app-error";
import { TransactionType } from "@prisma/client";

/**
 * Servicio para lógica de negocio de categorías
 */
export class CategoryService {
  /**
   * Crea una nueva categoría
   */
  async createCategory(userId: string, data: CreateCategoryInput) {
    // Verificar duplicados: no permitir misma nombre+tipo por usuario
    const existing = await categoryRepository.findByNameAndType(userId, data.name, data.type);
    if (existing) {
      throw new ConflictError(`Ya existe una categoría "${data.name.trim()}" de tipo ${data.type === "EXPENSE" ? "Gasto" : "Ingreso"}`);
    }

    // Si se marca como default, quitar default de otras categorías del mismo tipo
    if (data.isDefault) {
      const existingDefault = await categoryRepository.findDefaultByType(
        userId,
        data.type
      );

      if (existingDefault) {
        await categoryRepository.update(existingDefault.id, userId, {
          isDefault: false,
        });
      }
    }

    return await categoryRepository.create({
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      isDefault: data.isDefault ?? false,
      profile: {
        connect: { userId },
      },
    });
  }

  /**
   * Obtiene todas las categorías de un usuario
   */
  async getCategories(userId: string, options?: { type?: TransactionType }) {
    return await categoryRepository.findByUserId(userId, {
      ...(options?.type && { type: options.type }),
    });
  }

  /**
   * Obtiene una categoría por ID
   */
  async getCategoryById(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    return category;
  }

  /**
   * Actualiza una categoría
   */
  async updateCategory(id: string, userId: string, data: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id, userId);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    // Si se marca como default, quitar default de otras categorías del mismo tipo
    if (data.isDefault === true) {
      const existingDefault = await categoryRepository.findDefaultByType(
        userId,
        data.type ?? category.type
      );

      if (existingDefault && existingDefault.id !== id) {
        await categoryRepository.update(existingDefault.id, userId, {
          isDefault: false,
        });
      }
    }

    return await categoryRepository.update(id, userId, {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    });
  }

  /**
   * Elimina una categoría y sus presupuestos asociados
   */
  async deleteCategory(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    // Eliminar presupuestos vinculados a esta categoría antes de eliminarla
    // (evita que queden presupuestos huérfanos con categoryId: null)
    await budgetRepository.deleteByCategoryId(id, userId);

    await categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();

