import { useMemo } from 'react';
import { useApp } from './store.jsx';
import { daysLeft, matchScore } from '../lib/metrics.js';

/** Opportunities enriched with live match %, days left and the user's saved/applied flags. */
export function useOpps() {
  const { glob, profile, applications, saved } = useApp();
  return useMemo(() => {
    const appliedIds = new Set(applications.map((a) => a.opportunityId));
    const savedIds = new Set(saved.map((s) => s.opportunityId || s.id));
    return glob.opportunities.map((o) => ({
      ...o,
      match: matchScore(o, profile || {}),
      days: daysLeft(o),
      applied: appliedIds.has(o.id),
      saved: savedIds.has(o.id),
    }));
  }, [glob.opportunities, profile, applications, saved]);
}

export const MATCH_THRESHOLD = 70;
export const firstName = (profile, user) => {
  const n = profile?.fullName || user?.displayName || user?.email || '';
  return String(n).trim().split(/\s+/)[0] || 'there';
};
