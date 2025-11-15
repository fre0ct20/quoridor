import React from 'react';
import Pawn from './Pawn';
import './Square.css';

// マス目コンポーネント
const Square = ({player, onClick}) => {
  return(
    <>
      <button className="square" onClick={onClick}>
        {player > 0 && <Pawn player={player} />}
      </button>
    </>
  );
};

export default Square;