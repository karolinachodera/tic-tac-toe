import { useState } from 'react';

function Square({ value, onSquareClick, className }) {
  if(className) {
  return <button className={`square ${className}`} onClick={onSquareClick} >{value}</button>;
  } else {
    return <button className="square" onClick={onSquareClick} >{value}</button>;
}
}

function Row({n, winnerData, squares, handleClick}) {
  const row = [];
  let a, b, c;
  if (winnerData) { [a, b, c]= winnerData.winnerLine;};

  for(let i = n; i < n + 3; i++) {
    if(winnerData && (i === a || i === b || i === c)) {
      row.push(<Square key={"square-" + i} className="winner" value={squares[i]} onSquareClick={() => handleClick(i)} />);
    } else {
      row.push(<Square key={"square-" + i} value={squares[i]} onSquareClick={() => handleClick(i)} />);
    }      
  }
  return row;
}

function Rows({winnerData, squares, handleClick}) {
  const rows = [];
  for(let i = 0; i <= 6; i += 3) {
    rows.push(
      <div className="board-row" key={"row-" + i}>
        <Row key={"row-" + i} n={i} winnerData={winnerData} squares={squares} handleClick={handleClick} />
      </div>)
  }
  return rows;
}

function Sorter({ description, onSorterClick}) {
  return <button className="sorter" onClick={onSorterClick}>{description}</button>
}

function Board({ xIsNext, squares, onPlay, currentMove }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares, i);
  }

  const winnerData = calculateWinner(squares);
  let status;
  if (winnerData && winnerData.winner) {
    status = "Winner: " + winnerData.winner;
  } else if (currentMove === 9 && !winnerData) {
    status = "Draw";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }
  
  function Row(n) {
    const row = [];
    let a, b, c;
    if (winnerData) { [a, b, c]= winnerData.winnerLine;};
 
    for(let i = n; i < n + 3; i++) {
      if(winnerData && (i === a || i === b || i === c)) {
        row.push(<Square className="winner" value={squares[i]} onSquareClick={() => handleClick(i)} />);
      } else {
        row.push(<Square value={squares[i]} onSquareClick={() => handleClick(i)} />);
      }      
    }
    return row;
  }

  function Rows() {
    const rows = [];
    for(let i = 0; i <= 6; i += 3) {
      rows.push(
        <div className="board-row">
          {Row(i)}
        </div>)
    }
    return rows;
  }

  return (
    <>
      <div className="status">{status}</div>
      {Rows()}
    </>
  )
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setOrder] = useState(true);
  const [indexes, setIndexes] = useState([]);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares, i) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setIndexes(indexes => [...indexes, i]);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function sortMoves() {
    setOrder(!isAscending);
  }

  function setButtonDescription(isAscending) {
    let description;
    if(isAscending) {
      description = "Sort moves in descending order";
    } else {
      description = "Sort moves in ascending order";
    }
    return description;
  }

  let moves = history.map((squares, move) => {
    let description;
    let row = (Math.floor(indexes[move - 1] / 3)) + 1 || 0;
    let col = (indexes[move - 1] % 3) + 1 || 0;
    if (move > 0) {
      description = 'Go to move #' + move + ` (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }

    if (move !== history.length - 1) {
      return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
     );
    } else {
      return (
        <li key={move}>
          <p>You are at move {move} ({row}, {col}).</p>
        </li>
      )
      
    }
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} currentMove={currentMove} />
      </div>
      <div className="game-info">
        <Sorter description={setButtonDescription(isAscending)} onSorterClick={sortMoves} />
        <ol>{isAscending ? moves : moves.reverse()}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return  { winner: squares[a], winnerLine: [a, b, c]};
    }
  }
  return null;
}
