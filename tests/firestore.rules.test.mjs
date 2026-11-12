import {after, before, test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,updateDoc,deleteDoc} from 'firebase/firestore';
let env;
const profile={name:'Demo User',email:'a@example.com',createdAt:'2026-11-12T00:00:00.000Z'};
const user=(id,email)=>({name:'Demo User',email,createdAt:'2026-11-12T00:00:00.000Z'});
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-cvmatch-rules',firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('firestore.rules','utf8')}});
});
after(async()=>{if(env)await env.cleanup();});
test('authenticated users can create and update only their own account',async()=>{
 const a=env.authenticatedContext('a',{email:'a@example.com'}).firestore();
 await assertSucceeds(setDoc(doc(a,'users/a'),profile));
 await assertSucceeds(getDoc(doc(a,'users/a')));
 await assertSucceeds(updateDoc(doc(a,'users/a'),{title:'Developer'}));
 await assertSucceeds(updateDoc(doc(a,'users/a'),{draft:{cv:'Python',job:'SQL',role:'',url:''}}));
 await assertSucceeds(updateDoc(doc(a,'users/a'),{cvVersions:[{id:'v1',name:'CV',cv:'Python',createdAt:'2026-11-12'}]}));
});
test('cross-user reads, writes and deletion are rejected',async()=>{
 const a=env.authenticatedContext('a',{email:'a@example.com'}).firestore();
 const b=env.authenticatedContext('b',{email:'b@example.com'}).firestore();
 await assertFails(getDoc(doc(b,'users/a')));
 await assertFails(updateDoc(doc(b,'users/a'),{title:'Hijacked'}));
 await assertFails(deleteDoc(doc(b,'users/a')));
 await assertFails(setDoc(doc(b,'users/a'),user('a','b@example.com')));
 await assertSucceeds(setDoc(doc(b,'users/b'),user('b','b@example.com')));
 await assertFails(getDoc(doc(a,'users/b')));
});
test('anonymous access, immutable identity fields and unrelated collections are rejected',async()=>{
 const anon=env.unauthenticatedContext().firestore();
 const a=env.authenticatedContext('a',{email:'a@example.com'}).firestore();
 await assertFails(getDoc(doc(anon,'users/a')));
 await assertFails(setDoc(doc(anon,'users/public'),profile));
 await assertFails(updateDoc(doc(a,'users/a'),{email:'changed@example.com'}));
 await assertFails(updateDoc(doc(a,'users/a'),{createdAt:'changed'}));
 await assertFails(setDoc(doc(a,'other/test'),{secret:'x'}));
});
