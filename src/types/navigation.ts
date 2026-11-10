import type { NavigatorScreenParams } from "@react-navigation/native";

export type PartialBookPrefill = {
  title?: string;
  author?: string;
  totalPages?: number;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  coverUri?: string;
  genre?: string;
};

export type LibraryStackParamList = {
  LibraryHome: undefined;
  BookDetails: { bookId: string };
  AddEditBook: { bookId?: string; prefill?: PartialBookPrefill } | undefined;
  UpdateProgress: { bookId: string };
  ReadingSession: { bookId: string; sessionId?: string };
  NotesList: { bookId: string };
  NoteEditor: { bookId: string; noteId?: string };
  Collections: undefined;
  CollectionDetails: { collectionId: string };
  BarcodeScan: undefined;
  ReadingMemory: undefined;
  Duplicates: undefined;
  AnnualReport: undefined;
  ReadingCalendar: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Privacy: undefined;
};

export type RootTabParamList = {
  LibraryTab: NavigatorScreenParams<LibraryStackParamList>;
  DiscoverTab: undefined;
  GoalsTab: undefined;
  StatsTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};
