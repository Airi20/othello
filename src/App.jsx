import React from "react";
import Board from "./Board";
import "./index.css";

export default function App() {
  return (
    <div className="app">
      <h1 className="title">ぼーっとできるオセロ</h1>
      <p className="subtitle">頭使わなくてもポチポチしてれば終わる</p>
      <Board />
    </div>
  );
}
