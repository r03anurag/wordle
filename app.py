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
    game = wordle.ComputerPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in [5,6,7,8] else 5,
                                       heur=wordle_config.HEURISTIC if wordle_config.HEURISTIC in [0,1] else 0)
else:
    game = wordle.HumanPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in [5,6,7,8] else 5)

print(game.attempts)
'''Route to get the desired user config'''
@flask_app.route("/api/config", methods=["GET"])
def config():
    if wordle_config.COMPUTER_MODE:
        last = game.words.pop()
        return jsonify({"wordlength": game.word_length, "computer": bool(wordle_config.COMPUTER_MODE), 
                        "heuristic": game.heuristic, "attempts": game.attempts, "seed": last.upper()})
    else:
        return jsonify({"wordlength": game.word_length, "computer": bool(wordle_config.COMPUTER_MODE), 
                        "heuristic": game.heuristic, "attempts": game.attempts, "seed": "_"*wordle_config.WORDLENGTH})

'''Route to send a human player's guess to the server, and get the feedback'''
@flask_app.route("/api/human-feedback", methods=["POST"])
def receive_human_feedback():
    guess = request.get_data()
    guess = guess.decode()
    return game.evaluate_guess(guess=guess)

'''Route to receive feedback from the human'''
@flask_app.route("/api/computer-feedback", methods=["POST"])
def make_next_guess():
    fb = request.get_data()
    fb = fb.decode()
    if fb.count("+") == game.word_length:
        return "0"
    game.process_feedback(feedback=fb)
    if len(game.words) == 0:
        #print("Based on the given feedback, there are no words that match your criteria. Please try again.")
        return "-1"
    try:
        guess = game.words.pop()
    except:
        guess = ""
    return guess


if __name__ == "__main__":
    flask_app.run(debug=True)