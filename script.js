const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const game = document.querySelector(".game");

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

async function loadPokemons() {
  const randomPokemonIds = generateRandomIds();

  const pokePromises = randomPokemonIds.map((id) => fetch(pokeAPIBaseUrl + id));
  const responses = await Promise.all(pokePromises);
  return await Promise.all(responses.map((res) => res.json()));
}

function generateRandomIds() {
  const randomIds = new Set();
  while (randomIds.size < 8) {
    const randomNumber = Math.ceil(Math.random() * 150);
    randomIds.add(randomNumber);
  }
  return [...randomIds];
}

function displayPokemons(pokemons) {
  pokemons.sort(() => Math.random() - 0.5);
  const pokemonsHTML = pokemons
    .map((pokemon) => {
      const type = pokemon.types[0].type.name || "normal";
      const color = colors[type];
      return `
        <div class="card" style="background-color:${color}" onclick="clickCard(event)" data-pokename="${
        pokemon.name
      }">
            <div class="front"></div>
            <div class="back rotated" style="background-color:${color}">
            <img src="${pokemon.sprites.front_default}" alt=${pokemon.name}/>
            <h2>${pokemon.name[0].toLocaleUpperCase()}${pokemon.name.slice(
        1
      )}</h2>
            </div>
        </div>
    `;
    })
    .join("");
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
      if (matches === 8) {
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

function resetGame() {
  game.innerHTML = "";
  isPaused = true;
  firstPick = null;
  matches = 0;
  setTimeout(async () => {
    const pokemons = await loadPokemons();
    displayPokemons(pokemons.concat(pokemons));
    isPaused = false;
  }, 100);
}

resetGame();
