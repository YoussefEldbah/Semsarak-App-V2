# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Semsarak seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

**security@semsarak.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Policy

Semsarak follows the principle of [Responsible Disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure).

## Security Best Practices

### For Developers

1. **Keep Dependencies Updated**
   - Regularly update npm packages
   - Use `npm audit` to check for vulnerabilities
   - Enable automated security scanning

2. **Input Validation**
   - Validate all user inputs
   - Use Angular's built-in XSS protection
   - Implement proper form validation

3. **Authentication & Authorization**
   - Use secure authentication methods
   - Implement proper session management
   - Use HTTPS in production
   - Store sensitive data securely

4. **Code Security**
   - Follow Angular security best practices
   - Use Content Security Policy (CSP)
   - Implement proper error handling
   - Avoid exposing sensitive information in error messages

### For Users

1. **Keep Software Updated**
   - Always use the latest version of Semsarak
   - Keep your browser updated
   - Use strong, unique passwords

2. **Secure Your Account**
   - Enable two-factor authentication if available
   - Use a password manager
   - Be cautious of phishing attempts

3. **Data Protection**
   - Don't share sensitive information unnecessarily
   - Log out when using shared computers
   - Be aware of your privacy settings

## Security Features

Semsarak implements several security features:

- **XSS Protection**: Angular's built-in XSS protection
- **CSRF Protection**: CSRF tokens for form submissions
- **Input Sanitization**: Automatic input sanitization
- **Secure Headers**: Security headers implementation
- **HTTPS Enforcement**: HTTPS-only in production
- **Content Security Policy**: CSP headers for additional protection

## Security Updates

Security updates are released as patch versions (e.g., 1.0.1, 1.0.2). We recommend updating to the latest version as soon as possible.

## Disclosure Timeline

- **48 hours**: Initial response to vulnerability report
- **7 days**: Status update and timeline
- **30 days**: Public disclosure (if not fixed)
- **90 days**: Full disclosure (if not fixed)

## Acknowledgments

We would like to thank all security researchers who responsibly disclose vulnerabilities to us. Your contributions help make Semsarak more secure for everyone.

## Contact

For security-related questions or concerns:

- **Email**: security@semsarak.com
- **PGP Key**: [Available upon request]
- **Response Time**: Within 48 hours

## Legal

By reporting a vulnerability, you agree to:

1. Not publicly disclose the vulnerability until it has been fixed
2. Provide reasonable time for us to address the issue
3. Work with us to coordinate disclosure

We reserve the right to modify this security policy at any time. 