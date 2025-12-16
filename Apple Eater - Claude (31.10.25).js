import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment[0] === newFood.x && segment[1] === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({ x: 15, y: 15 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = [head[0] + direction.x, head[1] + direction.y];

      // Sprawdź kolizję ze ścianami
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Sprawdź kolizję z własnym ciałem
      if (prevSnake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Sprawdź czy zjadł jedzenie
      if (newHead[0] === food.x && newHead[1] === food.y) {
        setScore(s => s + 10);
        setFood(generateFood());
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, gameStarted, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && e.key.startsWith('Arrow')) {
        setGameStarted(true);
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 mb-4">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-2">
          🐍 Snake Game
        </h1>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold text-green-700">
            Wynik: <span className="text-green-900">{score}</span>
          </div>
          <button
            onClick={resetGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Nowa Gra
          </button>
        </div>

        <div 
          className="relative border-4 border-green-800 bg-green-50"
          style={{ 
            width: GRID_SIZE * CELL_SIZE, 
            height: GRID_SIZE * CELL_SIZE 
          }}
        >
          {/* Wąż */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={index === 0 ? 'bg-green-700' : 'bg-green-500'}
              style={{
                position: 'absolute',
                left: segment[0] * CELL_SIZE,
                top: segment[1] * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                borderRadius: '2px',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
          ))}

          {/* Jedzenie */}
          <div
            className="bg-red-500 rounded-full"
            style={{
              position: 'absolute',
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />

          {/* Ekran startowy */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg text-center">
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Gotowy do gry?
                </h2>
                <p className="text-gray-600">
                  Użyj strzałek, aby rozpocząć!
                </p>
              </div>
            </div>
          )}

          {/* Pauza */}
          {isPaused && gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-green-800">PAUZA</h2>
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg text-center">
                <h2 className="text-3xl font-bold text-red-600 mb-2">
                  Game Over!
                </h2>
                <p className="text-xl text-gray-700 mb-4">
                  Twój wynik: {score}
                </p>
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition"
                >
                  Zagraj ponownie
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>🎮 Sterowanie: Strzałki</p>
          <p>⏸️ Pauza: Spacja</p>
        </div>
      </div>
    </div>
  );

}
