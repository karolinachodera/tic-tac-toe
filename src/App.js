import { useState } from "react";

function Square({ value, onSquareClick, className }) {
  if (className) {
    return (
      <button className={`square ${className}`} onClick={onSquareClick}>
        {value}
      </button>
    );
  } else {
    return (
      <button className="square" onClick={onSquareClick}>
        {value}
      </button>
    );
  }
}

function Row({ n, winnerData, squares, handleClick }) {
  const row = [];
  let winnerSquareA, winnerSquareB, winnerSquareC;
  if (winnerData) {
    [winnerSquareA, winnerSquareB, winnerSquareC] = winnerData.winnerLine;
  }

  for (let i = n; i < n + 3; i++) {
    if (
      winnerData &&
      (i === winnerSquareA || i === winnerSquareB || i === winnerSquareC)
    ) {
      row.push(
        <Square
          key={"square-" + i}
          className="winner"
          value={squares[i]}
          onSquareClick={() => handleClick(i)}
        />
      );
    } else {
      row.push(
        <Square
          key={"square-" + i}
          value={squares[i]}
          onSquareClick={() => handleClick(i)}
        />
      );
    }
  }
  return row;
}

function Grid({ winnerData, squares, handleClick }) {
  const rows = [];
  for (let i = 0; i <= 6; i += 3) {
    rows.push(
      <div className="board-row" key={"row-" + i}>
        <Row
          key={"row-" + i}
          n={i}
          winnerData={winnerData}
          squares={squares}
          handleClick={handleClick}
        />
      </div>
    );
  }
  return rows;
}

function Sorter({ description, onSorterClick }) {
  return (
    <button className="sorter" onClick={onSorterClick}>
      {description}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, currentMoveIndex }) {
  function handleClick(squareIndex) {
    if (squares[squareIndex] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = [...squares];

    if (xIsNext) {
      nextSquares[squareIndex] = "X";
    } else {
      nextSquares[squareIndex] = "O";
    }
    onPlay(nextSquares, squareIndex);
  }

  const winnerData = calculateWinner(squares);
  let gameStatus;
  if (winnerData && winnerData.winner) {
    gameStatus = "Winner: " + winnerData.winner;
  } else if (currentMoveIndex === 9 && !winnerData) {
    gameStatus = "Draw";
  } else {
    gameStatus = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{gameStatus}</div>
      <Grid
        winnerData={winnerData}
        squares={squares}
        handleClick={handleClick}
      />
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAscending, setOrder] = useState(true);
  const [indexes, setIndexes] = useState([]);
  const xIsNext = currentMoveIndex % 2 === 0;
  const currentSquares = history[currentMoveIndex];

  function handlePlay(nextSquares, squareIndex) {
    const nextHistory = [
      ...history.slice(0, currentMoveIndex + 1),
      nextSquares,
    ];
    setHistory(nextHistory);
    setCurrentMoveIndex(nextHistory.length - 1);
    setIndexes((indexes) => [...indexes, squareIndex]);
  }

  function jumpTo(nextMove) {
    setCurrentMoveIndex(nextMove);
  }

  function sortMoves() {
    setOrder(!isAscending);
  }

  function setButtonDescription(isAscending) {
    let description;
    if (isAscending) {
      description = "Sort moves in descending order";
    } else {
      description = "Sort moves in ascending order";
    }
    return description;
  }

  let moves = history.map((squares, move) => {
    let description;
    let row = Math.floor(indexes[move - 1] / 3) + 1 || 0;
    let col = (indexes[move - 1] % 3) + 1 || 0;
    if (move > 0) {
      description = "Go to move #" + move + ` (${row}, ${col})`;
    } else {
      description = "Go to game start";
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
          <p>
            You are at move {move} ({row}, {col}).
          </p>
        </li>
      );
    }
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          currentMoveIndex={currentMoveIndex}
        />
      </div>
      <div className="game-info">
        <Sorter
          description={setButtonDescription(isAscending)}
          onSorterClick={sortMoves}
        />
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
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winnerLine: [a, b, c] };
    }
  }
  return null;
}
