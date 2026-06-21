import { useState, useEffect } from 'react';

interface HumanityScore {
  visitedCountries: string[];
  hasPledged: boolean;
}

export function useHumanityScore() {
  const [score, setScore] = useState<HumanityScore>(() => {
    const saved = localStorage.getItem('humanity_score');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { visitedCountries: [], hasPledged: false };
      }
    }
    return { visitedCountries: [], hasPledged: false };
  });

  useEffect(() => {
    localStorage.setItem('humanity_score', JSON.stringify(score));
  }, [score]);

  const trackCountryVisit = (code: string) => {
    setScore(prev => {
      if (prev.visitedCountries.includes(code)) return prev;
      return { ...prev, visitedCountries: [...prev.visitedCountries, code] };
    });
  };

  const trackPledge = () => {
    setScore(prev => ({ ...prev, hasPledged: true }));
  };

  const getScore = () => {
    const totalCountries = 195;
    const visitedCount = score.visitedCountries.length;
    const scorePercent = Math.round((visitedCount / totalCountries) * 100);
    return {
      visitedCountries: score.visitedCountries,
      totalCountries,
      scorePercent,
      hasPledged: score.hasPledged
    };
  };

  return {
    ...getScore(),
    trackCountryVisit,
    trackPledge
  };
}
