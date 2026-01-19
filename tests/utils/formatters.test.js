/**
 * Formatter Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatOunces,
  formatUnits
} from '../../src/utils/formatters.js';

describe('formatCurrency', () => {
  it('given_positiveValue_when_formatting_then_returnsPoundSign', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('£');
  });

  it('given_value1000_when_formattingWithNoDecimals_then_returns1000', () => {
    const result = formatCurrency(1000, 0);
    expect(result).toBe('£1,000');
  });

  it('given_value1000_when_formattingWith2Decimals_then_returnsDecimalPlaces', () => {
    const result = formatCurrency(1000.5, 2);
    expect(result).toBe('£1,000.50');
  });

  it('given_largeValue_when_formatting_then_includesThousandsSeparator', () => {
    const result = formatCurrency(500000);
    expect(result).toBe('£500,000');
  });

  it('given_negativeValue_when_formatting_then_showsNegative', () => {
    const result = formatCurrency(-1000);
    expect(result).toContain('-');
  });

  it('given_zero_when_formatting_then_returnsZero', () => {
    const result = formatCurrency(0);
    expect(result).toBe('£0');
  });

  it('given_NaN_when_formatting_then_returnsDash', () => {
    const result = formatCurrency(NaN);
    expect(result).toBe('—');
  });

  it('given_nonNumber_when_formatting_then_returnsDash', () => {
    const result = formatCurrency('1000');
    expect(result).toBe('—');
  });
});

describe('formatNumber', () => {
  it('given_value1234_when_formatting_then_addsThousandsSeparator', () => {
    const result = formatNumber(1234.56);
    expect(result).toBe('1,234.56');
  });

  it('given_value_when_formattingWith4Decimals_then_returns4DecimalPlaces', () => {
    const result = formatNumber(1.23456, 4);
    expect(result).toBe('1.2346');
  });

  it('given_value_when_formattingWith0Decimals_then_returnsWholeNumber', () => {
    const result = formatNumber(1234.56, 0);
    expect(result).toBe('1,235');
  });

  it('given_NaN_when_formatting_then_returnsDash', () => {
    const result = formatNumber(NaN);
    expect(result).toBe('—');
  });
});

describe('formatPercent', () => {
  it('given_decimal_when_formatting_then_returnsPercentage', () => {
    const result = formatPercent(0.05);
    expect(result).toBe('5.0%');
  });

  it('given_largeDecimal_when_formatting_then_returnsCorrectPercentage', () => {
    const result = formatPercent(0.4);
    expect(result).toBe('40.0%');
  });

  it('given_decimal_when_formattingWith2Decimals_then_returnsCorrectPrecision', () => {
    const result = formatPercent(0.1234, 2);
    expect(result).toBe('12.34%');
  });

  it('given_NaN_when_formatting_then_returnsDash', () => {
    const result = formatPercent(NaN);
    expect(result).toBe('—');
  });

  it('given_negativeDecimal_when_formatting_then_showsNegative', () => {
    const result = formatPercent(-0.05);
    expect(result).toBe('-5.0%');
  });
});

describe('formatOunces', () => {
  it('given_ounces_when_formatting_then_appendsOz', () => {
    const result = formatOunces(10.5);
    expect(result).toContain('oz');
  });

  it('given_ounces_when_formattingWithDefault_then_returns4Decimals', () => {
    const result = formatOunces(10.12345);
    expect(result).toBe('10.1235 oz');
  });

  it('given_ounces_when_formattingWith2Decimals_then_returns2Decimals', () => {
    const result = formatOunces(10.12345, 2);
    expect(result).toBe('10.12 oz');
  });

  it('given_NaN_when_formatting_then_returnsDash', () => {
    const result = formatOunces(NaN);
    expect(result).toBe('—');
  });
});

describe('formatUnits', () => {
  it('given_units_when_formatting_then_returnsFormattedNumber', () => {
    const result = formatUnits(1234.5678);
    expect(result).toBe('1,234.5678');
  });

  it('given_units_when_formattingWith2Decimals_then_returns2Decimals', () => {
    const result = formatUnits(1234.5678, 2);
    expect(result).toBe('1,234.57');
  });

  it('given_NaN_when_formatting_then_returnsDash', () => {
    const result = formatUnits(NaN);
    expect(result).toBe('—');
  });
});
