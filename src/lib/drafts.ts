import { z } from 'zod';
import { emptyCard, type CardInput, type GuestCard } from './schema';

export const DRAFT_STORAGE_KEY = 'ftp-stalker:drafts:v1';
const draftInput = z.object({
  ...Object.fromEntries(Object.keys(emptyCard).filter(key => key !== 'photos').map(key => [key,z.string().max(2000)])),
  photos: z.array(z.object({src:z.string().max(500).refine(value => !value || /^https:\/\/res\.cloudinary\.com\//.test(value)),name:z.string().max(100),reln:z.string().max(100)})).max(10),
});
export type SavedDraft = {key:string; data:CardInput; original:GuestCard|null; manualTitle:boolean; savedAt:string};
export type Drafts = Record<string,SavedDraft>;
export const draftKey = (card:GuestCard|null) => card?.id || 'new';
export function fingerprint(data:CardInput):string {
  return JSON.stringify(Object.fromEntries(Object.keys(emptyCard).map(key => [key,data[key as keyof CardInput]])));
}
export function hasChanges(data:CardInput, original:GuestCard|null):boolean {
  return fingerprint(data) !== fingerprint(original ? {...original,actor:''} : emptyCard);
}
export function readDrafts(raw:string|null):Drafts {
  if (!raw) return {};
  try {
    const parsed:unknown=JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const valid:Drafts={};
    for (const [key,value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object') continue;
      const draft=value as SavedDraft;
      const data=draftInput.safeParse(draft.data);
      const original=draft.original;
      if (!data.success || draft.key!==key || typeof draft.manualTitle!=='boolean' || typeof draft.savedAt!=='string') continue;
      if (key!=='new' && (!original || original.id!==key || !Number.isInteger(original.revision) || !draftInput.safeParse({...original,actor:''}).success)) continue;
      if (key==='new' && original!==null) continue;
      valid[key]={...draft,data:data.data as CardInput};
    }
    return valid;
  } catch { return {}; }
}
