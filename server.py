from flask import Flask, request, jsonify
from chatbot.chat_rag import ask  
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

@app.route('/ask', methods=['POST'])
def handle_ask(): 
    query = request.form.get('query')

    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    try:
        response = ask(query) 
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": f"Failed to process query: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
