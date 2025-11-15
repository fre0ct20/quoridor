import React from "react";
import './Pawn.css';

const Pawn = ({player}) => {
    const pawnColor = player == 1 ? 'pawn-player1' : 'pawn-player2';
    
    return (
        <div className={`pawn ${pawnColor}`}>
        </div>
    )
}

export default Pawn;