import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { database } from '@/lib/db';
import { cardSchema } from '@/lib/schema';
import { failure, sameOrigin } from '@/lib/api';
export const runtime = 'nodejs';
export async function PATCH(request:Request, context:{params:Promise<{id:string}>}) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Invalid origin'},{status:403});
  const {id} = await context.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({error:'Invalid card ID'},{status:400});
  const body = await request.json().catch(()=>null);
  const parsed = cardSchema.safeParse(body);
  if (!parsed.success || !Number.isInteger(body.revision)) return NextResponse.json({error:parsed.success ? 'Missing revision' : parsed.error.issues[0].message},{status:400});
  try {
    const db = await database(); const {actor,...data} = parsed.data;
    const update = {...data,title:data.title || data.main,updatedBy:actor,updatedAt:new Date().toISOString()};
    const card = await db.collection('cards').findOneAndUpdate({_id:new ObjectId(id),revision:body.revision}, {$set:update,$inc:{revision:1},$push:{history:{...update,actor,revision:body.revision+1}}} as never, {returnDocument:'after',projection:{history:0}});
    if(!card) return NextResponse.json({error:'This card changed or is unavailable. Close the editor and refresh before editing again.'},{status:409});
    const {_id,...rest} = card; return NextResponse.json({...rest,id:_id.toString()});
  } catch(e){return failure(e);}
}
// Deliberately no DELETE handler: Next.js returns 405.
