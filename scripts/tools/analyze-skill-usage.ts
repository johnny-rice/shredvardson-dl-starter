#!/usr/bin/env tsx
/**
 * Skills Usage Analytics
 *
 * Analyzes .logs/skill-usage.csv and generates statistics including:
 * - Total invocations per Skill
 * - Success/failure rates
 * - Average execution time
 * - Most frequently used actions
 * - Actionable recommendations for optimization
 *
 * @usage pnpm exec tsx scripts/tools/analyze-skill-usage.ts [--7d|--90d|--all]
 * @example pnpm exec tsx scripts/tools/analyze-skill-usage.ts --7d
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Represents a single log entry from the CSV file
 */
interface SkillLogEntry {
  /** Unix timestamp (seconds) */
  timestamp: number
  /** Skill name (e.g., 'git', 'review', 'docs') */
  skill: string
  /** Action within skill (e.g., 'branch', 'commit', 'auto') */
  action: string
  /** Exit code (0 = success, >0 = failure) */
  exitCode: number
  /** Execution duration in milliseconds */
  durationMs: number
}

/**
 * Aggregated statistics for a single Skill
 */
interface SkillStats {
  /** Skill name */
  skill: string
  /** Total number of invocations */
  totalInvocations: number
  /** Number of successful invocations (exit code 0) */
  successCount: number
  /** Number of failed invocations (exit code >0) */
  failureCount: number
  /** Success rate as percentage (0-100) */
  successRate: number
  /** Average execution time in milliseconds */
  avgDurationMs: number
  /** Map of action names to their invocation counts */
  topActions: Map<string, number>
}

const LOG_FILE = resolve(process.cwd(), '.logs/skill-usage.csv')
const DAYS_30 = 30 * 24 * 60 * 60 // 30 days in seconds

/**
 * Parses the CSV log file and returns an array of log entries
 * @param filePath - Absolute path to the CSV file
 * @returns Array of parsed log entries
 */
function parseCSV(filePath: string): SkillLogEntry[] {
  if (!existsSync(filePath)) {
    return []
  }

  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header

  return lines
    .filter((line) => line.trim())
    .map((line) => {
      const [timestamp, skill, action, exitCode, durationMs] = line
        .split(',')
        .map((v) => v.trim())

      return {
        timestamp: parseInt(timestamp, 10),
        skill,
        action,
        exitCode: parseInt(exitCode, 10),
        durationMs: parseInt(durationMs, 10),
      }
    })
    .filter(
      (entry) =>
        !isNaN(entry.timestamp) &&
        !isNaN(entry.exitCode) &&
        !isNaN(entry.durationMs)
    ) // Filter out malformed entries
}

/**
 * Filters log entries to only include those within the specified number of days
 * @param entries - All log entries
 * @param days - Number of days to filter by
 * @returns Filtered log entries
 */
function filterByDays(entries: SkillLogEntry[], days: number): SkillLogEntry[] {
  const cutoffTime = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60
  return entries.filter((entry) => entry.timestamp >= cutoffTime)
}

/**
 * Calculates aggregated statistics for each Skill from log entries
 * @param entries - Filtered log entries to analyze
 * @returns Map of Skill names to their statistics
 */
function calculateStats(entries: SkillLogEntry[]): Map<string, SkillStats> {
  const statsMap = new Map<string, SkillStats>()

  for (const entry of entries) {
    if (!statsMap.has(entry.skill)) {
      statsMap.set(entry.skill, {
        skill: entry.skill,
        totalInvocations: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        avgDurationMs: 0,
        topActions: new Map(),
      })
    }

    const stats = statsMap.get(entry.skill)!
    stats.totalInvocations++

    if (entry.exitCode === 0) {
      stats.successCount++
    } else {
      stats.failureCount++
    }

    // Track action frequency
    const actionCount = stats.topActions.get(entry.action) || 0
    stats.topActions.set(entry.action, actionCount + 1)
  }

  // Calculate averages and percentages
  for (const stats of statsMap.values()) {
    stats.successRate = (stats.successCount / stats.totalInvocations) * 100

    // Calculate average duration
    const skillEntries = entries.filter((e) => e.skill === stats.skill)
    const totalDuration = skillEntries.reduce((sum, e) => sum + e.durationMs, 0)
    stats.avgDurationMs = totalDuration / skillEntries.length
  }

  return statsMap
}

/**
 * Finds the most frequently used action from a map of action counts
 * @param actions - Map of action names to invocation counts
 * @returns Name of the most frequently used action
 */
function getTopAction(actions: Map<string, number>): string {
  let topAction = ''
  let maxCount = 0

  for (const [action, count] of actions.entries()) {
    if (count > maxCount) {
      maxCount = count
      topAction = action
    }
  }

  return topAction
}

/**
 * Formats duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration (e.g., "123ms" or "1.2s")
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Generates actionable recommendations based on Skill usage patterns
 * @param stats - Array of Skill statistics
 * @param totalInvocations - Total number of invocations across all Skills
 * @returns Array of recommendation strings with emoji indicators
 */
function generateRecommendations(
  stats: SkillStats[],
  totalInvocations: number
): string[] {
  const recommendations: string[] = []

  for (const stat of stats) {
    const usagePercent = (stat.totalInvocations / totalInvocations) * 100

    // High usage, good reliability
    if (usagePercent > 20 && stat.successRate > 95) {
      recommendations.push(
        `✅ /${stat.skill} - High usage (${usagePercent.toFixed(1)}%), excellent reliability (${stat.successRate.toFixed(1)}%) - keep investing`
      )
    }
    // High usage, needs attention
    else if (usagePercent > 20 && stat.successRate < 90) {
      recommendations.push(
        `⚠️  /${stat.skill} - High usage but ${stat.failureCount} failures (${stat.successRate.toFixed(1)}% success) - investigate errors`
      )
    }
    // Very low usage
    else if (usagePercent < 5 && stat.totalInvocations < 5) {
      recommendations.push(
        `❓ /${stat.skill} - Very low usage (${stat.totalInvocations} invocations) - evaluate value or improve discoverability`
      )
    }
    // Slow performance
    else if (stat.avgDurationMs > 10000) {
      recommendations.push(
        `⏱️  /${stat.skill} - Slow average time (${formatDuration(stat.avgDurationMs)}) - consider optimization`
      )
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All Skills performing within acceptable ranges')
  }

  return recommendations
}

/**
 * Prints formatted statistics table and recommendations to console
 * @param statsMap - Map of Skill names to their statistics
 * @param days - Number of days the statistics cover
 */
function printStats(statsMap: Map<string, SkillStats>, days: number) {
  const stats = Array.from(statsMap.values()).sort(
    (a, b) => b.totalInvocations - a.totalInvocations
  )

  const totalInvocations = stats.reduce(
    (sum, s) => sum + s.totalInvocations,
    0
  )
  const totalSuccess = stats.reduce((sum, s) => sum + s.successCount, 0)
  const overallSuccessRate = (totalSuccess / totalInvocations) * 100

  console.log(`Skills Usage Statistics (Last ${days} Days)`)
  console.log('='.repeat(70))
  console.log()

  console.log('Summary:')
  console.log(`- Total invocations: ${totalInvocations}`)
  console.log(`- Unique Skills: ${stats.length}`)
  console.log(`- Overall success rate: ${overallSuccessRate.toFixed(1)}%`)
  console.log()

  if (stats.length === 0) {
    console.log('No usage data found.')
    console.log(
      `\nCheck that Skills are logging to: ${LOG_FILE.replace(process.cwd(), '.')}`
    )
    return
  }

  console.log('By Skill:')
  console.log(
    '┌─────────────┬──────────────┬──────────┬──────────┬──────────────┐'
  )
  console.log(
    '│ Skill       │ Count        │ Success  │ Avg Time │ Top Action   │'
  )
  console.log(
    '├─────────────┼──────────────┼──────────┼──────────┼──────────────┤'
  )

  for (const stat of stats) {
    const usagePercent = (stat.totalInvocations / totalInvocations) * 100
    const topAction = getTopAction(stat.topActions)

    console.log(
      `│ ${stat.skill.padEnd(11)} │ ${`${stat.totalInvocations} (${usagePercent.toFixed(1)}%)`.padEnd(12)} │ ${`${stat.successRate.toFixed(1)}%`.padEnd(8)} │ ${formatDuration(stat.avgDurationMs).padEnd(8)} │ ${topAction.padEnd(12)} │`
    )
  }

  console.log(
    '└─────────────┴──────────────┴──────────┴──────────┴──────────────┘'
  )
  console.log()

  // Recommendations
  const recommendations = generateRecommendations(stats, totalInvocations)
  console.log('Recommendations:')
  for (const rec of recommendations) {
    console.log(rec)
  }
  console.log()
}

/**
 * Main entry point - parses arguments and generates analytics report
 */
function main() {
  const args = process.argv.slice(2)
  let days = 30

  // Parse arguments
  if (args.includes('--7d') || args.includes('-7')) {
    days = 7
  } else if (args.includes('--90d') || args.includes('-90')) {
    days = 90
  } else if (args.includes('--all') || args.includes('-a')) {
    days = 365 * 10 // 10 years effectively "all time"
  }

  const allEntries = parseCSV(LOG_FILE)

  if (allEntries.length === 0) {
    console.log('No Skills usage data found.')
    console.log(`\nExpected log file: ${LOG_FILE.replace(process.cwd(), '.')}`)
    console.log('\nSkills will automatically log usage when invoked.')
    console.log('Try running a Skill command to generate data.')
    return
  }

  const filteredEntries = filterByDays(allEntries, days)

  if (filteredEntries.length === 0) {
    console.log(`No usage data found in the last ${days} days.`)
    console.log(`\nTotal historical entries: ${allEntries.length}`)
    console.log('Try a longer time range: --90d or --all')
    return
  }

  const statsMap = calculateStats(filteredEntries)
  printStats(statsMap, days)
}

main()
