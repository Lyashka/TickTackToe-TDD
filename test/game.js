import {expect} from 'chai';
import sinon from 'sinon';
import Game from '../src/Game';
import GameBuilder from './GameBuilder';

import {
  USER_NAME,
  COMPUTER_NAME,
  USER_MOVE_SYMBOL,
  COMPUTER_MOVE_SYMBOL,
  INITIAL_GAME_BOARD,
} from '../src/const';

let game;

beforeEach(() => { game = new Game() });

const fillCells = (game, config={}) => {
  const { x = -1, y=-1 } = config;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i !== x || j !== y)  {
        game.acceptUserMove(i, j);
      }
    }
  }
}

const count = (arr, symbol) =>
  arr.reduce((result, row) => {
    return row.reduce((count, el) => {
      return el === symbol ? ++count : count;
    }, result)
  }, 0)

describe('Game', () => {
  it('Should return empty game board', () => {
    const board = game.getState();

    expect(board).to.deep.equal(INITIAL_GAME_BOARD);
  })
})

it('Writes user\'s symbol in cell with given coordinates', () => {
  const x = 1, y = 1;

  game.acceptUserMove(x, y);
  const board = game.getState();

  expect(board[x][y]).to.equal(USER_MOVE_SYMBOL);
})

it('Throws an exception if user moves in taken cell', () => {
  const x = 2, y = 2;

  game.acceptUserMove(x, y);
  const func = game.acceptUserMove.bind(game, x, y);

  expect(func).to.throw('cell is already taken');
})

it('Game saves user\'s move in history', () => {
  const x = 1, y = 1;

  game.acceptUserMove(x, y);
  const history = game.getMoveHistory();

  expect(history).to.deep.equal([{turn: USER_NAME, x, y}]);
})

it('Game saves computers\'s move in history', () => {
  const stub = sinon.stub(Math, 'random').returns(0.5);

  game.createComputerMove();
  const history = game.getMoveHistory();

  expect(history).to.deep.equal([{turn: COMPUTER_NAME, x: 1, y: 1}]);
  stub.restore();
})

it('Game saves 1 user\'s move and 1 computer\'s move in history', () => {
  const x = 1, y = 1;

  game.acceptUserMove(x, y);
  game.createComputerMove();
  const history = game.getMoveHistory();

  expect(history.length).to.equal(2);
  expect(history[0].turn).to.equal(USER_NAME);
  expect(history[1].turn).to.equal(COMPUTER_NAME);
})

it('Computer moves in randomly chosen cell', () => {
  const stub = sinon.stub(Math, 'random').returns(0.5);

  game.createComputerMove();
  const board = game.getState();

  expect(board[1][1]).to.equal(COMPUTER_MOVE_SYMBOL);
  stub.restore();
})

it('Computer moves in cell that is not taken', () => {
  fillCells(game, {x: 2, y:2});

  game.createComputerMove();
  const board = game.getState();

  expect(count(board, USER_MOVE_SYMBOL)).to.equal(8);
  expect(count(board, COMPUTER_MOVE_SYMBOL)).to.equal(1);
  expect(board[2][2]).to.equal(COMPUTER_MOVE_SYMBOL);
})

it('If there are no free cells computer throws an exception', () => {
  fillCells(game);

  const func = game.createComputerMove.bind(game);
  expect(func).to.throw('no cells available');
})

it('Checks if user won by horizontal', () => {
  const game = new GameBuilder()
    .withBoardState(`
      x x x
      . . .
      . . .`)
    .build();

  const userWon = game.isWinner(USER_NAME);
  expect(userWon).to.equal(true);
})

it('Checks if user has won by vertical', () => {
  const game = new GameBuilder()
    .withBoardState(`
      x . .
      x . .
      x . .`)
    .build();

  const userWon = game.isWinner(USER_NAME);
  expect(userWon).to.equal(true);
})

it('Checks if user has won by main diagonal', () => {
  const game = new GameBuilder()
    .withBoardState(`
    x . .
    . x .
    . . x`)
    .build();

  const userWon = game.isWinner(USER_NAME);
  expect(userWon).to.equal(true);
})

it('Checks if user has won by secondary diagonal', () => {
  const game = new GameBuilder()
    .withBoardState(`
      . . x
      . x .
      x . .`)
    .build();

  const userWon = game.isWinner(USER_NAME);
  expect(userWon).to.equal(true);
})

it('Checks if there is winner', () => {
  const game = new GameBuilder()
    .withBoardState(`
      x x x
      . . .
      . . .`)
    .build();

  const state = game.checkGame();
  expect(state).to.equal(`${USER_NAME} won!`);
})

it('Checks if there are no winners', () => {
  const game = new GameBuilder()
    .withBoardState(`
      . x x
      . . .
      . . .`)
    .build();

  const state = game.checkGame();
  expect(state).to.equal(`continue`);
})

it('Returns game board size', () => {
  const size = game.getSize();
  
  expect(size).to.deep.equal(3);
})

it('Check that all cells are free', () => {
  const freeCells = game.getFreeCells();

  expect(freeCells).to.deep.equal(INITIAL_GAME_BOARD);
})
