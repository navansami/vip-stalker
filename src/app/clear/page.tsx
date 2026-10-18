import type {Metadata} from 'next';
import {privateRobots} from '@/lib/indexing';
import ClearCards from '@/components/clear-cards';
export const metadata:Metadata={title:'Clear cards · VIP Stalker',robots:privateRobots};
export default function ClearPage(){return <ClearCards/>;}
