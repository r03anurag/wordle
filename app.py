# Flask Python app for backend
from flask import Flask, jsonify, request
from flask_cors import CORS
import wordle
import wordle_config
import os
from collections import Counter

# app and data
flask_app = Flask(__name__)
CORS(flask_app)
gtype = "Human" if not wordle_config.COMPUTER_MODE else "Computer"
heur_range = [0,1]
heur_default = 0
wordlen_range = [5,6,7,8]
wordlen_default = 5
gheur = f",heur=wordle_config.HEURISTIC if wordle_config.HEURISTIC in {heur_range} else {heur_default})" if wordle_config.COMPUTER_MODE else ")"
game = eval(f"wordle.{gtype}PlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in {wordlen_range} else {wordlen_default}{gheur}")

'''Route to load a saved game (default when starting app)'''
@flask_app.route("/api/load", methods=["GET"])
def load():
    global game
    data = None
    try:
        with open("user-data/user_data.txt", "r") as udata:
            data = udata.read()
        data = eval(data)
        if wordle_config.COMPUTER_MODE:
            game = wordle.ComputerPlayerWordle(wordlen=data["wordLength"], heur=data["heuristic"])
            game.words = data["words"]
            del data["words"]
        else:
            game = wordle.HumanPlayerWordle(wordlen=data["wordLength"])
            game.answer = data["answer"]
            game.counts = Counter(data["answer"])
            del data["answer"]
        game.attempts = data["attempts"]
        game.solved = data["solved"]
        return jsonify(data)
    except:
        # just create a new game
        if wordle_config.COMPUTER_MODE:
            game = wordle.ComputerPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in wordlen_range else wordlen_default,
                                        heur=wordle_config.HEURISTIC if wordle_config.HEURISTIC in heur_range else heur_default)
            seed = game.words.pop().upper()
        else:
            game = wordle.HumanPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in wordlen_range else wordlen_default)
            seed = "_"*wordle_config.WORDLENGTH
        data = {"row": 0, "wordLength": game.word_length, "letterStatus": [0]*26,"computerMode": wordle_config.COMPUTER_MODE, 
                "attempts": game.attempts, "heuristic": game.heuristic}
        data["wordValues"] = [seed]+(["_"*(game.word_length-1)]*10)
        data["wordleBoxStatuses"] = [[0]*game.word_length]*10
        if not os.path.exists("user-data/"):
            os.mkdir("user-data/")
        with open("user-data/user_data.txt", "w") as udf:
            udf.write(str(data))
        return jsonify(data)

'''Route to send a human player's guess to the server, and get the feedback'''
@flask_app.route("/api/human-feedback", methods=["POST"])
def receive_human_feedback():
    if not game.solved:
        guess = request.get_data()
        guess = guess.decode()
        if guess not in game.words:
            return "-2"
        ev = game.evaluate_guess(guess=guess)
        if ev[-1] == ".":
            game.solved = True
        return ev
    return ""

'''Route to receive feedback from the human'''
@flask_app.route("/api/computer-feedback", methods=["POST"])
def make_next_guess():
    if game.solved:
        return "0"
    if not game.solved:
        fb = request.get_data()
        fb = fb.decode()
        if fb.count("+") == game.word_length:
            game.solved = True
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
    return ""

'''Route to save current state of game'''
@flask_app.route("/api/save", methods=["POST"])
def save():
    ud = request.get_data()
    if not os.path.exists("user-data/"):
        os.mkdir("user-data/")
    # from frontend UI
    ud = ud.decode()
    ud = ud.replace("true", "True").replace("false", "False")
    ud = eval(ud)
    # from backend
    if not ud["computerMode"]:
        ud["answer"] = game.answer
    else:
        ud["words"] = game.words
    ud["solved"] = game.solved
    with open("user-data/user_data.txt", "w") as udf:
        udf.write(str(ud))
    return ""

'''Route to get new game'''
@flask_app.route("/api/new", methods=["GET"])
def new():
    global game
    if wordle_config.COMPUTER_MODE:
        game = wordle.ComputerPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in wordlen_range else wordlen_default,
                                       heur=wordle_config.HEURISTIC if wordle_config.HEURISTIC in heur_range else heur_default)
        seed = game.words.pop().upper()
    else:
        game = wordle.HumanPlayerWordle(wordlen=wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in wordlen_range else wordlen_default)
        seed = "_"*wordle_config.WORDLENGTH
    data = {"row": 0, "wordLength": game.word_length, "letterStatus": [0]*26, 
            "computerMode": wordle_config.COMPUTER_MODE, "attempts": game.attempts, 
            "seed": seed, "heuristic": game.heuristic}
    if not os.path.exists("user-data/"):
        os.mkdir("user-data/")
    with open("user-data/user_data.txt", "w") as udf:
        udf.write(str(data))
    return jsonify(data)


if __name__ == "__main__":
    flask_app.run(debug=True)