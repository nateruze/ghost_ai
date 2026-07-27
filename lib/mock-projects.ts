export interface Project {
  id: string
  name: string
  slug: string
  owner: "me" | "collaborator"
}

export const initialProjects: Project[] = [
  { id: "1", name: "Order Fulfillment Pipeline", slug: "order-fulfillment-pipeline", owner: "me" },
  { id: "2", name: "Auth Service Redesign", slug: "auth-service-redesign", owner: "me" },
  { id: "3", name: "Payments Gateway", slug: "payments-gateway", owner: "collaborator" },
]

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
