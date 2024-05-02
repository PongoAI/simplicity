'use client'

import Image from "next/image";
import React from 'react';
import SearchBar from "./components/searchBar";
import Sources from "./components/sources";
import {NumberedListLeft} from 'iconoir-react'
import { Heptagon } from "./components/heptagon";
import { RedWarningTrianlge } from './components/warningTriangles'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function addCitationLinks(markdownString: string, sources: any) {


  // Regular expression to match citation pattern [i] where i is a number 1-8
  const citationRegex = /\[(\d)\]/g;

  // Replace each match with a hyperlinked citation

  const modifiedMarkdown = markdownString.replace(citationRegex, (match, index) => {
    const sourceIndex = parseInt(index) - 1;

    if (sourceIndex >= 0 && sourceIndex < sources.length) {
      const source = sources[sourceIndex];
      if (source && source.url) {
        return `[${match}](${source.url})`;
      }
    }
    return match;
  });

  return modifiedMarkdown;
}

export default function Home() {
  const baseResults = [{placeholder: true}, {placeholder: true}, {placeholder: true}, {placeholder: true}]
  const [pageState, setPageState] = React.useState('landing')
  const [pageTitle, setPageTitle] = React.useState('')
  const [sources, setSources] = React.useState(baseResults)
  const [socket, setSocket] = React.useState<WebSocket | null>(null)

  const [answer, setAnswer] = React.useState('')

  const [socketReady, setSocketReady] = React.useState(false)
  const [SocketHasClosed, setSocketHasClosed] = React.useState(false)

const checkSocketsReady = (inputSocket: any) => {
        if (inputSocket.readyState === WebSocket.OPEN) {
          setSocketReady(true);
        }
    };

  React.useEffect(() => {
      const newSocket = new WebSocket(`ws://localhost:8000/sockets/test`);

      newSocket.onopen = () => checkSocketsReady(newSocket);


      newSocket.onmessage = (event) => {
          if (event.data.startsWith("JSON_STRING:")) {
              const data = JSON.parse(event.data.substring("JSON_STRING:".length));
              setSources(data);
          } else {
              setAnswer((prev) => prev + event.data);
          }
      };
      const handleClose = () => {
        setSocketHasClosed(true)
      };
  
      newSocket.onclose = handleClose;
      
      setSocket(newSocket);

  }, []);

  const handleSearch = async (e: any, queryString: string) => {
    e.preventDefault()
    if (!socket || socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
      console.log('que')
      setSocketHasClosed(true)
      return
    }

    if(queryString == '') {
      return
    } else {
      setSources(baseResults)
      setPageTitle(queryString)
      setPageState('results')
      setAnswer('')

      if(socket) {
        socket.send(JSON.stringify({'query': queryString}))
      } else {
        alert('connection to server lost, please refresh page')
      }
    }
    

  }

  return (
    <div className="min-h-screen h-fit w-screen bg-zinc-900 flex flex-col px-5">
      <div className="flex mt-3"><div className="static  mt-auto mb-3 text-sm "><a href='https://github.com/PongoAI/simplicity' className="underline">View source code</a></div>

<div className="static ml-auto ">An experiment by <a href='https://joinpongo.com?utm_source=simplicity' className="underline">Pongo</a></div></div>
        

      {pageState == 'landing' ? 
      <div className="flex flex-col h-screen">

        <div className="mx-auto text-3xl mt-32 md:mt-20 w-fit">Need answers? Ask a question</div>

        <div className="w-full mt-10">
          <SearchBar isPill={false} handleSearch={handleSearch} shouldWarn={SocketHasClosed} shouldBlur={SocketHasClosed || !socketReady}/>
        </div> 
      </div>
      
      :

      <div className="max-w-[50rem] w-full mx-auto">

        <div className="mx-auto text-3xl mt-10">{pageTitle}</div>

        <div className="flex mt-8 text-lg">
          <div className="my-auto mr-2"><NumberedListLeft width={'1.3rem'} height={'1.3rem'}/></div>
          Sources
        </div>


        <div className="mt-2">
          <Sources sources={sources}/>
        </div>

        <div className="flex mt-8 text-lg">
          <div className="my-auto mr-2 w-[1.4rem] h-[1.4rem]"><Heptagon/></div>
          Answer
        </div>

        <div className="mt-1 whitespace-pre-wrap mb-40"><ReactMarkdown
                            remarkPlugins={[remarkGfm]}

                            components={{
                                // Use Tailwind CSS classes to style the HTML elements
                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4 text-zinc-50" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-xl font-medium my-3 text-zinc-50" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl my-2 text-zinc-50" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-lg font-medium my-1 text-zinc-50" {...props} />,
                                h5: ({ node, ...props }) => <h5 className="text-sm font-medium text-zinc-50" {...props} />,
                                h6: ({ node, ...props }) => <h6 className="text-xs font-medium  text-zinc-50" {...props} />,
                                p: ({ node, ...props }) => <p className="text-base my-2 text-white font-light" {...props} />,

                                a: ({ node, ...props }) =>
                                    <a target='_blank' className="text-zinc-50 font-mono hover:text-zinc-100 underline" {...props} />,


                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 text-white font-light" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 text-white font-light" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1 py-0.5 font-light" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 italic my-4 bg-zinc-800 text-zinc-100" {...props} />,
                                code: ({ node, ...props }) => <code className="py-1 rounded text-sm font-mono bg-zinc-800 text-zinc-100" {...props} />,
                                pre: ({ node, ...props }) => <pre className="py-2 px-4 rounded text-sm bg-zinc-800 text-zinc-100 overflow-x-auto" {...props} />,
                            }} >
          
          {addCitationLinks(answer, sources)}
          
          </ReactMarkdown></div>


          <SearchBar isPill={true} handleSearch={handleSearch} shouldWarn={SocketHasClosed} shouldBlur={SocketHasClosed || !socketReady}/>

        </div>
        
        }



    </div>
  );
}
