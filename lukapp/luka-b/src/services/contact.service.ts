import { contactRepository } from "@/repositories/contact.repository";
import { ContactStatus } from "@prisma/client";
import { NotFoundError, ValidationError, ForbiddenError } from "@/errors/app-error";

export class ContactService {
  async invite(requesterId: string, email: string) {
    // Buscar perfil por email
    const target = await contactRepository.findProfileByEmail(email);
    if (!target) {
      throw new NotFoundError("No se encontró ningún usuario con ese email");
    }

    if (target.userId === requesterId) {
      throw new ValidationError("No puedes invitarte a ti mismo");
    }

    // Verificar si ya existe una relación
    const existing = await contactRepository.findByUsers(requesterId, target.userId);
    if (existing) {
      if (existing.status === ContactStatus.ACCEPTED) {
        throw new ValidationError("Ya son contactos");
      }
      if (existing.status === ContactStatus.PENDING) {
        throw new ValidationError("Ya existe una invitación pendiente");
      }
      // Si fue rechazada, eliminar y crear nueva
      await contactRepository.delete(existing.id);
    }

    return contactRepository.create(requesterId, target.userId);
  }

  async getContacts(userId: string) {
    const contacts = await contactRepository.findAllForUser(userId);

    return contacts.map((c) => {
      const isSender = c.requesterId === userId;
      const other = isSender ? c.receiver : c.requester;
      return {
        id: c.id,
        status: c.status,
        createdAt: c.createdAt,
        isSender,
        other,
      };
    });
  }

  async accept(contactId: string, userId: string) {
    const contact = await contactRepository.findById(contactId);
    if (!contact) throw new NotFoundError("Invitación no encontrada");

    if (contact.receiverId !== userId) {
      throw new ForbiddenError("Solo el receptor puede aceptar la invitación");
    }

    if (contact.status !== ContactStatus.PENDING) {
      throw new ValidationError("La invitación ya fue procesada");
    }

    return contactRepository.updateStatus(contactId, ContactStatus.ACCEPTED);
  }

  async reject(contactId: string, userId: string) {
    const contact = await contactRepository.findById(contactId);
    if (!contact) throw new NotFoundError("Invitación no encontrada");

    if (contact.receiverId !== userId && contact.requesterId !== userId) {
      throw new ForbiddenError("No tienes permiso para esta acción");
    }

    await contactRepository.delete(contactId);
  }

  async remove(contactId: string, userId: string) {
    const contact = await contactRepository.findById(contactId);
    if (!contact) throw new NotFoundError("Contacto no encontrado");

    if (contact.requesterId !== userId && contact.receiverId !== userId) {
      throw new ForbiddenError("No tienes permiso para esta acción");
    }

    await contactRepository.delete(contactId);
  }
}

export const contactService = new ContactService();
