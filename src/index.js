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

    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
        }
    }

    renderSquare(i) {
      return ( 
      <Square value={this.state.squares[i]}
      onClick={() => this.handleClick(i)} 
      />
      );
    }

    /**
     * why IMMUTABILITY of state
     * * save previous states -> undo/redo history  
     * * easy to detect changes -> reference to object has changed == object has changed
     * * **pure component** -> detect when to re-render 
     * @param {*} i index du child Square
     */
    handleClick(i) {
        const squares = this.state.squares.slice();
        // ne pas re-render le Square s'il y a un vainqueur ou si la case a déjà une valeur
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
        });
    }
  
    /**
     * Affiche l'état des cases  
     * Affiche le gagnant s'il y en a un, sinon le joueur suivant
     */
    render() {
      const winner = calculateWinner(this.state.squares);
      let status;

      if (winner) {
          status = `Winner: ${winner}`;
      } else {
          status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
      }
  
      return (
        <div>
          <div className="status">{status}</div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
  }
  
  /**
   * renders board and additional info
   */
  class Game extends React.Component {
    render() {
      return (
        <div className="game">
          <div className="game-board">
            <Board />
          </div>
          <div className="game-info">
            <div>{/* status */}</div>
            <ol>{/* TODO */}</ol>
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