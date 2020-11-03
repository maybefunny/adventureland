#!./.venv/bin/python
from flask import Flask, request, render_template
from flask_cors import CORS
import json
app = Flask(__name__)

CORS(app)
data = None

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == "GET":
        with open("test.json", "r+") as file:
            data = json.load(file)
            return render_template("index.html", data=data)
    elif request.method == "POST":
        with open("test.json", "w+") as file:
            json.dump(request.json, file);
        return "yo"
    return None

if __name__ == '__main__':    
    app.run(debug=True, port=6969, host="0.0.0.0")
