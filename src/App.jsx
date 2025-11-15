import { useState } from 'react'
import './App.css'
import Board from './Board'

// アプリ本体コンポーネント
function App() {
  return (
    <>
      <div className="App">
        <h1>Quoridor</h1>
        <Board />
      </div>
    </>
  )
}

export default App