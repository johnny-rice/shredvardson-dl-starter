#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';

interface LessonMetadata {
  file: string;
  title: string;
  tags: string[];
  severity?: string;
  category?: string;
  usedBy?: number;
  relatedIssues?: string[];
  date?: string;
}

const lessonsDir = '/home/user/dl-starter/docs/micro-lessons';
const files = fs.readdirSync(lessonsDir)
  .filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'template.md')
  .map(f => path.join(lessonsDir, f));

const lessons: LessonMetadata[] = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  const metadata: LessonMetadata = {
    file: path.basename(file),
    title: '',
    tags: [],
  };

  // Extract from YAML frontmatter
  let inFrontmatter = false;
  let frontmatterEnd = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        frontmatterEnd = true;
        break;
      }
    }

    if (inFrontmatter) {
      if (line.startsWith('title:')) metadata.title = line.replace('title:', '').trim().replace(/['"]/g, '');
      if (line.startsWith('category:')) metadata.category = line.replace('category:', '').trim();
      if (line.startsWith('severity:') || line.startsWith('Severity:')) metadata.severity = line.split(':')[1]?.trim();
      if (line.startsWith('UsedBy:') || line.startsWith('usedBy:')) metadata.usedBy = parseInt(line.split(':')[1]?.trim() || '0');
      if (line.startsWith('date:') || line.startsWith('created:')) metadata.date = line.split(':')[1]?.trim();
      if (line.startsWith('tags:')) {
        const tagMatch = line.match(/\[(.*?)\]/);
        if (tagMatch) {
          metadata.tags = tagMatch[1].split(',').map(t => t.trim());
        }
      }
      if (line.startsWith('related_issues:')) {
        const issueMatch = line.match(/\[(.*?)\]/);
        if (issueMatch) {
          metadata.relatedIssues = issueMatch[1].split(',').map(i => i.trim());
        }
      }
    }
  }

  // If no frontmatter, extract from content
  if (!metadata.title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) metadata.title = h1Match[1];
  }

  // Extract tags from footer
  const tagsMatch = content.match(/\*\*Tags\.\*\*\s+([#a-zA-Z0-9,\s-]+)/);
  if (tagsMatch && metadata.tags.length === 0) {
    metadata.tags = tagsMatch[1]
      .split(/[,\s]+/)
      .map(t => t.replace('#', '').trim())
      .filter(Boolean);
  }

  // Category inference from tags
  if (!metadata.category && metadata.tags.length > 0) {
    const tag = metadata.tags[0];
    if (tag.includes('bash') || tag.includes('shell')) metadata.category = 'bash';
    else if (tag.includes('git')) metadata.category = 'git';
    else if (tag.includes('test')) metadata.category = 'testing';
    else if (tag.includes('security')) metadata.category = 'security';
    else if (tag.includes('react') || tag.includes('nextjs')) metadata.category = 'react';
    else if (tag.includes('typescript')) metadata.category = 'typescript';
    else if (tag.includes('postgres') || tag.includes('supabase') || tag.includes('database')) metadata.category = 'database';
    else if (tag.includes('accessibility') || tag.includes('aria')) metadata.category = 'accessibility';
    else if (tag.includes('ci') || tag.includes('github-actions')) metadata.category = 'ci-cd';
    else if (tag.includes('pnpm') || tag.includes('monorepo')) metadata.category = 'monorepo';
  }

  lessons.push(metadata);
}

console.log(JSON.stringify(lessons, null, 2));
