---
title: pgTAP Setup - Why pg_tle Doesn't Specify Schema
created: 2025-10-31
tags: [pgtap, postgres, supabase, extensions]
context: Issue #236 - CodeRabbit flagged inconsistent schema directives
reuse_count: 0
effectiveness_score: 0
---

## Problem

CodeRabbit review noted that `pg_tle` extension installation lacked schema specification while other extensions used `with schema extensions`:

```sql
create extension if not exists pgtap with schema extensions;
create extension if not exists http with schema extensions;
create extension if not exists pg_tle;  -- No schema specified ❓
```

## Solution

Add clarifying comment explaining why:

```sql
-- Install pg_tle extension (prerequisite for dbdev)
-- Note: pg_tle is installed in pg_catalog schema by default and cannot be relocated
create extension if not exists pg_tle;
```

## Why This Matters

**pg_tle (Trusted Language Extensions) behavior:**

- Installs in `pg_catalog` schema by default
- Cannot be relocated to another schema (restriction by design)
- Must remain in pg_catalog for security and access control

**Other extensions (pgtap, http):**

- Can be installed in custom schemas
- We use `extensions` schema for isolation and organization
- Keeps test utilities separate from application code

## Pattern for Extension Installation

```sql
-- Standard relocatable extensions
create extension if not exists <name> with schema extensions;

-- System extensions that must live in pg_catalog
-- (Add comment explaining why no schema specified)
create extension if not exists <name>;
```

## Common Postgres System Extensions

These typically install in `pg_catalog` and cannot be relocated:

- `pg_tle` - Trusted Language Extensions
- `plpgsql` - PL/pgSQL procedural language (usually pre-installed)
- `pg_stat_statements` - Query statistics

## Related

- Postgres extension documentation: [CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html)
- pg_tle docs: [Trusted Language Extensions](https://github.com/aws/pg_tle)
- Schema best practice: Group custom extensions in dedicated schema for organization
