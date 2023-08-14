import View from "./view.js";
import Store from "./store.js";

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
];

function init() {
  const view = new View();
  const store = new Store("live-t3-storage-key", players);
  //current tab state changes
  store.addEventListener("stateChange", () => {
    view.render(store.game, store.stats);
  });

  //different tab state changes
  window.addEventListener("storage", () => {
    console.log("state changed from another tab");
    view.render(store.game, store.stats);
  });

  //first load of the document
  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    store.reset();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    //advance to next player by pushing move to moves array
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", init);
