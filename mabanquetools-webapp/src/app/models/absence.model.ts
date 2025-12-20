export type AbsenceType = 'ABSENCE' | 'FORMATION' | 'TELETRAVAIL';

export const ABSENCE_LABELS: Record<AbsenceType, string> = {
    ABSENCE: 'Absence',
    FORMATION: 'Formation / Hors MB',
    TELETRAVAIL: 'Télétravail'
};

export interface Absence {
    id: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
    startDate: string; // ISO Date string (YYYY-MM-DD)
    endDate: string;   // ISO Date string (YYYY-MM-DD)
    type: AbsenceType;
}

export type Period = 'MORNING' | 'AFTERNOON';

export const PERIOD_LABELS: Record<Period, string> = {
    MORNING: 'Matin',
    AFTERNOON: 'Après-midi'
};

export interface Absence {
    id: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
    startDate: string; // ISO Date string (YYYY-MM-DD)
    endDate: string;   // ISO Date string (YYYY-MM-DD)
    type: AbsenceType;
    startPeriod: Period;
    endPeriod: Period;
}

export interface CreateAbsenceRequest {
    userId?: string;
    startDate: string;
    endDate: string;
    type: AbsenceType;
    startPeriod: Period;
    endPeriod: Period;
}

export interface AbsenceUser {
    id: string;
    firstName: string;
    lastName: string;
    metier: string;
    tribu: string;
    interne: boolean;
    email: string;
    squads: string[];
}
