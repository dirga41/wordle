const targetNumbers = [];

const allPossibleNumbers = [];
var digits = ["0", "1", "2", "3", "4", "5", "6", "7"];
const NUMBER_LENGTH = 7;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");

var arr = generatePermutations(digits, 7);
arr.forEach((e) => allPossibleNumbers.push(e.join("")));

var targetNumber = allPossibleNumbers[Math.floor(Math.random() * 30240)];
while (targetNumber[0] === "0") {
  targetNumber = allPossibleNumbers[Math.floor(Math.random() * 30240)];
}

startInteraction();

function generatePermutations(list, size) {
  if (size > list.length) return [];
  else if (size == 1) return list.map((d) => [d]);
  return list.flatMap((d) =>
    generatePermutations(
      list.filter((a) => a !== d),
      size - 1
    ).map((item) => [d, ...item])
  );
}

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }

  if (e.target.matches("[data-info]")) {
    return;
  }

}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "DEL" || e.key === "Backspace") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[0-9]$/)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= NUMBER_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== NUMBER_LENGTH) {
    showAlert("Not enough numbers");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetNumber[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetNumber.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetNumber) {
    showAlert("You Win! Thank you for playing!", 5000);
    danceTiles(tiles);
    stopInteraction();
    shakeTiles(activeTiles);
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert("Your number was: " + targetNumber, null);
    stopInteraction();
    shakeTiles(activeTiles);
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}

function restartGame() {
  window.location.reload();
}

// Restart Game
$(".restart-button").click(function () {
  restartGame();
});

// Add Text Blocks

document.querySelector(".info").addEventListener("click", function () {
  document.querySelector(".box").classList.remove("hidden");

  setTimeout(() => {
    document.querySelector(".box").classList.add("hidden");
  }, 5000);
});

document.addEventListener("keydown", function (e) {
  if (
    e.key === "Escape" &&
    !document.querySelector(".box").classList.contains("hidden")
  ) {
    document.querySelector(".box").classList.add("hidden");
  }
});
