export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'How to Read Your Training Data Like a Coach',
  'description': 'Your workout app shows you numbers. FitVerse shows you what they mean. A walkthrough of the analytics features that turn raw training logs into actionable answers.',
  'author': { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
  'publisher': { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
  'url': 'https://fitverse.app/dashboard-analytics/',
  'mainEntityOfPage': 'https://fitverse.app/dashboard-analytics/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/dashboard-analytics/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
