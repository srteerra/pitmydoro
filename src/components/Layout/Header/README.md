# Header

Top navigation bar rendered on every page.

## Responsibilities

- Implements a responsive `Grid` layout:
  - **Desktop** (md+): three columns — left actions | centred logo | right actions.
  - **Mobile**: logo row stacked below the right-side actions.
- **Left** (desktop only): `GitHubStars` — live star count badge for the repository.
- **Centre**: `LocaleSwitch`, `Logo` (links to `/public`), `ToggleThemeMode`, `TogglePomodoroMode`.
- **Right**: `AuthModal` — sign-in button or user menu when authenticated.
- A `LuBookText` icon button is present in the centre group (docs link, currently without an `href`).

## Key child components

| Component            | Description                                    |
| -------------------- | ---------------------------------------------- |
| `AuthModal`          | Handles login / register / user menu           |
| `LocaleSwitch`       | Language toggle                                |
| `ToggleThemeMode`    | Light / dark mode toggle                       |
| `TogglePomodoroMode` | Switches between F1 and Minimal Pomodoro modes |
| `GitHubStars`        | Displays the GitHub star count                 |
