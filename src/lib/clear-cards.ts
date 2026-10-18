import {createHash,timingSafeEqual} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {sameOrigin} from './api';

const requestSchema=z.object({code:z.string().min(1).max(128),action:z.enum(['preview','clear']),confirmed:z.boolean().optional()});
type Dependencies={getCode:()=>string|undefined;countCards:()=>Promise<number>;deleteCards:()=>Promise<number>};
const json=(body:object,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});

export function createClearHandler(dependencies:Dependencies){
 return async function POST(request:Request){
  if(!sameOrigin(request))return json({error:'Invalid origin.'},403);
  const parsed=requestSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return json({error:'Enter the hotel code and select a valid action.'},400);
  const expected=dependencies.getCode();
  if(!expected)return json({error:'The hotel clear code has not been configured on the server.'},503);
  const hash=(value:string)=>createHash('sha256').update(value).digest();
  if(!timingSafeEqual(hash(parsed.data.code),hash(expected)))return json({error:'Incorrect hotel code. No cards were deleted.'},403);
  if(parsed.data.action==='clear'&&parsed.data.confirmed!==true)return json({error:'Confirm that you want to permanently delete all cards.'},400);
  try {
   if(parsed.data.action==='preview')return json({count:await dependencies.countCards()});
   return json({deletedCount:await dependencies.deleteCards()});
  }catch{
   return json({error:'The database operation failed. Check the connection and that the database user has permission to delete cards.'},503);
  }
 };
}
