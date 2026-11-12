import {describe,expect,it} from 'vitest';
import {parseDraft,parseVersions} from './cloudData';
describe('cross-device CV data validation',()=>{
 it('ignores malformed drafts instead of crashing',()=>{
  expect(parseDraft(null)).toEqual({cv:'',job:'',url:'',role:''});
  expect(parseDraft({cv:3,job:'SQL'}).job).toBe('SQL');
 });
 it('caps draft sizes before Firestore backup',()=>{
  expect(parseDraft({cv:'x'.repeat(40000)}).cv).toHaveLength(30000);
 });
 it('ignores invalid CV versions and caps count',()=>{
  const good=Array.from({length:25},(_,i)=>({id:String(i),name:'Name',cv:'Some CV',createdAt:'2026-11-12'}));
  expect(parseVersions([...good,{id:1}])).toHaveLength(20);
  expect(parseVersions('wrong')).toEqual([]);
 });
});
