# Production Monitoring Guide - Sub-Agent Workflow

**Status:** Reference / Aspirational
**Last Updated:** 2025-11-04
**Based On:** Phase 3 sub-agent testing work (now cancelled)

---

## Overview

This guide provides comprehensive monitoring recommendations for agent-based workflow systems. The patterns documented here were validated during Phase 3 sub-agent testing work.

**⚠️ Important:** Phase 3 sub-agent testing has been cancelled as over-engineered for MVP needs (see [ROADMAP.md](../../ROADMAP.md)). The metrics referenced in this guide (e.g., `research_agent.success`, `research_agent.total`) are **not currently instrumented** in the codebase. This guide serves as a reference for future production monitoring when agent workflows are implemented.

For current MVP priorities, see issues #292-#297.

**Key Monitoring Goals:**

1. **Detect failures early** - Alert before user impact
2. **Maintain quality** - Track fallback usage and degradation
3. **Optimize reliability** - Identify and fix systemic issues
4. **Meet SLAs** - Ensure Research Agent >98% success rate

---

## Implementation Guidance

To implement these metrics when you add agent workflows:

### 1. Choose an Instrumentation Library

**Recommended options:**

- **Datadog Browser RUM** (recommended for web apps): `npm install @datadog/browser-rum`
- **OpenTelemetry** (flexible, vendor-neutral): `npm install @opentelemetry/api @opentelemetry/sdk-node`
- **Custom Logging**: Emit structured JSON logs that Datadog/CloudWatch consume

### 2. Emit Metrics at Key Points

```typescript
import { datadogRum } from '@datadog/browser-rum';

async function executeAgent(agent: Agent): Promise<Result> {
  const startTime = Date.now();

  try {
    const result = await agent.execute();

    // Success metrics
    datadogRum.addAction('agent.success', {
      agent: agent.name,
      duration_ms: Date.now() - startTime
    });

    return result;
  } catch (error) {
    // Failure metrics
    datadogRum.addAction('agent.failure', {
      agent: agent.name,
      error: error.message,
      duration_ms: Date.now() - startTime
    });

    throw error;
  }
}
```

### 3. Add to Your Agent Wrapper

Wrap all agent executions with instrumentation:

```typescript
// src/lib/agents/base-agent.ts
export abstract class BaseAgent {
  async execute<T>(): Promise<T> {
    const metric = `${this.name}.total`;

    try {
      const result = await this.run();
      this.emitMetric(`${this.name}.success`, 1);
      return result;
    } catch (error) {
      this.emitMetric(`${this.name}.failure`, 1, {
        error: error.message
      });
      throw error;
    }
  }

  private emitMetric(name: string, value: number, tags?: Record<string, any>) {
    datadogRum.addAction(name, { value, ...tags });
  }

  protected abstract run<T>(): Promise<T>;
}
```

This transforms the guide from aspirational to actionable.

---

## Critical Metrics

### 1. Research Agent Success Rate

**Why Critical:** Research Agent provides 70% of workflow value. Workflow fails without it.

**Metric:** `research_agent_success_rate`

**Calculation:**

```typescript
research_agent_success_rate = (successful_executions / total_executions) * 100
```

**Thresholds:**

- ✅ **Target:** ≥98%
- ⚠️ **Warning:** 95-98%
- 🚨 **Critical:** <95%

**Actions:**

- **Warning:** Review error logs, investigate performance degradation
- **Critical:** Page on-call engineer, escalate to P0

**Datadog Query:**

```datadog
sum:research_agent.success{*}.as_count() / sum:research_agent.total{*}.as_count() * 100
```

**Alert Configuration:**

```yaml
name: "Research Agent Success Rate Critical"
query: "avg(last_10m):sum:research_agent.success{*}.as_count() / sum:research_agent.total{*}.as_count() * 100 < 95"
severity: P0
notify:
  - "@pagerduty-oncall"
  - "@slack-critical-alerts"
message: |
  Research Agent success rate dropped below 95% (current: {{value}}%).
  This is CRITICAL - workflow cannot succeed without Research Agent.

  Action Required:
  1. Check API health: https://status.anthropic.com
  2. Review recent deployments
  3. Check rate limits and quotas
  4. Investigate error logs
```

---

### 2. Agent Timeout Rate

**Why Critical:** Timeouts indicate performance degradation or network issues.

**Metric:** `agent_timeout_rate`

**Calculation:**

```typescript
agent_timeout_rate = (timeouts / total_executions) * 100
```

**Thresholds:**

- ✅ **Target:** <5%
- ⚠️ **Warning:** 5-10%
- 🚨 **Critical:** >10%

**Actions:**

- **Warning:** Investigate slow queries, check API latency
- **Critical:** Review timeout configuration, consider increasing to 90s

**Logging:**

```typescript
logger.warn('agent_timeout', {
  agent: 'research',
  duration_ms: 60000,
  query_complexity: 'high',
  fallback_used: true,
  quality_impact: 0.25,
  timestamp: new Date().toISOString()
});
```

**Dashboard Widget:**

```json
{
  "title": "Agent Timeout Rate (Last 24h)",
  "type": "timeseries",
  "requests": [
    {
      "q": "sum:agent.timeout{*}.as_count() / sum:agent.total{*}.as_count() * 100",
      "display_type": "line",
      "style": {
        "palette": "dog_classic",
        "type": "solid",
        "width": "normal"
      }
    }
  ],
  "yaxis": {
    "scale": "linear"
  },
  "events": [],
  "legend": {
    "type": "auto"
  }
}
```

**Note:** For production use, export JSON from Datadog's widget builder UI to ensure schema compatibility.

---

### 3. JSON Parse Error Rate

**Why Critical:** Parse errors indicate API response formatting issues.

**Metric:** `json_parse_error_rate`

**Calculation:**

```typescript
json_parse_error_rate = (parse_errors / total_executions) * 100
```

**Thresholds:**

- ✅ **Target:** <1%
- ⚠️ **Warning:** 1-5%
- 🚨 **Critical:** >5%

**Actions:**

- **Warning:** Review Security Scanner output format changes
- **Critical:** Investigate API contract violations, consider disabling Security Scanner

**Logging:**

```typescript
logger.warn('json_parse_error', {
  agent: 'security',
  error: error.message,
  raw_response_length: raw?.length || 0,
  raw_response_preview: raw?.substring(0, 100), // First 100 chars
  timestamp: new Date().toISOString()
});
```

**Alert Configuration:**

```yaml
name: "JSON Parse Error Rate Warning"
query: "avg(last_15m):sum:json.parse_error{agent:security}.as_count() / sum:security_agent.total{*}.as_count() * 100 > 1"
severity: P2
notify:
  - "@slack-alerts"
message: |
  Security Scanner parse error rate is {{value}}% (threshold: 1%).

  Likely causes:
  - API response format change
  - Malformed JSON from upstream
  - Response truncation

  Action: Review recent Security Scanner responses
```

---

### 4. Partial Failure Rate

**Why Critical:** Indicates agent reliability issues.

**Metric:** `partial_failure_rate`

**Calculation:**

```typescript
partial_failure_rate = (workflows_with_failures / total_workflows) * 100
```

**Thresholds:**

- ✅ **Target:** <10%
- ⚠️ **Warning:** 10-20%
- 🚨 **Critical:** >20%

**Actions:**

- **Warning:** Investigate failed agents, review recent changes
- **Critical:** Escalate to engineering, consider rolling back recent deployments

**Logging:**

```typescript
logger.warn('parallel_partial_failure', {
  total_agents: 3,
  successful: ['research', 'security'],
  failed: ['issue-creator'],
  workflow_quality: 0.9,
  timestamp: new Date().toISOString()
});
```

**Dashboard Widget:**

```json
{
  "title": "Partial Failure Breakdown",
  "type": "toplist",
  "query": "top(sum:agent.failure{*}.as_count() by {agent}, 10, 'sum', 'desc')",
  "description": "Top agents by failure count"
}
```

---

### 5. Network Retry Exhaustion Rate

**Why Critical:** Indicates systemic API or network issues.

**Metric:** `retry_exhaustion_rate`

**Calculation:**

```typescript
retry_exhaustion_rate = (retry_exhaustions / total_network_calls) * 100
```

**Thresholds:**

- ✅ **Target:** <5%
- ⚠️ **Warning:** 5-15%
- 🚨 **Critical:** >15%

**Actions:**

- **Warning:** Check API health status, review rate limits
- **Critical:** Investigate network issues, check for DDoS or API outages

**Logging:**

```typescript
logger.error('network_retry_exhausted', {
  agent: 'research',
  retry_attempts: 3,
  last_error: lastError.message,
  http_status: 503,
  fallback_used: true,
  timestamp: new Date().toISOString()
});
```

**Alert Configuration:**

```yaml
name: "Network Retry Exhaustion Spike"
query: "avg(last_10m):sum:network.retry_exhausted{*}.as_count() / sum:network.total_calls{*}.as_count() * 100 > 15"
severity: P1
notify:
  - "@slack-alerts"
  - "@pagerduty-engineering"
message: |
  Network retry exhaustion rate is {{value}}% (threshold: 15%).

  Immediate actions:
  1. Check API status: https://status.anthropic.com
  2. Review rate limits and quotas
  3. Check network connectivity
  4. Investigate recent infrastructure changes
```

---

### 6. Fallback Usage Rate

**Why Critical:** Indicates quality degradation impact.

**Metric:** `fallback_usage_rate`

**Calculation:**

```typescript
fallback_usage_rate = (fallback_executions / total_executions) * 100
```

**Thresholds:**

- ✅ **Target:** <10%
- ⚠️ **Warning:** 10-20%
- 🚨 **Critical:** >20%

**Actions:**

- **Warning:** Investigate root cause of primary failures
- **Critical:** User experience severely degraded, escalate to P1

**Logging:**

```typescript
logger.info('fallback_used', {
  agent: 'research',
  reason: 'timeout',
  fallback_quality: 0.75,
  confidence_reduction: 0.368,
  timestamp: new Date().toISOString()
});
```

**Dashboard Widget:**

```json
{
  "title": "Fallback Usage Trend",
  "type": "timeseries",
  "query": "sum:agent.fallback{*}.as_count() / sum:agent.total{*}.as_count() * 100",
  "description": "Percentage of executions using fallback data"
}
```

---

## Alert Severity Levels

### P0 (Critical) - Page On-Call

**Response Time:** Immediate (within 5 minutes)

**Triggers:**

- Research Agent success rate <95%
- Research Agent failures >5 in 5 minutes
- Total workflow failure rate >20%

**Actions:**

1. Acknowledge alert
2. Check API health status
3. Review recent deployments
4. Investigate error logs
5. Consider rollback if needed
6. Update incident channel

---

### P1 (High) - Notify Engineering

**Response Time:** Within 30 minutes

**Triggers:**

- Network retry exhaustion rate >15%
- Agent timeout rate >10%
- Partial failure rate >20%

**Actions:**

1. Acknowledge alert
2. Review metrics and trends
3. Investigate root cause
4. Create incident ticket
5. Update team on findings
6. Implement fix within 4 hours

---

### P2 (Medium) - Create Ticket

**Response Time:** Within 2 hours

**Triggers:**

- JSON parse error rate >1%
- Fallback usage rate >10%
- Agent timeout rate >5%

**Actions:**

1. Create tracking ticket
2. Review error patterns
3. Investigate during business hours
4. Implement fix within 1-2 days

---

## Dashboard Layout

### Main Dashboard: Sub-Agent Workflow Health

**URL:** `/dashboards/sub-agent-workflow`

**Sections:**

#### 1. Overall Health (Top Row)

- **Workflow Success Rate** - 24h trend with 95% threshold
- **Agent Success Rates** - Research (98%), Security (90%), Issue Creator (85%)
- **Error Rate** - Total errors across all agents
- **Fallback Usage** - Percentage using fallback data

#### 2. Critical Metrics (Second Row)

- **Research Agent Success Rate** - 7-day trend with alerts
- **Agent Timeout Rate** - By agent, 24h view
- **Partial Failure Rate** - Breakdown by failure combination
- **Network Retry Exhaustion** - 24h trend with threshold

#### 3. Error Details (Third Row)

- **JSON Parse Errors** - Count and rate by agent
- **Timeout Distribution** - Histogram of timeout durations
- **Network Error Types** - 500, 503, 429, timeout breakdown
- **Fallback Reasons** - Pie chart (timeout, network, parse error)

#### 4. Performance (Fourth Row)

- **Agent Execution Duration** - p50, p95, p99 by agent
- **Retry Attempts Distribution** - 0, 1, 2, 3 retries
- **Quality Degradation** - Average quality with/without failures
- **Agent Concurrency** - Parallel execution stats

---

## Sample Dashboard Configuration

### Datadog Dashboard JSON

```json
{
  "title": "Sub-Agent Workflow Health",
  "description": "Production monitoring for sub-agent workflow system",
  "layout_type": "ordered",
  "widgets": [
    {
      "definition": {
        "title": "Research Agent Success Rate (CRITICAL)",
        "type": "timeseries",
        "requests": [
          {
            "q": "sum:research_agent.success{*}.as_count() / sum:research_agent.total{*}.as_count() * 100",
            "display_type": "line",
            "style": {
              "palette": "dog_classic",
              "line_type": "solid",
              "line_width": "normal"
            }
          }
        ],
        "markers": [
          {
            "value": "y = 98",
            "display_type": "ok dashed",
            "label": "Target (98%)"
          },
          {
            "value": "y = 95",
            "display_type": "error dashed",
            "label": "Critical (95%)"
          }
        ]
      }
    },
    {
      "definition": {
        "title": "Agent Timeout Rate",
        "type": "query_value",
        "requests": [
          {
            "q": "sum:agent.timeout{*}.as_count() / sum:agent.total{*}.as_count() * 100",
            "aggregator": "avg"
          }
        ],
        "custom_unit": "%",
        "precision": 2,
        "thresholds": [
          { "value": 5, "color": "yellow" },
          { "value": 10, "color": "red" }
        ]
      }
    },
    {
      "definition": {
        "title": "Partial Failure Breakdown",
        "type": "toplist",
        "requests": [
          {
            "q": "top(sum:agent.failure{*}.as_count() by {agent}, 10, 'sum', 'desc')"
          }
        ]
      }
    },
    {
      "definition": {
        "title": "Fallback Usage Trend",
        "type": "timeseries",
        "requests": [
          {
            "q": "sum:agent.fallback{*}.as_count() / sum:agent.total{*}.as_count() * 100",
            "display_type": "line"
          }
        ],
        "markers": [
          {
            "value": "y = 20",
            "display_type": "error dashed",
            "label": "Critical (20%)"
          }
        ]
      }
    }
  ]
}
```

---

## Logging Standards

### Structured Logging Format

All agent events must log in structured JSON format:

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  type: string;
  agent?: string;
  details: Record<string, any>;
  timestamp: string;
}

// Export from: src/lib/logger/types.ts (or similar)
```

### Log Examples

#### Success

```typescript
logger.info('agent_success', {
  agent: 'research',
  duration_ms: 3500,
  tokens_used: 1200,
  confidence: 95,
  timestamp: new Date().toISOString()
});
```

#### Timeout

```typescript
logger.warn('agent_timeout', {
  agent: 'research',
  duration_ms: 60000,
  query_complexity: 'high',
  fallback_used: true,
  quality_impact: 0.25,
  timestamp: new Date().toISOString()
});
```

#### JSON Parse Error

```typescript
logger.warn('json_parse_error', {
  agent: 'security',
  error: error.message,
  raw_response_length: raw?.length || 0,
  raw_response_preview: raw?.substring(0, 100),
  timestamp: new Date().toISOString()
});
```

#### Partial Failure

```typescript
logger.warn('parallel_partial_failure', {
  total_agents: 3,
  successful: ['research', 'security'],
  failed: ['issue-creator'],
  failure_reasons: {
    'issue-creator': 'HTTP 500: Internal Server Error'
  },
  workflow_quality: 0.9,
  timestamp: new Date().toISOString()
});
```

#### Network Retry

```typescript
logger.warn('network_retry_attempt', {
  agent: 'research',
  attempt: 2,
  max_retries: 3,
  error: 'HTTP 503: Service Unavailable',
  next_delay_ms: 2000,
  timestamp: new Date().toISOString()
});
```

#### Retry Exhaustion

```typescript
logger.error('network_retry_exhausted', {
  agent: 'research',
  retry_attempts: 3,
  last_error: 'HTTP 503: Service Unavailable',
  http_status: 503,
  fallback_used: true,
  timestamp: new Date().toISOString()
});
```

---

## Incident Response Playbook

### Scenario 1: Research Agent Success Rate <95%

**Severity:** P0 - Critical

**Initial Response (within 5 minutes):**

1. Acknowledge alert in PagerDuty
2. Check API health: <https://status.anthropic.com>
3. Review error logs for Research Agent failures
4. Check rate limits and quotas

**Investigation (within 15 minutes):**

1. Identify failure pattern:
   - Timeouts? → Check API latency
   - Network errors? → Check network connectivity
   - Rate limits? → Review quota usage
2. Review recent deployments (last 24h)
3. Check for configuration changes
4. Verify environment variables

**Resolution (within 30 minutes):**

1. If API issue: Contact Anthropic support, enable fallback mode
2. If deployment issue: Rollback to previous version
3. If rate limit: Increase quota or implement backpressure
4. If timeout: Increase timeout to 90s temporarily

**Post-Incident (within 24 hours):**

1. Create incident report
2. Identify root cause
3. Implement permanent fix
4. Update runbook with learnings

---

### Scenario 2: Network Retry Exhaustion >15%

**Severity:** P1 - High

**Initial Response (within 30 minutes):**

1. Acknowledge alert
2. Check API health status
3. Review network error logs
4. Check rate limit headers

**Investigation (within 1 hour):**

1. Identify error types (500, 503, timeout)
2. Check for infrastructure changes
3. Review API quota usage
4. Verify network connectivity

**Resolution (within 4 hours):**

1. If API degradation: Enable fallback mode, contact support
2. If rate limit: Implement backpressure or increase quota
3. If network issue: Escalate to infrastructure team
4. If transient: Monitor for recovery

---

### Scenario 3: Fallback Usage >20%

**Severity:** P1 - High (Quality Degradation)

**Initial Response (within 30 minutes):**

1. Identify root cause of fallback usage:
   - Timeouts? → Check timeout logs
   - Network errors? → Check retry exhaustion
   - Parse errors? → Check parse error rate
2. Assess user impact
3. Create incident ticket

**Investigation (within 2 hours):**

1. Analyze fallback reasons breakdown
2. Check if specific to one agent or multiple
3. Review recent changes
4. Measure quality degradation impact

**Resolution (within 4 hours):**

1. Address root cause (timeout, network, parse)
2. Consider temporary timeout increase
3. Enable enhanced logging
4. Monitor for improvement

---

## SLA Targets

### Availability

- **Research Agent:** ≥98%
- **Security Scanner:** ≥90%
- **Issue Creator:** ≥85%
- **Overall Workflow:** ≥95%

### Performance

- **p50 Latency:** <5 seconds
- **p95 Latency:** <15 seconds
- **p99 Latency:** <30 seconds

### Quality

- **Fallback Usage:** <10%
- **Timeout Rate:** <5%
- **Parse Error Rate:** <1%
- **Retry Exhaustion:** <5%

---

## Monitoring Checklist

### Daily

- [ ] Review dashboard for anomalies
- [ ] Check alert history
- [ ] Verify SLA compliance

### Weekly

- [ ] Review incident reports
- [ ] Analyze failure trends
- [ ] Update alert thresholds if needed
- [ ] Review capacity and rate limits

### Monthly

- [ ] Generate health report
- [ ] Review SLA performance
- [ ] Identify optimization opportunities
- [ ] Update runbooks with new learnings

---

## References

- **Failure Handling Best Practices:** [failure-handling-best-practices.md](failure-handling-best-practices.md)
- **Current Roadmap:** [ROADMAP.md](../../ROADMAP.md)

**Note:** Phase 3 sub-agent testing was cancelled for MVP focus (2025-11-05). See [ROADMAP.md](../../ROADMAP.md) for rationale and current priorities.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
