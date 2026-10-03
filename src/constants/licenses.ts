import { LicenseTemplate } from '../types/index.js';

export const DEFAULT_LICENSE_TEMPLATES: LicenseTemplate[] = [
  {
    id: 'lic-standard',
    name: 'Standard M4A/MP3 Lease',
    price: 29.99,
    description: 'Non-exclusive lease for independent music releases.',
    fileTypes: ['M4A', 'MP3'],
    streamingLimit: '50,000 Streams',
    distributionLimit: '2,500 Units',
    commercialRights: true,
    performanceRights: false,
    isExclusive: false
  },
  {
    id: 'lic-premium',
    name: 'Premium Audio Lease',
    price: 49.99,
    description: 'Non-exclusive lease with higher streaming allowances.',
    fileTypes: ['M4A', 'MP3'],
    streamingLimit: '250,000 Streams',
    distributionLimit: '10,000 Units',
    commercialRights: true,
    performanceRights: true,
    isExclusive: false
  },
  {
    id: 'lic-unlimited',
    name: 'Unlimited License',
    price: 149.99,
    description: 'Unlimited streaming and commercial performance rights.',
    fileTypes: ['M4A', 'MP3'],
    streamingLimit: 'Unlimited',
    distributionLimit: 'Unlimited',
    commercialRights: true,
    performanceRights: true,
    isExclusive: false
  },
  {
    id: 'lic-exclusive',
    name: 'Exclusive Ownership',
    price: 499.99,
    description: 'Full exclusive ownership. Beat is locked and removed from future sale.',
    fileTypes: ['M4A', 'MP3'],
    streamingLimit: 'Unlimited',
    distributionLimit: 'Unlimited',
    commercialRights: true,
    performanceRights: true,
    isExclusive: true
  }
];
