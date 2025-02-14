import { useState, useEffect } from 'react'
import axios, { isAxiosError } from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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
  const [letter, setLetter] = useState(0); // which letter position are we editing
  const [wordLength, setWordLength] = useState(5); // how long is our word?
  // status of each letter as defined in KeyboardLetter() function
  const [letterStatus, setLetterStatus] = useState(Array(26).fill(0)); 
  const [computerMode, setComputerMode] = useState(false);  // human player (false-default) or computer player (true)?
  /* if in computer mode, which heuristic is used? (0-default: NGram Probability, 1: Positional Word Count)
    Might add more options in future. Irrelevant if human mode.*/
  const [heur, setHeur] = useState(0);

  // get configuration data
  function getConfig() {
    axios.get("http://localhost:5000/api/config")
         .then((response) => {
              setWordLength(response.data.wordlength);
              setComputerMode(response.data.computer);
              setHeur(response.data.heuristic);
            }
         )
  }

  // fetch config only once
  useEffect(() => {
    getConfig();
  }, []);

  // handle key down for the text input "wordinput"
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // send data to server to evaluate
      let word = document.getElementById("wordinput").value;
      if (is_alpha(word)) {
        alert("Enter pressed!");
      } else {
        alert("Invalid word guess. Please enter letters only.");
        document.getElementById("wordinput").value = "";
      }
      //alert(document.getElementById("wordinput").value)
      //document.getElementById("wordinput").value = document.getElementById("wordinput").value + ":)))";
    } 
  }

  // handle keyboard button press
  function handleKeyboardButtonPress(val) {
    let isLetter = between(val.charCodeAt(0), 65, 90);
    if (val === "Enter") {
      let word = document.getElementById("wordinput").value;
      if (is_alpha(word)) {
        alert("wwwww");
        // send data to server
      }
    } else if (val === "Backspace") {
      let forminputval = document.getElementById("wordinput").value;
      document.getElementById("wordinput").value = forminputval.slice(0, forminputval.length-1);
    } else if (isLetter) {
      document.getElementById("wordinput").value = document.getElementById("wordinput").value + val;
    }
  }

  return (
    <>
    <WordleLettersRow values="AREYOUW___" statuses={Array(10).fill(0)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="__________" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br>
    <WordleLettersRow values="" statuses={Array(6).fill(1)} wordlength={wordLength}></WordleLettersRow><br></br><br></br>
    <label hidden={computerMode} htmlFor="wordinput">Enter your guess here:  </label>
    <input id="wordinput" hidden={computerMode} onKeyDown={handleKeyDown}></input><br></br><br></br>
    <Keyboard lstatuses={letterStatus} keyClickHandler={handleKeyboardButtonPress} kvisible={!computerMode}></Keyboard>
    </>
  )
  
}

// row of wordle letters (size 10)
function WordleLettersRow({values, statuses, wordlength}) {
  return (
  <>
  <WordleLetterBox value={values[0]} status={statuses[0]} visible={wordlength >= 1}></WordleLetterBox>
  <WordleLetterBox value={values[1]} status={statuses[1]} visible={wordlength >= 2}></WordleLetterBox>
  <WordleLetterBox value={values[2]} status={statuses[2]} visible={wordlength >= 3}></WordleLetterBox>
  <WordleLetterBox value={values[3]} status={statuses[3]} visible={wordlength >= 4}></WordleLetterBox>
  <WordleLetterBox value={values[4]} status={statuses[4]} visible={wordlength >= 5}></WordleLetterBox>
  <WordleLetterBox value={values[5]} status={statuses[5]} visible={wordlength >= 6}></WordleLetterBox>
  <WordleLetterBox value={values[6]} status={statuses[6]} visible={wordlength >= 7}></WordleLetterBox>
  <WordleLetterBox value={values[7]} status={statuses[7]} visible={wordlength >= 8}></WordleLetterBox>
  <WordleLetterBox value={values[8]} status={statuses[8]} visible={wordlength >= 9}></WordleLetterBox>
  <WordleLetterBox value={values[9]} status={statuses[9]} visible={wordlength == 10}></WordleLetterBox>
  </>
  )
}

// blocks to hold typed (game) letters
function WordleLetterBox({value, status, visible}) {
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
  return <button style={bc}>{value}</button>
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