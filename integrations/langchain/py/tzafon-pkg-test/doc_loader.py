from langchain_tzafon import TzafonLoader

loader = TzafonLoader(urls=["https://tzafon.ai"])
documents = loader.load()

for doc in documents:
    print(f"Content from {doc.metadata['url']}:")
    print(doc.page_content[:200])
