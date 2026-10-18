import { describe, expect, it } from 'vitest';
import { compareWithDoc, parseTopicBankDoc } from './topic-bank-doc';

const doc = `## Year 1

### F — Foundations
| ID | Title | Prerequisites | Economic use |
|---|---|---|---|
| F01 | Algebra and exponent rules | — | Rearranging formulas |
| F05 | Market equilibrium | F02, F04 | Equilibrium price |

## Year 2
| MV01 | Functions of several variables | F03 | Production functions |
`;

describe('parseTopicBankDoc', () => {
  it('reads rows with their year and prerequisites', () => {
    expect(parseTopicBankDoc(doc)).toEqual([
      {
        id: 'F01',
        title: 'Algebra and exponent rules',
        coreYear: 1,
        prerequisites: [],
        economicUse: 'Rearranging formulas',
      },
      {
        id: 'F05',
        title: 'Market equilibrium',
        coreYear: 1,
        prerequisites: ['F02', 'F04'],
        economicUse: 'Equilibrium price',
      },
      {
        id: 'MV01',
        title: 'Functions of several variables',
        coreYear: 2,
        prerequisites: ['F03'],
        economicUse: 'Production functions',
      },
    ]);
  });
});

describe('compareWithDoc', () => {
  const entries = parseTopicBankDoc(doc);

  it('accepts identical data', () => {
    expect(compareWithDoc(entries, entries, 'bank')).toEqual([]);
  });

  it('reports changed fields and missing topics', () => {
    const [first, ...rest] = entries;
    if (!first) throw new Error('fixture');
    const json = [{ ...first, title: 'Algebra' }, ...rest.slice(0, 1)];
    const messages = compareWithDoc(json, entries, 'bank').map((i) => i.message);
    expect(messages).toEqual([
      'F01 title is "Algebra" in the JSON but "Algebra and exponent rules" in docs/05-topic-bank.md',
      'MV01 is in docs/05-topic-bank.md but not in the JSON',
    ]);
  });
});
