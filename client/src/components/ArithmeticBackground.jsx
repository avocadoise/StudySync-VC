import React, { useMemo } from 'react';

const SYMBOLS = ['+', '−', '×', '÷', '=', '%', 'π', '√', 'x²', '1+1', 'A+', '<', '>'];

export const ArithmeticBackground = () => {
  const items = useMemo(() => {
    const temp = [];
    // Generate enough symbols to scatter across the screen
    for (let i = 0; i < 80; i++) {
      temp.push({
        id: i,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 1.5 + 0.8}rem`, // varied sizes: 0.8rem to 2.3rem
        transform: `rotate(${Math.random() * 360}deg)`,
        // Make opacity slightly higher and use a darker color
        opacity: Math.random() * 0.4 + 0.2
      });
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
            color: '#b5b5a6', // Darker off-white/beige to stand out on the #fbfbf0 background
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
