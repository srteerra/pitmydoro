# AuthModal

Authentication dialog handling sign-in, registration, and the authenticated user menu.

## Responsibilities

- When no user is logged in, renders a **Join** button that opens a `Dialog`.
- Inside the dialog, toggles between `LoginForm` and `RegisterForm` via local `authMode` state (`'login' | 'register'`).
- When a user is authenticated, renders `UserMenu` in place of the button (no dialog).
- Delegates to `AuthContext` for all Firebase operations:
  - `signIn(email, password)`
  - `signUp(email, password)`
  - `signInWithGoogle()`
  - `logout()`
- Translates Firebase error codes to user-facing messages via `getErrorMessage`.
- Resets `authMode` to `'login'` when the dialog exits (`onExitComplete`).

## Sub-components

| Component      | Description                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| `LoginForm`    | Email/password fields + Google sign-in button + link to switch to register       |
| `RegisterForm` | Username/email/password fields + Google sign-in button + link to switch to login |
| `UserMenu`     | Avatar menu with logout and profile actions                                      |

## Key dependencies

| Import        | Purpose                                   |
| ------------- | ----------------------------------------- |
| `AuthContext` | Firebase auth operations and current user |
| `useAlert`    | Success / error toasts                    |
