import 'cypress-axe';

describe('Accessibility smoke tests', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', { fixture: 'forecast.json' }).as('forecast');
    cy.intercept('GET', 'https://air-quality-api.open-meteo.com/v1/air-quality*', { body: {} }).as('air');
    cy.visit('/');
    cy.injectAxe();
  });

  it('home has no critical axe violations', () => {
    cy.checkA11y(undefined, { includedImpacts: ['critical', 'serious'] });
  });

  it('settings has no critical axe violations', () => {
    cy.visit('/settings');
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ['critical', 'serious'] });
  });
});
