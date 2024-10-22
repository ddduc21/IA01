import { useState } from 'react';
import './App.css';

function Square({
	value,
	winHighlight,
	onSquareClick,
}: {
	winHighlight?: boolean;
	value: string;
	onSquareClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}) {
	return (
		<button
			className={winHighlight ? 'win-square' : 'square'}
			onClick={onSquareClick}
		>
			{value}
		</button>
	);
}

function Board({
	boardSize,
	xIsNext,
	squares,
	onPlay,
}: {
	boardSize: number;
	xIsNext: boolean;
	squares: string[];
	onPlay: (nextSquares: string[]) => void;
}) {
	function handleClick(i: number) {
		if (calculateWinner(squares) || squares[i]) {
			return;
		}

		const nextSquares = squares.slice();
		nextSquares[i] = xIsNext ? 'X' : 'O';

		onPlay(nextSquares);
	}

	let status;
	const winner = calculateWinner(squares);
	if (winner) {
		status = 'Winner: ' + winner.winner;
	} else if (squares.reduce((prev, cur) => prev && cur != null, true)) {
		status = 'Draw';
	} else {
		status = 'Next player: ' + (xIsNext ? 'X' : 'O');
	}

	const board: number[][] = [];
	for (let i = 0; i < boardSize; i++) {
		const row: number[] = [];
		for (let j = 0; j < boardSize; j++) {
			row.push(j + i * boardSize);
		}
		board.push(row);
	}

	return (
		<>
			<div className="status">{status}</div>
			{board.map((row) => (
				<div className="board-row">
					{row.map((e) => (
						<Square
							winHighlight={
								winner != null &&
								winner.winSquare.indexOf(e) > -1
							}
							value={squares[e]}
							onSquareClick={() => handleClick(e)}
						/>
					))}
				</div>
			))}
		</>
	);
}

type History = {
	board: string[];
	move: number;
}

export default function Game() {
	const [history, setHistory] = useState<History[]>([{
		move: -1,
		board: Array(9).fill(null)
	}]);
	const [currentMove, setCurrentMove] = useState(0);
	const [isReverse, setIsReverse] = useState(false);

	const xIsNext = currentMove % 2 === 0;
	const currentSquares = history[currentMove];

	function handlePlay(nextSquares: string[]) {
		let i = 0;
		for (; i < nextSquares.length; i++) {
			if (currentSquares.board[i] != nextSquares[i]) {
				break;
			}			
		}

		const nextHistory = [...history.slice(0, currentMove + 1), { board: nextSquares, move: i }];
		setHistory(nextHistory);

		setCurrentMove(nextHistory.length - 1);
	}

	function jumpTo(nextMove: number) {
		setCurrentMove(nextMove);
	}

	const moves = history.map((squares, move) => {
		let description;
		if (move > 0) {
			const pos = " (" + ((squares.move - squares.move % 3) / 3 + 1) + ", " + (squares.move % 3 + 1) + ")"; 
			
			if (move === currentMove) {
				description = 'Current move' + pos;
			}
			else {
				description = 'Go to move #' + move + pos;
			}
		} else {
			description = 'Go to game start';
		}

		return (
			<li key={move}>
				{move === currentMove ? (
					description
				) : (
					<button onClick={() => jumpTo(move)}>{description}</button>
				)}
			</li>
		);
	});

	return (
		<div className="game">
			<div className="game-board">
				<Board
					boardSize={3}
					xIsNext={xIsNext}
					squares={currentSquares.board}
					onPlay={handlePlay}
				/>
			</div>
			<div className="game-info">
				<button onClick={() => setIsReverse((value) => !value)}>
					{isReverse ? 'To Ascending' : 'To Descending'}
				</button>
				<ol>{isReverse ? moves.reverse() : moves}</ol>
			</div>
		</div>
	);
}

function calculateWinner(squares: string[]) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (
			squares[a] &&
			squares[a] === squares[b] &&
			squares[a] === squares[c]
		) {
			return {
				winner: squares[a],
				winSquare: [a, b, c],
			};
		}
	}
	return null;
}
