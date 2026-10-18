import type {Metadata} from 'next';

export const privateRobots:Metadata['robots']={
 index:false,follow:false,nocache:true,noarchive:true,nosnippet:true,noimageindex:true,
 googleBot:{index:false,follow:false,noimageindex:true,'max-snippet':0,'max-image-preview':'none','max-video-preview':0},
};
