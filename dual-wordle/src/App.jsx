import { useState, useEffect } from 'react'
import axios, { isAxiosError } from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// helper - sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// helper function - between
function between(value, min, max) {
  return (value <= max) && (value >= min);
}

// helper function - check to see that a string is all letters
function is_alpha(s) {
  if (s.length == 0) return false;
  for (let i = 0; i < s.length; i++) {
    let letterCheck = between(s[i].charCodeAt(0), 65, 90) || between(s[i].charCodeAt(0), 97, 122);
    if (!letterCheck) {
      return false;
    }
  }
  return true;
}

export default function Wordle() {
  const [row, setRow] = useState(0);  // which row are we editing
  //const [letter, setLetter] = useState(0); // which letter position are we editing
  const [wordLength, setWordLength] = useState(5); // how long is our word?
  // status of each letter as defined in KeyboardLetter() function
  const [letterStatus, setLetterStatus] = useState(Array(26).fill(0)); 
  const [computerMode, setComputerMode] = useState(false);  // human player (false-default) or computer player (true)?
  // values of word boxes
  const [wordValues, setWordValues] = useState(["".padStart(wordLength, "_"),"".padStart(wordLength, "_"),
                                                "".padStart(wordLength, "_"),"".padStart(wordLength, "_"),
                                                "".padStart(wordLength, "_"),"".padStart(wordLength, "_"),
                                                "".padStart(wordLength, "_"),"".padStart(wordLength, "_"),
                                                "".padStart(wordLength, "_"),"".padStart(wordLength, "_")
                                              ]);
  const [wordValuesLoading, setWordValuesLoading] = useState(true);
  // statuses of the letter boxes
  const [wordleBoxStatuses, setWordleBoxStatuses] = useState([Array(wordLength).fill(0),Array(wordLength).fill(0),
                                                              Array(wordLength).fill(0),Array(wordLength).fill(0),
                                                              Array(wordLength).fill(0),Array(wordLength).fill(0),
                                                              Array(wordLength).fill(0),Array(wordLength).fill(0),
                                                              Array(wordLength).fill(0),Array(wordLength).fill(0)
                                                            ]);
  const [wordleBoxStatusesLoading, setwordleBoxStatusesLoading] = useState(true);
  // attempts
  const [attempts, setAttempts] = useState(0);
  /* if in computer mode, which heuristic is used? (0-default: NGram Probability, 1: Positional Word Count)
    Might add more options in future. Irrelevant if human mode.*/
  const [heur, setHeur] = useState(0);

  // get configuration data
  function loadSaved() {
    axios.get("http://localhost:5000/api/load")
         .then((response) => {
              setWordLength(response.data.wordLength);
              setComputerMode(response.data.computerMode);
              setHeur(response.data.heuristic);
              setAttempts(response.data.attempts);
              setWordValues(response.data.wordValues);
              setWordleBoxStatuses(response.data.wordleBoxStatuses);
              setRow(response.data.row);
              setLetterStatus(response.data.letterStatus);
              setWordValuesLoading(false);
              setwordleBoxStatusesLoading(false);
            }
         )
  }

  // load only on refresh or start
  useEffect(() => {
    loadSaved();
  }, []);

  // save user data
  function saveData() {
    let data = {"row": row, "wordLength": wordLength, "letterStatus": letterStatus, 
                "computerMode": computerMode, "wordValues": wordValues, 
                "wordleBoxStatuses": wordleBoxStatuses, "attempts": attempts, "heuristic": heur};
    axios.post("http://localhost:5000/api/save", data);
  }

  // get new game
  function getNew() {
    axios.get("http://localhost:5000/api/new")
         .then((response) => {
            let newWordLength = response.data.wordLength;
            let cmp = response.data.computerMode;
            let seed = response.data.seed;
            setWordLength(newWordLength);
            setComputerMode(cmp);
            setHeur(response.data.heuristic);
            setAttempts(response.data.attempts);
            setLetterStatus(Array(26).fill(0));
            setWordValues([seed,"".padStart(newWordLength, "_"),
                            "".padStart(newWordLength, "_"),"".padStart(newWordLength, "_"),
                            "".padStart(newWordLength, "_"),"".padStart(newWordLength, "_"),
                            "".padStart(newWordLength, "_"),"".padStart(newWordLength, "_"),
                            "".padStart(newWordLength, "_"),"".padStart(newWordLength, "_")
                          ]
            );
            setWordleBoxStatuses([Array(newWordLength).fill(0),Array(newWordLength).fill(0),
                                  Array(newWordLength).fill(0),Array(newWordLength).fill(0),
                                  Array(newWordLength).fill(0),Array(newWordLength).fill(0),
                                  Array(newWordLength).fill(0),Array(newWordLength).fill(0),
                                  Array(newWordLength).fill(0),Array(newWordLength).fill(0)
                                  ]
            );
            setWordValuesLoading(false);
            setwordleBoxStatusesLoading(false);
         }
        )
  }

  // prepare data to be sent to server (for computer mode);
  function prepareFeedbackForComputer(row_i) {
    let fb = "";
    for (let j = 0; j < wordLength; j++) {
      if (wordleBoxStatuses[row_i][j] == 0) {
          alert("Invalid status. Please tell me if the letter is correctly placed (green), misplaced (yellow), or incorrect (gray).");
          return "";
      } else if (wordleBoxStatuses[row_i][j] == 1) {
          fb += (wordValues[row_i][j]+"+");
      } else if (wordleBoxStatuses[row_i][j] == 2) {
          fb += (wordValues[row_i][j]+"*");
      } else if (wordleBoxStatuses[row_i][j] == 3) {
          fb += (wordValues[row_i][j]+"~");
      }
    }
    return fb;
  }

  // handle processing of feedback string (human mode)
  function processFeedback(fbs, rown) {
    let solvedFlag = false;
    if (fbs[fbs.length-1] === ".") {
      solvedFlag = true;
      fbs = fbs.slice(0, fbs.length-1);
    }
    if (fbs[0] === "!") {
      alert(`Attempts over. Answer is ${fbs.slice(1)}`);
      return;
    }
    let vals = JSON.parse(JSON.stringify(wordValues));
    let wbs = JSON.parse(JSON.stringify(wordleBoxStatuses));
    let ls = JSON.parse(JSON.stringify(letterStatus));
    setWordValuesLoading(true);
    setwordleBoxStatusesLoading(true);
    vals[rown] = "";
    for (let k = 0; k < fbs.length; k+=2) {
      vals[rown] += fbs[k];
      let thisStat;
      if (fbs[k+1] === "+") {
        thisStat = 1;
      } else if (fbs[k+1] === "*") {
        thisStat = 2;
      } else if (fbs[k+1] === "~") {
        thisStat = 3;
      }
      wbs[rown][k/2] = thisStat;
      ls[fbs[k].charCodeAt(0)-65] = thisStat;
    }
    setWordValues(JSON.parse(JSON.stringify(vals)));
    setWordleBoxStatuses(JSON.parse(JSON.stringify(wbs)));
    setLetterStatus(JSON.parse(JSON.stringify(ls)));
    setWordValuesLoading(false);
    setwordleBoxStatusesLoading(false);
    if (solvedFlag) {
      alert("Nice job!");
      return;
    }
  }

  // handle button presses for the wordle letters
  function handleWordleBoxPress(box_no, row_) {
    // background color based on status
    // 0: not solved (neutral), 1: correct, 2: misplaced, 3: incorrect
    if (computerMode && row_ == row) {
      let bxs = JSON.parse(JSON.stringify(wordleBoxStatuses));
      bxs[row_][box_no] = (bxs[row_][box_no]+1)%4;
      setWordleBoxStatuses(JSON.parse(JSON.stringify(bxs)));
    }
  }

  // handle key down for the text input "wordinput"
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // send data to server to evaluate
      let word = document.getElementById("wordinput").value.toUpperCase();
      if (is_alpha(word) && word.length == wordLength) {
        // send data to server
        axios.post("http://localhost:5000/api/human-feedback", word)
            .then((response) => 
                {
                  if (response.data !== "") {
                    processFeedback(response.data, row);
                    setRow(Math.min(row+1, 10));
                    setAttempts(Math.max(attempts-1, 0));
                  }
                }
            )
      } else {
        alert("Invalid word guess. Please enter letters only.");
      }
      document.getElementById("wordinput").value = "";
    } 
  }

  // handle keyboard button press
  function handleKeyboardButtonPress(val) {
    let isLetter = between(val.charCodeAt(0), 65, 90);
    if (val === "Enter") {
      let word = document.getElementById("wordinput").value.toUpperCase();
      if (is_alpha(word) && word.length == wordLength && !computerMode) {
        // send data to server
        axios.post("http://localhost:5000/api/human-feedback", word)
            .then((response) => 
                {
                  if (response.data !== "") {
                    processFeedback(response.data, row);
                    setRow(Math.min(row+1, 10));
                    setAttempts(Math.max(attempts-1, 0));
                  }
                }
            )
      // computer mode
      } else if (computerMode) {
          let fb = prepareFeedbackForComputer(row);
          if (fb !== "") {
            axios.post("http://localhost:5000/api/computer-feedback", fb)
                .then((response) => 
                    {
                      if (response.data === 0) {
                        alert("YAY! I solved the game.");
                      } else if (response.data === -1) {
                        alert("Based on the given feedback, there are no words that match your criteria. Please try again.");
                      } else {
                          if (row < 10) {
                            let new_wordVals = JSON.parse(JSON.stringify(wordValues));
                            let guess = response.data.toUpperCase();
                            new_wordVals[row+1] = "";
                            for (let g = 0; g < guess.length; g++) {
                              new_wordVals[row+1] += guess[g];
                            }
                            setWordValues(JSON.parse(JSON.stringify(new_wordVals)));
                            setRow(Math.min(row+1, 10));
                          }
                      }
                    }
                )
            }
          }
    } else if (val === "Backspace") {
        let forminputval = document.getElementById("wordinput").value;
        document.getElementById("wordinput").value = forminputval.slice(0, forminputval.length-1);
    } else if (isLetter) {
        document.getElementById("wordinput").value = document.getElementById("wordinput").value + val;
    }
    document.getElementById("wordinput").value = "";
  }
  
  return (
    <>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[0]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[0]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={0}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[1]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[1]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={1}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[2]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[2]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={2}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[3]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[3]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={3}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[4]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[4]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={4}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[5]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[5]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={5}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[6]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[6]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={6}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[7]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[7]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={7}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[8]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[8]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={8}></WordleLettersRow><br></br>
    <WordleLettersRow values={wordValuesLoading ? "".padStart(wordLength, "_"): wordValues[9]} statuses={wordleBoxStatusesLoading ? "".padStart(wordLength, "_"): wordleBoxStatuses[9]} wordlength={wordLength} bxsetter={handleWordleBoxPress} nrow={9}></WordleLettersRow><br></br><br></br>
    <p>Attempts left: {!computerMode? attempts: "N/A"}</p>
    <label hidden={computerMode} htmlFor="wordinput">Enter your guess here:  </label>
    <input id="wordinput" hidden={computerMode} onKeyDown={handleKeyDown}></input><br></br><br></br>
    <Keyboard lstatuses={letterStatus} keyClickHandler={handleKeyboardButtonPress} kvisible={true}></Keyboard>
    <button onClick={saveData} style={{backgroundColor: "black", color: "white", fontWeight: "bold"}}>Save</button>
    <button onClick={getNew} style={{backgroundColor: "gray", color: "white", fontWeight: "bold"}}>New Game</button>
    </>
  )
  
}

// row of wordle letters (size 10)
function WordleLettersRow({values, statuses, wordlength, bxsetter, nrow}) {
  return (
  <>
  <WordleLetterBox value={values[0]} status={statuses[0]} visible={wordlength >= 1} handleWLBClick={() => bxsetter(0,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[1]} status={statuses[1]} visible={wordlength >= 2} handleWLBClick={() => bxsetter(1,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[2]} status={statuses[2]} visible={wordlength >= 3} handleWLBClick={() => bxsetter(2,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[3]} status={statuses[3]} visible={wordlength >= 4} handleWLBClick={() => bxsetter(3,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[4]} status={statuses[4]} visible={wordlength >= 5} handleWLBClick={() => bxsetter(4,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[5]} status={statuses[5]} visible={wordlength >= 6} handleWLBClick={() => bxsetter(5,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[6]} status={statuses[6]} visible={wordlength >= 7} handleWLBClick={() => bxsetter(6,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[7]} status={statuses[7]} visible={wordlength >= 8} handleWLBClick={() => bxsetter(7,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[8]} status={statuses[8]} visible={wordlength >= 9} handleWLBClick={() => bxsetter(8,nrow)}></WordleLetterBox>
  <WordleLetterBox value={values[9]} status={statuses[9]} visible={wordlength == 10} handleWLBClick={() => bxsetter(9,nrow)}></WordleLetterBox>
  </>
  )
}

// blocks to hold typed (game) letters
function WordleLetterBox({value, status, visible, handleWLBClick}) {
  // background color based on status
  // 0: not solved (neutral), 1: correct, 2: misplaced, 3: incorrect
  let wh = 75;
  let bc = {backgroundColor: "white", color: "white", borderStyle: "solid", borderColor: "black", 
            borderWidth: "thin", width: `${wh-15}px`, height: `${wh-20}px`, fontSize: `${wh*0.3}px`, fontWeight: "bold", 
            margin: "5px", visibility: visible ? "visible": "hidden"};
  if (status == 0) {
    bc["backgroundColor"] = "white";
    bc["color"] = "black";
  } else if (status == 1) {
    bc["backgroundColor"] = "#017513";
  } else if (status == 2) {
    bc["backgroundColor"] = "#9e9c26";
  } else if (status == 3) {
    bc["backgroundColor"] = "#545454";
  }
  return <button onClick={handleWLBClick} style={bc}>{value}</button>
}

// keyboard
function Keyboard({lstatuses, keyClickHandler, kvisible}) {
  let letter_to_idx = {};
  for (let p = 65; p < 91; p++) {
    letter_to_idx[String.fromCharCode(p)] = p-65;
  }
  return (
  <>
  <KeyboardLetter value="Q" status={lstatuses[letter_to_idx["Q"]]} onClickHandler={() => keyClickHandler("Q")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="W" status={lstatuses[letter_to_idx["W"]]} onClickHandler={() => keyClickHandler("W")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="E" status={lstatuses[letter_to_idx["E"]]} onClickHandler={() => keyClickHandler("E")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="R" status={lstatuses[letter_to_idx["R"]]} onClickHandler={() => keyClickHandler("R")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="T" status={lstatuses[letter_to_idx["T"]]} onClickHandler={() => keyClickHandler("T")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="Y" status={lstatuses[letter_to_idx["Y"]]} onClickHandler={() => keyClickHandler("Y")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="U" status={lstatuses[letter_to_idx["U"]]} onClickHandler={() => keyClickHandler("U")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="I" status={lstatuses[letter_to_idx["I"]]} onClickHandler={() => keyClickHandler("I")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="O" status={lstatuses[letter_to_idx["O"]]} onClickHandler={() => keyClickHandler("O")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="P" status={lstatuses[letter_to_idx["P"]]} onClickHandler={() => keyClickHandler("P")} visible={kvisible}></KeyboardLetter>
  <KeyboardSpecial value="Backspace" onClickHandler={() => keyClickHandler("Backspace")} visible={kvisible}></KeyboardSpecial>
  <br></br>
  <KeyboardLetter value="A" status={lstatuses[letter_to_idx["A"]]} onClickHandler={() => keyClickHandler("A")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="S" status={lstatuses[letter_to_idx["S"]]} onClickHandler={() => keyClickHandler("S")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="D" status={lstatuses[letter_to_idx["D"]]} onClickHandler={() => keyClickHandler("D")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="F" status={lstatuses[letter_to_idx["F"]]} onClickHandler={() => keyClickHandler("F")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="G" status={lstatuses[letter_to_idx["G"]]} onClickHandler={() => keyClickHandler("G")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="H" status={lstatuses[letter_to_idx["H"]]} onClickHandler={() => keyClickHandler("H")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="J" status={lstatuses[letter_to_idx["J"]]} onClickHandler={() => keyClickHandler("J")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="K" status={lstatuses[letter_to_idx["K"]]} onClickHandler={() => keyClickHandler("K")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="L" status={lstatuses[letter_to_idx["L"]]} onClickHandler={() => keyClickHandler("L")} visible={kvisible}></KeyboardLetter>
  <br></br>
  <KeyboardLetter value="Z" status={lstatuses[letter_to_idx["Z"]]} onClickHandler={() => keyClickHandler("Z")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="X" status={lstatuses[letter_to_idx["X"]]} onClickHandler={() => keyClickHandler("X")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="C" status={lstatuses[letter_to_idx["C"]]} onClickHandler={() => keyClickHandler("C")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="V" status={lstatuses[letter_to_idx["V"]]} onClickHandler={() => keyClickHandler("V")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="B" status={lstatuses[letter_to_idx["B"]]} onClickHandler={() => keyClickHandler("B")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="N" status={lstatuses[letter_to_idx["N"]]} onClickHandler={() => keyClickHandler("N")} visible={kvisible}></KeyboardLetter>
  <KeyboardLetter value="M" status={lstatuses[letter_to_idx["M"]]} onClickHandler={() => keyClickHandler("M")} visible={kvisible}></KeyboardLetter>
  <KeyboardSpecial value="Enter" onClickHandler={() => keyClickHandler("Enter")} visible={kvisible}></KeyboardSpecial>
  </>
  )
}

// blocks to hold typed (keyboard) letters
function KeyboardLetter({value, status, onClickHandler, visible}) {
  // background color based on status
  // 0: unused, 1: correct, 2: misplaced, 3: incorrect/used
  let bc = {backgroundColor: "white", color: "white", borderStyle: "solid", borderColor: "black", 
            borderWidth: "thin", fontWeight: "bold", margin: "4px"};
  if (status == 0) {
    bc["backgroundColor"] = "white";
    bc["color"] = "black";
  } else if (status == 1) {
    bc["backgroundColor"] = "#017513";
  } else if (status == 2) {
    bc["backgroundColor"] = "#9e9c26";
  } else if (status == 3) {
    bc["backgroundColor"] = "#545454";
  }
  return <button hidden={!visible} style={bc} onClick={onClickHandler}>{value}</button>;
}

// block to hold special keys on a keyboard (Backspace, Enter)
function KeyboardSpecial({value, onClickHandler, visible}) {
  let s = {backgroundColor: "white", color: "black", borderStyle: "solid", borderColor: "black", 
            borderWidth: "thin", fontWeight: "bold", margin: "4px", visibility: visible ? "visible": "hidden"};
  return <button style={s} onClick={onClickHandler}>{value}</button>;
}