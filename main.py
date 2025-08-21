from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import FileChatMessageHistory
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
import json

from sysprompt import prompt  # make sure sysprompt.py is in the same directory

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI()

# Enable cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client["chatbot_db"]
history_collection = db["chat_history"]

# LLM and Embeddings
model = ChatOpenAI(model='gpt-4', temperature=0.0)
parser = StrOutputParser()
embeddings = OpenAIEmbeddings(model='text-embedding-3-small')

# Vector Stores
vector_store1 = FAISS.load_local("vectorstore_punjab", embeddings, allow_dangerous_deserialization=True)
vector_store2 = FAISS.load_local("vectorstore_sindh", embeddings, allow_dangerous_deserialization=True)
vector_store3 = FAISS.load_local("vectorstore_kpk", embeddings, allow_dangerous_deserialization=True)
vector_store4 = FAISS.load_local("vectorstore_balochistan", embeddings, allow_dangerous_deserialization=True)

retriever_p = vector_store1.as_retriever(search_type="similarity", search_kwargs={'k': 8})
retriever_s = vector_store2.as_retriever(search_type="similarity", search_kwargs={'k': 8})
retriever_k = vector_store3.as_retriever(search_type="similarity", search_kwargs={'k': 8})
retriever_b = vector_store4.as_retriever(search_type="similarity", search_kwargs={'k': 8})

# Helper Functions
def format_chat_history(messages):
    formatted = []
    for msg in messages:
        role = msg.type.capitalize()
        content = msg.content
        formatted.append(f"{role}: {content}")
    return "\n".join(formatted)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def dual_retriever_merge(question):
    docs = retriever_p.invoke(question) + retriever_s.invoke(question) + retriever_k.invoke(question) + retriever_b.invoke(question)
    return format_docs(docs)

# Pydantic Model
class ChatRequest(BaseModel):
    question: str

# Route
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # Use a shared memory file for all users (or in-memory if preferred)
    user_history_file = f"chat_history_shared.json"
    chat_history = FileChatMessageHistory(user_history_file)
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        chat_memory=chat_history,
        return_messages=True
    )

    # Chain Setup
    parallel_chain = RunnableParallel({
        'context': RunnableLambda(dual_retriever_merge),
        'question': RunnablePassthrough()
    })

    inject_history = RunnableLambda(lambda inputs: {
        **inputs,
        "chat_history": format_chat_history(memory.chat_memory.messages)
    })

    main_chain = parallel_chain | inject_history | prompt | model | parser

    # Run chain
    question = request.question
    raw_output = main_chain.invoke(question)

    try:
        result_obj = json.loads(raw_output) if isinstance(raw_output, str) else raw_output
    except json.JSONDecodeError:
        result_obj = {"answer": raw_output, "references": []}

    # Update memory
    memory.chat_memory.add_user_message(question)
    memory.chat_memory.add_ai_message(result_obj['answer'])

    # Store in MongoDB (optional)
    history_collection.insert_many([
        {"role": "user", "message": question, "timestamp": datetime.now()},
        {"role": "assistant", "message": result_obj, "timestamp": datetime.now()}
    ])

    return result_obj
