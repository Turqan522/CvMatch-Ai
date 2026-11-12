import {describe,it,expect} from 'vitest';
import {applicationFunnel,careerChecklist,checklistProgress} from './commandCenter';
import type {Application} from './applications';
const make=(status:Application['status']):Application=>({id:status,title:'Engineer',company:'Company',url:'',status,appliedAt:'2026-11-12',interviewAt:'',notes:'',updatedAt:1});
describe('command center insights',()=>{
 it('counts only tracked applications and groups reviewing with applied',()=>{
  const stages=applicationFunnel([make('Planlaşdırılır'),make('Müraciət edildi'),make('Baxılır'),make('Müsahibə'),make('Təklif'),make('İmtina')]);
  expect(stages.map(x=>x.count)).toEqual([1,2,1,1]);
 });
 it('reflects verified workflow readiness, not hiring probability',()=>{
  expect(checklistProgress(careerChecklist('','',[],0,0))).toBe(0);
  expect(checklistProgress(careerChecklist('CV '.repeat(50),'Python SQL Docker position requires proven work skills', [make('Müraciət edildi')],2,3))).toBe(100);
 });
 it('never divides by zero',()=>expect(checklistProgress([])).toBe(0));
});
