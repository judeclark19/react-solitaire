import CardClass from "@/components/Card/CardClass";
import { BoardType, SuitsArray, ValuesArray } from "./types";
import { makeAutoObservable } from "mobx";

export class GameState {
  deck: CardClass[] = [];
  suits: SuitsArray = ["hearts", "spades", "clubs", "diamonds"];
  values: ValuesArray = [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king"
  ];
  board: BoardType = {
    stock: [],
    waste: [],
    foundation1: [],
    foundation2: [],
    foundation3: [],
    foundation4: [],
    column1: [],
    column2: [],
    column3: [],
    column4: [],
    column5: [],
    column6: [],
    column7: []
  };

  constructor() {
    makeAutoObservable(this);
    this.createDeck();
  }

  createDeck(shuffle = false) {
    this.deck = [];

    for (let suit in this.suits) {
      for (let value in this.values) {
        const card = new CardClass(this.values[value], this.suits[suit]);
        this.deck.push(card);
      }
    }

    if (shuffle) {
      this.shuffleDeck();
    }
  }

  printDeck() {
    console.log(this.deck);
  }

  shuffleDeck() {
    let m = this.deck.length,
      t,
      i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = this.deck[m];
      this.deck[m] = this.deck[i];
      this.deck[i] = t;
    }
  }

  clearBoard() {
    this.board = {
      stock: [],
      waste: [],
      foundation1: [],
      foundation2: [],
      foundation3: [],
      foundation4: [],
      column1: [],
      column2: [],
      column3: [],
      column4: [],
      column5: [],
      column6: [],
      column7: []
    };
  }

  dealCards() {
    this.clearBoard();
    this.createDeck(true);

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < i + 1; j++) {
        const card = this.deck.pop();
        const columnIndex = `column${i + 1}` as keyof BoardType;
        if (j === i) {
          card?.setIsActive(true);
          card?.setIsFaceUp(true);
        }
        if (card) {
          this.board[columnIndex].push(card);
        }
      }
    }

    this.board.stock = this.deck;
    this.board.stock[this.board.stock.length - 1].setIsActive(true);
  }
}

const gameState = new GameState();
export default gameState;
