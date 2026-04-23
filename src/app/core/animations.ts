import {
  animate,
  animateChild,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(6px)' })], { optional: true }),
    query(
      ':enter',
      [
        animate('260ms cubic-bezier(0.2, 0, 0, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
        animateChild(),
      ],
      { optional: true },
    ),
  ]),
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }),
        stagger(40, [
          animate(
            '220ms cubic-bezier(0.2, 0, 0, 1)',
            style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

export const cardEnter = trigger('cardEnter', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('240ms 40ms cubic-bezier(0.2, 0, 0, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [animate('160ms ease-out', style({ opacity: 0, transform: 'translateY(-6px)' }))]),
]);
