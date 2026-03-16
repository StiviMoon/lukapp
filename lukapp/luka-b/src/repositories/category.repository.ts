import { prisma } from "@/db/client";
import { Category, TransactionType, Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/app-error";

/**
 * Repositorio para operaciones de base de datos de categorías
 */
export class CategoryRepository {
  /**
   * Crea una nueva categoría
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return await prisma.category.create({
      data,
    });
  }

  /**
   * Encuentra una categoría por ID y userId
   */
  async findById(id: string, userId: string): Promise<Category | null> {
    return await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Encuentra todas las categorías de un usuario
   */
  async findByUserId(
    userId: string,
    options?: {
      type?: TransactionType;
    }
  ): Promise<Category[]> {
    return await prisma.category.findMany({
      where: {
        userId,
        ...(options?.type && { type: options.type }),
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  /**
   * Actualiza una categoría
   */
  async update(
    id: string,
    userId: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    const category = await this.findById(id, userId);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina una categoría
   */
  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findById(id, userId);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    await prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Encuentra categorías por defecto
   */
  async findDefaultByType(
    userId: string,
    type: TransactionType
  ): Promise<Category | null> {
    return await prisma.category.findFirst({
      where: {
        userId,
        type,
        isDefault: true,
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();

