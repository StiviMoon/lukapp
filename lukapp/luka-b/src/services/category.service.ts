import { categoryRepository } from "@/repositories/category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category.schema";
import { NotFoundError } from "@/errors/app-error";
import { TransactionType } from "@prisma/client";

/**
 * Servicio para lógica de negocio de categorías
 */
export class CategoryService {
  /**
   * Crea una nueva categoría
   */
  async createCategory(userId: string, data: CreateCategoryInput) {
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
      userId,
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
   * Elimina una categoría
   */
  async deleteCategory(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    // Verificar si la categoría tiene transacciones asociadas
    // Esto se puede hacer a través de Prisma o de la capa de repositorio
    // Por ahora, permitimos eliminar pero las transacciones quedan sin categoría (null)

    await categoryRepository.delete(id, userId);
  }
}

export const categoryService = new CategoryService();

