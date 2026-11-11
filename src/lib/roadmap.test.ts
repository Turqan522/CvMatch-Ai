import {describe,expect,it} from 'vitest';
import {ROADMAP_ROLES,roadmapSkillGaps,roadmapTasks} from './roadmap';
describe('career roadmap',()=>{
  it('provides 30, 60 and 90-day milestones for each role',()=>{for(const role of ROADMAP_ROLES){expect(roadmapTasks(role).map(x=>x.period)).toEqual([30,60,90]);expect(role.tasks.every(period=>period.length>=3)).toBe(true);}});
  it('matches only evidenced skills',()=>{const role=ROADMAP_ROLES[0];const result=roadmapSkillGaps('Python, Pandas, SQL layihələri',role);expect(result.found).toContain('SQL');expect(result.found).toContain('Python');expect(result.missing).toContain('Power BI');});
});
