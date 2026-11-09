/** Shared wipe script for Settings "Clear all data" and integrity tests. */
export const CLEAR_ALL_USER_DATA_SQL = `
  DELETE FROM book_tags;
  DELETE FROM book_collections;
  DELETE FROM notes;
  DELETE FROM reading_sessions;
  DELETE FROM progress_entries;
  DELETE FROM books;
  DELETE FROM tags;
  DELETE FROM collections;
  DELETE FROM goals;
  DELETE FROM achievements;
`;
