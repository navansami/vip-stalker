import { z } from 'zod';
const text = z.string().trim().max(2000);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, 'Enter a valid date');
export const cardSchema = z.object({
  room: text.min(1).max(100), main: text.min(1).max(150), title: text.max(150),
  start: date, end: date, gp: text, mp: text, hsk: text, dp: text, remarks: text,
  actor: text.min(2, 'Please enter your full name').max(100),
  photos: z.array(z.object({src: z.string().max(500).refine(v => !v || /^https:\/\/res\.cloudinary\.com\//.test(v), 'Use a Cloudinary image'), name: text.max(100), reln: text.max(100)})).max(10),
}).refine(v => v.end >= v.start, {message: 'Departure must follow arrival', path:['end']});
export type CardInput = z.infer<typeof cardSchema>;
export type GuestCard = CardInput & {id: string; createdBy: string; updatedBy: string; createdAt: string; updatedAt: string; revision: number};
export const emptyCard: CardInput = {room:'',main:'',title:'',start:'',end:'',gp:'',mp:'',hsk:'',dp:'',remarks:'',actor:'',photos:[{src:'',name:'',reln:''}]};
