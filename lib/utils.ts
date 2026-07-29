import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function randomSuffix(length = 6): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length)
}

export function uniqueSlug(value: string): string {
  const base = slugify(value)
  const suffix = randomSuffix()
  return base ? `${base}-${suffix}` : suffix
}
