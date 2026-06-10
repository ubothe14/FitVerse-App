export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Hevy vs Lyfta vs Strong \u2014 Full 2026 Comparison + Free FitVerse Analytics',
  'description': 'Honest comparison of Hevy, Lyfta, and Strong: features, pricing, API access, real user reviews, and complaints. Plus how FitVerse adds muscle heatmaps, plateau detection, PR tracking, set-by-set feedback, and AI export that all three workout loggers lack.',
  'author': { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
  'publisher': { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
  'url': 'https://fitverse.app/hevy-vs-lyfta/',
  'mainEntityOfPage': 'https://fitverse.app/hevy-vs-lyfta/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/hevy-vs-lyfta/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
