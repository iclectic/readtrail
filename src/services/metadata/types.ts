export type BookMetadataResult = {
  title: string;
  authors: string[];
  isbn?: string | null;
  pageCount?: number | null;
  publisher?: string | null;
  publishedYear?: number | null;
  description?: string | null;
  coverUrl?: string | null;
  subjects?: string[];
  source: string;
};

export type BookMetadataProvider = {
  id: string;
  label: string;
  searchByTitle(query: string): Promise<BookMetadataResult[]>;
  lookupIsbn(isbn: string): Promise<BookMetadataResult | null>;
};
