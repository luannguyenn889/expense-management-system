import { describe, expect, it } from 'vitest';
import { CurrencyVndPipe } from './currency-vnd.pipe';

describe('CurrencyVndPipe', () => {
  const pipe = new CurrencyVndPipe();

  it('should format a numeric amount as Vietnamese dong', () => {
    const formattedAmount = pipe.transform(1500000);

    expect(formattedAmount).toContain('1.500.000');
    expect(formattedAmount).toContain('₫');
  });

  it('should format an empty amount as zero dong', () => {
    expect(pipe.transform(null)).toContain('0');
    expect(pipe.transform(undefined)).toContain('₫');
  });
});
