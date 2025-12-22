export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    themePreference: string;
    createdAt: string;
    updatedAt: string;
    historiesCount: number;
    permissions: UserPermissions;
    metier?: string;
    tribu?: string;
    interne: boolean;
    squads?: string[];
}

import { UserPermissions } from '@services/permission.service';
