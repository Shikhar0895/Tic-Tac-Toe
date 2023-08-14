/*the view file acts view of the MVC architeture. It consists of all the methods that are 
required to reflect changes in the DOM. Two namespaces $ and $$ are defined for better organization 

constructor has properties referencing to the namespace*/
export default class View {
  $ = {};
  $$ = {};

  constructor() {
    this.$.menuBtn = this.#qs("[data-id = menu-btn]");
    this.$.menuItems = this.#qs("[data-id = menu-items]");
    this.$.resetBtn = this.#qs("[data-id = reset-btn]");
    this.$.newRoundBtn = this.#qs("[data-id = newRound-btn]");
    this.$.modal = this.#qs("[data-id = modal]");
    this.$.modalText = this.#qs("[data-id = modal-text]");
    this.$.modalBtn = this.#qs("[data-id = modal-btn]");
    this.$.turnIcon = this.#qs("[data-id = turn-icon]");
    this.$.turnText = this.#qs("[data-id = turn-text]");
    this.$.turnDiv = this.#qs("[data-id = turn]");
    this.$.p1Wins = this.#qs("[data-id = p1-wins]");
    this.$.p2Wins = this.#qs("[data-id = p2-wins]");
    this.$.ties = this.#qs("[data-id = ties]");
    this.$.grid = this.#qs("[data-id = grid]");

    this.$$.squares = this.#qsAll("[data-id = squares]");

    // UI only event listeners

    this.$.menuBtn.addEventListener("click", (event) => {
      this.#toggleMenu();
    });
  }

  render(game, stats) {
    const { playerWithStats, ties } = stats;
    const {
      currentPlayer,
      moves,
      status: { isComplete, winner },
    } = game;

    this.#closeAll();
    this.#clearBoard();
    this.#updateScore(playerWithStats[0].wins, playerWithStats[1].wins, ties);
    this.#initializeMove(moves);

    if (isComplete) {
      this.#openModal(winner ? `${winner.name} wins!` : "It's a Tie");
      return;
    }

    this.#setTurnIndicator(currentPlayer);
  }

  /**
   Register all event listeners 
   */
  bindGameResetEvent(handler) {
    this.$.resetBtn.addEventListener("click", handler);
    this.$.modalBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler) {
    this.#delegate(this.$.grid, "[data-id = squares]", "click", handler);
  }

  #delegate(el, selector, eventKey, handler) {
    el.addEventListener(eventKey, (event) => {
      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }

  /**
   DOM helper methods
   */

  #updateScore(p1Wins, p2Wins, ties) {
    this.$.p1Wins.innerText = `${p1Wins} Wins`;
    this.$.p2Wins.innerText = `${p2Wins} Wins`;
    this.$.ties.innerText = `${ties}`;
  }

  #openModal(message) {
    this.$.modal.classList.remove("hidden");
    this.$.modalText.innerText = message;
  }

  #closeAll() {
    this.#closeModal();
    this.#closeMenu();
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  #closeMenu() {
    this.$.menuItems.classList.add("hidden");
    this.$.menuBtn.classList.toggle("border");

    const icon = this.$.menuBtn.querySelector("i");
    icon.classList.add("fa-chevron-down");
    icon.classList.remove("fa-chevron-up");
  }

  #toggleMenu() {
    this.$.menuItems.classList.toggle("hidden");
    this.$.menuBtn.classList.toggle("border");

    const icon = this.$.menuBtn.querySelector("i");
    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }

  #qs(selector, parent) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) throw new Error("Could not find the element");

    return el;
  }

  #qsAll(selector) {
    const elList = document.querySelectorAll(selector);
    if (!elList) throw new Error("Could not find eleements");
    return elList;
  }

  #clearBoard() {
    this.$$.squares.forEach((square) => square.replaceChildren());
  }

  #initializeMove(moves) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);
      if (existingMove) {
        this.handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #setTurnIndicator(player) {
    const turnIcon = document.createElement("i");
    const turnLabel = document.createElement("p");
    turnLabel.innerHTML = `${player.name}, you're up!`;

    // if (playerId === 1) {
    //   turnIcon.classList.add("fa-solid", "fa-o", "yellow");
    //   turnLabel.classList.add("yellow");
    // } else if (playerId === 2) {
    //   turnIcon.classList.add("fa-solid", "fa-x", "turquoise");
    //   turnLabel.classList.add("turquoise");
    // }

    turnIcon.classList.add("fa-solid", player.iconClass, player.colorClass);
    turnLabel.classList.add(player.colorClass);

    this.$.turnDiv.replaceChildren(turnIcon, turnLabel);
  }

  handlePlayerMove(squareEl, player) {
    const squareIcon = document.createElement("i");
    squareIcon.classList.add("fa-solid", player.iconClass, player.colorClass);

    squareEl.replaceChildren(squareIcon);
  }
}
