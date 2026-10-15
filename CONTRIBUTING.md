# Contributing to Pitmydoro

Thank you for your interest in contributing to Pitmydoro! 🎉 We appreciate your support in improving this open-source project. Your contributions help make Pitmydoro better for everyone.

This guide will help you get started with contributing to the project.

_[Versión en español más abajo](#versión-en-español) / Spanish version below_

---

## Table of Contents

- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
  - [Creating a Branch](#creating-a-branch)
  - [Commit Messages](#commit-messages)
  - [Git Hooks](#git-hooks)
- [Testing Your Changes](#testing-your-changes)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [UI and Internationalization](#ui-and-internationalization)
- [Security](#security)
- [Getting Help](#getting-help)
- [Versión en Español](#versión-en-español)

---

## Quick Start

```bash
# 1. Fork and clone the repository
git clone https://github.com/srteerra/pitmydoro.git
cd pitmydoro

# 2. Install dependencies (this automatically sets up git hooks)
bun install

# 3. Create a new branch
git checkout -b type/your-feature-name

# 4. Start development server
bun dev

# 5. Make your changes and commit
git add .
git commit -m "type(scope): your changes"

# 6. Push and create a Pull Request
git push origin type/your-feature-name
```

---

## Development Setup

### Tech Stack

Pitmydoro is built with:

- **Next.js** - React framework with TypeScript
- **Chakra UI** - Component system
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **Playwright** - End-to-end testing
- **License**: GPL-3.0

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 20 or higher
- **Bun** (recommended) or npm 10 or higher
- **Playwright** (for testing)

### Installation Steps

#### 1. Fork and clone the repository:

```bash
git clone https://github.com/srteerra/pitmydoro.git
cd pitmydoro
```

#### 2. Install Dependencies

```bash
bun install
```

**Important:** The `bun install` command automatically sets up Husky git hooks. You don't need to do anything extra!

#### 4. Run the Development Server

```bash
bun dev
```

The application will be available at `http://localhost:3000`

### Running with Firebase Emulators (recommended)

You don't need access to the real Firebase project to work on Pitmydoro. One command starts local Firebase emulators (Firestore, Auth and Storage), fills them with realistic sample data and runs the app against them.

**Extra prerequisites:**

- **Java 21+** (the emulators run on Java)
- **Firebase CLI**: `npm install -g firebase-tools` (no login needed)
- Functions dependencies: `npm --prefix functions install`

```bash
bun run dev:emulator
```

- App: `http://localhost:3000` · Emulator UI: `http://localhost:4000`
- Sign in with the demo account: **`demo@pitmydoro.dev` / `pitmydoro`**
- Sample data: ~50 users with stats, favorite teams, follows, notifications and a computed leaderboard
- It uses the `demo-pitmydoro` project, so it **never** touches real Firebase data
- `Ctrl+C` stops everything and saves the emulator data in `.emulator-data/`. Delete that folder to start fresh
- To restart without regenerating the sample data: `bun run dev:emulator -- --skip-seed`

---

## Development Workflow

### Creating a Branch

**Always branch from `master`** and use the appropriate prefix:

| Prefix      | Purpose                        | Example                     |
| ----------- | ------------------------------ | --------------------------- |
| `feat/`     | New features                   | `feat/add-dark-mode`        |
| `fix/`      | Bug fixes                      | `fix/timer-not-stopping`    |
| `docs/`     | Documentation                  | `docs/update-readme`        |
| `style/`    | Code style changes             | `style/format-components`   |
| `refactor/` | Code refactoring               | `refactor/simplify-store`   |
| `test/`     | Tests (unit, integration, e2e) | `test/add-timer-tests`      |
| `chore/`    | Maintenance tasks              | `chore/update-dependencies` |

**Example workflow:**

```bash
# Update your local master branch
git checkout master
git pull origin master

# Create a new feature branch
git checkout -b type/add-notification-sound

# Make your changes...

# Commit following Conventional Commits
git add .
git commit -m "type(notifications): add sound alerts for completed pomodoros"

# Push to your fork
git push origin type/add-notification-sound
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification, enforced by commitlint.

**Format:**

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that don't affect code meaning (formatting, whitespace)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Changes to build system or dependencies
- `ci` - Changes to CI configuration
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

**Scope (optional):**
The part of the codebase affected (e.g., `pomodoro`, `settings`, `ui`, `store`)

**Examples:**

✅ **Good commits:**

```bash
git commit -m "feat(pomodoro): add tooltips for control buttons"
git commit -m "fix(settings): prevent invalid negative intervals"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(timer): add unit tests for countdown logic"
git commit -m "refactor(store): simplify state management"
```

❌ **Bad commits:**

```bash
git commit -m "fixed stuff"
git commit -m "Update README.md"
git commit -m "WIP"
git commit -m "asdfasdf"
```

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to maintain code quality. Hooks run automatically when you commit or push.

#### Pre-commit Hook

Runs **automatically before each commit**:

1. 📝 **Auto-format** - Formats your code with Prettier
2. 🎨 **Format check** - Verifies formatting standards
3. 🔍 **Linting** - Checks code quality with ESLint

**What happens:**

```bash
# When you run:
git commit -m "feat(timer): add feature"

# Husky automatically runs:
🏗️ Preparing your code for commit...

📝 Running auto-format...
✅ Format complete!

🎨 Checking code formatting...
✅ Formatting check passed!

🔍 Running linter...
✅ Linting passed!

✨ All checks passed! Committing your changes... ✨
```

If any check fails, the commit will be **blocked** until you fix the issues.

#### Pre-push Hook

Runs **automatically before pushing to remote**:

1. 🔍 **Branch protection** - Prevents direct pushes to `master`
2. 🧪 **Tests** - All tests must pass

**What happens:**

```bash
# When you run:
git push origin feat/my-feature

# Husky automatically runs:
🔍 Checking branch protection...
✅ Branch check passed!

🚀 Running tests before push...
✅ All tests passed! Pushing to remote...
```

#### Commit Message Hook

Validates your commit message format:

```bash
# ✅ This will work:
git commit -m "feat(timer): add pause button"

# ❌ This will be rejected:
git commit -m "added pause button"

# Error message shows:
🚫 Invalid commit message format!

📋 Your commit message must follow the Conventional Commits standard:
   type(scope): description

📌 Types allowed:
   • feat     - New feature
   • fix      - Bug fix
   ...
```

## Testing Your Changes

### Running Tests Manually

Before submitting a pull request, ensure all checks pass:

```bash
# Format code
bun format

# Check code formatting
bun format:check

# Lint code
bun lint

# Run all tests
bun test

```

### Test Requirements

- ✅ All existing tests must pass
- ✅ New features should include tests
- ✅ Bug fixes should include regression tests
- ✅ Aim for high test coverage

### Manual Testing

1. Test your changes in the browser
2. Try different screen sizes (responsive design)
3. Test with keyboard navigation
4. Check for console errors or warnings
5. Test in different browsers if possible

---

## Pull Request Guidelines

### Before Submitting

**Checklist:**

- [ ] Branch is up to date with `master`
- [ ] All tests pass locally (`bun test`)
- [ ] Code is properly formatted (`bun format`)
- [ ] No linting errors (`bun lint`)
- [ ] Commits follow Conventional Commits format
- [ ] Application works as expected
- [ ] Documentation updated (if needed)
- [ ] Translations added for new text (if applicable)

### PR Title

Use Conventional Commits format:

✅ **Good PR titles:**

- `feat(timer): add pause and resume functionality`
- `fix(settings): resolve interval validation bug`
- `docs(contributing): improve setup instructions`

❌ **Bad PR titles:**

- `Update timer.tsx`
- `Bug fix`
- `New feature`

### PR Description Template

```markdown
## Description

Brief description of what this PR does.

## What Changed?

- List key changes made
- Include technical details if relevant
- Mention any dependencies added/removed

## Screenshots / Videos (OPTIONAL)

If applicable, add screenshots or screen recordings to demonstrate the changes.

## Related Issues

Closes #(issue number)

## Breaking Changes (OPTIONAL)

If this PR includes breaking changes, describe them here and provide migration instructions.

## Additional Notes (OPTIONAL)

Any additional information that reviewers should know.
```

### Review Process

1. **Automated Checks**: GitHub Actions will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged
5. **Merge**: A maintainer will merge your PR into `master`

**Addressing Feedback:**

```bash
# Make requested changes
git add .
git commit -m "fix(review): address review comments"
git push origin your-feature-branch
```

The PR will automatically update with your new commits.

---

## Code Quality Standards

### Code Style

- **TypeScript**: Use TypeScript for type safety
- **Formatting**: Prettier (runs automatically on commit)
- **Linting**: ESLint (runs automatically on commit)
- **Functions**: Keep functions small and focused
- **Comments**: Add comments for complex logic

### Best Practices

**Do:**

- ✅ Write clean, readable code
- ✅ Follow existing code patterns
- ✅ Use TypeScript types properly
- ✅ Keep components small and reusable
- ✅ Write meaningful commit messages
- ✅ Add tests for new features
- ✅ Update documentation

**Don't:**

- ❌ Commit commented-out code
- ❌ Leave console.log statements
- ❌ Ignore TypeScript errors
- ❌ Push directly to `master`
- ❌ Skip tests
- ❌ Use `any` type excessively

### Component Guidelines

**React Components:**

```typescript
// ✅ Good: Functional component with TypeScript
import { FC } from 'react';

interface TimerProps {
  duration: number;
  onComplete: () => void;
}

export const Timer: FC<TimerProps> = ({ duration, onComplete }) => {
  // Component logic
  return <div>Timer</div>;
};
```

**Chakra UI Usage:**

```typescript
// ✅ Use Chakra UI components
import { Box, Button, Text } from '@chakra-ui/react';

export const Example = () => (
  <Box p={4}>
    <Text fontSize="lg">Hello</Text>
    <Button colorScheme="blue">Click me</Button>
  </Box>
);
```

**State Management:**

```typescript
// ✅ Use Zustand for global state
import { create } from 'zustand';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { TireTypeEnum } from '@/enums/TireType.enum';

interface SessionStore {
  status: SessionStatusEnum;
  selectedTire: TireTypeEnum;
}

interface SessionActions {
  setStatus: (status: SessionStatusEnum) => void;
  setSelectedTire: (tire: TireTypeEnum) => void;
}

const useSessionStore = create<SessionStore & SessionActions>((set) => ({
  status: SessionStatusEnum.IN_SESSION,
  selectedTire: TireTypeEnum.HARD,

  setStatus: (status) => set(() => ({ status })),
  setSelectedTire: (selectedTire) => set(() => ({ selectedTire })),
}));

export default useSessionStore;
```

---

## UI and Internationalization

### UI Framework

- **Chakra UI**: Use for components
- **Tailwind CSS**: Use for utility classes
- **Responsive**: Test on mobile, tablet, and desktop
- **Accessibility**: Follow WCAG guidelines

### Adding New UI Components

1. Use existing Chakra UI components when possible
2. Follow the project's component structure
3. Ensure responsive design
4. Test keyboard navigation
5. Add proper ARIA labels

### Internationalization (i18n)

Pitmydoro supports multiple languages. When adding new text:

#### 1. Add to English (`src/assets/messages/en.json`)

```json
{
  "timer": {
    "start": "Start",
    "pause": "Pause",
    "reset": "Reset",
    "newKey": "Your new text here"
  }
}
```

#### 2. Add to Spanish (`src/assets/messages/es.json`)

```json
{
  "timer": {
    "start": "Iniciar",
    "pause": "Pausar",
    "reset": "Reiniciar",
    "newKey": "Tu nuevo texto aquí"
  }
}
```

#### 3. Use in Components

```typescript
import { useTranslation } from 'react-i18next';

export const Timer = () => {
  const { t } = useTranslation();

  return (
    <Button>{t('timer.start')}</Button>
  );
};
```

#### Adding a New Language

Want to add support for another language? Great! Here's how:

1. Create a new message file: `src/assets/messages/[language-code].json`
2. Copy the structure from `en.json`
3. Translate all strings
4. Update the i18n configuration
5. Submit a PR with your translations

**Example for French:**

- Create `src/assets/messages/fr.json`
- Translate all keys
- Open a PR!

### Accessibility Guidelines

Ensure your changes are accessible:

- ✅ **Focus Indicators**: Visible focus states
- ✅ **ARIA Labels**: Proper labels for screen readers
- ✅ **Color Contrast**: Meet WCAG AA standards (4.5:1 for text)
- ✅ **Alt Text**: Descriptive alt text for images
- ✅ **Semantic HTML**: Use proper HTML elements

---

## Security

### Security Best Practices

- 🔒 **Never commit sensitive data**:
  - API keys
  - Passwords
  - Tokens
  - `.env` files
- 🔑 **Use environment variables**:

  ```bash
  # .env.local (never committed)
  NEXT_PUBLIC_API_KEY=your_key_here
  ```

- 🚨 **Report vulnerabilities privately**:
  - See [SECURITY.md](SECURITY.md) for reporting process
  - Do NOT open public issues for security bugs

- ✅ **Follow secure coding practices**:
  - Validate all user inputs
  - Sanitize data before displaying
  - Use parameterized queries
  - Keep dependencies updated

### Dependency Security

```bash
# Check for known vulnerabilities
npm audit

# Update dependencies
bun update
```

---

## Getting Help

### Resources

- 📖 **[README.md](README.md)** - Project overview and setup
- 🤝 **[COLLABORATION.md](COLLABORATION.md)** - Detailed workflow
- 📜 **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines
- 🔒 **[SECURITY.md](SECURITY.md)** - Security policy

### Need Assistance?

- 💬 **[Open an issue](https://github.com/srteerra/pitmydoro/issues/new)** for bug reports or feature requests
- 🗣️ **[Start a discussion](https://github.com/srteerra/pitmydoro/discussions)** for questions
- 📧 **Contact maintainers** for private concerns

### Common Issues

<details>
<summary><strong>Git hooks not running after install</strong></summary>

```bash
# Reinitialize Husky
npx husky init
```

</details>

<details>
<summary><strong>Commit message rejected</strong></summary>

Your commit must follow Conventional Commits:

```bash
git commit -m "type(scope): description"

# Example:
git commit -m "feat(timer): add pause button"
```

</details>

<details>
<summary><strong>Tests failing</strong></summary>

```bash
# Run tests to see errors
bun test

# Fix the issues
# Try committing again
```

</details>

<details>
<summary><strong>Linting errors</strong></summary>

```bash
# Auto-fix most linting issues
bun lint --fix

# For remaining issues, fix manually
# Then commit again
```

</details>

---

## Recognition

Contributors are recognized in:

- 🌟 The project's README
- 📰 Release notes
- 💖 Our eternal gratitude!

Thank you for making Pitmydoro better! 🙌

---

## Versión en Español

# Contribuir a Pitmydoro

¡Gracias por tu interés en contribuir a Pitmydoro! 🎉 Apreciamos tu apoyo para mejorar este proyecto de código abierto. Tus contribuciones ayudan a hacer Pitmydoro mejor para todos.

Esta guía te ayudará a comenzar a contribuir al proyecto.

_[English version above](#contributing-to-pitmydoro) / Versión en inglés arriba_

---

## Tabla de Contenidos

- [Inicio Rápido](#inicio-rápido)
- [Configuración de Desarrollo](#configuración-de-desarrollo)
- [Flujo de Trabajo de Desarrollo](#flujo-de-trabajo-de-desarrollo)
  - [Crear una Rama](#crear-una-rama)
  - [Mensajes de Commit](#mensajes-de-commit)
  - [Git Hooks](#git-hooks)
- [Probar tus Cambios](#probar-tus-cambios)
- [Guía de Pull Requests](#guía-de-pull-requests)
- [Estándares de Calidad de Código](#estándares-de-calidad-de-código)
- [UI e Internacionalización](#ui-e-internacionalización)
- [Seguridad](#seguridad)
- [Obtener Ayuda](#obtener-ayuda)

---

## Inicio Rápido

```bash
# 1. Haz fork y clona el repositorio
git clone https://github.com/srteerra/pitmydoro.git
cd pitmydoro

# 2. Instala dependencias (esto configura automáticamente los git hooks)
bun install

# 3. Crea una nueva rama
git checkout -b type/nombre-de-tu-funcionalidad

# 4. Inicia el servidor de desarrollo
bun dev

# 5. Haz tus cambios y commitea
git add .
git commit -m "type(scope): tus cambios"

# 6. Sube y crea un Pull Request
git push origin type/nombre-de-tu-funcionalidad
```

---

## Configuración de Desarrollo

### Stack Tecnológico

Pitmydoro está construido con:

- **Next.js** - Framework de React con TypeScript
- **Chakra UI** - Sistema de componentes
- **Tailwind CSS** - CSS con utilidades
- **Zustand** - Gestión de estado
- **Playwright** - Pruebas end-to-end
- **Licencia**: GPL-3.0

### Requisitos Previos

Antes de comenzar, asegúrate de tener:

- **Node.js** 20 o superior
- **Bun** (recomendado) o npm 10 o superior
- **Playwright** (para pruebas)

### Pasos de Instalación

#### 1. Haz fork y clona el repositorio:

```bash
git clone https://github.com/srteerra/pitmydoro.git
cd pitmydoro
```

#### 2. Instala las Dependencias

```bash
bun install
```

**Importante:** El comando `bun install` configura automáticamente los git hooks de Husky. ¡No necesitas hacer nada extra!

#### 4. Ejecuta el Servidor de Desarrollo

```bash
bun dev
```

La aplicación estará disponible en `http://localhost:3000`

### Ejecutar con los Emuladores de Firebase (recomendado)

No necesitas acceso al proyecto real de Firebase para trabajar en Pitmydoro. Un solo comando levanta los emuladores locales de Firebase (Firestore, Auth y Storage), los llena con datos de ejemplo realistas y ejecuta la app contra ellos.

**Requisitos adicionales:**

- **Java 21+** (los emuladores corren sobre Java)
- **Firebase CLI**: `npm install -g firebase-tools` (no requiere login)
- Dependencias de functions: `npm --prefix functions install`

```bash
bun run dev:emulator
```

- App: `http://localhost:3000` · UI de los emuladores: `http://localhost:4000`
- Inicia sesión con la cuenta demo: **`demo@pitmydoro.dev` / `pitmydoro`**
- Datos de ejemplo: ~50 usuarios con estadísticas, escuderías favoritas, follows, notificaciones y un leaderboard calculado
- Usa el proyecto `demo-pitmydoro`, así que **nunca** toca datos reales de Firebase
- `Ctrl+C` detiene todo y guarda los datos del emulador en `.emulator-data/`. Borra esa carpeta para empezar de cero
- Para reiniciar sin regenerar los datos de ejemplo: `bun run dev:emulator -- --skip-seed`

---

## Flujo de Trabajo de Desarrollo

### Crear una Rama

**Siempre crea ramas desde `master`** y usa el prefijo apropiado:

| Prefijo     | Propósito                        | Ejemplo                         |
| ----------- | -------------------------------- | ------------------------------- |
| `feat/`     | Nuevas funcionalidades           | `feat/agregar-modo-oscuro`      |
| `fix/`      | Corrección de bugs               | `fix/temporizador-no-detiene`   |
| `docs/`     | Documentación                    | `docs/actualizar-readme`        |
| `style/`    | Cambios de estilo de código      | `style/formatear-componentes`   |
| `refactor/` | Refactorización de código        | `refactor/simplificar-store`    |
| `test/`     | Pruebas (unit, integration, e2e) | `test/agregar-pruebas-timer`    |
| `chore/`    | Tareas de mantenimiento          | `chore/actualizar-dependencias` |

**Flujo de trabajo de ejemplo:**

```bash
# Actualiza tu rama master local
git checkout master
git pull origin master

# Crea una nueva rama de funcionalidad
git checkout -b type/agregar-sonido-notificacion

# Haz tus cambios...

# Commitea siguiendo Conventional Commits
git add .
git commit -m "type(notifications): agregar alertas de sonido para pomodoros completados"

# Sube a tu fork
git push origin type/agregar-sonido-notificacion
```

### Mensajes de Commit

Seguimos la especificación de [Conventional Commits](https://www.conventionalcommits.org/), aplicada por commitlint.

**Formato:**

```
type(scope): descripción

[cuerpo opcional]

[pie opcional]
```

**Tipos:**

- `feat` - Una nueva funcionalidad
- `fix` - Corrección de un bug
- `docs` - Solo cambios en documentación
- `style` - Cambios que no afectan el significado del código (formato, espacios en blanco)
- `refactor` - Cambio de código que no corrige un bug ni agrega una funcionalidad
- `perf` - Mejoras de rendimiento
- `test` - Agregar o actualizar pruebas
- `build` - Cambios al sistema de compilación o dependencias
- `ci` - Cambios a la configuración de CI
- `chore` - Otros cambios que no modifican archivos src o test
- `revert` - Revierte un commit previo

**Scope (opcional):**
La parte del código afectada (ej., `pomodoro`, `settings`, `ui`, `store`)

**Ejemplos:**

✅ **Buenos commits:**

```bash
git commit -m "feat(pomodoro): agregar tooltips para botones de control"
git commit -m "fix(settings): prevenir intervalos negativos inválidos"
git commit -m "docs(readme): actualizar instrucciones de instalación"
git commit -m "test(timer): agregar pruebas unitarias para lógica de cuenta regresiva"
git commit -m "refactor(store): simplificar gestión de estado"
```

❌ **Malos commits:**

```bash
git commit -m "arreglé cosas"
git commit -m "Actualizar README.md"
git commit -m "WIP"
git commit -m "asdfasdf"
```

### Git Hooks

Este proyecto usa [Husky](https://typicode.github.io/husky/) para mantener la calidad del código. Los hooks se ejecutan automáticamente cuando haces commit o push.

#### Hook Pre-commit

Se ejecuta **automáticamente antes de cada commit**:

1. 📝 **Auto-formateo** - Formatea tu código con Prettier
2. 🎨 **Verificación de formato** - Verifica estándares de formato
3. 🔍 **Linting** - Verifica la calidad del código con ESLint

**Lo que sucede:**

```bash
# Cuando ejecutas:
git commit -m "feat(timer): agregar funcionalidad"

# Husky ejecuta automáticamente:
🏗️ Preparando tu código para commit...

📝 Ejecutando auto-formateo...
✅ ¡Formateo completo!

🎨 Verificando formato de código...
✅ ¡Verificación de formato pasada!

🔍 Ejecutando linter...
✅ ¡Linting pasado!

✨ ¡Todas las verificaciones pasaron! Commiteando tus cambios... ✨
```

Si alguna verificación falla, el commit será **bloqueado** hasta que corrijas los problemas.

#### Hook Pre-push

Se ejecuta **automáticamente antes de subir al remoto**:

1. 🔍 **Protección de rama** - Previene pushes directos a `master`
2. 🧪 **Pruebas** - Todas las pruebas deben pasar

**Lo que sucede:**

```bash
# Cuando ejecutas:
git push origin feat/mi-funcionalidad

# Husky ejecuta automáticamente:
🔍 Verificando protección de rama...
✅ ¡Verificación de rama pasada!

🚀 Ejecutando pruebas antes del push...
✅ ¡Todas las pruebas pasaron! Subiendo al remoto...
```

#### Hook de Mensaje de Commit

Valida el formato de tu mensaje de commit:

```bash
# ✅ Esto funcionará:
git commit -m "feat(timer): agregar botón de pausa"

# ❌ Esto será rechazado:
git commit -m "agregué botón de pausa"

# El mensaje de error muestra:
🚫 ¡Formato de mensaje de commit inválido!

📋 Tu mensaje de commit debe seguir el estándar de Conventional Commits:
   type(scope): descripción

📌 Tipos permitidos:
   • feat     - Nueva funcionalidad
   • fix      - Corrección de bug
   ...
```

## Probar tus Cambios

### Ejecutar Pruebas Manualmente

Antes de enviar un pull request, asegúrate de que todas las verificaciones pasen:

```bash
# Formatear código
bun format

# Verificar formato de código
bun format:check

# Lint del código
bun lint

# Ejecutar todas las pruebas
bun test

```

### Requisitos de Pruebas

- ✅ Todas las pruebas existentes deben pasar
- ✅ Las nuevas funcionalidades deben incluir pruebas
- ✅ Las correcciones de bugs deben incluir pruebas de regresión
- ✅ Apuntar a alta cobertura de pruebas

### Pruebas Manuales

1. Prueba tus cambios en el navegador
2. Prueba diferentes tamaños de pantalla (diseño responsivo)
3. Prueba con navegación por teclado
4. Verifica errores o advertencias en la consola
5. Prueba en diferentes navegadores si es posible

---

## Guía de Pull Requests

### Antes de Enviar

**Lista de verificación:**

- [ ] La rama está actualizada con `master`
- [ ] Todas las pruebas pasan localmente (`bun test`)
- [ ] El código está formateado correctamente (`bun format`)
- [ ] No hay errores de linting (`bun lint`)
- [ ] Los commits siguen el formato de Conventional Commits
- [ ] La aplicación funciona como se espera
- [ ] Documentación actualizada (si es necesario)
- [ ] Traducciones agregadas para nuevo texto (si aplica)

### Título del PR

Usa el formato de Conventional Commits:

✅ **Buenos títulos de PR:**

- `feat(timer): agregar funcionalidad de pausa y reanudar`
- `fix(settings): resolver bug de validación de intervalos`
- `docs(contributing): mejorar instrucciones de configuración`

❌ **Malos títulos de PR:**

- `Actualizar timer.tsx`
- `Corrección de bug`
- `Nueva funcionalidad`

### Plantilla de Descripción de PR

```markdown
## Descripción

Breve descripción de lo que hace este PR.

## ¿Qué Cambió?

- Lista de cambios clave realizados
- Incluir detalles técnicos si es relevante
- Mencionar cualquier dependencia agregada/removida

## Capturas de Pantalla / Videos (OPCIONAL)

Si aplica, agrega capturas de pantalla o grabaciones de pantalla para demostrar los cambios.

## Issues Relacionados

Closes #(número de issue)

## Cambios que Rompen Funcionalidad (OPCIONAL)

Si este PR incluye cambios que rompen funcionalidad, descríbelos aquí y proporciona instrucciones de migración.

## Notas Adicionales (OPCIONAL)

Cualquier información adicional que los revisores deberían saber.
```

### Proceso de Revisión

1. **Verificaciones Automáticas**: GitHub Actions ejecutará pruebas y linting
2. **Revisión de Código**: Los mantenedores revisarán tu código
3. **Retroalimentación**: Atiende cualquier cambio solicitado
4. **Aprobación**: Una vez aprobado, tu PR será fusionado
5. **Merge**: Un mantenedor fusionará tu PR en `master`

**Atendiendo Retroalimentación:**

```bash
# Realiza los cambios solicitados
git add .
git commit -m "fix(review): atender comentarios de revisión"
git push origin tu-rama-de-funcionalidad
```

El PR se actualizará automáticamente con tus nuevos commits.

---

## Estándares de Calidad de Código

### Estilo de Código

- **TypeScript**: Usa TypeScript para seguridad de tipos
- **Formateo**: Prettier (se ejecuta automáticamente en commit)
- **Linting**: ESLint (se ejecuta automáticamente en commit)
- **Funciones**: Mantén las funciones pequeñas y enfocadas
- **Comentarios**: Agrega comentarios para lógica compleja

### Mejores Prácticas

**Hacer:**

- ✅ Escribir código limpio y legible
- ✅ Seguir patrones de código existentes
- ✅ Usar tipos de TypeScript apropiadamente
- ✅ Mantener componentes pequeños y reutilizables
- ✅ Escribir mensajes de commit significativos
- ✅ Agregar pruebas para nuevas funcionalidades
- ✅ Actualizar documentación

**No hacer:**

- ❌ Commitear código comentado
- ❌ Dejar sentencias console.log
- ❌ Ignorar errores de TypeScript
- ❌ Hacer push directo a `master`
- ❌ Saltarse pruebas
- ❌ Usar el tipo `any` excesivamente

### Guías de Componentes

**Componentes React:**

```typescript
// ✅ Bueno: Componente funcional con TypeScript
import { FC } from 'react';

interface TimerProps {
  duration: number;
  onComplete: () => void;
}

export const Timer: FC<TimerProps> = ({ duration, onComplete }) => {
  // Lógica del componente
  return <div>Timer</div>;
};
```

**Uso de Chakra UI:**

```typescript
// ✅ Usar componentes de Chakra UI
import { Box, Button, Text } from '@chakra-ui/react';

export const Example = () => (
  <Box p={4}>
    <Text fontSize="lg">Hello</Text>
    <Button colorScheme="blue">Click me</Button>
  </Box>
);
```

**Gestión de Estado:**

```typescript
// ✅ Usar Zustand para estado global
import { create } from 'zustand';
import { SessionStatusEnum } from '@/enums/SessionStatus.enum';
import { TireTypeEnum } from '@/enums/TireType.enum';

interface SessionStore {
  status: SessionStatusEnum;
  selectedTire: TireTypeEnum;
}

interface SessionActions {
  setStatus: (status: SessionStatusEnum) => void;
  setSelectedTire: (tire: TireTypeEnum) => void;
}

const useSessionStore = create<SessionStore & SessionActions>((set) => ({
  status: SessionStatusEnum.IN_SESSION,
  selectedTire: TireTypeEnum.HARD,

  setStatus: (status) => set(() => ({ status })),
  setSelectedTire: (selectedTire) => set(() => ({ selectedTire })),
}));

export default useSessionStore;
```

---

## UI e Internacionalización

### Framework de UI

- **Chakra UI**: Usar para componentes
- **Tailwind CSS**: Usar para clases utilitarias
- **Responsivo**: Probar en móvil, tablet y escritorio
- **Accesibilidad**: Seguir guías WCAG

### Agregar Nuevos Componentes de UI

1. Usar componentes existentes de Chakra UI cuando sea posible
2. Seguir la estructura de componentes del proyecto
3. Asegurar diseño responsivo
4. Probar navegación por teclado
5. Agregar etiquetas ARIA apropiadas

### Internacionalización (i18n)

Pitmydoro soporta múltiples idiomas. Al agregar nuevo texto:

#### 1. Agregar a Inglés (`src/assets/messages/en.json`)

```json
{
  "timer": {
    "start": "Start",
    "pause": "Pause",
    "reset": "Reset",
    "newKey": "Your new text here"
  }
}
```

#### 2. Agregar a Español (`src/assets/messages/es.json`)

```json
{
  "timer": {
    "start": "Iniciar",
    "pause": "Pausar",
    "reset": "Reiniciar",
    "newKey": "Tu nuevo texto aquí"
  }
}
```

#### 3. Usar en Componentes

```typescript
import { useTranslation } from 'react-i18next';

export const Timer = () => {
  const { t } = useTranslation();

  return (
    <Button>{t('timer.start')}</Button>
  );
};
```

#### Agregar un Nuevo Idioma

¿Quieres agregar soporte para otro idioma? ¡Genial! Así es como:

1. Crea un nuevo archivo de mensajes: `src/assets/messages/[codigo-idioma].json`
2. Copia la estructura de `en.json`
3. Traduce todas las cadenas
4. Actualiza la configuración de i18n
5. Envía un PR con tus traducciones

**Ejemplo para Francés:**

- Crea `src/assets/messages/fr.json`
- Traduce todas las claves
- ¡Abre un PR!

### Guías de Accesibilidad

Asegura que tus cambios sean accesibles:

- ✅ **Indicadores de Foco**: Estados de foco visibles
- ✅ **Etiquetas ARIA**: Etiquetas apropiadas para lectores de pantalla
- ✅ **Contraste de Color**: Cumplir estándares WCAG AA (4.5:1 para texto)
- ✅ **Texto Alternativo**: Texto alternativo descriptivo para imágenes
- ✅ **HTML Semántico**: Usar elementos HTML apropiados

---

## Seguridad

### Mejores Prácticas de Seguridad

- 🔒 **Nunca commitees datos sensibles**:
  - Claves API
  - Contraseñas
  - Tokens
  - Archivos `.env`
- 🔑 **Usa variables de entorno**:

  ```bash
  # .env.local (nunca commiteado)
  NEXT_PUBLIC_API_KEY=tu_clave_aqui
  ```

- 🚨 **Reporta vulnerabilidades privadamente**:
  - Ver [SECURITY.md](SECURITY.md) para el proceso de reporte
  - NO abras issues públicos para bugs de seguridad

- ✅ **Sigue prácticas de codificación segura**:
  - Valida todas las entradas de usuario
  - Sanitiza datos antes de mostrar
  - Usa consultas parametrizadas
  - Mantén las dependencias actualizadas

### Seguridad de Dependencias

```bash
# Verificar vulnerabilidades conocidas
npm audit

# Actualizar dependencias
bun update
```

---

## Obtener Ayuda

### Recursos

- 📖 **[README.md](README.md)** - Descripción general del proyecto y configuración
- 🤝 **[COLLABORATION.md](COLLABORATION.md)** - Flujo de trabajo detallado
- 📜 **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Guías de la comunidad
- 🔒 **[SECURITY.md](SECURITY.md)** - Política de seguridad

### ¿Necesitas Asistencia?

- 💬 **[Abre un issue](https://github.com/srteerra/pitmydoro/issues/new)** para reportes de bugs o solicitudes de funcionalidades
- 🗣️ **[Inicia una discusión](https://github.com/srteerra/pitmydoro/discussions)** para preguntas
- 📧 **Contacta a los mantenedores** para preocupaciones privadas

### Problemas Comunes

<details>
<summary><strong>Git hooks no se ejecutan después de instalar</strong></summary>

```bash
# Reinicializar Husky
npx husky init
```

</details>

<details>
<summary><strong>Mensaje de commit rechazado</strong></summary>

Tu commit debe seguir Conventional Commits:

```bash
git commit -m "type(scope): descripción"

# Ejemplo:
git commit -m "feat(timer): agregar botón de pausa"
```

</details>

<details>
<summary><strong>Pruebas fallando</strong></summary>

```bash
# Ejecutar pruebas para ver errores
bun test

# Corregir los problemas
# Intentar commitear de nuevo
```

</details>

<details>
<summary><strong>Errores de linting</strong></summary>

```bash
# Auto-corregir la mayoría de problemas de linting
bun lint --fix

# Para problemas restantes, corregir manualmente
# Luego commitear de nuevo
```

</details>

---

## Reconocimiento

Los contribuyentes son reconocidos en:

- 🌟 El README del proyecto
- 📰 Notas de lanzamiento
- 💖 ¡Nuestra eterna gratitud!

¡Gracias por hacer Pitmydoro mejor! 🙌
