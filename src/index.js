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
    <button className={`square ${props.highlight ? "highlight" : ""}`}
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
      <Square value={this.props.squares[i].value}
        onClick={() => this.props.onClick(i)}
        highlight={this.props.squares[i].highlight}
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
        boardRows.push(<div className="board-row" key={i}>{row}</div>);
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
        squares: Array(9).fill({
          value: null,
          highlight: false,
        }),
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
      /**
       * ordre de tri
       */
      ascending: true
    };
  }

  /**
  * Handler du clic sur une case  
  * 
  * * enregistre la case cliquée
  * * ignore clic si partie terminée ou si case déjà cliquée
  * * change de joueur
  * * positionne la case cliquée comme dernier coup joué de l'historique, jette les coups suivants 
  * 
  * why IMMUTABILITY of state
  * * save previous states -> undo/redo history  
  * * easy to detect changes -> reference to object has changed == object has changed
  * * **pure component** -> detect when to re-render 
  * @param {*} i index du child Square
  */
  handleClick(i) {
    // récupère l'historique jusqu'au numéro du tour actuel, jette les tours suivants
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // récupère copie pour conserver immutability
    const squares = current.squares.slice();
    const move = calculateColRow(i);
    // ne pas re-render le Square s'il y a un vainqueur ou si la case a déjà une valeur
    if (hasNoWinner(getValues(squares)) || calculateWinner(getValues(squares)) || squares[i].value) {
      return;
    }
    squares[i] = { ...squares[i], value: this.state.xIsNext ? 'X' : 'O'};
    this.setState({
      history: history.concat([{
        squares: squares,
        move: move
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  /**
   * Retourne à un état de l'historique  
   * MAJ :
   * * n° du tour
   * * joueur actuel
   * @param {*} step 
   */
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      // 'X' joue les tours pairs
      xIsNext: (step % 2) === 0,

    })
  }

  /**
   * Inverse l'order de tri des moves
   */
  toggleOrder() {
    this.setState({
      ascending : !this.state.ascending,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(getValues(current.squares));
    const noWinner = hasNoWinner(getValues(current.squares));
    // reset className "highlight"
    current.squares.forEach((currentObj, index) => {
      currentObj.highlight = false;
    });
    const moves = history.map((boardState, turn) => {
    const description = turn ? `Go to move #${turn} - ${(turn % 2) === 0 ? 'O' : 'X'} played (${boardState.move.row},${boardState.move.col})` : 'Go to game start';
      return (
        // declare key as UUID for element in iterable
        <li key={turn}>
          <button onClick={() => this.jumpTo(turn)} 
          className={`button ${turn === this.state.stepNumber ? "selected" : ""}`}>{description}</button>
        </li>
      )
    })
    if(!this.state.ascending) {
      moves.reverse();
    }
    let status;
    if (noWinner) {
      status = `no Winner`;
    }
    else if (winner) {
      status = `Winner: ${winner}`;
      const winningLine = calculateWinningLine(getValues(current.squares));
      current.squares.forEach((currentObj, index) => {
        if (winningLine.includes(index)) {currentObj.highlight = true}
      });
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
    <button  onClick={() => this.toggleOrder()}>
      Toggle order - {`${this.state.ascending ? 'asc' : 'desc'}`}
      </button>
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
  return calculateWinnerTemplate(squares, winningLine => squares[winningLine[0]]);
}

/**
 * Retourne la liste des indices de la ligne gagnante, sinon null
 * @param {*} squares 
 */
function calculateWinningLine(squares) {
  return calculateWinnerTemplate(squares, winningLine => winningLine);
}

/**
 * Template de fonction lorsqu'il y a une ligne gagnante
 * @param {*} squares 
 * @param {*} callback fonction à appeler s'il y a une ligne gagnante
 */
function calculateWinnerTemplate(squares, callback) {

  const lines = getWinningCombinations();

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    // Les valeurs des trois cases sont identiques et non null
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return callback([a, b, c]);
    }
  }
  return null;
}

/**
 * Retourne true s'il ne peut y avoir de vainqueur  
 * Description : Vérifie qu'aucune combinaison ne peut être gagnée par un joueur  
 * i.e. chaque ligne contient à la fois un 'X' et un 'O'
 * @param {*} squares 
 */
function hasNoWinner(squares) {

  const winningCombinations = getWinningCombinations();

  const res = Array(winningCombinations.length).fill(null);

  for (let i = 0; i < winningCombinations.length; i++) {
    const testLine = squares.filter((current, index) => winningCombinations[i].includes(index));
    res[i] = (hasValue('X', testLine) && hasValue('O', testLine));
  }
  return res.every((current) => current === true);
}

/**
 * Retourne les combinaisons gagnantes
 */
function getWinningCombinations() {
  return [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
}

/**
 * Renvoie true si la ligne contient la valeur
 * @param {*} value valeur
 * @param {*} line ligne
 */
function hasValue(value, line) {
  return line.some((current) => current === value);
}

/**
 * Retourne la colonne et la rangée de la case
 * @param {*} index index de la case
 */
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

/**
 * Retourne les valeurs de chaque case
 * @param {*} squares les cases
 */
function getValues(squares) {
  return squares.map(current => current.value);
}