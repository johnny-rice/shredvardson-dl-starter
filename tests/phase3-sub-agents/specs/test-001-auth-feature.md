---
title: Multi-Factor Authentication (MFA) System
type: feature
priority: p0
status: draft
lane: spec-driven
issue: TEST-001
created: 2025-11-02
test_scenario: TC1.1
test_purpose: Standard spec-driven feature with auth patterns (Research + Security agents)
---

# Multi-Factor Authentication (MFA) System

## Summary

Add multi-factor authentication (MFA) support to the application, allowing users to enable TOTP-based 2FA for enhanced account security.

## Problem Statement

Users currently authenticate with only username/password, which is vulnerable to credential theft and phishing attacks. High-value accounts need an additional layer of security.

**User Impact:**
- Account takeovers result in data breaches
- Compliance requirements (SOC 2, HIPAA) mandate MFA
- Users have no self-service way to improve security

## Proposed Solution

Implement TOTP (Time-based One-Time Password) MFA using industry-standard libraries:

1. **Enrollment Flow:**
   - User enables MFA in account settings
   - Generate secret key and QR code
   - User scans QR code with authenticator app
   - Verify TOTP code to confirm enrollment
   - Display backup codes

2. **Authentication Flow:**
   - User logs in with username/password
   - If MFA enabled, prompt for TOTP code
   - Verify code against secret key
   - Allow "trust this device" option (30-day cookie)

3. **Recovery Flow:**
   - User can use backup codes if authenticator lost
   - Admin can reset MFA for user accounts
   - Email notification on MFA changes

## Acceptance Criteria

- [ ] User can enable MFA from account settings page
- [ ] QR code generated for TOTP enrollment
- [ ] TOTP verification works with Google Authenticator and Authy
- [ ] Backup codes generated and displayed once
- [ ] Login flow prompts for TOTP when MFA enabled
- [ ] "Trust this device" option works for 30 days
- [ ] User can disable MFA from settings
- [ ] Admin can reset user MFA in emergency
- [ ] Email notifications sent on MFA enable/disable/reset
- [ ] MFA status visible in user profile
- [ ] RLS policies prevent unauthorized MFA changes
- [ ] Audit log tracks MFA events

## Technical Constraints

**Authentication:**
- Must integrate with existing Supabase Auth system
- TOTP secrets must be encrypted at rest
- Backup codes must be hashed before storage

**Performance:**
- TOTP verification must complete in <200ms
- QR code generation must be fast (<100ms)

**Security:**
- Rate limiting on TOTP verification (5 attempts per 5 minutes)
- Backup codes single-use only
- Secret keys generated with cryptographically secure RNG

**Dependencies:**
- Supabase Auth (existing)
- TOTP library (e.g., `otpauth`, `speakeasy`)
- QR code library (e.g., `qrcode`)

## Success Metrics

- **Adoption:** ≥30% of users enable MFA within 3 months
- **Security:** 0 account takeovers for MFA-enabled users
- **Reliability:** ≥99.9% uptime for MFA verification
- **Performance:** P95 TOTP verification time <100ms

## Out of Scope

- SMS-based MFA (future consideration)
- Hardware security keys (future consideration)
- Biometric authentication (future consideration)
- Forced MFA for all users (optional for now)

## References

- Supabase Auth documentation: https://supabase.com/docs/guides/auth
- RFC 6238 (TOTP): https://tools.ietf.org/html/rfc6238
- OWASP MFA Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html

## Expected Research Findings

This test spec should trigger Research Agent to find:
- Existing auth patterns in `apps/web/lib/auth/` or similar
- Supabase Auth integration examples
- RLS policy patterns for user data
- Existing settings page components

## Expected Security Findings

This test spec should trigger Security Scanner to identify:
- Missing RLS policies on MFA-related tables
- Authentication bypass risks
- Session management vulnerabilities
- Encryption requirements for secrets
