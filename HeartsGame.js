var ClickPlayer = function (name, ui_div, northplayer, eastplayer, playedcards, westplayer, yourhand) {

    var match = null;
    var position = null;
    var current_game = null;
    var player_key = null;

    var ui_message_log = $("<div class='click_player_message_log'></div>");
    var ui_input_form = $("<form class='click_player_input_form'><input type='text' class='click_player_input'></form>");

    $(ui_div).append(ui_message_log).append(ui_input_form);

    this.setupMatch = function (hearts_match, pos) {
	match = hearts_match;
	position = pos;

  enterName();
    }



    this.getName = function () {
	return name;
    }

    this.setupNextGame = function (game_of_hearts, pkey) {
	current_game = game_of_hearts;
	player_key = pkey;

  $(".northscore").empty();
  $(".eastscore").empty();
  $(".yourscore").empty();
  $(".westscore").empty();
  updatescoreboard();

  game_of_hearts.registerEventHandler(Hearts.GAME_STARTED_EVENT, function(e){
    $(".northplayed").empty();
    $(".eastplayed").empty();
    $(".yourplayed").empty();
    $(".westplayed").empty();
    newCards();
    $(".turnindication").empty();
    $(".turnindication").append("<h2>Your turn!</h2>");
    $(".trickwinner").empty();


    // $(".usercards").each(function(){
    //   this.onclick=function(){
    //     $(".usercards").toggleClass("selected");
    //   }
    // })

  });

  game_of_hearts.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT, function(e){
    updateCards();
  });

  game_of_hearts.registerEventHandler(Hearts.CARD_PLAYED_EVENT, function(e){
    //playFunction(e);
    playedCards(e);
    updateCards();

  });

  game_of_hearts.registerEventHandler(Hearts.TRICK_START_EVENT, function(e){
    //alert("trick start");
    updateCards();
    $(".turnindication").empty();
    yourturn(e);

  });

  game_of_hearts.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, function(e){
    //alert("trick continue");
    $(".turnindication").empty();
    yourturntrickcontinue(e);
  });

  game_of_hearts.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, function(e){
    //alert("trick over");
    //$("#playedcards").empty();
    $(".trickwinner").empty();
    appendwinner(e);
  });

	game_of_hearts.registerEventHandler(Hearts.ALL_EVENTS, function (e) {
	    message_log_append($("<div class='click_player_message'>"+e.toString()+"</div>"));
	});




    }

    var message_log_append = function (msg) {
	ui_message_log.append($(msg));
	ui_message_log.scrollTop(ui_message_log.prop("scrollHeight")-ui_message_log.height());
    }

    ui_input_form.on('submit', function (e) {
	e.preventDefault();
	var cmd = $(this).find('.click_player_input').val().split(" ");
	action = cmd[0];
	if (action == "pass") {
	    var cards = [new Card(Card.parseRank(cmd[1]), Card.parseSuit(cmd[2])),
			 new Card(Card.parseRank(cmd[3]), Card.parseSuit(cmd[4])),
			 new Card(Card.parseRank(cmd[5]), Card.parseSuit(cmd[6]))];
	    if (!current_game.passCards(cards, player_key)) {
		message_log_append($("<div class='click_player_message error'>Card pass failed!</div>"));
	    } else {
		message_log_append($("<div class='click_player_message'>Cards passed. Waiting for first trick to start.</div>"));
	    }
	} else if (action == "showPlayable") {
	    var playable = current_game.getHand(player_key).getPlayableCards(player_key);
	    var playable_message = $("<div class='click_player_message'>Playable cards:</div>");
	    var playable_list = $("<ul></ul>");
	    playable.forEach(function (c) {
		playable_list.append($("<li>"+c.toString()+"</li>"));
	    });
	    playable_message.append(playable_list);
	    message_log_append(playable_message);
	} else if (action == "showDealt") {
	    var dealt = current_game.getHand(player_key).getDealtCards(player_key);
	    var dealt_message = $("<div class='click_player_message'>Dealt cards:</div>");
	    var dealt_list = $("<ul></ul>");
	    dealt.forEach(function (c) {
		dealt_list.append($("<li>"+c.toString()+"</li>"));
	    });
	    dealt_message.append(dealt_list);
	    message_log_append(dealt_message);
	} else if (action == "play") {
	    var card_to_play = new Card(Card.parseRank(cmd[1]), Card.parseSuit(cmd[2]));
	    if (!current_game.playCard(card_to_play, player_key)) {
		message_log_append($("<div class='click_player_message error'>Attempt to play " +
					card_to_play.toString() + " failed!</div>"));
	    }
	} else if (action == "autoplay") {
	    var autoplay_handler = function (e) {
		if (current_game.getNextToPlay() == position) {
		    current_game.playCard(current_game.getHand(player_key).getPlayableCards(player_key)[0],
					  player_key);
		}
	    }

	    current_game.registerEventHandler(Hearts.TRICK_START_EVENT, autoplay_handler);
	    current_game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, autoplay_handler);
	    autoplay_handler();
	} else if (action == "scoreboard") {
	    var sb = match.getScoreboard();
	    message_log_append($("<div class='click_player_message'>Scoreboard:<ul>"+
				    "<li>"+match.getPlayerName(Hearts.NORTH)+": " +
				    sb[Hearts.NORTH] + "</li>" +
				    "<li>"+match.getPlayerName(Hearts.EAST)+": " +
				    sb[Hearts.EAST] + "</li>" +
				    "<li>"+match.getPlayerName(Hearts.SOUTH)+": " +
				    sb[Hearts.SOUTH] + "</li>" +
				    "<li>"+match.getPlayerName(Hearts.WEST)+": " +
				    sb[Hearts.WEST] + "</li>" +
				    "</ul></div>"));
	}else {
	    message_log_append($("<div class='click_player_message error'>Unknown action: " + action + "</div>"));
	}
	// Clear click input
	$(this).find('.click_player_input').val("")
    });


    var CardMap = {
            "Two of Clubs": "cardClubs2",
            "Two of Diamonds": "cardDiamonds2",
            "Two of Hearts": "cardHearts2",
            "Two of Spades": "cardSpades2",
            "Three of Clubs": "cardClubs3",
            "Three of Diamonds": "cardDiamonds3",
            "Three of Hearts": "cardHearts3",
            "Three of Spades": "cardSpades3",
            "Four of Clubs": "cardClubs4",
            "Four of Diamonds": "cardDiamonds4",
            "Four of Hearts": "cardHearts4",
            "Four of Spades": "cardSpades4",
            "Five of Clubs": "cardClubs5",
            "Five of Diamonds": "cardDiamonds5",
            "Five of Hearts": "cardHearts5",
            "Five of Spades": "cardSpades5",
            "Six of Clubs": "cardClubs6",
            "Six of Diamonds": "cardDiamonds6",
            "Six of Hearts": "cardHearts6",
            "Six of Spades": "cardSpades6",
            "Seven of Clubs": "cardClubs7",
            "Seven of Diamonds": "cardDiamonds7",
            "Seven of Hearts": "cardHearts7",
            "Seven of Spades": "cardSpades7",
            "Eight of Clubs": "cardClubs8",
            "Eight of Diamonds": "cardDiamonds8",
            "Eight of Hearts": "cardHearts8",
            "Eight of Spades": "cardSpades8",
            "Nine of Clubs": "cardClubs9",
            "Nine of Diamonds": "cardDiamonds9",
            "Nine of Hearts": "cardHearts9",
            "Nine of Spades": "cardSpades9",
            "Ten of Clubs": "cardClubs10",
            "Ten of Diamonds": "cardDiamonds10",
            "Ten of Hearts": "cardHearts10",
            "Ten of Spades": "cardSpades10",
            "Jack of Clubs": "cardClubsJ",
            "Jack of Diamonds": "cardDiamondsJ",
            "Jack of Hearts": "cardHeartsJ",
            "Jack of Spades": "cardSpadesJ",
            "Queen of Clubs": "cardClubsQ",
            "Queen of Diamonds": "cardDiamondsQ",
            "Queen of Hearts": "cardHeartsQ",
            "Queen of Spades": "cardSpadesQ",
            "King of Clubs": "cardClubsK",
            "King of Hearts": "cardHeartsK",
            "King of Diamonds": "cardDiamondsK",
            "King of Spades": "cardSpadesK",
            "Ace of Clubs": "cardClubsA",
            "Ace of Diamonds": "cardDiamondsA",
            "Ace of Hearts": "cardHeartsA",
            "Ace of Spades": "cardSpadesA",
    }

    var updatescoreboard = function(){
      var sb = match.getScoreboard();

      $(".northscore").append("<h3>North's Score:" + " " + sb[Hearts.NORTH] + "</h3>");
      $(".eastscore").append("<h3>East's Score:" + " " + sb[Hearts.EAST] + "</h3>");
      $(".yourscore").append("<h3>Your Score:" + " " + sb[Hearts.SOUTH] + "</h3>");
      $(".westscore").append("<h3>West's Score:" + " " + sb[Hearts.NORTH] + "</h3>");

    }

    var enterName = function(){
      var person = prompt("Enter Your Name.", "PlayerOne");
      $(".name").append("<h2>I am " + person + "!" + "</h2>");
    }

    var yourturn = function(e){
      $(".turnindication").empty();
      if(e.getStartPos() == "South"){
          $(".turnindication").append("<h2>Your turn!</h2>");
      }
      else{
        $(".turnindication").empty();
      }
    }

    var appendwinner = function(e){
      if(e.getTrick().getWinner() != "South"){
        $(".trickwinner").append("<h2>" + e.getTrick().getWinner() + " Player won the trick!</h2>");
      }
      else{
        $(".trickwinner").append("<h2>You won the trick!</h2>");
      }
    }

    var yourturntrickcontinue = function(e){
      $(".turnindication").empty();
      if(e.getNextPos() == "South"){
          $(".turnindication").append("<h2>Your turn!</h2>");
      }
      else{
        $(".turnindication").empty();
      }
    }

    var newCards = function(){
      $(".yourcards").empty();

      var dealt = current_game.getHand(player_key).getDealtCards(player_key);
      var unplayed = current_game.getHand(player_key).getUnplayedCards(player_key);

      dealt.forEach(function (c){
          $(".yourcards").append("<th>" + "<img id=" + CardMap[c.toString()] + " class=imgcards" + " " + "src=cards/" + CardMap[c.toString()] + ".png" + " " + "style=width:100px;height:150px;>" + "</th>");
      });

      if(current_game.getStatus() == Hearts.PASSING){
        $(".imgcards").on("click", passFunction);  //selectable cards during passing
      }

    }

    var updateCards = function(){
      $(".yourcards").empty();

      var dealt = current_game.getHand(player_key).getDealtCards(player_key);
      var unplayed = current_game.getHand(player_key).getUnplayedCards(player_key);
      var playableCards = current_game.getHand(player_key).getPlayableCards(player_key);

      unplayed.forEach(function(c){
          $(".yourcards").append("<th>" + "<img id=" + CardMap[c.toString()] + " class=imgcards" + " " + "src=cards/" + CardMap[c.toString()] + ".png" + " " + "style=width:100px;height:150px;>" + "</th>");
      });

      playableCards.forEach(function(c) {
          $(".yourcards").find("#" + CardMap[c.toString()] + "").addClass("playable");
          $(".yourcards").find("#" + CardMap[c.toString()] + "").on("click", playFunction);
      });

    }


    var buttontopass = document.getElementById("buttontopass");
    buttontopass.onclick = function (){
        var unplayed = current_game.getHand(player_key).getUnplayedCards(player_key);
        var selected = [];
        var passedCards = [];
        var unplayedstring = unplayed.map(c => c.toString());
        Array.from($(".selected")).forEach(c => selected.push(c.id));

        for (var i = 0; i < unplayed.length; i++){
                for (var j = 0; j < selected.length; j++){
                    if (CardMap[unplayedstring[i]] == selected[j]){
                        passedCards.push(unplayed[i]);
                    }
                }
            }
            if(current_game.getStatus() == Hearts.PASSING){
                if(!current_game.passCards(passedCards, player_key)){
                    passFunction();
                }
                else{
                    $(".yourcards").find((".selected")).removeClass("selected");
                    current_game.passCards(passedCards, player_key);
                    passedCards = [];
                }
            }
    }

    var buttontoplay = document.getElementById("buttontoplay");
    buttontoplay.onclick = function (){
        var unplayed = current_game.getHand(player_key).getUnplayedCards(player_key);
        var selected = [];
        var playedCard = [];
        var unplayedstring = unplayed.map(c => c.toString());
        Array.from($(".selected")).forEach(c => selected.push(c.id));
        for (var i = 0; i < unplayed.length; i++){
                for (var j = 0; j < selected.length; j++){
                    if (CardMap[unplayedstring[i]] == selected[j]){
                        playedCard.push(unplayed[i]);
                    }
                }
            }
            if(!current_game.playCard(playedCard[0], player_key)){
                if(!current_game.passCards(playedCard, player_key)){
                    playFunction();
                }
                else{
                    $(".yourcards").find((".selected")).removeClass("selected");
                    current_game.passCards(playedCard, player_key);
                    passedCards = [];
                }
            }
    }

    var passFunction = function (){
        if($(".selected").length == 3){
            if($(this).hasClass("selected")){
                $(this).toggleClass("selected");
            }
            else{
                $(".selected").first().toggleClass("selected");
                $(this).toggleClass("selected");
            }
        }
        else{
            //alert("must pass 3 cards")
            $(this).toggleClass("selected");
        }
    }

    var playFunction = function (e){
        if($(".selected").length == 1){
            if($(this).hasClass("selected")){
                $(this).toggleClass("selected");
            }
            else{
                $(".selected").first().toggleClass("selected");
                $(this).toggleClass("selected");
            }
        }
        else{
            //alert("can only play 1 card");
            $(this).toggleClass("selected");
        }

    }

     var playedCards = function(e){
            if(e.getPosition() == "North"){
              $(".northplayed").empty();
              $(".northplayed").append("<h3>North's Card-></h3>\n" + "<img id=" + CardMap[e.getCard()] + " class=imgcards" + " " + "src=cards/" + CardMap[e.getCard()] + ".png" + " " + "style=width:100px;height:150px;>");
            }
            if(e.getPosition() == "East"){
              $(".eastplayed").empty();
              $(".eastplayed").append("<h3>East's Card-></h3>\n" + "<img id=" + CardMap[e.getCard()] + " class=imgcards" + " " + "src=cards/" + CardMap[e.getCard()] + ".png" + " " + "style=width:100px;height:150px;>");
            }
            if(e.getPosition() == "South"){
              $(".yourplayed").empty();
              $(".yourplayed").append("<h3>Your Card-></h3>\n" + "<img id=" + CardMap[e.getCard()] + " class=imgcards" + " " + "src=cards/" + CardMap[e.getCard()] + ".png" + " " + "style=width:100px;height:150px;>");
            }
            if(e.getPosition() == "West"){
              $(".westplayed").empty();
              $(".westplayed").append("<h3>West's Card-></h3>\n" + "<img id=" + CardMap[e.getCard()] + " class=imgcards" + " " + "src=cards/" + CardMap[e.getCard()] + ".png" + " " + "style=width:100px;height:150px;>");
            }
      }


    var northplayer = $(

      "<div id= \"northplayer\">\n" +
        "<div class= \"iamnorthplayer\">\n" +
          "<h2>I am North Player!</h2>\n" +
        "</div>"

        +

        "<div class= \"northcards\">\n" +
          "<img src=\"legendpogchamp.png\" alt=\"HTML5 Icon\" style=\"width:100px;height:150px;\">\n" +
        "</div>"

        +

        "<div class= \"northscore\">\n" +

        "</div>" +

      "</div>");

      $("#northplayer").append(northplayer);

      var eastplayer = $(
          "<div id= \"eastplayer\">\n" +

            "<div class=\"iameastplayer\">\n" +
              "<h2>I am East Player!</h2>\n" +
            "</div>" +

            "<div class= \"eastcards\">\n" +
              "<img src=\"legendpogchamp.png\" alt=\"HTML5 Icon\" style=\"width:100px;height:150px;\">\n" +
            "</div>" +

            "<div class= \"eastscore\">\n" +

            "</div>" +

          "</div>");

        $("#eastplayer").append(eastplayer);

        var playedcards= $(
          "<div id= \"playedcards\">\n" +
            "<h3>Played cards here---></h3>" +

              "<div class = \"northplayed\">\n" + "" + "</div>" +
              "<div class = \"eastplayed\">\n" + "" + "</div>" +
              "<div class = \"yourplayed\">\n" + "" + "</div>" +
              "<div class = \"westplayed\">\n" + "" + "</div>" +

          "</div>");

        $("#playedcards").append(playedcards);

        var westplayer=$(
          "<div id= \"westplayer\">\n" +

            "<div class=\"iamwestplayer\">\n" +
              "<h2>I am West Player!</h2>\n" +
            "</div>" +

            "<div class= \"westcards\">\n" +
              "<img src=\"legendpogchamp.png\" alt=\"HTML5 Icon\" style=\"width:100px;height:150px;\">\n" +
            "</div>" +

            "<div class= \"westscore\">\n" +

            "</div>" +

          "</div>");

          $("#westplayer").append(westplayer);

        var yourhand = $(
          "<div id= \"yourhand\">\n" +

            "<div class = \"turnindication\">\n" + "" + "</div>" +
            "<div class = \"trickwinner\">\n" + "" + "</div>" +

            "<div class= \"name\">\n" +

            "</div>"

            +

            "<div class= \"yourcards\">\n" +

            "</div>"

            +

            "<div class= \"yourscore\">\n" +

            "</div>" +

          "</div>");

          $("#yourhand").append(yourhand);

}
