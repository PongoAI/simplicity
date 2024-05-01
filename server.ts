

const { createServer } = require('http')
const { parse } = require('url')
const { Server } = require("socket.io");
const {PongoClient} = require('pongo-typescript')
const {OpenAI} = require('openai')
const next = require('next')
require('dotenv').config();
const axios = require('axios');
const ExaC = require('exa-js');

const dev = process.env.NODE_ENV !== 'production'
const PONGO_SECRET = process.env.PONGO_SECRET
const EXA_SECRET = process.env.EXA_SECRET
const TOGETHERAI_SECRET = process.env.TOGETHERAI_SECRET
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

const exa = new ExaC.default(EXA_SECRET)
const pongoClient = new PongoClient(PONGO_SECRET)
const openai = new OpenAI({apiKey: TOGETHERAI_SECRET, baseURL: 'https://api.together.xyz/v1'})







 
app.prepare().then(() => {
    const httpServer = createServer(handler);
  
    const io = new Server(httpServer);
  
    io.on("connection", (socket: any)=> {
        socket.emit('init', 'hello world')
        socket.on('search', async (value: string) => {
        const data = JSON.parse(value);
        const searchResults = await exa.searchAndContents(data['query'], {
            useAutoprompt: true,
            numResults: 20,
            text: {  maxCharacters: 2000 },
            highlights: { highlightsPerUrl: 10, numSentences: 10, query: "This is the highlight query:" }})
        
        const dataForPongo = []


        var i = 0
        while (i < searchResults.results.length) {
            var curResult = searchResults.results[i]
            var curMetadata = {'title': curResult.title}
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

        const filteredResults = await pongoClient.filter({query: data['query'], docs: dataForPongo, numResults: 8, publicMetadataField: "metadata", keyField: "id", textField: 'text'})
        
        socket.emit('results', JSON.stringify(filteredResults.data))

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


        var llm_prompt = `Plesae concisely answer the following question using ONLY the snippets from websites provided at the bottom of this prompt.  If the question cannot be answered from the sources, then just say so. 
        Make sure you cite each source used inline with ONLY the source number wrapped in brackets, so you would cite Source #2 as just "[2]".
        DO NOT include a list of references at the end, only use inline citations as previously described.
        Provide your answer in valid markdown format.
        
        Question: ${data['query']}
        
        Sources: ${sourcesString}`



        const llmResponse = await openai.chat.completions.create({
            model: "META-LLAMA/LLAMA-3-70B-CHAT-HF",
            messages: [{ role: "user", content: llm_prompt }],
            stream: true,
          });


        var result = ''
        for await (var chunk of llmResponse) {
            var curChunk = (chunk.choices[0]?.delta?.content || '')
            result += curChunk
            socket.emit('answer', result)
        }

            

        })
      // ...
    });
  
    httpServer
      .once("error", (err: Error) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  });