import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/api';
import { uploadFailure } from '@/lib/upload-error';
export const runtime = 'nodejs';
export async function POST(request:Request) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Invalid origin'},{status:403});
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return NextResponse.json({error:'Connect Cloudinary in .env.local to upload photographs.'},{status:503});
  const data = await request.formData().catch(()=>null); const file = data?.get('file');
  if (!(file instanceof File) || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8*1024*1024) return NextResponse.json({error:'Choose a JPG, PNG or WebP image under 8 MB.'},{status:400});
  cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{secure_url:string}>((resolve,reject)=>{cloudinary.uploader.upload_stream({folder:'ftp-stalker',resource_type:'image',allowed_formats:['jpg','png','webp'],transformation:[{width:1200,height:1200,crop:'limit'}]},(error,result)=>error || !result ? reject(error) : resolve(result)).end(buffer);});
    return NextResponse.json({url:result.secure_url});
  } catch(error){
    const failure=uploadFailure(error);
    console.error('Cloudinary upload failed:',failure.body.code);
    return NextResponse.json(failure.body,{status:failure.status});
  }
}
