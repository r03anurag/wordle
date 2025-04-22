# dual-wordle
A web application/game like NYT's [Wordle](https://www.nytimes.com/games/wordle/index.html), in which one is tasked with guessing the word in a limited number of tries. I added my own touch to this by adding the option to have words of length greater than five (between 5 and 8). Additionally, you can switch roles, and have the computer be the player, and you give it feedback.

# Description
[Wordle](https://www.nytimes.com/games/wordle/index.html) is a New York Times (NYT) game in which one is tasked with guessing the word in a limited number of tries, based on feedback given. On each guess, the player is told which letters are correctly placed, misplaced, or non-existent in the word. 

# Getting Started

## Dependencies
* Run the command `pip install -r requirements.txt` to install Python libraries.
* Make sure to install [node.js](https://nodejs.org/en/download/current).
* Code is compatible with any OS. Make sure your Python version is at least 3.12.7 for predictable results.

## Downloading code (follow these steps in order)
* Download the code from this repository as-is. DO NOT REMOVE OR DELETE ANY FILES. 

## Running the code
* You will need TWO (2) terminal instances - one for the frontend, and one for the backend.
* Backend:
    * Navigate to `wordle/` directory, and open a terminal.
    * Type `flask run`.
* Frontend:
    * Navigate to `wordle/dual-wordle` directory, and open another terminal.
        1. Type `npm install` (only if it is the first time running the code).
        2. Type `npm run dev` to run the server locally. 
            * (OPTIONAL) If you want to build this app for production, additionally run the command `npm run build`.
        3. Copy paste the url containing "localhost" (should be displayed in the terminal) into
           your browser. 
    * If playing in computer mode: Click on the letter tiles to change their color to give the computer feedback.

## Configuring game settings
* Navigate to the file `wordle_config.py` in the main directory. The following are parameters:
    - `WORDLENGTH`: Length of the word. Must be between 5 and 8 (otherwise system will default to 5).
    - `COMPUTER_MODE`: Set to True if the computer is playing the game, or leave False (default) if you want to be the player.
    - `HEURISTIC`: If the computer is playing the game, how should it rank relevant words? Choices are (currently) 0 (default) or 1.
        - 0: Bigram Probabilities (probability of seeing pairs of letters in a specific order, e.g. "CA", "PR")
        - 1: Positional Letter Counts (how often does a letter occur at a specific position in a word, e.g. how often
             is "G" the third letter in 5-letter words?)
    - `COMMON_ONLY`: Use only common words when playing the game? Default true 
                     (You can change this if you want to make life harder for yourself...)
    - `SCOPE`: If in computer mode, a number that determines how many top word choices to consider when selecting a seed word? 
               Must be an integer, and the minimum is 1. Default 20.
    - `UNIQUE`: If in computer mode and set to True, the algorithm will prioritize words that have no repeating letters.
                This can help eliminate more letters and words quickly. Default false.
                NOTE: This is not a separate heuristic by itself; it is built on top of existing heuristics. As such, 
                      uniqueness never takes precedence over the heuristic computed for a word.
* To change game settings: Edit `wordle_config.py`, restart backend (Ctrl+C plus `flask run`).

# Authors
* Anurag Renduchintala.

# Versions
* 4/21/2025
    * Removed unnecessary comments.
* 4/10/2025
    * Two (2) words added to `commonWords.py`.
* 4/6/2025
    * `UNIQUE` parameter added.
* 3/26/2025
    * Bug fix in UI that didn't reset row number when new game was requested.
    * "Invalid word guess" notification is now supported both by pressing "Enter" on keyboard and on the panel of letters.
    * Check added to make sure that the word guess actually exists.
* 3/23/2025
    * Data selection is now automated, based on word length
    * New parameter added in config file (`COMMON_ONLY`)
    * `DATA` parameter removed from config file
    * Heuristic implementations are now in `helper.py`. Take a look at this file for details.
* 3/16/2025
    * New parameter added in config file (`SCOPE`)
* 3/8/2025
    * Small .gitignore error fix
    * Added some info to README
    * Browser will display a notification when saving data
* 3/5/2025
    * Small bug fix
* 2/26/2025
    * Bug fix
    * Added note on UI.
* 2/24/2025
    * Initial release.

# Acknowledgements
* Huge dictionary of 370,000 English words (`words_alpha.txt`); [GitHub](https://github.com/dwyl/english-words/tree/master)
* Common and Uncommon words (`commonWords.py` and `uncommonWords.py`); [GitHub](https://github.com/skedwards88/word_lists/tree/main)
* Positional Letter Count heuristic was originally developed by Jack C. 
  Here is the [article](https://medium.com/codex/building-a-wordle-solver-with-python-77e3c2388d63) from which it was inspired.
