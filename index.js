async function getRandomPokemon(numPokemonPairs) {
  // Set to store unique Pokemon ID
  const randomPokemon = new Set();
  // Array to store shuffled Pokemon ID
  const shuffledPokemon = [];

  //Generate Pokemon pairs based on difficulty
  while (randomPokemon.size < numPokemonPairs) {
    // Generate random Pokemon ID between 1 to 810
    const randomPokemonID = Math.floor(Math.random() * 810) + 1;
    // Add the Pokémon ID to the set (automatically handles uniqueness)
    randomPokemon.add(randomPokemonID);
    // Push the Pokémon ID twice into the shuffled array to make pairs
    shuffledPokemon.push(randomPokemonID, randomPokemonID);
  }
  // Shuffle the array of Pokémon IDs
  shuffledPokemon.sort(() => Math.random() - 0.5);

  // Generate Pokémon cards
  for (let i = 0; i < shuffledPokemon.length; i++) {
    const pokemonID = shuffledPokemon[i];
    // Fetch Pokémon image from the PokéAPI
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`);
    // Generate a card for the Pokémon
    $("#gameGrid").append(`
      <div class="pokeCard">
        <img id="img${i}" class="front_face" src=${res.data.sprites.other["official-artwork"].front_default} alt="">
        <img class="back_face" src="back.webp" alt="">
      </div>
    `);
  }
}

/* Sets up the whole functionality of the memory card game */
const setup = () => {

  // Reset Button Event Listener
  $("#reset").click(function () {
    location.reload();
  });

  // Event listeners for users to switch between dark and light mode
  $("#darkMode").click(function () {
    $("body").css("background-color", "black");
    $(".dashboard").css("color", "white");
    $(".dashboard").css("border", "1px solid white");
  });
  $("#lightMode").click(function () {
    $("body").css("background-color", "white");
    $(".dashboard").css("color", "black");
    $(".dashboard").css("border", "1px solid black");
  });

  // Set Difficulty
  var difficulty = '';

  $("#easy").click(function () {
    difficulty = "easy";
  });
  $("#normal").click(function () {
    difficulty = "normal";
  });
  $("#hard").click(function () {
    difficulty = "hard";
  });

  // Starts the game
  function startGame() {
    // Remove Start button once game starts and display game status bar
    $("#start").css("display", "none");
    $("#info").css("display", "");

    // Initial variable declaration
    var firstCard = undefined;
    var secondCard = undefined;
    var totalPairs = 0;
    var matches = 0;
    var clicks = 0;
    var moves = 0;
    var matchesLeft = totalPairs;
    var timer = 0;
    var finalTime = 0;

    // Assign values to variables based on difficulty and size of game grid
    switch (difficulty) {
      case "easy":
        totalPairs = 3;
        timer = 30;
        $("#gameGrid").css("width", "300px");
        $("#gameGrid").css("height", "200px");
        break;
      case "normal":
        totalPairs = 6;
        timer = 120;
        $("#gameGrid").css("width", "400px");
        $("#gameGrid").css("height", "300px");
        break;
      default:
        totalPairs = 12;
        timer = 180;
        $("#gameGrid").css("width", "600px");
        $("#gameGrid").css("height", "400px");
    }
    matchesLeft = totalPairs;

    // Display Dashboard variable values
    $("#moves").text(moves);
    $("#total").text(totalPairs);
    $("#matches").text(matches);
    $("#left").text(matchesLeft - matches);
    $("#timer").text(timer);
    $("#time").text(timer);

    // Sets the timer for the game
    let timerInterval = setInterval(() => {
      timer--;
      finalTime++;
      $("#time").text(timer);

      if (timer === 0) {
        clearInterval(timerInterval);
        $(".modal-timeout").show();
        return;
      }
    }, 1000);


    // Generates random pairs of Pokémon for the card game
    getRandomPokemon(totalPairs).then(() => {

      // Power Up function that allows the user to view all the cards face up for 1.5 second
      $("#powerUp").one("click", function () {
        // Disable the powerUp button
        $(this).prop("disabled", true);
        // Turn all cards face up
        $(".pokeCard").addClass("flip disabled");

        // Delay for 1.5 seconds
        setTimeout(() => {
          // Check each card for matches
          $(".pokeCard").each(function () {
            if (!$(this).hasClass("matched")) {
              // Turn unmatched cards face down
              $(this).removeClass("flip disabled");
            }
          });
        }, 1500);
      });

      // Event handler for the click on elements with the class "pokeCard"
      $(".pokeCard").on("click", function () {
        if (!firstCard) {
          // If firstCard is not assigned, assign it to the clicked element's first child with class "front_face"
          firstCard = $(this).find(".front_face")[0];
          $(this).toggleClass("flip");
          $(this).toggleClass("disabled"); // Toggle the class "disabled" on the clicked element
          clicks++;
          $("#clicks").text(clicks);
        } else {
          // If the clicked element's first child with class "front_face" is equal to firstCard, return and do nothing
          if ($(this).find(".front_face")[0] === firstCard) {
            return;
          }
          if (!secondCard) {
            // If secondCard is not assigned, assign it to the clicked element's first child with class "front_face"
            secondCard = $(this).find(".front_face")[0];
            $(this).toggleClass("flip");
            $(this).toggleClass("disabled"); // Toggle the class "disabled" on the clicked element
            clicks++;
            $("#clicks").text(clicks);
            // Tracks number of moves which is when the user clicks the second card
            moves++;
            $("#moves").text(moves);
          } else {
            // If secondCard already has a value, return and do nothing
            return;
          }
          
          if (firstCard.src == secondCard.src) {
            matches++;
            $("#matches").text(matches);
            $("#left").text(matchesLeft - matches);

            // Mark the matched cards
            $(`#${firstCard.id}`).parent().addClass("matched");
            $(`#${secondCard.id}`).parent().addClass("matched");

            // Remove the click event handlers for matched cards
            $(`#${firstCard.id}`).parent().off("click");
            $(`#${secondCard.id}`).parent().off("click");

            // Reset cards to undefined
            firstCard = undefined;
            secondCard = undefined;
          } else {
            setTimeout(() => {
              // Flip back the unmatched cards after 1 second
              $(`#${firstCard.id}`).parent().toggleClass("flip");
              $(`#${firstCard.id}`).parent().toggleClass("disabled");
              $(`#${secondCard.id}`).parent().toggleClass("flip");
              $(`#${secondCard.id}`).parent().toggleClass("disabled");
              // Reset cards to undefined

              firstCard = undefined;
              secondCard = undefined;
            }, 1000);
          }
        }

        // Ends the game and stops everything once the player wins
        if (matches === totalPairs) {
          setTimeout(() => {
            $("#final-moves").text(moves);
            $("#final-time").text(finalTime);
            $(".modal").show(); // Display the modal with the class "modal"
            clearInterval(timerInterval);
          }, 1000);
        }
      });
    });
  }
  $("#start").click(function () {
    startGame();
  });
};

$(document).ready(setup);