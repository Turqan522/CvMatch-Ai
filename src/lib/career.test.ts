import {describe,expect,it} from 'vitest';
import {createCareerReport,githubUsername,localJobSearchUrl,profileAudit,scoreJobMatch} from './career';

describe('career intelligence',()=>{
  it('does not pretend to know missing LinkedIn and GitHub profile information',()=>{
    const audit=profileAudit('',null);
    expect(audit).toHaveLength(8);
    expect(audit.every(item=>!item.complete)).toBe(true);
  });
  it('checks supplied LinkedIn sections and public GitHub evidence',()=>{
    const linkedIn='Headline: Python Developer\nAbout: '+ 'I build useful products. '.repeat(12)+'\nExperience: Built APIs\nSkills: Python';
    const github={login:'test',name:null,bio:'Developer',blog:'https://example.com',public_repos:3,html_url:'https://github.com/test',repos:[1,2,3].map(n=>({name:`project-${n}`,description:'Example project',language:'TypeScript',html_url:`https://github.com/test/project-${n}`,stargazers_count:0,fork:false,updated_at:new Date().toISOString()}))};
    expect(profileAudit(linkedIn,github).every(item=>item.complete)).toBe(true);
  });
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
