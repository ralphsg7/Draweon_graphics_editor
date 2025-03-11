import ollama

model = "deepseek-coder"  # Change to your preferred model (e.g., llama3, gemma, etc.)

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Exiting chat...")
        break

    response = ollama.chat(model=model, messages=[{"role": "user", "content": user_input}])
    print("Bot:", response['message']['content'])

