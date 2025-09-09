# Commit Conventions

## Format

```
<type>(<scope>): <description>
```

## Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

## Scopes

- Types: feat, fix, docs, refactor, test, chore
- Scopes: topology, network, containers, simulation, docker, config

## Examples

```bash
feat(topology): add new ground node to network
fix(docker): resolve container build issues
docs(readme): update setup instructions
refactor(network): optimize IP address allocation
chore(deps): update Docker base image
```

## Pre-Commit Checklist

- [ ] **Update README.md** with changes
- [ ] Test changes locally
- [ ] Follow naming conventions
- [ ] Use proper commit format

## Mandatory

Every contributor MUST read and follow this `commit-convention.md` before creating a commit. If you're unsure about the correct type/scope/description, stop and ask the repository maintainers or consult existing commits for examples.