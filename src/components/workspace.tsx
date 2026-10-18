'use client';
import {useCallback,useEffect,useRef,useState, type CSSProperties} from 'react';
import {ArrowUpRight, Plus, Search, Layers3, LayoutGrid, ChevronLeft, ChevronRight, X, Download, Camera, Check, LoaderCircle, Sparkles, Crown, ArrowRight, RefreshCw, Users, DoorOpen, LockKeyhole, Trash2} from 'lucide-react';
import {toPng} from 'html-to-image';
import StayRangePicker from '@/components/stay-range-picker';
import {emptyCard,type CardInput,type GuestCard} from '@/lib/schema';
import {DRAFT_STORAGE_KEY,draftKey,hasChanges,readDrafts,type Drafts,type SavedDraft} from '@/lib/drafts';
const dateLabel=(date:string)=>date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'Not set';
function ProfileCard({card}:{card:CardInput}) {
  const guestName = card.main || card.title || 'Guest name';
  const details = [
    ['Accompanying guests', card.photos.slice(1).map(p => `${p.name}${p.reln ? ` (${p.reln})` : ''}`).filter(Boolean).join(', ')],
    ['Meal plan', card.mp],
    ['Housekeeping', card.hsk],
    ['Dining preferences', card.dp],
  ];
  return <article className="guest-card">
    <header className="card-heading">
      <div className="card-heading-meta"><span className="card-kind">VIP Stalker</span><span className="card-room"><DoorOpen size={13}/><span>Room {card.room || '—'}</span></span></div>
      <h2>{guestName}</h2>
      {card.gp && <div className="card-profile"><span/>{card.gp}</div>}
    </header>
    <div className="card-stay"><div><span>Arrival</span><strong>{dateLabel(card.start)}</strong></div><div><span>Departure</span><strong>{dateLabel(card.end)}</strong></div></div>
    <section className="card-guests" aria-label="Guest photographs"><h3>Guests <span>{String(card.photos.length).padStart(2,'0')}</span></h3><div className="portraits">{card.photos.map((p,i) => <figure key={i}>
      {p.src ? <img src={p.src} alt={p.name || `Guest ${i+1}`} crossOrigin="anonymous"/> : <div className="portrait-placeholder"><Users size={24}/></div>}
      <figcaption>{p.name || (i===0 ? card.main || 'Main guest' : 'Accompanying guest')}{p.reln && <small>{p.reln}</small>}</figcaption>
    </figure>)}</div></section>
    <dl>{details.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
    <section className="card-remarks"><h3>Remarks</h3><p>{card.remarks || '—'}</p></section>
  </article>;
}
export default function Workspace(){
 const [cards,setCards]=useState<GuestCard[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[view,setView]=useState<'space'|'grid'>('space'),[active,setActive]=useState(0),[editor,setEditor]=useState(false),[editing,setEditing]=useState<GuestCard|null>(null),[draft,setDraft]=useState<CardInput>(emptyCard),[saving,setSaving]=useState(false),[uploading,setUploading]=useState<number|null>(null),[notice,setNotice]=useState(''),[formError,setFormError]=useState(''),[exporting,setExporting]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),preview=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement|null>(null),manualTitle=useRef(false);
 const photoInputs=useRef<(HTMLInputElement|null)[]>([]),pasteTimer=useRef<ReturnType<typeof setTimeout>|null>(null),pasteAttempt=useRef(0),uploadBusy=useRef(false);
 function cancelPaste(){if(pasteTimer.current)clearTimeout(pasteTimer.current);pasteTimer.current=null;pasteAttempt.current+=1;}
 useEffect(()=>()=>cancelPaste(),[editor]);
 const [drafts,setDrafts]=useState<Drafts>({}),[draftStorageError,setDraftStorageError]=useState(false),[confirmClose,setConfirmClose]=useState(false);
 const draftsRef=useRef<Drafts>({}),closeDialog=useRef<HTMLDialogElement>(null);
 const dirty=hasChanges(draft,editing);
 const writeDrafts=useCallback((next:Drafts)=>{
   draftsRef.current=next;
   setDrafts(next);
   try {localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(next));setDraftStorageError(false);}
   catch {setDraftStorageError(true);}
 },[]);
 useEffect(()=>{
   try {const saved=readDrafts(localStorage.getItem(DRAFT_STORAGE_KEY));draftsRef.current=saved;setDrafts(saved);}
   catch {setDraftStorageError(true);}
 },[]);
 const preserveDraft=useCallback(()=>{
   const key=draftKey(editing);
   if(hasChanges(draft,editing)) {
     const saved:SavedDraft={key,data:draft,original:editing,manualTitle:manualTitle.current,savedAt:new Date().toISOString()};
     writeDrafts({...draftsRef.current,[key]:saved});
   } else if(draftsRef.current[key]) {
     const next={...draftsRef.current};delete next[key];writeDrafts(next);
   }
 },[draft,editing,writeDrafts]);
 useEffect(()=>{if(editor)preserveDraft();},[editor,preserveDraft]);
 useEffect(()=>{
   if(!editor || !dirty)return;
   const beforeUnload=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
   const preserve=()=>preserveDraft();
   window.addEventListener('beforeunload',beforeUnload);
   window.addEventListener('pagehide',preserve);
   document.addEventListener('visibilitychange',preserve);
   return()=>{window.removeEventListener('beforeunload',beforeUnload);window.removeEventListener('pagehide',preserve);document.removeEventListener('visibilitychange',preserve);};
 },[editor,dirty,preserveDraft]);
 useEffect(()=>{if(confirmClose)closeDialog.current?.showModal();else closeDialog.current?.close();},[confirmClose]);
 async function load(){setLoading(true);setError('');try{const r=await fetch('/api/cards');const data=await r.json();if(!r.ok)throw new Error(data.error);setCards(data);}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 useEffect(()=>{if(editor){dialog.current?.showModal();document.body.style.overflow='hidden';}else{dialog.current?.close();document.body.style.overflow='';}return()=>{document.body.style.overflow='';};},[editor]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(t);},[notice]);
 const filtered=cards.filter(c=>`${c.title} ${c.main} ${c.room} ${c.createdBy}`.toLowerCase().includes(query.toLowerCase()));
 const index=Math.min(active,Math.max(0,filtered.length-1));
 function resume(saved:SavedDraft){
   setEditing(saved.original);setDraft(saved.data);manualTitle.current=saved.manualTitle;setFormError('');setConfirmClose(false);setEditor(true);setNotice('Unfinished card restored. Pick up where you left off.');
 }
 function open(card?:GuestCard){
   const saved=draftsRef.current[draftKey(card||null)];
   if(saved){resume(saved);return;}
   setEditing(card||null);setDraft(card?{...card,actor:''}:structuredClone(emptyCard));setFormError('');manualTitle.current=!!card;setConfirmClose(false);setEditor(true);
 }
 function finishClose(){preserveDraft();setConfirmClose(false);setEditor(false);trigger.current?.focus();}
 function close(){if(saving || uploading!==null)return;if(dirty){preserveDraft();setConfirmClose(true);return;}finishClose();}
 function update(key:keyof CardInput,value:string){setDraft(d=>({...d,[key]:value,...(key==='main'&&!manualTitle.current?{title:value}:{})}));if(key==='title')manualTitle.current=true;}
 async function save(e:React.FormEvent){e.preventDefault();if(uploading!==null)return;if(!draft.start||!draft.end){setFormError('Select both arrival and departure dates in the stay calendar.');return;}setSaving(true);setFormError('');try{const r=await fetch(editing?`/api/cards/${editing.id}`:'/api/cards',{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,...(editing?{revision:editing.revision}:{})})});const data=await r.json();if(!r.ok)throw new Error(data.error);setCards(cs=>[data,...cs.filter(c=>c.id!==data.id)]);setActive(0);const remaining={...draftsRef.current};delete remaining[draftKey(editing)];writeDrafts(remaining);setConfirmClose(false);setEditor(false);setError('');setNotice(editing?'Card updated. Every detail remembered.':'A new guest, thoughtfully remembered.');}catch(e){setFormError((e as Error).message);}finally{setSaving(false);}}
 function removePhoto(index:number,removeGuest=false){
   if(uploadBusy.current||saving)return;
   cancelPaste();
   setFormError('');
   setDraft(current=>({...current,photos:removeGuest&&index>0
     ? current.photos.filter((_,i)=>i!==index)
     : current.photos.map((photo,i)=>i===index?{...photo,src:''}:photo)}));
 }
 async function upload(file:File,i:number){if(uploadBusy.current)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){setFormError('Choose a JPG, PNG or WebP image under 8 MB.');return;}uploadBusy.current=true;setUploading(i);setFormError('');try{const form=new FormData();form.append('file',file);const r=await fetch('/api/upload',{method:'POST',body:form});const data=await r.json();if(!r.ok)throw new Error(data.error);setDraft(d=>({...d,photos:d.photos.map((p,j)=>j===i?{...p,src:data.url}:p)}));}catch(e){setFormError((e as Error).message);}finally{uploadBusy.current=false;setUploading(null);}}
 async function pastePhoto(i:number){
   if(uploadBusy.current)return;
   const attempt=++pasteAttempt.current;
   if(!navigator.clipboard?.read){setFormError('Click the photo box and press Ctrl+V (or ⌘V) to paste, or double-click to upload.');return;}
   try {
     const items=await navigator.clipboard.read();
     if(attempt!==pasteAttempt.current)return;
     const item=items.find(item=>item.types.some(type=>['image/png','image/jpeg','image/webp'].includes(type)));
     const type=item?.types.find(type=>['image/png','image/jpeg','image/webp'].includes(type));
     if(!item||!type){setFormError('No image found on the clipboard. Copy a screenshot first, then click the photo box to paste it.');return;}
     const blob=await item.getType(type);
     if(attempt!==pasteAttempt.current)return;
     await upload(new File([blob],`guest-${i+1}.${type.split('/')[1]}`,{type}),i);
   } catch {
     if(attempt===pasteAttempt.current)setFormError('Clipboard access wasn’t available. With the photo box focused, press Ctrl+V (or ⌘V), or double-click to upload.');
   }
 }
 async function download(){if(!preview.current)return;setExporting(true);setFormError('');try{const url=await toPng(preview.current,{pixelRatio:2,backgroundColor:'#ffffff'});const link=document.createElement('a');link.download=`FTP_${(draft.title||draft.main||'guest').replace(/[^a-z0-9]/gi,'_')}.png`;link.href=url;link.click();}catch{setFormError('Unable to export this image. Please retry after all photos have loaded.');}finally{setExporting(false);}}
 return <main><aside className="sidebar"><a className="brand" href="/">f<span>t</span>p<span className="brand-dot">.</span></a><div className="sidebar-rule"/><button className="nav-active" aria-label="Guest collection"><Layers3 size={21}/></button><div className="sidebar-bottom"><span className="avatar">F</span><span className="vertical-label">EXCEPTIONAL BY DESIGN</span></div></aside><div className="workspace"><header className="topbar"><div><span className="topbar-brand">GUEST EXPERIENCE</span><span className="topbar-divider">/</span><span>The collection</span></div><span className="private"><LockKeyhole size={12}/> INTERNAL WORKSPACE</span></header><section className="page-heading"><div className="eyebrow"><span className="gold-line"/> THE ART OF REMEMBERING</div><div className="heading-row"><div><h1>Every guest.<br/><em>Every little detail.</em></h1><p>A considered space for the people who make every stay special.</p></div><button ref={trigger} className="button primary" onClick={()=>open()}><Plus size={17}/> Create a stalker <ArrowUpRight size={16}/></button></div></section>{Object.keys(drafts).length>0&&<section className="draft-recovery" aria-label="Unfinished cards"><div><RefreshCw size={16}/><span><strong>Unfinished work, kept safe.</strong><small>{draftStorageError?'Drafts are kept in this session only. Browser storage is unavailable.':'Drafts are saved on this browser. Resume whenever you’re ready.'}</small></span></div><div className="draft-recovery-actions">{Object.values(drafts).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)).map(saved=><button className="button secondary" key={saved.key} onClick={()=>resume(saved)}>Resume {saved.data.main || (saved.original?'guest edits':'new card')}<ArrowUpRight size={14}/></button>)}</div></section>}<section className="collection"><div className="collection-toolbar"><div className="collection-title">The guest collection <span>{String(cards.length).padStart(2,'0')}</span></div><div className="toolbar-actions"><label className="search"><Search size={15}/><input aria-label="Search guests, rooms or creators" placeholder="Find a guest or room…" value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}}/></label><div className="view-toggle"><button aria-label="3D gallery" aria-pressed={view==='space'} className={view==='space'?'selected':''} onClick={()=>setView('space')}><Layers3 size={17}/></button><button aria-label="Grid gallery" aria-pressed={view==='grid'} className={view==='grid'?'selected':''} onClick={()=>setView('grid')}><LayoutGrid size={17}/></button></div></div></div>{error&&<div className="connection-message"><span>{error}</span><button onClick={()=>void load()}><RefreshCw size={13}/> Retry</button></div>}
 {loading?<div className="empty-stage"><LoaderCircle className="spin"/><p>Preparing your collection…</p></div>:!filtered.length?<div className="empty-stage"><div className="stage-grid"/><div className="orbital orbital-one"/><div className="orbital orbital-two"/><div className="empty-art" aria-hidden="true"><div className="ghost-card left"/><div className="ghost-card right"/><div className="invitation"><div className="invitation-top">FTP <Crown size={16}/></div><div className="invitation-icon"><Sparkles size={28}/></div><span>A SPACE FOR</span><strong>someone special.</strong><div className="invitation-lines"><i/><i/></div><div className="invitation-bottom">YOUR NEXT EXTRAORDINARY STAY</div></div><div className="art-spark s1">✦</div><div className="art-spark s2">✧</div></div><div className="empty-copy"><span className="eyebrow">{query?'A LITTLE FURTHER AFIELD':'GREAT HOSPITALITY STARTS HERE'}</span><h2>{query?'No matching guests.':'Your collection is waiting.'}</h2><p>{query?'Try another name, room number or creator.':'Turn a name into a personal welcome. Create your first guest card\nand keep the details that make all the difference.'}</p><button className="text-button" onClick={()=>query?setQuery(''):open()}>{query?'Clear search':'Create your first stalker'}<ArrowRight size={16}/></button></div><span className="space-label"><span/> AN OPEN SPACE FOR EXCEPTIONAL PEOPLE</span></div>:<><div className={view==='space'?'gallery-space':'gallery-grid'} onKeyDown={e=>{if(e.key==='ArrowRight')setActive(Math.min(index+1,filtered.length-1));if(e.key==='ArrowLeft')setActive(Math.max(0,index-1));}} tabIndex={view==='space'?0:undefined} aria-label="Guest cards; use left and right arrows to browse"><div className="stage-grid"/>{filtered.map((c,i)=>{const offset=i-index;return <div key={c.id} className={`gallery-item ${offset===0?'focused':''}`} aria-hidden={view==='space'&&Math.abs(offset)>2} style={view==='space'?{'--offset':offset,visibility:Math.abs(offset)>2?'hidden':'visible',zIndex:10-Math.abs(offset)} as CSSProperties:undefined}><button className="card-open" tabIndex={view==='space'&&Math.abs(offset)>2?-1:0} aria-label={`Edit ${c.title}`} onClick={()=>view==='space'&&offset!==0?setActive(i):open(c)}><ProfileCard card={c}/></button><div className="card-attribution"><span>Created by {c.createdBy}<small>Last edited by {c.updatedBy} · {dateLabel(c.updatedAt.slice(0,10))}</small></span><button onClick={()=>open(c)}>Edit card <ArrowUpRight size={14}/></button></div></div>;})}</div>{view==='space'&&<div className="gallery-controls"><button aria-label="Previous card" disabled={index===0} onClick={()=>setActive(index-1)}><ChevronLeft size={18}/></button><span>{String(index+1).padStart(2,'0')} <i>/ {String(filtered.length).padStart(2,'0')}</i></span><button aria-label="Next card" disabled={index===filtered.length-1} onClick={()=>setActive(index+1)}><ChevronRight size={18}/></button></div>}</>}
 <div className="collection-footer"><span><span className="status-dot"/> {error?'Awaiting connection':'A little more personal. A lot more memorable.'}</span><span>{view==='space'?'PERSPECTIVE VIEW':'COLLECTION VIEW'} <Layers3 size={12}/></span></div></section><footer className="page-footer"><span>FTP <i>·</i> Crafted for exceptional hospitality.</span><span>DETAILS MAKE THE DIFFERENCE.</span></footer></div>{notice&&<div className="toast" role="status"><Check size={17}/>{notice}</div>}
 <dialog ref={dialog} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===dialog.current)close();}} className="editor-dialog" aria-labelledby="editor-title"><div className="editor-shell"><header className="editor-header"><div><span className="eyebrow">THE GUEST ATELIER</span><h2 id="editor-title">{draft.main || (editing ? editing.main : 'New guest card')}</h2></div><button className="icon-button" aria-label="Close editor" onClick={close} disabled={saving||uploading!==null}><X size={21}/></button></header><div className="editor-body"><form id="card-form" onSubmit={save} className="editor-form"><div className="form-section"><span className="section-number">01</span><h3>The essentials</h3><p>Start with the person behind the stay.</p><label>Your full name <span>*</span><input required minLength={2} maxLength={100} value={draft.actor} onChange={e=>update('actor',e.target.value)} placeholder={editing?'Who is making this update?':'Who is creating this card?'}/></label><label>Main guest name <span>*</span><input required maxLength={150} value={draft.main} onChange={e=>update('main',e.target.value)} placeholder="e.g. Alexandra Morgan"/></label><div className="form-row"><label>Room number(s) <span>*</span><input required maxLength={100} value={draft.room} onChange={e=>update('room',e.target.value)} placeholder="e.g. 402, 403"/></label><label>Guest profile<input maxLength={2000} value={draft.gp} onChange={e=>update('gp',e.target.value)} placeholder="e.g. Special attention — handle with care"/></label></div><label>Card title<input maxLength={150} value={draft.title} onChange={e=>update('title',e.target.value)} placeholder="Automatically follows the guest name"/></label><StayRangePicker start={draft.start} end={draft.end} disabled={saving} onChange={(start,end)=>setDraft(current=>({...current,start,end}))}/></div><div className="form-section"><span className="section-number">02</span><h3>The thoughtful details</h3><p>The small things that make a stay their own.</p>{([['mp','Meal plan','e.g. Bed & breakfast'],['hsk','Housekeeping preferences','e.g. Evening turndown, extra pillows'],['dp','Dining preferences','e.g. Vegetarian, window table']] as const).map(([key,label,placeholder])=><label key={key}>{label}<input maxLength={2000} value={draft[key]} onChange={e=>update(key,e.target.value)} placeholder={placeholder}/></label>)}<label>Remarks & personal touches<textarea maxLength={2000} value={draft.remarks} onChange={e=>update('remarks',e.target.value)} placeholder="An anniversary, a favourite flower, a detail worth remembering…"/></label></div><div className="form-section"><span className="section-number">03</span><h3>Familiar faces <small>{draft.photos.length}/10</small></h3><p>Click to paste a screenshot · Double-click to upload. You can also focus a box and press Ctrl+V / ⌘V. JPG, PNG or WebP · up to 8 MB.</p><div className="photo-slots">{draft.photos.map((photo,i)=><div className="photo-slot" key={i}><button type="button" className="photo-upload" aria-label={`Guest photo ${i+1}: click to paste, double-click to upload`} title="Click to paste · Double-click to upload · Ctrl+V / ⌘V also works" disabled={uploading!==null||saving}
 onClick={e=>{cancelPaste();if(e.detail>1)return;if(e.detail===0){void pastePhoto(i);return;}pasteTimer.current=setTimeout(()=>{pasteTimer.current=null;void pastePhoto(i);},350);}}
 onDoubleClick={e=>{e.preventDefault();cancelPaste();setFormError('');photoInputs.current[i]?.click();}}
 onPaste={e=>{e.preventDefault();cancelPaste();if(uploadBusy.current)return;const file=Array.from(e.clipboardData.files).find(file=>file.type.startsWith('image/'));if(file)void upload(file,i);else setFormError('Copy an image or screenshot first, then paste it into the photo box.');}}>
 {uploading===i?<LoaderCircle className="spin"/>:photo.src?<img src={photo.src} alt={photo.name||'Guest photograph'}/>:<><Camera size={21}/><span>{i===0?'Main guest':'Guest photo'}</span><small>Click to paste</small></>}
 </button><input hidden ref={element=>{photoInputs.current[i]=element;}} aria-label={`Upload photo ${i+1}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading!==null||saving} onChange={e=>{cancelPaste();if(e.target.files?.[0])void upload(e.target.files[0],i);e.target.value='';}}/>{(['name','reln'] as const).map(key=><input key={key} aria-label={`${key==='name'?'Name':'Relationship'} for guest ${i+1}`} placeholder={key==='name'?'Guest name':'Relationship'} value={photo[key]} maxLength={100} onChange={e=>setDraft(d=>({...d,photos:d.photos.map((p,j)=>j===i?{...p,[key]:e.target.value}:p)}))}/>) }<div className="photo-slot-actions">{photo.src&&<button type="button" className="remove-photo-button" disabled={uploading!==null||saving} aria-label={`Remove photo for ${photo.name||`guest ${i+1}`}`} onClick={()=>removePhoto(i)}><X size={12}/> Remove photo</button>}{i>0&&<button type="button" className="remove-guest-button" disabled={uploading!==null||saving} aria-label={`Remove accompanying guest ${photo.name||i+1}`} onClick={()=>removePhoto(i,true)}><Trash2 size={11}/> Remove guest</button>}</div></div>)}</div><button className="text-button" type="button" disabled={draft.photos.length>=10} onClick={()=>setDraft(d=>({...d,photos:[...d.photos,{src:'',name:'',reln:''}]}))}><Plus size={14}/> Add a guest</button></div>{editing&&<p className="audit-info">Created by {editing.createdBy} · {dateLabel(editing.createdAt.slice(0,10))}<br/>Last edited by {editing.updatedBy} · Revision {editing.revision}</p>}</form><section className="preview-panel"><div className="preview-label"><span><span className="status-dot"/> LIVE PREVIEW</span><span>Made personal, as you type.</span></div><div ref={preview} className="export-card"><ProfileCard card={draft}/></div><p className="preview-note"><Sparkles size={13}/> A thoughtful welcome, down to the last detail.</p></section></div><footer className="editor-footer"><div role="alert" className={formError?'form-error':'save-note'}>{formError||(draftStorageError?'Draft is in memory only. Browser storage is unavailable.':dirty?'Draft saved on this browser · Not yet saved to the collection.':'Every card keeps its creator and edit history.')}</div><div><button className="button secondary" onClick={()=>void download()} disabled={exporting||uploading!==null}>{exporting?<LoaderCircle className="spin" size={15}/>:<Download size={15}/>} Export PNG</button><button className="button primary" type="submit" form="card-form" disabled={saving||uploading!==null}>{saving?<LoaderCircle className="spin" size={15}/>:<Check size={16}/>} {saving?'Saving…':editing?'Save changes':'Save guest card'}</button></div></footer></div></dialog>
 <dialog ref={closeDialog} className="close-confirm-dialog" aria-labelledby="close-confirm-title" aria-describedby="close-confirm-description" onCancel={e=>{e.preventDefault();setConfirmClose(false);}}>
   <div className="close-confirm-content"><span className="eyebrow">UNSAVED CARD</span><h2 id="close-confirm-title">Close this unfinished card?</h2><p id="close-confirm-description">You have unsaved changes. {draftStorageError?'Your draft will stay in this session so you can resume it, but browser storage is unavailable. Keep this tab open to protect your work.':'Your draft is saved on this browser, so you can resume it later. It hasn’t been saved to the guest collection yet.'}</p><div className="close-confirm-actions"><button className="button secondary" autoFocus onClick={()=>setConfirmClose(false)}>Keep editing</button><button className="button primary" onClick={finishClose}>Close & keep draft</button></div></div>
 </dialog></main>;
}
