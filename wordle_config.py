############# SHORT FILE WITH CONFIGURATION PARAMETERS. CHANGE TO YOUR LIKING
WORDLENGTH=6    # must be between 5-8
COMPUTER_MODE=True # must be true/false
HEURISTIC=1     # must be either 0 (NGram probability), 1 (positional letter count)
DATA='data/words_alpha.txt' # valid, existent filepath
SCOPE=20 # when picking a seed, how many top choices of words should be considered? Must be at least 1. 

########## Word list credits: 
# https://github.com/dwyl/english-words/tree/master (words_alpha.txt)
# https://gist.github.com/shmookey/b28e342e1b1756c4700f42f17102c2ff (WORDS)