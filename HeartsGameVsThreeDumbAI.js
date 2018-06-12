$(document).ready(function () {
    var south = new ClickPlayer("Alice", $("#north_player")[0], $("#northplayer")[0], $("#eastplayer")[0], $("#playedcards")[0], $("#westplayer")[0], $("#yourhand")[0]);
    var east = new DumbAI("Bob")
    var north = new DumbAI("Carol");
    var west = new DumbAI("David");

    var match = new HeartsMatch(north, east, south, west);

    match.run();
});
