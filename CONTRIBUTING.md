# Contributing to SegmentIQ

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Code Style

### Python (Backend)

- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for public functions

```python
def process_data(df: pd.DataFrame, options: dict) -> pd.DataFrame:
    """
    Process the input DataFrame.
    
    Args:
        df: Input DataFrame
        options: Processing options
        
    Returns:
        Processed DataFrame
    """
    pass
```

### JavaScript/React (Frontend)

- Use functional components with hooks
- Use CSS Modules for styling
- Use meaningful component names
- Keep components focused and small

```jsx
// Good
function CustomerCard({ customer, onSelect }) {
  return (
    <div className={styles.card} onClick={() => onSelect(customer)}>
      <h3>{customer.name}</h3>
    </div>
  );
}

// Avoid
function Card(props) {
  return <div onClick={props.onClick}>{props.children}</div>;
}
```

## Commit Messages

Use conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(api): add dataset deletion endpoint
fix(ui): resolve tooltip positioning issue
docs: update API documentation
```

## Pull Requests

### Before Submitting

- [ ] Code follows project style
- [ ] All tests pass
- [ ] New code has tests
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
```

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

## Project Structure

```
CustSegML/
├── backend/           # FastAPI backend
│   ├── app/           # Application code
│   ├── alembic/       # Database migrations
│   └── tests/         # Backend tests
├── frontend/          # React frontend
│   ├── src/           # Source code
│   └── public/        # Static assets
├── docs/              # Documentation
└── sample_data/       # Sample datasets
```

## Areas for Contribution

### High Priority
- [ ] Add more clustering algorithms (k-means, DBSCAN)
- [ ] Implement user authentication
- [ ] Add data export functionality
- [ ] Improve mobile responsiveness

### Nice to Have
- [ ] Dark/light theme toggle
- [ ] Cluster comparison view
- [ ] Batch processing
- [ ] API rate limiting

### Documentation
- [ ] Add more examples
- [ ] Video tutorials
- [ ] Amharic translations

## Questions?

- Open an issue for discussion
- Tag with `question` label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

