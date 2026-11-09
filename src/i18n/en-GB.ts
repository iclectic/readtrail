/** Default British English interface copy. */
export const enGB = {
  appName: "ReadTrail",
  tabs: {
    library: "Library",
    discover: "Discover",
    goals: "Goals",
    stats: "Stats",
    settings: "Settings",
  },
  library: {
    title: "Your library",
    searchPlaceholder: "Search by title, author or ISBN…",
    emptyTitle: "No books yet",
    emptyBody: "Add your first book to start your reading trail.",
    noMatchTitle: "No matching books",
    noMatchBody: "Try a different search term or filter.",
    quickUpdate: "Update",
    addBook: "Add book",
  },
  status: {
    all: "All",
    want_to_read: "Want to read",
    reading: "Reading",
    paused: "Paused",
    finished: "Finished",
    did_not_finish: "Did not finish",
  },
  book: {
    details: "Book details",
    edit: "Edit book",
    add: "Add book",
    updateProgress: "Update progress",
    startSession: "Start session",
    notes: "Notes",
    delete: "Delete book",
    deleteConfirm:
      "Are you sure you want to delete this book? Progress, notes and sessions for it will also be removed.",
  },
  progress: {
    title: "Update progress",
    pageLabel: "Current page",
    noteLabel: "Note (optional)",
    save: "Save progress",
  },
  sessions: {
    title: "Reading session",
    active: "Session in progress",
    end: "End session",
    manual: "Log a session",
  },
  notes: {
    title: "Reading journal",
    empty: "No notes yet",
    emptyBody: "Capture quotations, reflections and reminders as you read.",
    add: "Add note",
    quote: "Favourite quotation",
    reflection: "Reflection",
  },
  goals: {
    title: "Reading goals",
    empty: "No active goals",
    emptyBody: "Set a gentle target for pages, time or books.",
    create: "Create goal",
  },
  stats: {
    title: "Reading insights",
    streak: "Day streak",
    pagesRead: "Pages advanced",
    timeRead: "Time reading",
    finished: "Books finished",
  },
  settings: {
    title: "Settings",
    export: "Export data",
    import: "Import data",
    clear: "Clear all data",
    theme: "Appearance",
    reminders: "Reminders",
    streaks: "Streak tracking",
    privacy:
      "Your reading data stays on this device unless you export it. ReadTrail does not require an account for offline use.",
    feedback: "Send feedback",
  },
  onboarding: {
    title: "Welcome to ReadTrail",
    body: "A private reading companion for your books, progress and notes — entirely on your device.",
    cta: "Add your first book",
    skip: "Explore the library",
  },
  common: {
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    loading: "Loading…",
    error: "Something went wrong.",
    retry: "Try again",
    offline: "You are offline. Local features still work.",
  },
} as const;

export type Copy = typeof enGB;

export function t(): Copy {
  return enGB;
}
