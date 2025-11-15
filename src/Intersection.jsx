import React from "react";
import './Intersection.css';

const Intersection = ({r, c, handleWallPlacement}) => {
    return (
        <div className="intersection-container">
            {/* 垂直方向の壁の配置エリア */}
            <button
                className="wall-placeholder vertical"
                onClick={() => handleWallPlacement(r, c, 'V')}
            >
            </button>

            {/* 水平方向の壁の配置エリア */}
            <button
                className="wall-placeholder horizontal"
                onClick={() => handleWallPlacement(r, c, 'H')}
            >
            </button>
        </div>
    )
}

export default Intersection;