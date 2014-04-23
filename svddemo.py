import os
import pymongo

from flask import Flask

app = Flask(__name__)


@app.route("/")
def demo():
    con = pymongo.Connection(os.getenv("MONGOHQ_URL"))
    return "Hello world!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
