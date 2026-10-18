import { NextResponse } from 'next/server';
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const source = new URL(origin);
    return ['http:', 'https:'].includes(source.protocol) && source.host === request.headers.get('host');
  } catch { return false; }
}
export function failure(error: unknown) {
  console.error(error);
  return NextResponse.json({error: process.env.MONGODB_URI ? 'Storage is temporarily unavailable. Please try again.' : 'Connect MongoDB Atlas in .env.local to load and save cards.'}, {status:503});
}
