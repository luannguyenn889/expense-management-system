# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1.

## Sprint 1 features

- Registration collects full name, username, email, and password. Sign-in uses username and password.
- The frontend expects registration at `/api/v1/users/register` and sign-in at `/api/v1/auth/login`; both must return an `AuthSession` containing a valid token so the user can be sent to `/wallets`.
- Wallet listing and creation use `/api/v1/wallets`; wallet routes require a valid session token.
- The API base URL is configured in `src/environments/environment.ts`. The API is expected to return the shared `{ code, message, data }` response shape.
- The session token is kept in `sessionStorage` and sent as a bearer token. Clear it by signing out; a `401` response also clears it.
- Google sign-in is currently a UI placeholder. It does not authenticate or redirect until a backend OAuth flow is configured.

The current backend does not yet provide the registration, authentication, Google OAuth, or wallet endpoints described above. These screens require corresponding backend APIs before authentication can be used end-to-end.

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
