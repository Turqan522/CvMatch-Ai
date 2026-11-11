import {describe,expect,it} from 'vitest';
import {basicLetter,letterPrompt,safeLetterInput} from './coverLetter';
describe('cover letter',()=>{
  it('sanitizes and bounds candidate content',()=>expect(safeLetterInput(' A\u0000B ',4)).toBe('AB'));
  it('instructs model not to fabricate experience',()=>expect(letterPrompt({name:'Ali',company:'Example',role:'Intern',job:'Python',cv:'SQL',language:'az',tone:'professional'})).toContain('Do not invent'));
  it('offers an honest manual draft without pretending AI ran',()=>expect(basicLetter({name:'Turqan',company:'Company',role:'Analyst',language:'en'})).toContain('Turqan'));
});
