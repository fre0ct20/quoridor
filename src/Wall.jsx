import React from "react";
import './Wall.css';

const Wall = ({orientation, value}) => {
    // value 3: 水平, 4: 垂直, 5: 交点
    const isIntersection = value === 5;
    const isVertical = orientation === 'V';
    const className = isIntersection ? 'intersection' : (isVertical ? 'vertical' : 'horizontal');

    return (
        <div className={`wall ${className}}`}>
        </div>
    );
};

export default Wall;