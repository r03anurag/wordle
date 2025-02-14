# Flask Python app for backend
from flask import Flask, jsonify, request
from flask_cors import CORS
import wordle
import wordle_config

# app and data
flask_app = Flask(__name__)
CORS(flask_app)
game = None
if wordle_config.COMPUTER_MODE:
    game = wordle.ComputerPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in [5,6,7,8,9,10] else 5,
                                       heur=wordle_config.HEURISTIC if wordle_config.HEURISTIC in [0,1] else 0)
else:
    game = wordle.HumanPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in [5,6,7,8,9,10] else 5)

'''Route to get the desired user config'''
@flask_app.route("/api/config", methods=["GET"])
def config():
    return jsonify({"wordlength": game.word_length, "computer": bool(wordle_config.COMPUTER_MODE), 
                    "heuristic": game.heuristic})


if __name__ == "__main__":
    flask_app.run(debug=True)