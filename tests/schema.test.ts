import test from 'node:test';
import assert from 'node:assert/strict';
import { cardSchema,emptyCard } from '../src/lib/schema';
const valid={...emptyCard,main:'Guest',room:'101',actor:'Jane Doe',start:'2026-10-18',end:'2026-10-20'};
test('accepts a complete card and requires an attributable editor',()=>{assert.equal(cardSchema.safeParse(valid).success,true);assert.equal(cardSchema.safeParse({...valid,actor:''}).success,false);});
test('rejects reversed stays and impossible dates',()=>{assert.equal(cardSchema.safeParse({...valid,end:'2026-10-17'}).success,false);assert.equal(cardSchema.safeParse({...valid,start:'2026-02-30'}).success,false);});
test('rejects arbitrary image sources and more than ten guests',()=>{assert.equal(cardSchema.safeParse({...valid,photos:[{src:'javascript:alert(1)',name:'',reln:''}]}).success,false);assert.equal(cardSchema.safeParse({...valid,photos:Array(11).fill({src:'',name:'',reln:''})}).success,false);});

test('mutations accept the actual host and reject foreign origins',async()=>{
  const {sameOrigin}=await import('../src/lib/api');
  assert.equal(sameOrigin(new Request('http://localhost:3000/api/cards',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})),true);
  assert.equal(sameOrigin(new Request('http://localhost:3000/api/cards',{headers:{host:'localhost:3000',origin:'https://foreign.example'}})),false);
});
