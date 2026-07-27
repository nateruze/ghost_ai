import { prisma } from "@/lib/prisma";

export interface ProjectSummary {
  id: string;
  name: string;
}

export async function getOwnedProjects(
  userId: string
): Promise<ProjectSummary[]> {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
}

export async function getSharedProjects(
  email: string | null | undefined
): Promise<ProjectSummary[]> {
  if (!email) return [];

  return prisma.project.findMany({
    where: { collaborators: { some: { email } } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
}
