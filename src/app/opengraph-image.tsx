import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

export const dynamic='force-dynamic';
export const alt='FTP VIP Stalker — guest profiles, stay dates and preferences.';
export const size={width:1200,height:630};
export const contentType='image/png';

export default async function OpenGraphImage(){
 const logo=await readFile(join(process.cwd(),'public/apple-touch-icon.png'));
 const logoSrc=`data:image/png;base64,${logo.toString('base64')}`;
 return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',position:'relative',background:'#101010',color:'#fff',fontFamily:'sans-serif',overflow:'hidden'}}>
  <div style={{display:'flex',position:'absolute',top:0,left:0,right:0,height:8,background:'#ffe600'}}/>
  <div style={{display:'flex',position:'absolute',right:-100,top:-80,width:650,height:800,border:'1px solid #303025',borderRadius:400,transform:'rotate(-22deg)'}}/>
  <div style={{display:'flex',position:'absolute',right:-20,top:-140,width:460,height:850,border:'1px solid #303025',borderRadius:400,transform:'rotate(-22deg)'}}/>
  <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'55px 64px',width:760,height:'100%'}}>
   <div style={{display:'flex',alignItems:'center',gap:18}}><img src={logoSrc} width={68} height={68} alt="FTP" style={{borderRadius:10}}/><span style={{fontSize:14,letterSpacing:3,color:'#aaa'}}>GUEST MANAGEMENT</span></div>
   <div style={{display:'flex',flexDirection:'column'}}><span style={{fontSize:89,fontWeight:700,letterSpacing:-5,lineHeight:1.05}}>VIP Stalker<span style={{color:'#ffe600'}}>.</span></span><div style={{display:'flex',flexDirection:'column',fontSize:25,lineHeight:1.6,color:'#b5b5b5',marginTop:23}}><span>Guest profiles, stays and preferences.</span><span>One shared workspace.</span></div></div>
   <div style={{display:'flex',alignItems:'center',gap:12,fontSize:13,letterSpacing:2,color:'#aaa'}}><div style={{display:'flex',width:26,height:3,background:'#ffe600'}}/> FTP HOTEL OPERATIONS</div>
  </div>
  <div style={{display:'flex',position:'absolute',right:65,top:100,width:300,height:430,borderRadius:18,background:'#fff',border:'1px solid #444',transform:'rotate(7deg)',boxShadow:'0 30px 60px #0008',overflow:'hidden',flexDirection:'column'}}>
   <div style={{display:'flex',flexDirection:'column',padding:'23px 24px',background:'#181818',borderTop:'5px solid #ffe600',height:135}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:10,letterSpacing:2,color:'#ccc'}}>VIP STALKER</span><span style={{fontSize:10,padding:'6px 9px',borderRadius:4,background:'#ffe600',color:'#111'}}>ROOM</span></div><span style={{fontSize:25,marginTop:20,color:'#fff'}}>Guest profile</span></div>
   <div style={{display:'flex',gap:25,padding:'16px 24px',background:'#f3f3f3',color:'#777',fontSize:9,letterSpacing:1}}><span>ARRIVAL</span><span style={{color:'#bbb'}}>→</span><span>DEPARTURE</span></div>
   <div style={{display:'flex',gap:11,padding:'20px 24px'}}>{[0,1,2].map(i=><div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:69,height:80,background:'#eee',borderRadius:6,gap:5}}><div style={{display:'flex',width:18,height:18,borderRadius:20,background:'#c9c9c9'}}/><div style={{display:'flex',width:33,height:20,borderRadius:'20px 20px 5px 5px',background:'#c9c9c9'}}/></div>)}</div>
   <div style={{display:'flex',flexDirection:'column',padding:'0 24px',gap:15}}>{['STAY DETAILS','PREFERENCES','REMARKS'].map(label=><div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #e8e8e8',paddingTop:12}}><span style={{fontSize:8,color:'#888',letterSpacing:1}}>{label}</span><div style={{display:'flex',height:4,width:60,background:'#e6e6e6',borderRadius:3}}/></div>)}</div>
  </div>
 </div>,size);
}
