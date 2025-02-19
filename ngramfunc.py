########## file responsible for reading the english words dictionary, and training an N-Gram (bigram)
#          character-level model on it with probabilities
from nltk.util import ngrams
from collections import Counter
from math import log, inf
import random
import wordle_config

'''Function that reads dictionary and collects counts'''
def collect_all_words_and_counts(consideration_length: int):
    datapath = wordle_config.DATA
    words = []
    bigram_counts = Counter()
    unigram_counts = Counter()
    with open(datapath, 'r') as wordfile:
        for word in wordfile:
            word = word.replace("\n","")
            lc = len(word) == consideration_length
            if lc:
                wu = word.upper()
                ng = list(ngrams(sequence=wu, n=2))
                bigram_counts.update(ng)
                unigram_counts.update(wu)
                words.append(wu)
    return bigram_counts, unigram_counts, words

'''Function that calculates probability of a sequence'''
def calculate_sequence_log_probability(seq: str, bigram_counts: dict, unigram_counts: dict):
    '''Short Function that calculates Add-1 MLE (log-prob):
        P_Add-1(wi|w(i-1)) = ln([c(w(i-1), wi) + 1]/[c(w(i-1)) + 26])
    '''
    bigram_log_prob = lambda c1, c2: log((bigram_counts[(c1,c2)]+1)/(unigram_counts[c1]+26))
    if len(seq) >= 2:
        ng2 = list(ngrams(sequence=seq, n=2))
        lprob = 0
        for (c1,c2) in ng2:
            lprob += bigram_log_prob(c1,c2)
        return lprob
    return inf

'''Main function. Run this.'''
def get_words_and_seed(desired_length: int = 5):
    bigramCount, unigramCount, wordList = collect_all_words_and_counts(consideration_length=desired_length)
    sw = sorted(wordList, key=lambda rw: calculate_sequence_log_probability(seq=rw, 
                                                                               bigram_counts=bigramCount, 
                                                                               unigram_counts=unigramCount))
    # pick a seed from the 20 most common words of that length
    seed = random.choice(sw[-20:])
    sw.remove(seed)
    return sw+[seed]
