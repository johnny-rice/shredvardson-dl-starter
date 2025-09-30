# Security Policy

## Reporting a Vulnerability

**Contact:** security@yourdomain.tld

### Encrypted Reporting (Recommended)

For sensitive security issues, please use PGP encryption:

- **PGP Key:** [Link to your public key or paste key block here]
- **Key ID:** [Your key ID]
- **Instructions:** Encrypt your report with our public key and email the encrypted message

### Disclosure Timeline

- **Initial Response:** We triage reports within 72 hours
- **Status Updates:** Every 7 days during investigation
- **Coordinated Disclosure:** We follow a 90-day coordinated disclosure window
- **Public Disclosure:** Only after fixes are deployed or the disclosure window expires

Please do not publicly disclose vulnerabilities until we have released a fix or the disclosure window has closed.

## In Scope

Security vulnerabilities in:

- Authentication and authorization systems
- Payment processing and PCI compliance
- Secrets management and environment handling
- CI/CD pipeline security
- Data validation and injection vulnerabilities
- This repository's published artifacts and dependencies

## Out of Scope

The following issues are typically **not considered security vulnerabilities**:

- Missing security headers on non-sensitive pages
- Self-XSS that requires significant user interaction
- Issues in third-party dependencies (please report directly to maintainers)
- Social engineering attacks
- Physical security issues
- Issues requiring admin/privileged access that is intended
- Rate limiting on non-authentication endpoints
- Missing HTTPS on localhost/development environments

## Security Best Practices

When developing with this starter:

- Never commit secrets or API keys to version control
- Use environment variables for all sensitive configuration
- Keep dependencies updated with `pnpm audit` and `pnpm update`
- Enable 2FA on all deployment platforms
- Review security headers in production deployments
