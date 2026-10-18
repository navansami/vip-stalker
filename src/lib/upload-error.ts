// Return actionable messages without forwarding provider payloads or credentials.
export function uploadFailure(error:unknown) {
  const status=error && typeof error==='object' && 'http_code' in error ? Number(error.http_code) : 0;
  if(status===403)return {status:503,body:{code:'CLOUDINARY_FORBIDDEN',error:'Cloudinary refused the upload. The configured API key needs create/upload permission for assets in the ftp-stalker folder. Update the key’s permissions or use an upload-enabled key.'}};
  if(status===401)return {status:503,body:{code:'CLOUDINARY_AUTH',error:'Cloudinary authentication failed. Check the cloud name, API key and API secret in the server environment.'}};
  if(status===400)return {status:400,body:{code:'CLOUDINARY_IMAGE_REJECTED',error:'Cloudinary could not process this image. Try a different JPG, PNG or WebP image.'}};
  if(status===420||status===429)return {status:503,body:{code:'CLOUDINARY_LIMIT',error:'Cloudinary’s upload limit was reached. Please try again later.'}};
  return {status:502,body:{code:'CLOUDINARY_UNAVAILABLE',error:'Cloudinary is temporarily unavailable. Your card draft is safe; please try the photo again.'}};
}
