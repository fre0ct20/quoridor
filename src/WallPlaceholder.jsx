import React from 'react';
import './WallPlaceholder.css';

const WallPlaceholder = ({onClick, type, mode, isWallStart}) => {
    const className = `wall-placeholder ${type}`;

    return (
        <div
            className={className}
            onClick={onClick}
        >
            {/* 設置モードの時だけハイライト */}
            {(mode === 'wall' || isWallStart) && 
                <div className={`wall-highlight ${isWallStart ? 'start-pos' : ''}`}></div>}
        </div>
    );
};


export default WallPlaceholder;