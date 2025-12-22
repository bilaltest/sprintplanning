import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
    transition('* <=> *', [
        // Initial state of new route
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            })
        ], { optional: true }),

        // Move entering item off-screen/transparent
        query(':enter', [
            style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' })
        ], { optional: true }),

        group([
            // Animate leaving item
            query(':leave', [
                animate('300ms ease-out', style({ opacity: 0, transform: 'scale(1.05) translateY(-10px)' }))
            ], { optional: true }),

            // Animate entering item
            query(':enter', [
                animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
            ], { optional: true })
        ])
    ])
]);
