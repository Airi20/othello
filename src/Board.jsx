import React, { useState, useEffect } from "react";

const SIZE = 8;
const DIRECTIONS = [
  [-1, 0], [1, 0],  // 上下
  [0, -1], [0, 1],  // 左右
  [-1, -1], [-1, 1], // 斜め
  [1, -1], [1, 1],
];

function createInitialBoard() {
  const board = Array(SIZE)
    .fill(null)
    .map(() => Array(SIZE).fill(null));
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";
  return board;
}

export default function Board() {
  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState("black");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  function inBounds(row, col) {
    return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
  }

  function stonesToFlip(board, row, col, color, dirRow, dirCol) {
    let r = row + dirRow;
    let c = col + dirCol;
    let stones = [];

    while (inBounds(r, c)) {
      if (board[r][c] === null) return [];
      if (board[r][c] === color) return stones;
      stones.push([r, c]);
      r += dirRow;
      c += dirCol;
    }
    return [];
  }

  function canPlace(board, row, col, color) {
    if (board[row][col] !== null) return false;
    for (const [dr, dc] of DIRECTIONS) {
      if (stonesToFlip(board, row, col, color, dr, dc).length > 0) {
        return true;
      }
    }
    return false;
  }

  // 置ける場所が1つでもあるか
  function hasValidMove(board, color) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (canPlace(board, r, c, color)) return true;
      }
    }
    return false;
  }

  function countStones(board) {
    let black = 0;
    let white = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === "black") black++;
        else if (board[r][c] === "white") white++;
      }
    }
    return { black, white };
  }

  function placeStone(row, col) {
    if (gameOver) return;
    if (!canPlace(board, row, col, turn)) return;

    let flips = [];
    for (const [dr, dc] of DIRECTIONS) {
      flips = flips.concat(stonesToFlip(board, row, col, turn, dr, dc));
    }

    if (flips.length === 0) return;

    const newBoard = board.map((r) => r.slice());
    newBoard[row][col] = turn;
    for (const [r, c] of flips) {
      newBoard[r][c] = turn;
    }
    setBoard(newBoard);

    const nextTurn = turn === "black" ? "white" : "black";

    if (hasValidMove(newBoard, nextTurn)) {
      setTurn(nextTurn);
      setMessage(`${nextTurn.charAt(0).toUpperCase() + nextTurn.slice(1)}のターン`);
    } else if (hasValidMove(newBoard, turn)) {
      // 相手は置けないけど自分は置ける → パス
      setMessage(`${nextTurn.charAt(0).toUpperCase() + nextTurn.slice(1)}はパス！もう一度${turn}のターン`);
    } else {
      // 両方置けない → 終了
      setGameOver(true);
      const { black, white } = countStones(newBoard);
      let result = "";
      if (black > white) result = "黒の勝ち！";
      else if (white > black) result = "白の勝ち！";
      else result = "引き分け！";
      setMessage(`ゲーム終了！${result} (黒:${black} 白:${white})`);
    }
  }

  useEffect(() => {
    if (!gameOver) setMessage(`${turn.charAt(0).toUpperCase() + turn.slice(1)}のターン`);
  }, [turn, gameOver]);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 40px)`,
          gridTemplateRows: `repeat(${SIZE}, 40px)`,
          gap: "2px",
          backgroundColor: "black",
          padding: "4px",
          marginBottom: "12px",
          userSelect: "none",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => placeStone(r, c)}
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#4caf50",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: gameOver ? "default" : "pointer",
                position: "relative",
              }}
              title={canPlace(board, r, c, turn) ? "ここに置けます" : ""}
            >
              {canPlace(board, r, c, turn) && !gameOver && (
                <div
                  style={{
                    position: "absolute",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 0, 0.6)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {cell && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: cell === "black" ? "black" : "white",
                    border: cell === "white" ? "1px solid #ccc" : "none",
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>{message}</div>

      {/* ここからもう一回やるボタン */}
      {gameOver && (
        <button
          onClick={() => {
            setBoard(createInitialBoard());
            setTurn("black");
            setGameOver(false);
            setMessage("黒のターン");
          }}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            fontSize: 16,
            cursor: "pointer",
            borderRadius: 8,
            backgroundColor: "#ddd",
            border: "none",
          }}
        >
          もう一回やる
        </button>
      )}
    </div>
  );
}
