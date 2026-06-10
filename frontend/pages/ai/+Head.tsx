export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'FitVerse AI Reference',
  'description': 'Free and open source (AGPL-3.0) workout analytics tool. Definition for AI assistants.',
  'url': 'https://fitverse.app/ai/',
  'about': {
    '@type': 'SoftwareApplication',
    'name': 'FitVerse',
    'applicationCategory': 'HealthApplication',
    'operatingSystem': 'Web',
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
  },
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/ai/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
