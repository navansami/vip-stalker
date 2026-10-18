import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { cardSchema } from '@/lib/schema';
import { failure, sameOrigin } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {const db = await database(); const cards = await db.collection('cards').find({}, {projection:{history:0}}).sort({updatedAt:-1}).toArray(); return NextResponse.json(cards.map(({_id,...c})=>({...c,id:_id.toString()})));} catch(e){return failure(e);}
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Invalid origin'}, {status:403});
  const parsed = cardSchema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({error:parsed.error.issues[0].message},{status:400});
  try {
    const db = await database(); const now = new Date().toISOString(); const {actor,...data} = parsed.data;
    const card = {...data,title:data.title || data.main,createdBy:actor,updatedBy:actor,createdAt:now,updatedAt:now,revision:1};
    const result = await db.collection('cards').insertOne({...card,history:[{...card,actor}]});
    return NextResponse.json({...card,id:result.insertedId.toString()},{status:201});
  } catch(e){return failure(e);}
}
