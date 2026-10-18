'use client';

import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {ArrowRight,CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react';

type Props={start:string;end:string;onChange:(start:string,end:string)=>void;disabled?:boolean};
const iso=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const parse=(value:string)=>new Date(`${value}T12:00:00`);
const label=(value:string)=>value?parse(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Select date';
const nights=(start:string,end:string)=>Math.round((Date.UTC(parse(end).getFullYear(),parse(end).getMonth(),parse(end).getDate())-Date.UTC(parse(start).getFullYear(),parse(start).getMonth(),parse(start).getDate()))/86400000);

export default function StayRangePicker({start,end,onChange,disabled=false}:Props){
 const [open,setOpen]=useState(false),[selectingEnd,setSelectingEnd]=useState(false),[hover,setHover]=useState('');
 const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1,12));
 const [focused,setFocused]=useState('');
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const id=useId();
 const today=iso(new Date());
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){setOpen(false);setHover('');}};
  document.addEventListener('pointerdown',outside);
  return()=>document.removeEventListener('pointerdown',outside);
 },[open]);
 useEffect(()=>{
  if(!open||!focused)return;
  panel.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus({preventScroll:true});
 },[open,focused,month]);
 function show(){
  if(open){setOpen(false);return;}
  const date=start?parse(start):new Date();
  setMonth(new Date(date.getFullYear(),date.getMonth(),1,12));
  setSelectingEnd(!!start&&!end);setHover('');setFocused(iso(date));setOpen(true);
 }
 function pick(value:string){
  if(!selectingEnd||!start||value<start){onChange(value,'');setSelectingEnd(true);setHover('');setFocused(value);return;}
  onChange(start,value);setSelectingEnd(false);setHover('');setOpen(false);trigger.current?.focus();
 }
 function moveMonth(step:number){setMonth(current=>new Date(current.getFullYear(),current.getMonth()+step,1,12));setHover('');}
 function keyDate(event:KeyboardEvent<HTMLButtonElement>,value:string){
  const steps:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
  let next=parse(value);
  if(event.key in steps)next.setDate(next.getDate()+steps[event.key]);
  else if(event.key==='Home')next.setDate(next.getDate()-((next.getDay()+6)%7));
  else if(event.key==='End')next.setDate(next.getDate()+6-((next.getDay()+6)%7));
  else if(event.key==='PageUp'||event.key==='PageDown'){
   const day=next.getDate();next=new Date(next.getFullYear(),next.getMonth()+(event.key==='PageUp'?-1:1),1,12);next.setDate(Math.min(day,new Date(next.getFullYear(),next.getMonth()+1,0).getDate()));
  } else return;
  event.preventDefault();const nextIso=iso(next);setFocused(nextIso);setMonth(new Date(next.getFullYear(),next.getMonth(),1,12));if(selectingEnd)setHover(nextIso);
 }
 const firstDay=(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7;
 const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const cells=Array.from({length:Math.ceil((firstDay+days)/7)*7},(_,i)=>i>=firstDay&&i<firstDay+days?iso(new Date(month.getFullYear(),month.getMonth(),i-firstDay+1,12)):null);
 const rangeEnd=selectingEnd?(hover>=start?hover:''):end;
 const count=start&&rangeEnd?nights(start,rangeEnd):null;
 return <div className="stay-range-picker" ref={root} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();setOpen(false);setHover('');trigger.current?.focus();}}}>
  <span className="stay-range-label" id={`${id}-label`}>Stay dates <span>*</span></span>
  <button ref={trigger} type="button" className={`stay-range-trigger ${open?'is-open':''}`} disabled={disabled} aria-expanded={open} aria-controls={`${id}-calendar`} aria-labelledby={`${id}-label ${id}-value`} onClick={show}>
   <CalendarDays size={18}/><span className="stay-range-values" id={`${id}-value`}><span><small>Arrival</small><strong>{label(start)}</strong></span><ArrowRight size={15}/><span><small>Departure</small><strong>{label(end)}</strong></span></span><ChevronRight size={15}/>
  </button>
  {open&&<div className="stay-calendar" id={`${id}-calendar`} ref={panel} aria-label="Choose arrival and departure dates">
   <div className="calendar-instruction" aria-live="polite"><span className="status-dot"/>{selectingEnd?'Select your departure date':'Select your arrival date'}</div>
   <div className="calendar-navigation"><button type="button" aria-label="Previous month" onClick={()=>moveMonth(-1)}><ChevronLeft size={17}/></button><h4 id={`${id}-month`} aria-live="polite">{month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</h4><button type="button" aria-label="Next month" onClick={()=>moveMonth(1)}><ChevronRight size={17}/></button></div>
   <div className="calendar-grid" role="grid" aria-labelledby={`${id}-month`} onMouseLeave={()=>setHover('')}>
    <div className="calendar-week" role="row">{['Mo','Tu','We','Th','Fr','Sa','Su'].map(day=><span key={day} role="columnheader">{day}</span>)}</div>
    {Array.from({length:cells.length/7},(_,week)=><div className="calendar-week" role="row" key={week}>{cells.slice(week*7,week*7+7).map((value,i)=>{
     if(!value)return <div role="gridcell" key={`empty-${i}`}/>;
     const arrival=value===start,departure=value===rangeEnd,inside=!!start&&!!rangeEnd&&value>start&&value<rangeEnd;
     return <div role="gridcell" key={value} aria-selected={arrival||departure||inside} className={['calendar-cell',arrival?'range-start':'',departure?'range-end':'',inside?'in-range':'',selectingEnd?'previewing':''].join(' ')}><button type="button" data-date={value} aria-label={parse(value).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+(arrival?', arrival':departure?', departure':'')} aria-current={value===today?'date':undefined} tabIndex={value===focused?0:-1} onFocus={()=>{setFocused(value);if(selectingEnd)setHover(value);}} onMouseEnter={()=>{if(selectingEnd)setHover(value);}} onClick={()=>pick(value)} onKeyDown={event=>keyDate(event,value)}>{parse(value).getDate()}</button></div>;
    })}</div>)}
   </div>
   <div className="calendar-summary" aria-live="polite"><span>{count===null?(selectingEnd?'Hover to preview your stay':'Choose arrival, then departure'):count===0?'Same-day stay':`${count} ${count===1?'night':'nights'}`}</span><button type="button" onClick={()=>{onChange('','');setSelectingEnd(false);setHover('');trigger.current?.focus();}}>Clear dates</button></div>
  </div>}
 </div>;
}
