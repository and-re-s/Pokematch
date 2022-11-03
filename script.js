const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const game = document.querySelector(".game");
const selector = document.querySelector(".selector");

let numOfPokemons;
let isPaused = false;
let firstPick;
let matches;

const colors = {
  fire: "#FDDFDF",
  grass: "#DEFDE0",
  electric: "#FCF7DE",
  water: "#DEF3FD",
  ground: "#f4e7da",
  rock: "#d5d5d4",
  fairy: "#fceaff",
  poison: "#98d7a5",
  bug: "#f8d5a3",
  dragon: "#97b3e6",
  psychic: "#eaeda1",
  flying: "#F5F5F5",
  fighting: "#E6E0D4",
  normal: "#F5F5F5",
};

function redrawBoard(size = selector.value) {
  resetGame(size);
}

async function loadPokemons(amount) {
  const randomPokemonIds = generateRandomIds(amount);

  const pokePromises = randomPokemonIds.map((id) => fetch(pokeAPIBaseUrl + id));
  const responses = await Promise.all(pokePromises);
  return await Promise.all(responses.map((res) => res.json()));
}

function generateRandomIds(amountOfCards) {
  const randomIds = new Set();
  while (randomIds.size < amountOfCards) {
    const randomNumber = Math.ceil(Math.random() * 150);
    randomIds.add(randomNumber);
  }
  return [...randomIds];
}

function displayPokemons(pokemons) {
  pokemons.sort(() => Math.random() - 0.5);
  if (numOfPokemons === 12) {
    pokemons.splice(12, 0, pokemons[11]);
  }
  const pokemonsHTML = pokemons
    .map((pokemon, index) => {
      const type = pokemon.types[0].type.name || "normal";
      const color = colors[type];
      const emptyMidCard5x5Board = `
      <div class="empyMidCard">
      </div>`;
      let pokeCard = `
      <div class="card" style="background-color:${color}" onclick="clickCard(event)" data-pokename="${
        pokemon.name
      }">
          <div class="front"></div>
          <div class="back rotated" style="background-color:${color}">
          <img src="${pokemon.sprites.front_default}" alt=${
        pokemon.name
      } style="width:70%;"/>
          <h2>${pokemon.name[0].toLocaleUpperCase()}${pokemon.name.slice(
        1
      )}</h2>
          </div>
      </div>
  `;
      if (numOfPokemons === 12 && index === 12) return emptyMidCard5x5Board;
      return pokeCard;
    })
    .join("");
  game.setAttribute(
    "style",
    `grid-template-columns: repeat(${selector.value}, 175px); grid-template-rows: repeat(${selector.value}, 175px);`
  );
  game.innerHTML = pokemonsHTML;
}

function clickCard(event) {
  const pokemonCard = event.currentTarget;
  const [front, back] = getFrontAndBackOfCard(pokemonCard);

  if (front.classList.contains("rotated") || isPaused) return;

  isPaused = true;

  rotateElements([front, back]);

  if (!firstPick) {
    firstPick = pokemonCard;
    isPaused = false;
  } else {
    const firstPokemonName = firstPick.dataset.pokename;
    const secondPokemonName = pokemonCard.dataset.pokename;

    if (firstPokemonName !== secondPokemonName) {
      const [firstFront, firstBack] = getFrontAndBackOfCard(firstPick);
      setTimeout(() => {
        rotateElements([front, back, firstFront, firstBack]);
        firstPick = null;
        isPaused = false;
      }, 500);
    } else {
      matches += 1;
      if (matches === numOfPokemons) {
        console.log("winner");
      }
      firstPick = null;
      isPaused = false;
    }
  }
}

function rotateElements(elements) {
  if (typeof elements !== "object" || !elements.length) return;
  elements.forEach((element) => element.classList.toggle("rotated"));
}

function getFrontAndBackOfCard(card) {
  const front = card.querySelector(".front");
  const back = card.querySelector(".back");
  return [front, back];
}

function resetGame(boardSize = selector.value) {
  game.innerHTML = "";
  isPaused = true;
  firstPick = null;
  matches = 0;

  if (boardSize === "4") numOfPokemons = 8;
  if (boardSize === "5") numOfPokemons = 12;
  if (boardSize === "6") numOfPokemons = 18;

  setTimeout(async () => {
    const pokemons = await loadPokemons(numOfPokemons);
    console.log(pokemons);
    displayPokemons(pokemons.concat(pokemons));
    isPaused = false;
  }, 100);
}

resetGame(selector.value);

selector.addEventListener("change", () => {
  redrawBoard(selector.value);
});
