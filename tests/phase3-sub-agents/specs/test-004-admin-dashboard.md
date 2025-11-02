---
title: Admin Dashboard with User Management
type: feature
priority: p1
status: draft
lane: spec-driven
issue: TEST-004
created: 2025-11-02
test_scenario: TC4.1
test_purpose: Security-sensitive feature (Security Scanner pre-check)
---

# Admin Dashboard with User Management

## Summary

Create an admin dashboard that allows administrators to view user activity, manage accounts, and monitor system health.

## Problem Statement

Administrators currently have no visibility into:
- User activity and engagement metrics
- System performance and errors
- Account status and user support issues
- Security incidents and anomalies

**Admin Impact:**
- Manual database queries for basic user info
- No real-time monitoring of system health
- Slow response to user support requests
- Security incidents detected too late

## Proposed Solution

Build a comprehensive admin dashboard with:

### 1. User Management
- User list with search and filters
- User detail view (profile, activity, usage)
- Account actions (suspend, delete, impersonate)
- Role and permission management

### 2. Analytics Dashboard
- Total users, MAU, DAU metrics
- Revenue charts (MRR, ARR)
- Feature usage heatmaps
- Conversion funnel analytics

### 3. System Health Monitoring
- API response times and error rates
- Database performance metrics
- Background job status
- Uptime and availability

### 4. Security Center
- Recent login attempts (successful/failed)
- Suspicious activity alerts
- IP blocklist management
- Audit log viewer

### 5. Support Tools
- User search by email/ID
- Impersonation for troubleshooting
- Support ticket integration
- Activity timeline

## Acceptance Criteria

### User Management
- [ ] Admin can view all users with pagination
- [ ] Admin can search users by email/name/ID
- [ ] Admin can filter by role, status, plan
- [ ] Admin can suspend/unsuspend user accounts
- [ ] Admin can delete user accounts (with confirmation)
- [ ] Admin can impersonate users (audit logged)
- [ ] Admin can assign/revoke roles

### Analytics
- [ ] Dashboard shows key metrics (users, revenue, engagement)
- [ ] Charts render with real-time data (<2s load)
- [ ] Export data as CSV
- [ ] Date range filters work correctly

### System Health
- [ ] API metrics displayed (latency, error rate)
- [ ] Database metrics displayed (query time, connections)
- [ ] Background jobs monitored (success/failure)
- [ ] Alerts shown for critical issues

### Security
- [ ] Recent logins displayed with IP and device info
- [ ] Failed login attempts tracked
- [ ] Suspicious activity flagged (e.g., multiple IPs)
- [ ] Audit log tracks all admin actions
- [ ] IP blocklist management works

### Support
- [ ] Admin can search users for support
- [ ] Admin can impersonate user (with audit trail)
- [ ] Activity timeline shows user history
- [ ] Support notes can be added to accounts

## Technical Constraints

**Authorization:**
- Only users with `admin` or `superadmin` role can access
- `admin` role: read-only access
- `superadmin` role: full CRUD access
- Impersonation requires `superadmin` + 2FA verification

**Security:**
- RLS policies enforce admin-only access
- All admin actions audit logged
- Rate limiting on sensitive operations (delete, suspend)
- CSRF protection on all forms

**Performance:**
- Dashboard loads in <2s
- User list paginated (50 per page)
- Analytics queries cached (5-minute TTL)
- Real-time updates via WebSocket for critical alerts

**Dependencies:**
- Supabase RLS policies for admin tables
- Analytics data aggregation (background jobs)
- Audit log storage and querying
- Charting library (e.g., Recharts, Chart.js)

## Success Metrics

**Admin Efficiency:**
- Average user lookup time: <10 seconds (vs. 5 minutes manual)
- Support ticket resolution time: -30%

**Security:**
- Time to detect security incident: <5 minutes
- False positive rate on suspicious activity: <5%

**Performance:**
- Dashboard load time: <2s P95
- User list search: <500ms P95

## Out of Scope

- Advanced analytics (cohort analysis, retention curves)
- Custom report builder
- Bulk user operations (bulk delete, bulk email)
- Multi-tenancy (organization-level admins)
- Scheduled reports and email digests

## References

- Admin dashboard examples: Stripe Dashboard, Vercel Analytics
- User impersonation guide: https://auth0.com/docs/secure/tokens/impersonation
- RLS admin patterns: Supabase docs

## Expected Research Findings

This test spec should trigger Research Agent to find:
- Existing admin routes or components
- Role/permission management patterns
- Analytics data aggregation approaches
- Chart component library usage

## Expected Security Findings (P0 CRITICAL)

This test spec should trigger Security Scanner to identify:
- **Missing RLS policies** on admin-only tables
- **Authorization bypass risks** (no role checks in API routes)
- **Audit logging gaps** (admin actions not tracked)
- **Session management issues** (impersonation token security)
- **CSRF vulnerabilities** on destructive actions (delete, suspend)
- **Data exposure risks** (viewing all user data without RLS)

**Expected P0 findings:**
- No RLS policy on users table (admins can see everything)
- No role-based access control in `/admin/*` routes
- Impersonation allows privilege escalation
- Audit log missing for sensitive operations
