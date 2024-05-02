'use client'
import React from 'react';
import { ArrowRight} from 'iconoir-react';
import { RedWarningTrianlge } from './warningTriangles';


export default function SearchBar({isPill=false, handleSearch, shouldWarn=false, shouldBlur=false}: {isPill: boolean, handleSearch: any, shouldWarn: boolean, shouldBlur: boolean}) {

  const [queryString, setQueryString] = React.useState('')



  return (

      <div  className={'flex flex-col mx-auto w-fit max-w-[50rem] '+ (isPill ? ' w-[96vw] rounded-full fixed bottom-10 left-1/2 transform -translate-x-1/2' : 'rounded-md w-full')}>
        {shouldWarn && <div className='text-red-500 flex items-center w-full mb-1 max-w-[96vw] w-[30rem]'>
                    <div className='w-4 h-4 mr-1 mt-0.5'>
                    <RedWarningTrianlge />
                    </div>
                    <div className='flex sm:text-md text-sm items-center text-right'>
                    Lost connection to the server, please reload the page to search
                    </div>
        </div>}
      
      <form className={'border-2 border-zinc-500 h-12   bg-zinc-700 mx-auto flex flex-row py-1 ' + (isPill ? ' w-[96vw] rounded-full fixed bottom-10 left-1/2 transform -translate-x-1/2' : 'rounded-md w-full')}
      onSubmit={(e)=> {shouldBlur ? () => {} : handleSearch(e, queryString)}}>

        <input className={'bg-zinc-700 h-full w-full focus:outline-none ml-3 ' + (isPill ? 'rounded-full' : 'rounded-md')} 
        placeholder='Ask anything...'
        value={queryString}
        onChange={(e) => {setQueryString(e.target.value)}}>
        </input>
        <button className={'bg-indigo-500 h-full w-9 rounded-full p-2 mr-1 ' + (shouldBlur || queryString=='' ? 'opacity-50' : '')}><ArrowRight width={'100%'} height={'100%'} color='white' strokeWidth={2.5}/></button>


        

      </form>
      </div>


  );
}
