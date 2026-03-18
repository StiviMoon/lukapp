import { prisma } from "@/db/client";
import { Contact, ContactStatus } from "@prisma/client";

type ContactWithProfiles = Contact & {
  requester: { userId: string; email: string; fullName: string | null; avatarUrl: string | null };
  receiver:  { userId: string; email: string; fullName: string | null; avatarUrl: string | null };
};

const profileSelect = {
  userId: true,
  email: true,
  fullName: true,
  avatarUrl: true,
};

export class ContactRepository {
  async findById(id: string): Promise<ContactWithProfiles | null> {
    return prisma.contact.findUnique({
      where: { id },
      include: { requester: { select: profileSelect }, receiver: { select: profileSelect } },
    }) as Promise<ContactWithProfiles | null>;
  }

  async findByUsers(requesterId: string, receiverId: string): Promise<Contact | null> {
    return prisma.contact.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });
  }

  async findAllForUser(userId: string): Promise<ContactWithProfiles[]> {
    return prisma.contact.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        NOT: { status: ContactStatus.REJECTED },
      },
      include: { requester: { select: profileSelect }, receiver: { select: profileSelect } },
      orderBy: { createdAt: "desc" },
    }) as Promise<ContactWithProfiles[]>;
  }

  async findProfileByEmail(email: string) {
    return prisma.profile.findFirst({ where: { email } });
  }

  async create(requesterId: string, receiverId: string): Promise<Contact> {
    return prisma.contact.create({
      data: { requesterId, receiverId },
    });
  }

  async updateStatus(id: string, status: ContactStatus): Promise<Contact> {
    return prisma.contact.update({ where: { id }, data: { status } });
  }

  async delete(id: string): Promise<void> {
    await prisma.contact.delete({ where: { id } });
  }
}

export const contactRepository = new ContactRepository();
