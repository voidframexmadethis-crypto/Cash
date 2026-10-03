import { LicenseTemplate, LicenseVersion, BeatPassport } from '../types/index.js';
import { db } from './db.js';
import { DEFAULT_LICENSE_TEMPLATES } from '../constants/licenses.js';

export { DEFAULT_LICENSE_TEMPLATES };

export function getOrCreateLicenseVersion(license: LicenseTemplate): LicenseVersion {
  const active = db.getActiveLicenseVersion(license.id);
  if (active && active.price === license.price && active.name === license.name) {
    return active;
  }

  const existingVersions = db.getLicenseVersions().filter(v => v.licenseId === license.id);
  const nextVerNumber = existingVersions.length + 1;

  const newVersion: LicenseVersion = {
    id: `licver-${license.id}-v${nextVerNumber}`,
    licenseId: license.id,
    versionNumber: nextVerNumber,
    name: license.name,
    price: license.price,
    description: license.description,
    fileTypes: license.fileTypes,
    streamingLimit: license.streamingLimit,
    distributionLimit: license.distributionLimit,
    commercialRights: license.commercialRights,
    performanceRights: license.performanceRights,
    isExclusive: license.isExclusive,
    termsText: `Cashmere Kid$ ${license.name} Legal Contract Terms (Version ${nextVerNumber}.0)`,
    createdAt: new Date().toISOString()
  };

  return db.createLicenseVersion(newVersion);
}

export function generateBeatPassport(
  beatId: string,
  beatTitle: string,
  producer: string,
  customerEmail: string,
  orderId: string,
  downloadToken: string,
  license: LicenseTemplate
): BeatPassport {
  const version = getOrCreateLicenseVersion(license);

  return {
    id: 'passport-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    beatId,
    beatTitle,
    producer,
    customerEmail,
    orderId,
    purchaseDate: new Date().toISOString(),
    licenseName: license.name,
    licenseVersionId: version.id,
    licensePrice: license.price,
    downloadToken,
    includedFiles: license.fileTypes
  };
}
