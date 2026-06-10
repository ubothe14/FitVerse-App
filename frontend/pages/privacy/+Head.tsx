export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'FitVerse Privacy — How Your Workout Data Stays Private',
  'description': 'FitVerse processes workout analytics locally in your browser. Learn what is stored locally and what is never stored on FitVerse servers.',
  'url': 'https://fitverse.app/privacy/',
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/privacy/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
