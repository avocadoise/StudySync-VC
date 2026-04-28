import React, { useMemo } from 'react';

const SYMBOLS = ['+', '−', '×', '÷', '=', '%', 'π', '√', 'x²', '1+1', 'A+', '<', '>'];

export const ArithmeticBackground = () => {
  const items = useMemo(() => {
    const temp = [];
    const rows = 16;
    const cols = 24;
    
    let idCounter = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        temp.push({
          id: idCounter,
          symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          left: `${(c / cols) * 100 + 2}%`,
          top: `${(r / rows) * 100 + 2}%`,
          fontSize: '1rem',
          transform: 'rotate(0deg)',
          opacity: 0.15
        });
        idCounter++;
      }
    }
    return temp;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute font-semibold"
          style={{
            color: '#b5b5a6',
            left: item.left,
            top: item.top,
            fontSize: item.fontSize,
            transform: item.transform,
            opacity: item.opacity,
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
};
