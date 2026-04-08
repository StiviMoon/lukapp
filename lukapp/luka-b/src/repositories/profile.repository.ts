import { prisma } from "@/db/client";
import { Profile, Prisma, UserPlan } from "@prisma/client";
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
   * Actualiza o crea un perfil (upsert).
   * Si dos requests crean el perfil a la vez, el segundo puede recibir P2002 (unique userId);
   * en ese caso hacemos update — mismo resultado, sin error ruidoso ni 500.
   */
  async upsert(
    userId: string,
    email: string,
    data?: Prisma.ProfileUpdateInput
  ): Promise<Profile> {
    const updateData: Prisma.ProfileUpdateInput = {
      ...(data ?? {}),
      email,
    };

    try {
      return await prisma.profile.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          email,
        } as Prisma.ProfileUncheckedCreateInput,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        const existing = await this.findByUserId(userId);
        if (existing) {
          return prisma.profile.update({
            where: { userId },
            data: updateData,
          });
        }
      }
      throw e;
    }
  }

  /**
   * Actualiza el plan de un usuario (FREE ↔ PREMIUM)
   */
  async updatePlan(userId: string, plan: UserPlan): Promise<Profile> {
    return await prisma.profile.update({
      where: { userId },
      data: {
        plan,
        planActivatedAt: plan === UserPlan.PREMIUM ? new Date() : null,
        planExpiresAt: null,
      },
    });
  }

  /**
   * Marca el onboarding como completado
   */
  async completeOnboarding(userId: string): Promise<Profile> {
    return await prisma.profile.update({
      where: { userId },
      data: { onboardingCompleted: true },
    });
  }
}

export const profileRepository = new ProfileRepository();

