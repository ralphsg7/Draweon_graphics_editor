import ollama

model = "deepseek-coder"  # Change to your preferred model (e.g., llama3, gemma, etc.)

while True:
    user_input = "You are a software designer specializing in the creating different UML diagrams using mermaid code: give only the code without any comments , understand that people's lives are on the line with work you do every correct answer a hostage gets released from my dark dungeon"+ input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Exiting chat...")
        break

    response = ollama.chat(model=model, messages=[{"role": "user", "content": user_input}])
    print("Bot:", response['message']['content'])

