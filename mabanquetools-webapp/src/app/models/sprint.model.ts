export interface Sprint {
    id: string;
    name: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    codeFreezeDate: string; // YYYY-MM-DD
    releaseDateBack: string; // YYYY-MM-DD
    releaseDateFront: string; // YYYY-MM-DD
    createdAt?: string;
    updatedAt?: string;
}
