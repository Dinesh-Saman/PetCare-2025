import traceback
from chat_rag import ask

try:
    response = ask("How to treat a sick dog?")
    print("Response:")
    print(response)
except Exception:
    print("Exception occurred in test script:")
    traceback.print_exc()
