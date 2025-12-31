export type LibraryStackParamList = {
    LibraryHome: undefined;
    BookDetails: { bookId:string };
    AddEditBook: { bookId?: string } | undefined;
    UpdateProgress: { bookId: string };
};

export type RootTabParamList = {
    LibraryTab: undefined;
    StatsTab: undefined;
    SettingsTab: undefined;
};
