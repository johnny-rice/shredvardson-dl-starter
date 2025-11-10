/**
 * Tests for git branch operations and tracking info.
 *
 * @module git-branch.test
 */

import { describe, expect, it } from 'vitest';
import {
  getCurrentBranch,
  getCurrentBranchName,
  getUpstreamBranch,
  isTrackingUpstream,
} from '../src/git-branch.js';

describe('getCurrentBranch', () => {
  describe('branch information', () => {
    it('should return branch info object', () => {
      const branch = getCurrentBranch();
      expect(branch).toHaveProperty('current');
      expect(branch).toHaveProperty('upstream');
      expect(branch).toHaveProperty('tracking');
      expect(branch).toHaveProperty('commitsBehind');
      expect(branch).toHaveProperty('commitsAhead');
    });

    it('should return valid current branch name', () => {
      const branch = getCurrentBranch();
      expect(typeof branch.current).toBe('string');
      expect(branch.current.length).toBeGreaterThan(0);
    });

    it('should have boolean tracking status', () => {
      const branch = getCurrentBranch();
      expect(typeof branch.tracking).toBe('boolean');
    });

    it('should have number for commits ahead/behind', () => {
      const branch = getCurrentBranch();
      expect(typeof branch.commitsAhead).toBe('number');
      expect(typeof branch.commitsBehind).toBe('number');
      expect(branch.commitsAhead).toBeGreaterThanOrEqual(0);
      expect(branch.commitsBehind).toBeGreaterThanOrEqual(0);
    });
  });

  describe('upstream tracking', () => {
    it('should return upstream branch or null', () => {
      const branch = getCurrentBranch();
      if (branch.upstream !== null) {
        expect(typeof branch.upstream).toBe('string');
      }
    });

    it('should have consistent tracking status with upstream', () => {
      const branch = getCurrentBranch();
      if (branch.tracking) {
        expect(branch.upstream).not.toBeNull();
      } else {
        expect(branch.upstream).toBeNull();
      }
    });

    it('should have zero ahead/behind when not tracking', () => {
      const branch = getCurrentBranch();
      if (!branch.tracking) {
        expect(branch.commitsAhead).toBe(0);
        expect(branch.commitsBehind).toBe(0);
      }
    });
  });

  describe('current branch name format', () => {
    it('should not be empty', () => {
      const branch = getCurrentBranch();
      expect(branch.current).not.toBe('');
    });

    it('should be valid branch name or HEAD (detached)', () => {
      const branch = getCurrentBranch();
      // Should be either a valid branch name or 'HEAD' for detached HEAD
      expect(branch.current).toBeTruthy();
    });
  });
});

describe('getCurrentBranchName', () => {
  describe('branch name retrieval', () => {
    it('should return current branch name as string', () => {
      const name = getCurrentBranchName();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should match current from getCurrentBranch', () => {
      const name = getCurrentBranchName();
      const branch = getCurrentBranch();
      expect(name).toBe(branch.current);
    });
  });
});

describe('isTrackingUpstream', () => {
  describe('tracking status', () => {
    it('should return boolean', () => {
      const tracking = isTrackingUpstream();
      expect(typeof tracking).toBe('boolean');
    });

    it('should match tracking from getCurrentBranch', () => {
      const tracking = isTrackingUpstream();
      const branch = getCurrentBranch();
      expect(tracking).toBe(branch.tracking);
    });

    it('should be consistent with upstream branch presence', () => {
      const tracking = isTrackingUpstream();
      const upstream = getUpstreamBranch();

      if (tracking) {
        expect(upstream).not.toBeNull();
      } else {
        expect(upstream).toBeNull();
      }
    });
  });
});

describe('getUpstreamBranch', () => {
  describe('upstream branch retrieval', () => {
    it('should return string or null', () => {
      const upstream = getUpstreamBranch();
      if (upstream !== null) {
        expect(typeof upstream).toBe('string');
      }
    });

    it('should match upstream from getCurrentBranch', () => {
      const upstream = getUpstreamBranch();
      const branch = getCurrentBranch();
      expect(upstream).toBe(branch.upstream);
    });

    it('should have valid format when present', () => {
      const upstream = getUpstreamBranch();
      if (upstream !== null) {
        // Upstream branch should be in format like "origin/main"
        expect(upstream.length).toBeGreaterThan(0);
      }
    });
  });
});
