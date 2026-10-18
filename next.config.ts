import type {NextConfig} from 'next';

const config:NextConfig={
 async headers(){
  return [{source:'/:path*',headers:[
   {key:'X-Robots-Tag',value:'noindex, nofollow, noarchive, nosnippet, noimageindex'},
   {key:'Cache-Control',value:'private, no-store, max-age=0, must-revalidate'},
   {key:'CDN-Cache-Control',value:'no-store'},
   {key:'Vercel-CDN-Cache-Control',value:'no-store'},
   {key:'Pragma',value:'no-cache'},
   {key:'Expires',value:'0'},
  ]}];
 },
};
export default config;
