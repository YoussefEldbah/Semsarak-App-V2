# Contributing to Semsarak

Thank you for your interest in contributing to Semsarak! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/semsarak-app.git
   cd semsarak-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   ng serve
   ```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Angular
- Use standalone components when possible
- Follow Angular style guide
- Use reactive forms for form handling
- Implement proper error handling

### CSS
- Use CSS custom properties (variables) for theming
- Follow BEM methodology for class naming
- Use flexbox and grid for layouts
- Ensure responsive design

### HTML
- Use semantic HTML elements
- Ensure accessibility with proper ARIA attributes
- Keep markup clean and readable

## 🔧 Development Workflow

### Creating a Feature

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Add tests for new functionality

4. Update documentation if needed

5. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add property details page"
   ```

6. Push your branch and create a pull request

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. Ensure your code follows the style guidelines
2. Add tests for new functionality
3. Update documentation if needed
4. Ensure all tests pass
5. Update the CHANGELOG.md if applicable
6. Request review from maintainers

## 🧪 Testing

### Running Tests

```bash
# Unit tests
ng test

# E2E tests (if configured)
ng e2e

# Linting
ng lint
```

### Writing Tests

- Write tests for all new functionality
- Use descriptive test names
- Test both success and error scenarios
- Mock external dependencies

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in comments
- Document complex business logic
- Keep README files updated

### API Documentation

- Document all public interfaces
- Include usage examples
- Specify parameter types and return values
- Document error scenarios

## 🐛 Bug Reports

When reporting bugs, please include:

1. A clear description of the issue
2. Steps to reproduce the problem
3. Expected vs actual behavior
4. Browser and OS information
5. Screenshots if applicable
6. Console errors if any

## 💡 Feature Requests

When suggesting features:

1. Describe the feature clearly
2. Explain the use case
3. Provide examples if possible
4. Consider implementation complexity
5. Discuss alternatives if applicable

## 🤝 Code Review

### Review Process

1. All pull requests require review
2. Address review comments promptly
3. Request clarification if needed
4. Be respectful and constructive

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance considerations addressed
- [ ] Security implications considered

## 📋 Issue Templates

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Version: [e.g., 1.0.0]

## Additional Information
Any other relevant information
```

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## Use Case
Why this feature is needed

## Proposed Solution
How you think it should be implemented

## Alternatives Considered
Other approaches you've considered

## Additional Information
Any other relevant information
```

## 🎯 Getting Help

If you need help:

1. Check existing issues and pull requests
2. Read the documentation
3. Ask questions in discussions
4. Contact maintainers directly

## 📄 License

By contributing to Semsarak, you agree that your contributions will be licensed under the MIT License.

## 🙏 Acknowledgments

Thank you for contributing to Semsarak! Your contributions help make this project better for everyone. 