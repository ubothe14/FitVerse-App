export { Head };

import React from 'react';
import { CommonHead } from '../../renderer/CommonHead';
import { SeoHead } from '../../renderer/SeoHead';
import config from './+config';

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', 'name': 'FitVerse', 'url': 'https://fitverse.app/' },
    { '@type': 'WebApplication', 'name': 'FitVerse', 'url': 'https://fitverse.app/', 'applicationCategory': 'HealthApplication', 'operatingSystem': 'Web', 'isAccessibleForFree': true },
  ],
});

function Head() {
  return (
    <>
      <CommonHead />
      <SeoHead canonicalPath="/about/" isLanding={false} title={config.title} description={config.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
    </>
  );
}
