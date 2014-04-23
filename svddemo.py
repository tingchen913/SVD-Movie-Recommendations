import os
import numpy
import pymongo

from flask import (Flask,
                   request,
                   render_template)

app = Flask(__name__)


@app.route("/")
def demo():
    con = pymongo.Connection(os.getenv("MONGOHQ_URL"))
    return render_template("select_favorites.html", ip=request.remote_addr)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
