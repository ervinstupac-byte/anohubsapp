import en from '../i18n/en.json';
import { describe, it, expect } from 'vitest';

describe('i18n en.json', () => {
  it('has no empty values', () => {
    const flatten = (obj: any, prefix = ''): Record<string,string> => Object.entries(obj).reduce((acc, [k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') acc[key] = v;
      else Object.assign(acc, flatten(v, key));
      return acc;
    }, {} as Record<string,string>);

    const flat = flatten(en);
    const empties = Object.entries(flat).filter(([, v]) => !v || v.trim() === '');
    expect(empties).toHaveLength(0);
  });
});
