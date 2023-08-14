/*this file basically acts as model which is used to track states of the game
all the methods and properties declared in the class are used to track state of the 
game and derive other states from on preliminary state i.e moves played by player
*/

const initialValue = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allRounds: [],
  },
};


export default class Store extends EventTarget {
  /*state variable which is initialized with initial value 
   #state =
    initialValue; now local storage will be used to fetch initial state*/

  constructor(key, players) {
    super();
    this.storageKey = key;
    this.players = players;
  }
  /*the game method is deriving state from #state(state variable) indirectly with the help of 
getState method which simply return #state




*/

  get game() {
    const state = this.#getState();
    let currentPlayer = this.players[state.currentGameMoves.length % 2];
    /*
    this.players == [
   {id: 1,
    name: "Player 1",
    iconClass: "fa-o",
    colorClass: "yellow"},
    {id: 2,
    name: "Player 2",
    iconClass: "fa-x",
    colorClass: "turquoise"}
]
    state.moves.length % 2 === > with every move the moves array is being updated
     by pushing 
    {
      squareId,
      player: this.game.currentPlayer,
    } into it.

    Now its length % 2 will either return 0 or 1, if 0 => this.players[0], 
    if 1 => this.players[1]
    */

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    for (const player of this.players) {
      const selectedSquareIds = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedSquareIds.includes(v))) {
          winner = player;
        }
      }
    }

    return {
      currentPlayer,
      moves: state.currentGameMoves,
      status: {
        isComplete: (winner !== null) | (state.currentGameMoves.length === 9),
        winner,
      },
    };
  }
  /*
method responsible for pushing the derived state from the current move made 
the player

1)it takes squareId as an input
2)clones the current state so that origninal state doesn't get mutated
3)pushes the derived state consisting squareId(from the input)
and currentPlayer from game method
4) updates the original state with #saveState method
*/
  playerMove(squareId) {
    const stateClone = structuredClone(this.#getState());
    // const stateClone = structuredClone(state); redundant

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
    // console.log(stateClone);
  }

  /* a method used to simply return the current state */
  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialValue;
  }
  /*helps in tracking the new state as player makes the move

1) takes an input which could either be object or function
1.1) if a function then returned value from the function invoked gets stored 
as new state
1.2) if an object then stored as it is in new state
2)captures previous state in variable prevState 
3) updates the state i.e. this.#state with new state

*/
  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn(prevState);
        break;
      case "object":
        newState = stateOrFn;
        break;

      default:
        throw new Error("invalid state has been passed");
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("stateChange"));
  }

  reset() {
    const stateClone = structuredClone(this.#getState());

    const { moves, status } = this.game;
    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        status,
      });
    }
    stateClone.currentGameMoves = [];
    this.#saveState(stateClone);
  }

  newRound() {
    this.reset();
    const stateClone = structuredClone(this.#getState());
    stateClone.history.allRounds.push(...stateClone.history.currentRoundGames);
    stateClone.history.currentRoundGames = [];

    this.#saveState(stateClone);
  }

  get stats() {
    const state = this.#getState();
    return {
      playerWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...player,
          wins,
        };
      }),
      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }
}
