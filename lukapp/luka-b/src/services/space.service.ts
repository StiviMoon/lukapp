import { contactRepository } from "@/repositories/contact.repository";
import { spaceRepository } from "@/repositories/space.repository";
import { ContactStatus } from "@prisma/client";
import { NotFoundError, ValidationError, ForbiddenError } from "@/errors/app-error";
import {
  CreateSpaceInput,
  CreateSharedBudgetInput,
  UpdateSharedBudgetInput,
  AddSharedTransactionInput,
  UpdateSharedTransactionInput,
} from "@/validations/space.schema";

export class SpaceService {
  async createSpace(userId: string, data: CreateSpaceInput) {
    // Verificar que el contacto existe y está aceptado
    const contact = await contactRepository.findById(data.contactId);
    if (!contact) throw new NotFoundError("Contacto no encontrado");

    if (contact.status !== ContactStatus.ACCEPTED) {
      throw new ValidationError("El contacto debe estar aceptado para crear una sala");
    }

    // Identificar quién es el otro miembro
    const isRequester = contact.requesterId === userId;
    const otherUserId = isRequester ? contact.receiverId : contact.requesterId;

    if (otherUserId !== contact.receiverId && otherUserId !== contact.requesterId) {
      throw new ForbiddenError("No tienes permiso para crear esta sala");
    }

    // Verificar que no sean parte de la misma relación
    if (contact.requesterId !== userId && contact.receiverId !== userId) {
      throw new ForbiddenError("No formas parte de este contacto");
    }

    // Verificar que no existe ya una sala entre ellos
    const existing = await spaceRepository.findSpaceBetweenUsers(userId, otherUserId);
    if (existing) {
      throw new ValidationError("Ya existe una sala compartida con este contacto");
    }

    return spaceRepository.createSpace({
      name: data.name ?? "Finanzas compartidas",
      createdBy: userId,
      memberUserId: otherUserId,
    });
  }

  async getMySpaces(userId: string) {
    return spaceRepository.findSpacesByUser(userId);
  }

  async getSpaceById(id: string, userId: string) {
    const space = await spaceRepository.findSpaceById(id);
    if (!space) throw new NotFoundError("Sala no encontrada");

    const isMember = space.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("No eres miembro de esta sala");

    return space;
  }

  async updateSalary(spaceId: string, userId: string, salary: number) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    return spaceRepository.updateSalary(spaceId, userId, salary);
  }

  async createSharedBudget(spaceId: string, userId: string, data: CreateSharedBudgetInput) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    return spaceRepository.createSharedBudget(spaceId, data);
  }

  async updateSharedBudget(budgetId: string, spaceId: string, userId: string, data: UpdateSharedBudgetInput) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    const budget = await spaceRepository.findBudgetById(budgetId);
    if (!budget || budget.spaceId !== spaceId) throw new NotFoundError("Presupuesto no encontrado");

    return spaceRepository.updateSharedBudget(budgetId, data);
  }

  async deleteSharedBudget(budgetId: string, spaceId: string, userId: string) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    const budget = await spaceRepository.findBudgetById(budgetId);
    if (!budget || budget.spaceId !== spaceId) throw new NotFoundError("Presupuesto no encontrado");

    await spaceRepository.deleteSharedBudget(budgetId);
  }

  async addTransaction(spaceId: string, userId: string, data: AddSharedTransactionInput) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    if (data.sharedBudgetId) {
      const budget = await spaceRepository.findBudgetById(data.sharedBudgetId);
      if (!budget || budget.spaceId !== spaceId) {
        throw new ValidationError("El presupuesto no pertenece a esta sala");
      }
    }

    return spaceRepository.createSharedTransaction({
      spaceId,
      authorId: userId,
      amount: data.amount,
      sharedBudgetId: data.sharedBudgetId,
      description: data.description,
      date: data.date,
    });
  }

  async getTransactions(spaceId: string, userId: string) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    return spaceRepository.getSharedTransactions(spaceId);
  }

  async editTransaction(txId: string, spaceId: string, userId: string, data: UpdateSharedTransactionInput) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    const tx = await spaceRepository.findTransactionById(txId);
    if (!tx || tx.spaceId !== spaceId) throw new NotFoundError("Transacción no encontrada");

    if (data.sharedBudgetId) {
      const budget = await spaceRepository.findBudgetById(data.sharedBudgetId);
      if (!budget || budget.spaceId !== spaceId) {
        throw new ValidationError("El presupuesto no pertenece a esta sala");
      }
    }

    return spaceRepository.updateSharedTransaction(txId, data);
  }

  async deleteTransaction(txId: string, spaceId: string, userId: string) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    const tx = await spaceRepository.findTransactionById(txId);
    if (!tx || tx.spaceId !== spaceId) throw new NotFoundError("Transacción no encontrada");

    await spaceRepository.deleteSharedTransaction(txId);
  }

  async getSpaceStatus(spaceId: string, userId: string) {
    const space = await spaceRepository.findSpaceById(spaceId);
    if (!space) throw new NotFoundError("Sala no encontrada");

    const isMember = space.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("No eres miembro de esta sala");

    const me = space.members.find((m) => m.userId === userId)!;
    const partner = space.members.find((m) => m.userId !== userId);

    const mySalary = Number(me.salary ?? 0);
    const partnerSalary = Number(partner?.salary ?? 0);
    const totalSalaries = mySalary + partnerSalary;
    // Si solo uno declaró, se asume ratio 50/50 para repartir gastos
    const myRatio = totalSalaries > 0 ? mySalary / totalSalaries : 0.5;

    // Calcular deducciones totales de MI parte en TODOS los gastos de la sala
    const allTransactions = await spaceRepository.getSharedTransactions(spaceId);
    const myTotalDeductions = allTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount) * myRatio,
      0
    );
    const partnerTotalDeductions = allTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount) * (1 - myRatio),
      0
    );

    const myAvailableSalary = mySalary - myTotalDeductions;
    const partnerAvailableSalary = partnerSalary - partnerTotalDeductions;

    const budgetStatuses = await Promise.all(
      space.budgets.map(async (budget) => {
        const pct = Number(budget.percentage) / 100;
        const myContrib = mySalary * pct;
        const partnerContrib = partnerSalary * pct;
        const totalBudget = myContrib + partnerContrib;
        const spent = await spaceRepository.getSpentByBudget(budget.id);
        const remaining = totalBudget - spent;
        const percentage = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

        return {
          budget,
          myContrib,
          partnerContrib,
          totalBudget,
          spent,
          remaining,
          percentage,
          isExceeded: spent > totalBudget,
        };
      })
    );

    return {
      budgetStatuses,
      mySalary,
      partnerSalary,
      myTotalDeductions,
      partnerTotalDeductions,
      myAvailableSalary,
      partnerAvailableSalary,
      myRatio,
      partnerProfile: partner ? {
        userId: partner.userId,
        fullName: (partner as any).profile?.fullName ?? null,
        email: (partner as any).profile?.email ?? null,
      } : null,
    };
  }

  async requestDeletion(spaceId: string, userId: string) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    const space = await spaceRepository.findSpaceById(spaceId);
    if (!space) throw new NotFoundError("Sala no encontrada");

    if (space.deletionRequestedBy) {
      throw new ValidationError("Ya existe una solicitud de eliminación pendiente");
    }

    return spaceRepository.setDeletionRequest(spaceId, userId);
  }

  async cancelDeletion(spaceId: string, userId: string) {
    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    return spaceRepository.setDeletionRequest(spaceId, null);
  }

  async confirmAndDelete(spaceId: string, userId: string) {
    const space = await spaceRepository.findSpaceById(spaceId);
    if (!space) throw new NotFoundError("Sala no encontrada");

    const member = await spaceRepository.findMember(spaceId, userId);
    if (!member) throw new ForbiddenError("No eres miembro de esta sala");

    if (!space.deletionRequestedBy) {
      throw new ValidationError("No hay solicitud de eliminación pendiente");
    }

    if (space.deletionRequestedBy === userId) {
      throw new ValidationError("Debes esperar a que tu pareja confirme la eliminación");
    }

    await spaceRepository.deleteSpace(spaceId);
  }

  async getSharedOverview(userId: string) {
    const spaces = await spaceRepository.findSpacesByUser(userId);

    const spaceBreakdowns = await Promise.all(
      spaces.map(async (space) => {
        const me = space.members.find((m) => m.userId === userId)!;
        const partner = space.members.find((m) => m.userId !== userId);

        const mySalary = Number(me.salary ?? 0);
        const partnerSalary = Number(partner?.salary ?? 0);
        const totalSalaries = mySalary + partnerSalary;
        const myRatio = totalSalaries > 0 ? mySalary / totalSalaries : 0.5;

        const allTransactions = await spaceRepository.getSharedTransactions(space.id);
        const myDeductions = allTransactions.reduce(
          (sum, tx) => sum + Number(tx.amount) * myRatio,
          0
        );

        return {
          id: space.id,
          name: space.name,
          myDeductions,
          transactionCount: allTransactions.length,
          partnerName: (partner as any)?.profile?.fullName ?? (partner as any)?.profile?.email ?? "Pareja",
        };
      })
    );

    const totalMyDeductions = spaceBreakdowns.reduce((sum, s) => sum + s.myDeductions, 0);

    return { totalMyDeductions, spaces: spaceBreakdowns };
  }
}

export const spaceService = new SpaceService();
