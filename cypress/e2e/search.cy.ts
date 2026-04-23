describe('Weather search flow', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://geocoding-api.open-meteo.com/v1/search*', {
      statusCode: 200,
      body: {
        results: [
          {
            id: 2643743,
            name: 'London',
            country: 'United Kingdom',
            admin1: 'England',
            latitude: 51.5074,
            longitude: -0.1278,
            timezone: 'Europe/London',
          },
        ],
      },
    }).as('geocode');

    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      fixture: 'forecast.json',
    }).as('forecast');

    cy.intercept('GET', 'https://air-quality-api.open-meteo.com/v1/air-quality*', {
      body: {
        current: {
          time: '2026-04-23T12:00',
          pm10: 12,
          pm2_5: 8,
          ozone: 55,
          nitrogen_dioxide: 10,
          european_aqi: 35,
          us_aqi: 40,
          uv_index: 3,
        },
      },
    }).as('air');

    cy.visit('/');
  });

  it('searches for a city and shows current weather + forecast', () => {
    cy.get('input[type="search"]').type('Lond');
    cy.wait('@geocode');
    cy.contains('li', 'London').click();
    cy.wait('@forecast');
    cy.contains('h2', 'London');
    cy.contains('Feels like');
    cy.contains('7-Day forecast');
  });

  it('supports keyboard-driven selection with arrow keys', () => {
    cy.get('input[type="search"]').type('Lond');
    cy.wait('@geocode');
    cy.get('input[type="search"]').type('{downarrow}{enter}');
    cy.wait('@forecast');
    cy.contains('h2', 'London');
  });
});
