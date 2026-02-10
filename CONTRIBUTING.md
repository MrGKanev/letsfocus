# Contributing to LetsFocus

Thank you for your interest in contributing to LetsFocus! This document provides guidelines for contributing to the project.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/letsfocus.git`
3. Add upstream remote: `git remote add upstream https://github.com/MrGKanev/letsfocus.git`

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

The app will be available at `http://localhost:5173`

## Code Style

We use ESLint and Prettier to maintain code quality and consistency.

### JavaScript Guidelines
- Use ES6+ features (arrow functions, destructuring, modules)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused on a single task

### File Organization
- Place audio-related code in `js/audio/`
- Place UI components in `js/ui/`
- Place timer logic in `js/timer/`
- Add configuration constants to `js/config.js`

### Commit Messages
Follow conventional commits format:
```
type(scope): description

Examples:
feat(timer): add break timer for Pomodoro cycles
fix(audio): resolve volume control initialization bug
docs(readme): update installation instructions
style(css): improve focus indicators for accessibility
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes following the code style guidelines
3. Test your changes thoroughly
4. Run linter and fix any issues: `npm run lint:fix`
5. Format your code: `npm run format`
6. Commit your changes with a descriptive message

## Testing

Currently, the project is in early development and does not have automated tests. When making changes:

1. Test all user flows manually:
   - Start/pause/reset timer
   - Switch between sound profiles
   - Adjust timer duration
   - Test keyboard shortcuts
   - Verify break timer functionality
   - Check session history tracking

2. Test on multiple browsers:
   - Chrome/Edge
   - Firefox
   - Safari

3. Test responsive design on different screen sizes

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with your changes
3. Ensure your code follows the style guidelines
4. Make sure all your commits have descriptive messages
5. Create a pull request with a clear title and description
6. Link any related issues in the PR description
7. Wait for review and address any feedback

### PR Title Format
```
[Type] Brief description

Examples:
[Feature] Add session statistics dashboard
[Fix] Resolve timer synchronization issue
[Docs] Improve keyboard shortcuts documentation
```

## Adding New Features

### Sound Profiles
To add a new sound profile, edit `js/audio/soundProfiles.js` and `js/audio/profileEngine.js`. See the existing profiles as examples.

### UI Components
Place new UI components in `js/ui/` and follow the existing module pattern with clear exports.

### Configuration
Add new configuration constants to `js/config.js` rather than hardcoding values.

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating a new one
- Tag issues appropriately (bug, enhancement, question, etc.)

## Code of Conduct

- Be respectful and constructive in all interactions
- Welcome newcomers and help them get started
- Focus on what is best for the community and project
- Show empathy towards other community members

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to LetsFocus! 🎧
