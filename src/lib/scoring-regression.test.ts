import {describe,it,expect} from 'vitest';
import {scoreResume} from './scoring';
import {compareJob,evaluateCV} from './careerInsights';
describe('ATS scoring safety regressions',()=>{
 it('does not award free points when only skill requirements exist',()=>{
  const a=scoreResume('Completely unrelated text','Python SQL Docker');
  expect(a.score).toBe(0);
  expect(a.keywordCoverage).toBe(0);
 });
 it('does not award a deceptive score to an unrecognized vacancy',()=>{
  const a=scoreResume('Strong project university certificate','A creative role, with excellent communication');
  expect(a.score).toBe(0);
  expect(a.required).toHaveLength(0);
 });
 it('renormalizes applicable requirements only',()=>{
  const a=scoreResume('Python','Python SQL');
  expect(a.score).toBe(50);
 });
 it('compares independent portfolio evidence with a CV',()=>{
  const x=compareJob('Python','Python SQL','SQL');
  expect(x.cvResult.keywordCoverage).toBe(50);
  expect(x.combined.keywordCoverage).toBe(100);
 });
 it('quality checker stays in range with empty or malformed resumes',()=>{
  for(const cv of ['', 'a', 'Education\nPython\ncontact@example.com'])
   expect(evaluateCV(cv).score).toBeGreaterThanOrEqual(0);
  expect(evaluateCV('Python').score).toBeLessThanOrEqual(100);
 });
});