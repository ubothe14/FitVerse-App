export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'What Your Workout App Doesn\'t Tell You',
  'description': 'Hevy, Strong, and Lyfta are great at logging workouts. But their built-in charts leave you guessing. Here\'s what FitVerse adds.',
  'author': { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
  'publisher': { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
  'url': 'https://fitverse.app/free-workout-dashboard/',
  'mainEntityOfPage': 'https://fitverse.app/free-workout-dashboard/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/free-workout-dashboard/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
