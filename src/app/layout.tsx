import type {Metadata,Viewport} from 'next';
import './globals.css';
import {privateRobots} from '@/lib/indexing';
export const dynamic='force-dynamic';
const title='VIP Stalker | FTP';
const description='Guest profiles, stay dates, preferences and team notes in one workspace.';
export const metadata:Metadata={
 metadataBase:new URL(process.env.SITE_URL||'http://localhost:3000'),
 title,description,applicationName:'FTP VIP Stalker',robots:privateRobots,
 openGraph:{title,description,siteName:'FTP VIP Stalker',type:'website',locale:'en_ZA',url:'/'},
 twitter:{card:'summary_large_image',title,description,images:[{url:'/opengraph-image',alt:'FTP VIP Stalker — guest profiles, stays and preferences.'}]},
 icons:{icon:[{url:'/favicon.ico'},{url:'/favicon-32x32.png',sizes:'32x32',type:'image/png'},{url:'/favicon-16x16.png',sizes:'16x16',type:'image/png'}],apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},
};
export const viewport:Viewport={themeColor:'#111111'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
