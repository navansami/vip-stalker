import {database} from '@/lib/db';
import {createClearHandler} from '@/lib/clear-cards';
export const runtime='nodejs';
export const POST=createClearHandler({
 getCode:()=>process.env.HOTEL_CLEAR_CODE,
 countCards:async()=>(await database()).collection('cards').countDocuments({}),
 deleteCards:async()=>(await (await database()).collection('cards').deleteMany({})).deletedCount,
});
