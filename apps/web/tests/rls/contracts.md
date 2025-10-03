# RLS Policy Contracts

**Version**: 1.0
**Updated**: 2025-10-03

## Overview

These contracts define the security boundaries that Row Level Security (RLS) policies MUST enforce in the Supabase database. All RLS tests validate these contracts.

## User Data Isolation

### Contract 1.1: Users Can Only Read Own Data

**Rule**: A user MUST only be able to SELECT rows where `user_id` matches their authenticated user ID.

**Test Scenarios**:

- ✅ User can read their own data
- ❌ User cannot read data belonging to other users
- ❌ Query returns 0 rows when filtering for other user's data

**SQL Policy Pattern**:

```sql
CREATE POLICY "Users can only read own data"
ON table_name
FOR SELECT
USING (auth.uid() = user_id);
```

### Contract 1.2: Users Cannot Read Other User Data

**Rule**: Any attempt to access data where `user_id` does NOT match the authenticated user MUST fail or return empty results.

**Test Scenarios**:

- ❌ SELECT where user_id = other_user_id returns 0 rows
- ❌ JOIN with other user's data returns no cross-user data
- ❌ Subqueries cannot leak other user information

### Contract 1.3: Users Cannot Update Other User Data

**Rule**: UPDATE operations MUST only succeed when `user_id` matches the authenticated user.

**Test Scenarios**:

- ✅ User can update their own data
- ❌ User cannot update other user's data (operation fails)
- ❌ UPDATE with other user_id has no effect

**SQL Policy Pattern**:

```sql
CREATE POLICY "Users can only update own data"
ON table_name
FOR UPDATE
USING (auth.uid() = user_id);
```

### Contract 1.4: Users Cannot Delete Other User Data

**Rule**: DELETE operations MUST only succeed when `user_id` matches the authenticated user.

**Test Scenarios**:

- ✅ User can delete their own data
- ❌ User cannot delete other user's data (operation fails)
- ❌ DELETE with other user_id has no effect

**SQL Policy Pattern**:

```sql
CREATE POLICY "Users can only delete own data"
ON table_name
FOR DELETE
USING (auth.uid() = user_id);
```

## Role-Based Permissions

### Contract 2.1: Owner Role - Full Access

**Rule**: Users with `role = 'owner'` have unrestricted access to organization data.

**Test Scenarios**:

- ✅ Owner can read all org data
- ✅ Owner can update all org data
- ✅ Owner can delete org data
- ✅ Owner can manage org members

**Future Implementation**: When multi-tenancy (organizations) is added.

### Contract 2.2: Admin Role - Read/Write Access

**Rule**: Users with `role = 'admin'` can read/write org data but cannot delete the organization.

**Test Scenarios**:

- ✅ Admin can read all org data
- ✅ Admin can update org data
- ✅ Admin can invite members
- ❌ Admin cannot delete organization
- ❌ Admin cannot remove owner

**Future Implementation**: When multi-tenancy (organizations) is added.

### Contract 2.3: Member Role - Limited Access

**Rule**: Users with `role = 'member'` have read-only access to org data.

**Test Scenarios**:

- ✅ Member can read org data
- ❌ Member cannot update org data
- ❌ Member cannot invite members
- ❌ Member cannot delete data

**Future Implementation**: When multi-tenancy (organizations) is added.

## Anonymous Access

### Contract 3.1: Anonymous Users Have No Data Access

**Rule**: Unauthenticated requests MUST NOT return any user data.

**Test Scenarios**:

- ❌ Anonymous SELECT returns 0 rows
- ❌ Anonymous INSERT fails
- ❌ Anonymous UPDATE fails
- ❌ Anonymous DELETE fails

**SQL Policy Pattern**:

```sql
-- No policy for anonymous users = no access
CREATE POLICY "Authenticated users only"
ON table_name
FOR ALL
USING (auth.uid() IS NOT NULL);
```

### Contract 3.2: Public Data Access

**Rule**: Only data explicitly marked as `is_public = true` can be accessed anonymously.

**Test Scenarios**:

- ✅ Anonymous users can read public data
- ❌ Anonymous users cannot read private data
- ❌ Anonymous users cannot modify any data

**Future Implementation**: When public data features are added.

## Cross-Table Security

### Contract 4.1: Foreign Key Access Control

**Rule**: Access to related data through foreign keys MUST respect RLS policies of the target table.

**Test Scenarios**:

- ❌ User cannot access related data of other users via JOIN
- ❌ Subqueries cannot bypass RLS on related tables
- ✅ User can access own related data

### Contract 4.2: Many-to-Many Relationship Security

**Rule**: Junction tables MUST enforce access control on both sides of the relationship.

**Test Scenarios**:

- ✅ User can only see their own memberships
- ❌ User cannot see other user's memberships
- ❌ User cannot create memberships for other users

**Future Implementation**: When team/organization features are added.

## Testing Checklist

For each table with RLS policies:

- [ ] Test user can read own data
- [ ] Test user cannot read other user data
- [ ] Test user can update own data
- [ ] Test user cannot update other user data
- [ ] Test user can delete own data
- [ ] Test user cannot delete other user data
- [ ] Test anonymous access is denied
- [ ] Test role permissions (if applicable)
- [ ] Test foreign key access control
- [ ] Test edge cases (null user_id, etc.)

## Validation Tools

### Manual RLS Testing

```sql
-- Set session to impersonate user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-here"}';

-- Run query to test
SELECT * FROM table_name;

-- Reset
RESET role;
RESET request.jwt.claims;
```

### Automated Testing

- Use Supabase client with different user tokens
- Create test users with known IDs
- Verify queries return expected results
- Assert unauthorized operations fail

## Security Priorities

**P0 (Critical)**:

- User data isolation (contracts 1.1-1.4)
- Anonymous access denial (contract 3.1)

**P1 (High)**:

- Role-based permissions (contracts 2.1-2.3)
- Cross-table security (contracts 4.1-4.2)

**P2 (Medium)**:

- Public data access (contract 3.2)
- Advanced relationship security

## References

- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
