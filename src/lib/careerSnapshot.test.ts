import {describe,expect,it} from 'vitest';
import {cvFingerprint,makeCareerSnapshot} from './careerSnapshot';
describe('career snapshot',()=>{
  it('detects changes to CV without storing private CV text',()=>{expect(cvFingerprint('Python')).not.toBe(cvFingerprint('Python SQL'));});
  it('stores source-specific skill evidence without CV text',()=>{const snapshot=makeCareerSnapshot({skills:['Python','SQL'],roles:['Data Analyst'],findings:[]},'CV private data','LinkedIn about',true,['SQL']);expect(snapshot.skills).toEqual(['SQL']);expect(JSON.stringify(snapshot)).not.toContain('CV private data');expect(snapshot.sources.github).toBe(true);});
});
