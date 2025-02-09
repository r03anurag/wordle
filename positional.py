######### file responsible for reading the dictionary, and keeping counts of common letters
#         for each position, ordered from least common to most common.
########## Word list credits: https://github.com/dwyl/english-words/tree/master
########## Idea Credits: https://medium.com/codex/building-a-wordle-solver-with-python-77e3c2388d63
from collections import Counter
import random

'''Function that reads dictionary and records letter counts at positions'''
def collect_all_words_and_pcounts(consideration_length: int):
    datapath = "data/words_alpha.txt"
    pos_counts = []
    words = []
    for _ in range(10):
        ctr = Counter()
        pos_counts.append(ctr)
    with open(datapath, 'r') as wordfile:
        for word in wordfile:
            word = word.replace("\n","").upper()
            lc = len(word) == consideration_length 
            if lc:
                for i in range(len(word)):
                    pos_counts[i][word[i]] += 1
                words.append(word)
    return words, pos_counts

'''Function that scores a word according to this heuristic'''
def sequence_score(word: str, pc: list):
    score = 0
    for j in range(len(word)):
        score += pc[j][word[j]]
    return score

'''Main function. Run this'''
def get_words_and_seed(desired_length: int = 5):
    wl, pc = collect_all_words_and_pcounts(consideration_length=desired_length)
    swl = sorted(wl, key = lambda wd: sequence_score(word=wd, pc=pc))
    # choose a random seed from 20 highest scored words
    seed = random.choice(swl[-20:])
    swl.remove(seed)
    return swl+[seed]