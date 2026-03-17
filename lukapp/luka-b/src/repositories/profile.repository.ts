import { prisma } from "@/db/client";
import { Profile, Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/app-error";

/**
 * Repositorio para operaciones de base de datos de perfiles
 */
export class ProfileRepository {
  /**
   * Crea un nuevo perfil
   */
  async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return await prisma.profile.create({
      data,
    });
  }

  /**
   * Encuentra un perfil por userId
   */
  async findByUserId(userId: string): Promise<Profile | null> {
    return await prisma.profile.findUnique({
      where: { userId },
    });
  }

  /**
   * Encuentra un perfil por ID
   */
  async findById(id: string): Promise<Profile | null> {
    return await prisma.profile.findUnique({
      where: { id },
    });
  }

  /**
   * Actualiza un perfil
   */
  async update(
    userId: string,
    data: Prisma.ProfileUpdateInput
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Perfil no encontrado");
    }

    return await prisma.profile.update({
      where: { userId },
      data,
    });
  }

  /**
   * Actualiza o crea un perfil (upsert)
   */
  async upsert(
    userId: string,
    email: string,
    data?: Prisma.ProfileUpdateInput
  ): Promise<Profile> {
    return await prisma.profile.upsert({
      where: { userId },
      update: data ?? {},
      create: {
        userId,
        email,
      } as Prisma.ProfileUncheckedCreateInput,
    });
  }
}

export const profileRepository = new ProfileRepository();

