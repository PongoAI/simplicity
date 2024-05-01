'use client'
import React from 'react';
import { ArrowRight} from 'iconoir-react';


export default function SearchBar({isPill=false, handleSearch}: {isPill: boolean, handleSearch: any}) {

  const [queryString, setQueryString] = React.useState('')



  return (


      <form className={'border-2 border-zinc-500 h-12 max-w-[50rem]  bg-zinc-700 mx-auto flex flex-row py-1 ' + (isPill ? ' w-[96vw] rounded-full fixed bottom-10 left-1/2 transform -translate-x-1/2' : 'rounded-md w-full')} 
      onSubmit={(e)=> {handleSearch(e, queryString)}}>

        <input className={'bg-zinc-700 h-full w-full focus:outline-none ml-3 ' + (isPill ? 'rounded-full' : 'rounded-md')} 
        placeholder='Ask anything...'
        value={queryString}
        onChange={(e) => {setQueryString(e.target.value)}}>
        </input>
        <button className='bg-indigo-500 h-full w-9 rounded-full p-2 mr-1'><ArrowRight width={'100%'} height={'100%'} color='white' strokeWidth={2.5}/></button>


        

      </form>



  );
}
