############# SHORT FILE WITH CONFIGURATION PARAMETERS. CHANGE TO YOUR LIKING
WORDLENGTH=6    # must be between 5-8
COMPUTER_MODE=False # must be true/false
HEURISTIC=1     # must be either 0 (NGram probability), 1 (positional letter count)
COMMON_ONLY=True  # use only well-known words? Default true. If false, all words are used.
SCOPE=40 # when picking a seed, how many top choices of words should be considered? Must be at least 1. Default 20.
UNIQUE=True # prioritize words that contain unique letters?