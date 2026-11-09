import { openLibraryProvider } from "./openLibraryProvider";
import type { BookMetadataProvider, BookMetadataResult } from "./types";

export type { BookMetadataProvider, BookMetadataResult };

const providers: BookMetadataProvider[] = [openLibraryProvider];

/**
 * Search book metadata across providers with graceful fallback.
 * Returns an empty list when offline or when all providers fail.
 */
export async function searchBookMetadata(
  query: string
): Promise<{ results: BookMetadataResult[]; errors: string[] }> {
  const results: BookMetadataResult[] = [];
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const found = await provider.searchByTitle(query);
      results.push(...found);
      if (found.length > 0) break;
    } catch (error) {
      errors.push(
        `${provider.label}: ${error instanceof Error ? error.message : "Unavailable"}`
      );
    }
  }

  return { results, errors };
}

export async function lookupBookByIsbn(
  isbn: string
): Promise<{ result: BookMetadataResult | null; errors: string[] }> {
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const result = await provider.lookupIsbn(isbn);
      if (result) return { result, errors };
    } catch (error) {
      errors.push(
        `${provider.label}: ${error instanceof Error ? error.message : "Unavailable"}`
      );
    }
  }
  return { result: null, errors };
}
