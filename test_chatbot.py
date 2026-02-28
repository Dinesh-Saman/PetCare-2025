import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))
from chatbot.chat_rag import ask

test_queries = [
    "What vaccinations do dogs need in Sri Lanka?",
    "My dog is bleeding heavily, what should I do?",
    "Is jackfruit safe for dogs?",
    "What is the role of the Veterinary Epidemiology Unit in Sri Lanka?",
    "What is the capital of France?"
]

print("🚀 Starting Chatbot Accuracy Tests...\n")

for query in test_queries:
    print(f"User: {query}")
    response = ask(query)
    print(f"Dr. Sara: {response}")
    print("-" * 50)

print("\n✅ Verification complete.")
