import axios from 'axios'
import Exa from 'exa-js';
import { NextRequest } from 'next/server';
import { PongoClient } from 'pongo-typescript';
import { NextResponse } from 'next/server';
const EXA_SECRET = process.env.EXA_SECRET
const PONGO_SECRET = process.env.PONGO_SECRET 

const exa = new Exa(EXA_SECRET)
const pongoClient = new PongoClient(PONGO_SECRET || '')
 
export async function POST(req: NextRequest) {

  const {query} = await req.json()
  var llmPrompt = ''

  const searchResults = await exa.searchAndContents(query, {
    useAutoprompt: true,
    numResults: 20,
    text: {  maxCharacters: 2000 },
    highlights: { highlightsPerUrl: 10, numSentences: 10, query: "This is the highlight query:" }})

    const dataForPongo = []

    // console.log(searchResults)
    var i = 0
    while (i < searchResults.results.length) {
        var curResult = searchResults.results[i]

        if (!curResult) break
        var curMetadata = curResult.title ? {'title': curResult.title} : {'title': 'no title'}
        var k = 0

        dataForPongo.push({'text': curResult.text, 'metadata': curMetadata, id: curResult.id, url: curResult.url})
        while (k < curResult.highlights.length) {
            //big opportunity to combine highlights from the same site

            var curHighlight = curResult.highlights[k]
            dataForPongo.push({'text': curHighlight, 'metadata': curMetadata, id: curResult.id+'-'+k, url: curResult.url})
            k++
        }
        i++
    }

    const filteredResults = await pongoClient.filter({query: query, docs: dataForPongo, numResults: 8, publicMetadataField: "metadata", keyField: "id", textField: 'text'})



    var sourcesString = ''
    i = 0
    while (i < 8) {
        var curSource = filteredResults.data[i] 

        if(sourcesString.length > 10000) {
            break
        }

        sourcesString += `Source #${i+1} (from "${curSource['metadata']['title']}"): ${curSource['text']}\n\n`

        i++
    }


    var llmPrompt = `Plesae concisely answer the following question using ONLY the snippets from websites provided at the bottom of this prompt.  If the question cannot be answered from the sources, then just say so. 
    Make sure you cite each source used inline with ONLY the source number wrapped in brackets, so you would cite Source #2 as just "[2]".
    DO NOT include a list of references at the end, only use inline citations as previously described.
    Provide your answer in valid markdown format.

    Question: ${query}

    Sources: ${sourcesString}`
 
  


  // Respond with the stream
  return NextResponse.json({llmPrompt: llmPrompt, sources: filteredResults.data});
}
