import {describe,it,expect} from 'vitest';
import {defaultBuilder,cleanBuilder,moveBuilderSection,builderText,cleanPortfolio,portfolioHtml,safePortfolioLink} from './creativeStudio';
describe('visual CV builder',()=>{
 it('starts with standard editable sections',()=>expect(defaultBuilder('Ayla Test\nPython Developer').sections.length).toBeGreaterThan(4));
 it('reorders without losing content',()=>{
  const sections=defaultBuilder('Ayla').sections;
  const updated=moveBuilderSection(sections,0,2);
  expect(updated[2].id).toBe(sections[0].id);
  expect(sections[0].id).toBe('section-0');
  expect(moveBuilderSection(sections,0,-1)).toBe(sections);
 });
 it('exports only filled sections and constrains stored data',()=>{
  const v=defaultBuilder();v.sections[0].body='example@example.com';v.sections[1].body='Developer';
  expect(builderText(v)).toContain('PEŞƏKAR XÜLASƏ');
  expect(builderText(v)).not.toContain('SERTİFİKATLAR');
  expect(cleanBuilder({name:'x'.repeat(900),sections:[{id:'a',title:'S',body:'x'.repeat(17000)}]}).name.length).toBe(120);
 });
});
describe('portfolio HTML safety',()=>{
 it('blocks script URLs and escapes untrusted text',()=>{
  expect(safePortfolioLink('javascript:alert(1)')).toBe('');
  const p=cleanPortfolio({name:'<script>alert(1)</script>',headline:'Engineer',projects:[{id:'a',title:'<img src=x onerror=alert(1)>',description:'Nice',link:'javascript:alert(1)'}]});
  const html=portfolioHtml(p);
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>alert(1)</script>');
  expect(html).not.toContain('href="javascript:');
 });
 it('limits project count and link protocols',()=>{
  const p=cleanPortfolio({name:'Test',github:'https://github.com/test',projects:Array.from({length:20},(_,i)=>({id:String(i),title:'P',description:'D',link:'data:text/html,x'}))});
  expect(p.projects).toHaveLength(12);
  expect(p.projects.every(x=>!x.link)).toBe(true);
 });
});
