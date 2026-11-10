import {describe,expect,it} from 'vitest';
import {createCareerReport,githubUsername,localJobSearchUrl,scoreJobMatch} from './career';

describe('career intelligence',()=>{
  it('accepts GitHub usernames and profile URLs only',()=>{
    expect(githubUsername('turqan522')).toBe('turqan522');
    expect(githubUsername('https://github.com/turqan522/')).toBe('turqan522');
    expect(githubUsername('https://not-github.com/turqan522')).toBeNull();
    expect(githubUsername('not valid username')).toBeNull();
  });
  it('suggests a relevant role based on actual profile evidence',()=>{
    const report=createCareerReport('Python, SQL, pandas. Data analysis project with dashboards and Excel.', '',null);
    expect(report.roles).toContain('Data Analyst');
    expect(report.skills).toContain('python');
    expect(report.findings.some(item=>item.area==='LinkedIn'&&item.tone==='improve')).toBe(true);
  });
  it('scores linked vacancy content and provides appropriate local search',()=>{
    const job={id:1,title:'Python Developer',company_name:'Example',url:'https://example.org',candidate_required_location:'Remote',description:'Python FastAPI developer',publication_date:'',category:''};
    expect(scoreJobMatch('Python and FastAPI developer with projects','',null,job)).toBeGreaterThan(0);
    expect(localJobSearchUrl('Data Analyst','linkedin')).toContain('Azerbaijan');
  });
});
