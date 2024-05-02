from fastapi import (
    APIRouter,
    WebSocket,
)

import json
from dotenv import load_dotenv
import os
import json
import pongo
from exa_py import Exa
from openai import OpenAI

socket_router = APIRouter()
load_dotenv()
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")



exa_client = Exa( os.environ.get("EXA_API_KEY"))

openai_client = OpenAI(api_key=os.environ.get("TOGETHER_API_KEY"), base_url='https://api.together.xyz/v1')
pongo_client = pongo.PongoClient(os.environ.get("PONGO_API_KEY"))




@socket_router.websocket("/sockets/test")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        query = await websocket.receive_text()

        llm_prompt = ''

        search_results = exa_client.search_and_contents(
            query, 
            use_autoprompt=True,
            num_results=20,
            text={  "include_html_tags": False,'max_characters': 2000 },
            highlights={ 'highlights_per_url': 10, 'num_sentences': 10})

        data_for_pongo = []


        i = 0
        for cur_result in search_results.results:

            if not cur_result: 
                break
            if cur_result.title:
                cur_metadata = {'title': cur_result.title}
            else:
                cur_metadata = {'title': 'no title'}
            k = 0

            data_for_pongo.append({'text': cur_result.text, 'metadata': cur_metadata, 'id': cur_result.id, 'url': cur_result.url})
            for cur_highlight in cur_result.highlights:
                #big opportunity to combine highlights from the same site

                data_for_pongo.append({'text': cur_highlight, 'metadata': cur_metadata, 'id': f'{cur_result.id}-{k}', 'url': cur_result.url})
                k+=1
            
            i+=1
        

        filtered_results = pongo_client.filter(query=query, docs=data_for_pongo, num_results=8, public_metadata_field="metadata", key_field="id", text_field='text')
        filtered_body = filtered_results.json()
        await websocket.send_text("JSON_STRING:" + json.dumps(filtered_body))

        sources_string = ''
        i = 0
        while (i < 8):
            cur_source = filtered_body[i] 

            if(len(sources_string) > 10000):
                break
            

            sources_string += f'''Source #{i+1} (from "{cur_source['metadata']['title']}"): ${cur_source['text']}\n\n'''

            i+=1



        llm_prompt = f'''Plesae concisely answer the following question using ONLY the snippets from websites provided at the bottom of this prompt.  If the question cannot be answered from the sources, then just say so. 
        Make sure you cite each source used inline with ONLY the source number wrapped in brackets, so you would cite Source #2 as just "[2]".
        DO NOT include a list of references at the end, only use inline citations as previously described.
        Provide your answer in valid markdown format.

        Question: {query}

        Sources: {sources_string}'''

        for chunk in openai_client.chat.completions.create(
            model="META-LLAMA/LLAMA-3-70B-CHAT-HF",
            messages=[{"role": "user", "content": llm_prompt}],
            stream=True,
            temperature=0.2,
        ):
            if isinstance(chunk.choices[0].delta.content, str):
                await websocket.send_text(chunk.choices[0].delta.content)
        
        



        

