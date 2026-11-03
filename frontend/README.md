# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1.

## Sprint 1 features

- Registration and sign-in use `/api/v1/users/register` and `/api/v1/auth/login`.
- Wallet listing and creation use `/api/v1/wallets`; wallet routes require a valid session token.
- The API base URL is configured in `src/environments/environment.ts`. The API is expected to return the shared `{ code, message, data }` response shape.
- The session token is kept in `sessionStorage` and sent as a bearer token. Clear it by signing out; a `401` response also clears it.

The backend must provide the registration, authentication, and wallet endpoints before these screens can be used against a live API.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
