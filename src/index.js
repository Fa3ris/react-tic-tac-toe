import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// ================== COMPONENTS ======================

/**
 * function component  
 * **only render**
 */
function Square(props) {
  return (
    <button className="square"
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

/**
 * hold state of each Square
 */
class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  /**
   * Affiche l'état des cases  
   */
  render() {
    let boardRows = [];
    for (let i = 0; i < 3; i++) {
      const row = []
          for (let j = 0; j < 3; j++) {
            const index = j + i * 3;
            row.push(<span key={index}>{this.renderSquare(index)}</span>);
          }
        boardRows.push(<div className="board-row" key="i">{row}</div>);
    }

    return (<div>{boardRows}</div>);
  }
}

/**
 * renders Board and additional info
 */
class Game extends React.Component {

  /**
   * init - le jeu commence au tour zéro
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      /**
       * historique des coups joués
       */
      history: [{
        /**
         * Etat des cases
         */
        squares: Array(9).fill(null),
        /**
         * coup joué ce tour {col, row}
         */
        move: null, 
      }],
      /**
       * true si c'est à 'X' de jouer
       */
      xIsNext: true,
      /**
       * numéro du tour actuel
       */
      stepNumber: 0,
    };
  }

  /**
  * why IMMUTABILITY of state
  * * save previous states -> undo/redo history  
  * * easy to detect changes -> reference to object has changed == object has changed
  * * **pure component** -> detect when to re-render 
  * @param {*} i index du child Square
  */
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const move = calculateColRow(i);
    // ne pas re-render le Square s'il y a un vainqueur ou si la case a déjà une valeur
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        move: move
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      // 'X' joue les tours pairs
      xIsNext: (step % 2) === 0,

    })
  }

  render() {

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((boardState, turn) => {
      const description = turn ? `Go to move #${turn} (${boardState.move.row},${boardState.move.col})` : 'Go to game start';
      return (
        // declare key as UUID for element in iterable
        <li key={turn}>
          <button onClick={() => this.jumpTo(turn)} 
          className={`button ${turn === this.state.stepNumber ? "selected" : ""}`}>{description}</button>
        </li>
      )
    })
    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ================== RENDER DOM ======================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// ================== HELPER ======================

/**
 * Retourne le symbole du vainqueur s'il y en a un, sinon null
 * @param {*} squares tableau des valeurs de chaque Square
 */
function calculateWinner(squares) {

  /**
   * Combinaisons gagnantes
   */
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
    // Les valeurs des trois cases sont identiques et non null
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // symbole du vainqueur
    }
  }
  return null;
}

function calculateColRow(index) {
  const map = new Map();
  
  map.set(0, {row: 0, col: 0});
  map.set(1, {row: 0, col: 1});
  map.set(2, {row: 0, col: 2});
  map.set(3, {row: 1, col: 0});
  map.set(4, {row: 1, col: 1});
  map.set(5, {row: 1, col: 2});
  map.set(6, {row: 2, col: 0});
  map.set(7, {row: 2, col: 1});
  map.set(8, {row: 2, col: 2});

  return map.get(index);
}