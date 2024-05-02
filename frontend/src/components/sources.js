'use client'
import React from 'react';



function extractDomain(url) {
    // Remove the protocol (http://, https://)
    url = url.replace(/(https?:\/\/)/, '');
    
    // Remove the path and any query parameters
    url = url.split('/')[0];
    
    // Remove the "www." prefix if present
    url = url.replace(/^www\./, '');
    
    // Remove any subdomains
    const parts = url.split('.');
    url = parts.slice(-2).join('.');
    
    // Remove the top-level domain (e.g., ".com", ".org")
    url = url.split('.')[0];
    
    return url;
  }

export default function Sources({sources}) {





  return (


      <div className='grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0'>
        {sources.map((obj, i) => {
            if(i > 3) return <></>
            else if  (obj['placeholder']){
                return <div key={i} className='w-40 h-20 bg-zinc-800 rounded text-sm p-1'>
                    
                    
                </div>
            } else {
                return <a key={i} href={obj['url']} target='_blank' rel="noreferrer"><div className='w-40 h-20 bg-zinc-800 rounded text-sm p-1 '>
                    <div className='overflow-hidden overflow-ellipsis line-clamp-2'>
                        {obj['metadata']['title']}
                    </div>
                    <div className='text-xs mt-2'>{extractDomain(obj['url'])}</div>
                    
                </div></a>
            }
            
        })}


      </div>



  );
}
