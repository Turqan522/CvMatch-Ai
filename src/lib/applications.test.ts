import {describe,expect,it} from 'vitest';
import {applicationStats,parseApplications,safeJobUrl,upcomingInterviews,type Application} from './applications';
const item=(status:Application['status'],interviewAt=''):Application=>({id:status,title:'Data Analyst',company:'ACME',url:'https://example.com/job',status,appliedAt:'2026-11-11',interviewAt,notes:'',updatedAt:1});
describe('application tracker',()=>{
  it('counts active applications and interview stages',()=>expect(applicationStats([item('Müsahibə'),item('Təklif'),item('İmtina')])).toEqual({total:3,interviews:1,offers:1,active:1}));
  it('filters stale, invalid and malformed entries',()=>{expect(parseApplications([{x:1},item('Baxılır')])).toHaveLength(1);expect(parseApplications(null)).toEqual([]);});
  it('rejects unsafe protocols',()=>{expect(safeJobUrl('javascript:alert(1)')).toBe('');expect(safeJobUrl('https://example.com')).toBe('https://example.com/');});
  it('lists only future scheduled interviews',()=>{expect(upcomingInterviews([item('Müsahibə','2026-11-20T10:00'),item('Müsahibə','2026-11-01T10:00')],new Date('2026-11-11').getTime())).toHaveLength(1);});
});
