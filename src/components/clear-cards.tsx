'use client';
import {useState} from 'react';
import {ArrowLeft,Check,LoaderCircle,LockKeyhole,Trash2} from 'lucide-react';
import {DRAFT_STORAGE_KEY} from '@/lib/drafts';

export default function ClearCards(){
 const [code,setCode]=useState(''),[count,setCount]=useState<number|null>(null),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[deleted,setDeleted]=useState<number|null>(null),[draftWarning,setDraftWarning]=useState(false);
 async function submit(event:React.FormEvent){
  event.preventDefault();setBusy(true);setError('');
  try {
   const action=count===null?'preview':'clear';
   const response=await fetch('/api/clear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,action,confirmed})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to clear cards.');
   if(action==='preview'){setCount(result.count);setConfirmed(false);}
   else {
    setDeleted(result.deletedCount);setCode('');setCount(null);setConfirmed(false);
    // Clear this browser’s backups only after the server confirms deletion.
    try{localStorage.removeItem(DRAFT_STORAGE_KEY);}catch{setDraftWarning(true);}
   }
  }catch(error){setError((error as Error).message);}
  finally{setBusy(false);}
 }
 return <main className="clear-page"><div className="clear-container"><a href="/" className="clear-back"><ArrowLeft size={15}/> Back to collection</a><section className="clear-panel"><div className="clear-icon">{deleted!==null?<Check size={24}/>:<LockKeyhole size={24}/>}</div><span className="eyebrow">HOTEL ADMINISTRATION</span><h1>{deleted!==null?'Collection cleared.':'Clear all VIP Stalkers'}</h1>
 {deleted!==null?<><p role="status">{deleted} {deleted===1?'card was':'cards were'} permanently deleted.</p>{draftWarning&&<p className="form-error">Browser draft storage could not be cleared. Check for local drafts before returning to the collection.</p>}<a href="/" className="button primary">Return to collection</a></>:<><p>Delete every saved card, including its revision history. This cannot be undone. Cloudinary images are retained.</p><form onSubmit={submit}>
 {count===null?<label className="clear-code-label">Hotel code<input autoFocus type="password" autoComplete="off" required maxLength={128} value={code} disabled={busy} onChange={event=>{setCode(event.target.value);setError('');}} placeholder="Enter hotel code"/></label>:<div className="clear-confirmation"><strong>{count} saved {count===1?'card':'cards'}</strong>{count===0?<p>The collection is already empty.</p>:<><p>All cards present when you confirm will be permanently deleted. Drafts in this browser will also be cleared.</p><label><input type="checkbox" checked={confirmed} disabled={busy} onChange={event=>setConfirmed(event.target.checked)}/> I confirm that I want to delete all cards.</label></>}</div>}
 {error&&<p className="form-error" role="alert">{error}</p>}<div className="clear-actions">{count!==null&&<button type="button" className="button secondary" disabled={busy} onClick={()=>{setCount(null);setConfirmed(false);setCode('');setError('');}}>Cancel</button>}{count!==0&&<button type="submit" className={`button ${count===null?'primary':'clear-delete'}`} disabled={busy||(count!==null&&!confirmed)}>{busy?<LoaderCircle size={15} className="spin"/>:count===null?<LockKeyhole size={15}/>:<Trash2 size={15}/>} {busy?'Please wait…':count===null?'Verify hotel code':'Permanently delete all cards'}</button>}</div></form></>}
 </section></div></main>;
}
