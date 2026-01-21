/**
 * Disclaimer Component Tests
 * 
 * Tests for the disclaimer functionality including strategy-specific
 * disclaimer filtering and rendering.
 * 
 * All tests follow the naming convention: given_[precondition]_when_[action]_then_[expectedResult]
 */

import { describe, test, expect } from 'vitest';
import { 
  DISCLAIMERS, 
  getApplicableDisclaimers 
} from '../../src/components/disclaimer.js';

describe('DISCLAIMERS', () => {
  test('given_disclaimers_when_accessed_then_hasGeneralDisclaimer', () => {
    expect(DISCLAIMERS.general).toBeDefined();
    expect(DISCLAIMERS.general.id).toBe('general');
    expect(DISCLAIMERS.general.title).toBe('General Disclaimer');
    expect(DISCLAIMERS.general.content).toBeTruthy();
    expect(DISCLAIMERS.general.priority).toBe(1);
  });

  test('given_disclaimers_when_accessed_then_hasGoldCgtDisclaimer', () => {
    expect(DISCLAIMERS.goldCgtExemption).toBeDefined();
    expect(DISCLAIMERS.goldCgtExemption.appliesTo).toContain('gold');
    expect(DISCLAIMERS.goldCgtExemption.appliesTo).toContain('gold-sp500');
  });

  test('given_disclaimers_when_accessed_then_hasPrePensionFreedomsDisclaimer', () => {
    expect(DISCLAIMERS.prePensionFreedoms).toBeDefined();
    expect(DISCLAIMERS.prePensionFreedoms.appliesToYearsBefore).toBe(2015);
  });

  test('given_disclaimers_when_accessed_then_hasSippFeesDisclaimer', () => {
    expect(DISCLAIMERS.sippFees).toBeDefined();
    expect(DISCLAIMERS.sippFees.appliesTo).toContain('sp500');
    expect(DISCLAIMERS.sippFees.appliesTo).toContain('nasdaq100');
    expect(DISCLAIMERS.sippFees.appliesTo).toContain('ftse100');
    expect(DISCLAIMERS.sippFees.appliesTo).toContain('goldEtf');
  });

  test('given_disclaimers_when_accessed_then_hasCurrencyRiskDisclaimer', () => {
    expect(DISCLAIMERS.currencyRisk).toBeDefined();
    expect(DISCLAIMERS.currencyRisk.appliesTo).toContain('sp500');
    expect(DISCLAIMERS.currencyRisk.appliesTo).toContain('nasdaq100');
    expect(DISCLAIMERS.currencyRisk.appliesTo).not.toContain('ftse100');
    expect(DISCLAIMERS.currencyRisk.appliesTo).not.toContain('goldEtf');
  });

  test('given_disclaimers_when_accessed_then_hasGoldEtfVsPhysicalDisclaimer', () => {
    expect(DISCLAIMERS.goldEtfVsPhysical).toBeDefined();
    expect(DISCLAIMERS.goldEtfVsPhysical.appliesTo).toContain('goldEtf');
    expect(DISCLAIMERS.goldEtfVsPhysical.appliesTo).toContain('gold-goldEtf');
  });

  test('given_allDisclaimers_when_checked_then_haveRequiredFields', () => {
    Object.values(DISCLAIMERS).forEach(disclaimer => {
      expect(disclaimer.id).toBeDefined();
      expect(disclaimer.title).toBeDefined();
      expect(disclaimer.content).toBeDefined();
      expect(disclaimer.icon).toBeDefined();
      expect(typeof disclaimer.priority).toBe('number');
    });
  });
});

describe('getApplicableDisclaimers', () => {
  test('given_anyStrategies_when_gettingDisclaimers_then_alwaysIncludesGeneral', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'sp500', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('general');
  });

  test('given_anyStrategies_when_gettingDisclaimers_then_alwaysIncludesTaxRates', () => {
    const disclaimers = getApplicableDisclaimers('sp500', 'ftse100', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('taxRates');
  });

  test('given_goldStrategy_when_gettingDisclaimers_then_includesGoldDisclaimers', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'sp500', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('goldCgtExemption');
    expect(ids).toContain('goldStorageCosts');
  });

  test('given_sippStrategy_when_gettingDisclaimers_then_includesSippFees', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'sp500', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('sippFees');
  });

  test('given_usDollarIndices_when_gettingDisclaimers_then_includesCurrencyRisk', () => {
    const disclaimers = getApplicableDisclaimers('sp500', 'nasdaq100', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('currencyRisk');
  });

  test('given_ftseOnly_when_gettingDisclaimers_then_excludesCurrencyRisk', () => {
    const disclaimers = getApplicableDisclaimers('ftse100', 'goldEtf', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).not.toContain('currencyRisk');
  });

  test('given_startYearBefore2015_when_gettingDisclaimers_then_includesPrePensionFreedoms', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'sp500', 2010);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('prePensionFreedoms');
  });

  test('given_startYear2015OrLater_when_gettingDisclaimers_then_excludesPrePensionFreedoms', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'sp500', 2015);
    const ids = disclaimers.map(d => d.id);
    expect(ids).not.toContain('prePensionFreedoms');
  });

  test('given_goldEtfStrategy_when_gettingDisclaimers_then_includesGoldEtfVsPhysical', () => {
    const disclaimers = getApplicableDisclaimers('goldEtf', 'sp500', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('goldEtfVsPhysical');
  });

  test('given_goldVsGoldEtf_when_gettingDisclaimers_then_includesGoldEtfVsPhysical', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'goldEtf', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('goldEtfVsPhysical');
  });

  test('given_combinedStrategy_when_gettingDisclaimers_then_includesRelevantDisclaimers', () => {
    const disclaimers = getApplicableDisclaimers('gold-sp500', 'nasdaq100', 2010);
    const ids = disclaimers.map(d => d.id);
    
    // Should include gold disclaimers because of gold-sp500
    expect(ids).toContain('goldCgtExemption');
    expect(ids).toContain('goldStorageCosts');
    
    // Should include SIPP fees for both strategies
    expect(ids).toContain('sippFees');
    
    // Should include currency risk for SP500 and Nasdaq
    expect(ids).toContain('currencyRisk');
    
    // Should include pre-2015 disclaimer
    expect(ids).toContain('prePensionFreedoms');
  });

  test('given_disclaimers_when_returned_then_sortedByPriority', () => {
    const disclaimers = getApplicableDisclaimers('gold', 'sp500', 2010);
    
    // Check that disclaimers are sorted by priority
    for (let i = 0; i < disclaimers.length - 1; i++) {
      expect(disclaimers[i].priority).toBeLessThanOrEqual(disclaimers[i + 1].priority);
    }
    
    // General should be first (priority 1)
    expect(disclaimers[0].id).toBe('general');
  });

  test('given_ftse100VsNasdaq100_when_gettingDisclaimers_then_includesSyntheticPricing', () => {
    const disclaimers = getApplicableDisclaimers('ftse100', 'nasdaq100', 2020);
    const ids = disclaimers.map(d => d.id);
    expect(ids).toContain('syntheticPricing');
  });
});
