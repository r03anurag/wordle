####### file that implements necessary function for wordle gameplay
from math import ceil
from collections import Counter
import string
import ngramfunc
import positional
import random

'''Class that represents a human Wordle player's game'''
class HumanPlayerWordle:
    # constructor
    # self.word_length -> length of word
    # self.heuristic -> irrelevant for this game; simply for polymorphism purpose. -1.
    # self.answer -> the answer for this round (str)
    # self.progress -> attempts (list of strings) made so far, and information that
    #                  indicates which letters don't exist (~), are misplaced (*), and are correctly placed (+).
    #                  Example: A+U~D~I*O* =>
    #                       - A is correctly placed
    #                       - I, O are misplaced
    #                       - U, D don't exist in the word
    # self.attempts -> how many tries are left. initial num. of attempts = ceil(word_length*1.2)
    # self.counts -> counts of each letter in the answer.
    # self.used -> which letters have been used? Dict mapping each letter to a boolean.
    def __init__(self, wordlen: int):  
        wordlist = []
        with open("data/words_alpha.txt", "r") as wordsfile:
            for word in wordsfile:
                word = word.replace("\n","").upper()
                if len(word) == wordlen:
                    wordlist.append(word)
        self.word_length = wordlen
        self.heuristic = -1
        self.answer = random.choice(wordlist)
        del wordlist
        self.progress = []
        self.attempts = ceil(len(self.answer)*1.2)
        self.counts = Counter(self.answer)
        self.used = dict()
        for ul in string.ascii_uppercase:
            self.used[ul] = False

    # helper function to calculate margin of error for *
    def calculate_margin_of_error(self, guess: str):
        corrects = Counter()
        for h in range(len(guess)):
            corrects[self.answer[h]] += int(self.answer[h] == guess[h])
        return self.counts - corrects
    
    # function that evaluates a guess made
    def evaluate_guess(self, guess: str):
        if self.attempts > 0:
            if guess == self.answer:
                return self.answer
            info = ["" for _ in range(len(self.answer))]
            margin = self.calculate_margin_of_error(guess=guess)
            for i in range(len(guess)):
                if guess[i] == self.answer[i]:
                    info[i] = guess[i]+"+"
                elif guess[i] in self.counts:
                    if margin[guess[i]] > 0:
                        info[i] = guess[i]+"*"
                        margin[guess[i]] = max((0,margin[guess[i]]-1))
                    else:
                        info[i] = guess[i]+"~"
                else:
                    info[i] = guess[i]+"~"
                self.used[guess[i]] = True
            self.attempts -= 1
            infoStr = "".join(info)
            self.progress.append(infoStr)
            return infoStr
        # (!) indicates that answer is returned, but because attempts are over
        return "!"+self.answer


'''Class that reprsents a computer's wordle game'''
class ComputerPlayerWordle:
    # constructor
    # self.progress -> attempts (list of strings) made so far, and information that
    #                  indicates which letters don't exist (~), are misplaced (*), and are correctly placed (+).
    #                  Example: A+U~D~I*O* =>
    #                       - A is correctly placed
    #                       - I, O are misplaced
    #                       - U, D don't exist in the word
    # self.word_length = how long is the word? At most 10.
    # self.attempts -> how many tries are left. initial num. of attempts = ceil(word_length*1.2)
    # self.heuristic -> how to score words. [0: bigram-log-probabilities (default), 1: positional-scores]
    # self.words -> list of dictionary words sorted by their log-probabilities/positional-scores in ascending order.
    def __init__(self, wordlen: int, heur: int = 0):
        self.progress = []
        self.word_length = wordlen
        self.attempts = ceil(wordlen*1.2)
        self.heuristic = heur
        self.words = ngramfunc.get_words_and_seed(desired_length=wordlen) if self.heuristic == 0 \
                        else positional.get_words_and_seed(desired_length=wordlen)
    
    # function to get user feedback for a guess. Only needed if using command-line
    def get_user_feedback_CLI(self, guess: str):
        fbs = input(f"My guess is {guess}. Evaluate it: ")
        return fbs
    
    # helper function to get letter statuses (conditions) from feedback string (Don't directly call)
    def get_conditions(self, feedback: str):
        crt = set()
        mis = set()
        crt_cond = []
        mis_cond = []
        inc_cond = []
        for k in range(0, len(feedback), 2):
            if feedback[k+1] == "+":
                crt.add(feedback[k])
            elif feedback[k+1] == "*":
                mis.add(feedback[k])
        for j in range(0, len(feedback), 2):
            if feedback[j+1] == "+":
                crt_cond.append(f"word[{j//2}] == '{feedback[j]}'")
            elif feedback[j+1] == "*":
                mis_cond.append(f"word[{j//2}] != '{feedback[j]}' and '{feedback[j]}' in word")
            else:
                if feedback[j] not in crt and feedback[j] not in mis:
                    inc_cond.append(f"'{feedback[j]}' not in word")
        return " and ".join(crt_cond+mis_cond+inc_cond)

    # function to process the generated conditions
    def process_conditions(self, feedback: str):
        cond = self.get_conditions(feedback=feedback)
        self.words = list(filter(lambda word: eval(cond), self.words))

    # main process (making guess and incorporating the feedback)
    def run(self):
        while True:
            if len(self.words) == 0:
                print("Based on the given feedback, there are no words that match your criteria. Please try again.")
                break
            guess = self.words.pop()
            fb = self.get_user_feedback_CLI(guess=guess)
            self.progress.append(fb)
            if fb.count("+") == self.word_length:
                break
            _ = self.process_conditions(fb)
