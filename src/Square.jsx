import React from 'react';
import Pawn from './Pawn';
import './Square.css';

// マス目コンポーネント
const Square = ({player, mode, onClick}) => {

  // modeがmoveの時だけ'can-hover'クラスを適用
  const hoverClass = mode === 'move' ? 'can-hover' : '';
  
  return(
    <>
      <div 
        className={`square ${hoverClass}`}
        onClick={onClick}
      >
        {player > 0 && <Pawn player={player} />}
        
      </div>
    </>
  );
};

export default Square;