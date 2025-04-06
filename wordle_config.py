############# SHORT FILE WITH CONFIGURATION PARAMETERS. CHANGE TO YOUR LIKING
WORDLENGTH=5    # must be between 5-8
COMPUTER_MODE=False # must be true/false
HEURISTIC=0     # must be either 0 (NGram probability), 1 (positional letter count)
COMMON_ONLY=True  # use only well-known words? Default true. If false, all words are used.
SCOPE=20 # when picking a seed, how many top choices of words should be considered? Must be at least 1. Default 20.
UNIQUE=False # prioritize words that contain unique letters?
########## Word list credits: 
# https://github.com/dwyl/english-words/tree/master (words_alpha.txt)
# https://gist.github.com/shmookey/b28e342e1b1756c4700f42f17102c2ff (WORDS)