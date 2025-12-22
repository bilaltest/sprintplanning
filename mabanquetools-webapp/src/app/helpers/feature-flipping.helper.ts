
import { ActionType, FlippingType, RuleAction, RuleState, ACTION_TYPE_LABELS, FLIPPING_TYPE_LABELS, RULE_ACTION_LABELS, RULE_STATE_LABELS } from '@models/release.model';

export class FeatureFlippingHelper {

    static getFlippingTargets(data: string | string[]): string[] {
        if (Array.isArray(data)) return data;
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    static getFlippingVersions(data: string | any[]): string {
        let versions: any[];
        if (Array.isArray(data)) {
            versions = data;
        } else {
            try {
                versions = JSON.parse(data);
            } catch {
                return '';
            }
        }
        return versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
    }

    static getActionTypeLabel(type: string): string {
        return ACTION_TYPE_LABELS[type as ActionType] || type;
    }

    static getFlippingTypeLabel(type: string): string {
        return FLIPPING_TYPE_LABELS[type as FlippingType] || type;
    }

    static getRuleActionLabel(action: string): string {
        return RULE_ACTION_LABELS[action as RuleAction] || action;
    }

    static getRuleStateLabel(state: string): string {
        return RULE_STATE_LABELS[state as RuleState] || state;
    }

    static getFlippingClientsDisplay(targetClients: string | string[]): string {
        const clients = this.getFlippingTargets(targetClients);
        if (clients.length === 0 || clients.includes('all')) {
            return 'ALL';
        }
        return clients.join(', ');
    }

    static getFlippingCaissesDisplay(targetCaisses?: string | null): string {
        if (!targetCaisses || targetCaisses === 'Toutes') {
            return 'ALL';
        }
        return targetCaisses;
    }

    static getFlippingOSDisplay(targetOS: string | string[]): string {
        const osList = this.getFlippingTargets(targetOS);
        if (osList.length === 0 || (osList.includes('ios') && osList.includes('android'))) {
            return 'ALL';
        }
        return osList.join(', ').toUpperCase();
    }

    static getFlippingOSDisplayWithIcons(targetOS: string | string[]): string {
        const osList = this.getFlippingTargets(targetOS);
        if (osList.length === 0 || (osList.includes('ios') && osList.includes('android'))) {
            return '📱 iOS, 🤖 Android';
        }
        const icons = osList.map(os => os === 'ios' ? '📱 iOS' : '🤖 Android');
        return icons.join(', ');
    }

    static getFlippingVersionsDisplay(targetVersions: string | any[]): string {
        let versions: any[];
        if (Array.isArray(targetVersions)) {
            versions = targetVersions;
        } else {
            try {
                versions = JSON.parse(targetVersions);
            } catch {
                versions = [];
            }
        }

        if (versions.length === 0) {
            return 'ALL';
        }

        return versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
    }
}
