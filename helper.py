#### file that deals with handling and processing of words, and sorting them according to heuristic
import wordle_config
from nltk.util import ngrams
from collections import Counter
from math import log, inf
import random
from collections import Counter
from commonWords import common_words
from uncommonWords import uncommon_words

'''function that collects all the words'''
def collect_words():
    # make sure valid word length
    wordlen_range = [5,6,7,8]
    wordlen_default = 5
    finalLength = wordle_config.WORDLENGTH if wordle_config.WORDLENGTH in wordlen_range else wordlen_default
    if wordle_config.COMMON_ONLY:
        return list(filter(lambda cw: len(cw) == finalLength, common_words))
    else:
        # read in words_alpha.txt
        words_alpha = set()
        with open("words_alpha.txt", "r") as wafile:
            for word in wafile:
                words_alpha.add(word.replace("\n","").upper())
        allWords = list(set(common_words)|set(uncommon_words)|words_alpha)
        return list(filter(lambda w: len(w) == finalLength, allWords))

'''NGram Heuristic functions (heuristic 0)'''
class ngramfunc:
    def __init__(self):
        pass
    '''Function that collects counts'''
    @staticmethod
    def collect_counts(wordlist: list):
        words = []
        bigram_counts = Counter()
        unigram_counts = Counter()
        for word in wordlist:
            wu = word.upper()
            ng = list(ngrams(sequence=wu, n=2))
            bigram_counts.update(ng)
            unigram_counts.update(wu)
            words.append(wu)
        return bigram_counts, unigram_counts, words
    '''Function that calculates probability of a sequence'''
    @staticmethod
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
    def get_words_and_seed():
        bigramCount, unigramCount, wordList = ngramfunc.collect_counts(collect_words())
        sw = sorted(wordList, key=lambda rw: ngramfunc.calculate_sequence_log_probability(seq=rw, 
                                                                                bigram_counts=bigramCount, 
                                                                                unigram_counts=unigramCount))
        # pick a seed from the n most common words of that length (now a config variable)
        try:
            scope = int(wordle_config.SCOPE)
            scope = max((1, scope))
        except:
            scope = 20
        seed = random.choice(sw[-scope:])
        sw.remove(seed)
        return sw+[seed]

'''Positional Letter Counts heuristic functions (heuristic 1)'''
class positional:
    def __init__(self):
        pass
    '''Function that reads dictionary and records letter counts at positions'''
    @staticmethod
    def collect_pcounts(wordlist: list):
        pos_counts = []
        words = []
        for _ in range(10):
            ctr = Counter()
            pos_counts.append(ctr)
        for word in wordlist:
            word = word.replace("\n","").upper()
            for i in range(len(word)):
                pos_counts[i][word[i]] += 1
            words.append(word)
        return words, pos_counts

    '''Function that scores a word according to this heuristic'''
    @staticmethod
    def sequence_score(word: str, pc: list):
        score = 0
        for j in range(len(word)):
            score += pc[j][word[j]]
        return score

    '''Main function. Run this'''
    def get_words_and_seed():
        wl, pc = positional.collect_pcounts(collect_words())
        swl = sorted(wl, key = lambda wd: positional.sequence_score(word=wd, pc=pc))
        # choose a random seed from n highest scored words (now a config variable)
        try:
            scope = int(wordle_config.SCOPE)
            scope = max((1, scope))
        except:
            scope = 20
        seed = random.choice(swl[-scope:])
        swl.remove(seed)
        return swl+[seed]