import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import List "mo:base/List";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Timer "mo:base/Timer";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import InviteLinksModule "invite-links/invite-links-module";
import Random "mo:base/Random";

actor FanForge {
  let storage = Storage.new();
  include MixinStorage(storage);

  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

  var userHubs = textMap.empty<Text>();
  var communityPosts = textMap.empty<List.List<(Text, Int)>>();
  var fanPredictions = textMap.empty<List.List<Text>>();
  var newsFeed = textMap.empty<List.List<Text>>();
  var fixtures = textMap.empty<List.List<Text>>();
  var teamColors = textMap.empty<Text>();
  var teamLogos = textMap.empty<Storage.ExternalBlob>();
  var playerImages = textMap.empty<List.List<(Text, Storage.ExternalBlob)>>();

  // Player ratings storage
  var playerRatings = textMap.empty<OrderedMap.Map<Nat, Nat>>(); // teamName -> playerId -> rating
  var playerRatingCounts = textMap.empty<OrderedMap.Map<Nat, Nat>>(); // teamName -> playerId -> count
  var playerRatingSums = textMap.empty<OrderedMap.Map<Nat, Nat>>(); // teamName -> playerId -> sum

  // New feature section data storage
  var featureSectionData = textMap.empty<{
    fixtures : [Text];
    newsFeed : [Text];
    communityPosts : [(Text, Int)];
    fanPredictions : [Text];
    teamColor : Text;
    teamLogo : ?Storage.ExternalBlob;
    playerImages : [(Text, Storage.ExternalBlob)];
  }>();

  // News ticker storage
  var newsTickerHeadlines = textMap.empty<[Text]>();
  var lastUpdated = textMap.empty<Int>();

  // Default headlines
  let defaultHeadlines = [
    "BREAKING: Arsenal signs new striker",
    "Lakers win championship",
    "Real Madrid wins Champions League",
    "Warriors set new record",
    "Manchester United signs new manager",
    "Barcelona unveils new stadium",
    "Ferrari wins Grand Prix",
    "India wins cricket world cup",
    "England defeats Australia in Ashes",
    "Red Bull Racing dominates F1 season",
  ];

  // Initialize news ticker with default headlines
  newsTickerHeadlines := textMap.put(newsTickerHeadlines, "default", defaultHeadlines);

  // Timer for auto-refreshing news ticker
  var tickerTimer : ?Timer.TimerId = null;

  // Start ticker timer on actor initialization
  public func initializeTicker<system>() : async () {
    await startTickerTimer();
  };

  public func createHub(userId : Text, teamName : Text) : async Bool {
    userHubs := textMap.put(userHubs, userId, teamName);
    communityPosts := textMap.put(communityPosts, teamName, List.nil());
    fanPredictions := textMap.put(fanPredictions, teamName, List.nil());
    newsFeed := textMap.put(newsFeed, teamName, List.nil());
    fixtures := textMap.put(fixtures, teamName, List.nil());

    let color = detectTeamColor(teamName);
    teamColors := textMap.put(teamColors, teamName, color);

    // Initialize player ratings for the team
    playerRatings := textMap.put(playerRatings, teamName, natMap.empty());
    playerRatingCounts := textMap.put(playerRatingCounts, teamName, natMap.empty());
    playerRatingSums := textMap.put(playerRatingSums, teamName, natMap.empty());

    // Initialize feature section data
    featureSectionData := textMap.put(
      featureSectionData,
      teamName,
      {
        fixtures = [];
        newsFeed = [];
        communityPosts = [];
        fanPredictions = [];
        teamColor = color;
        teamLogo = null;
        playerImages = [];
      },
    );

    true;
  };

  public func getHub(userId : Text) : async ?Text {
    textMap.get(userHubs, userId);
  };

  public func getAllHubs() : async [(Text, Text)] {
    Iter.toArray(textMap.entries(userHubs));
  };

  public func addPost(teamName : Text, post : Text) : async Bool {
    if (Text.size(post) == 0) {
      Debug.trap("Post content cannot be empty");
    };

    switch (textMap.get(communityPosts, teamName)) {
      case (null) { false };
      case (?posts) {
        let timestamp = Time.now();
        let newPosts = List.push((post, timestamp), posts);
        communityPosts := textMap.put(communityPosts, teamName, newPosts);
        true;
      };
    };
  };

  public func addPrediction(teamName : Text, prediction : Text) : async Bool {
    if (Text.size(prediction) == 0) {
      Debug.trap("Prediction content cannot be empty");
    };

    switch (textMap.get(fanPredictions, teamName)) {
      case (null) { false };
      case (?predictions) {
        let newPredictions = List.push(prediction, predictions);
        fanPredictions := textMap.put(fanPredictions, teamName, newPredictions);
        true;
      };
    };
  };

  public func updateNews(teamName : Text, news : Text) : async Bool {
    if (Text.size(news) == 0) {
      Debug.trap("News content cannot be empty");
    };

    switch (textMap.get(newsFeed, teamName)) {
      case (null) { false };
      case (?newsList) {
        let newNews = List.push(news, newsList);
        newsFeed := textMap.put(newsFeed, teamName, newNews);
        true;
      };
    };
  };

  public func addFixture(teamName : Text, fixture : Text) : async Bool {
    if (Text.size(fixture) == 0) {
      Debug.trap("Fixture content cannot be empty");
    };

    switch (textMap.get(fixtures, teamName)) {
      case (null) { false };
      case (?fixtureList) {
        let newFixtures = List.push(fixture, fixtureList);
        fixtures := textMap.put(fixtures, teamName, newFixtures);
        true;
      };
    };
  };

  public func getDashboardData(teamName : Text) : async {
    fixtures : [Text];
    newsFeed : [Text];
    communityPosts : [(Text, Int)];
    fanPredictions : [Text];
    teamColor : Text;
    teamLogo : ?Storage.ExternalBlob;
    playerImages : [(Text, Storage.ExternalBlob)];
  } {
    let teamFixtures = switch (textMap.get(fixtures, teamName)) {
      case (null) { List.nil() };
      case (?list) { list };
    };

    let teamNews = switch (textMap.get(newsFeed, teamName)) {
      case (null) { List.nil() };
      case (?list) { list };
    };

    let teamPosts = switch (textMap.get(communityPosts, teamName)) {
      case (null) { List.nil() };
      case (?list) { list };
    };

    let teamPredictions = switch (textMap.get(fanPredictions, teamName)) {
      case (null) { List.nil() };
      case (?list) { list };
    };

    let teamColor = switch (textMap.get(teamColors, teamName)) {
      case (null) { "#FFFFFF" };
      case (?color) { color };
    };

    let teamLogo = textMap.get(teamLogos, teamName);

    let players = switch (textMap.get(playerImages, teamName)) {
      case (null) { List.nil() };
      case (?list) { list };
    };

    {
      fixtures = List.toArray(teamFixtures);
      newsFeed = List.toArray(teamNews);
      communityPosts = List.toArray(teamPosts);
      fanPredictions = List.toArray(teamPredictions);
      teamColor;
      teamLogo;
      playerImages = List.toArray(players);
    };
  };

  public func uploadTeamLogo(teamName : Text, logo : Storage.ExternalBlob) : async Bool {
    teamLogos := textMap.put(teamLogos, teamName, logo);
    true;
  };

  public func uploadPlayerImage(teamName : Text, playerName : Text, image : Storage.ExternalBlob) : async Bool {
    let currentPlayers = switch (textMap.get(playerImages, teamName)) {
      case (null) { List.nil() };
      case (?list) { list };
    };

    let newPlayers = List.push((playerName, image), currentPlayers);
    playerImages := textMap.put(playerImages, teamName, newPlayers);
    true;
  };

  // Player rating functions
  public func ratePlayer(teamName : Text, playerId : Nat, rating : Nat) : async Bool {
    if (rating < 1 or rating > 5) {
      return false;
    };

    switch (textMap.get(playerRatings, teamName)) {
      case (null) { false };
      case (?teamRatings) {
        let currentRating = natMap.get(teamRatings, playerId);
        let newTeamRatings = natMap.put(teamRatings, playerId, rating);

        switch (textMap.get(playerRatingCounts, teamName), textMap.get(playerRatingSums, teamName)) {
          case (null, _) { false };
          case (_, null) { false };
          case (?teamCounts, ?teamSums) {
            let currentCount = switch (natMap.get(teamCounts, playerId)) {
              case (null) { 0 };
              case (?count) { count };
            };

            let currentSum = switch (natMap.get(teamSums, playerId)) {
              case (null) { 0 };
              case (?sum) { sum };
            };

            let (newCount, newSum) = switch (currentRating) {
              case (null) {
                (currentCount + 1, rating);
              };
              case (?oldRating) {
                let safeSum = if (currentSum >= oldRating) {
                  Int.abs(currentSum - oldRating + rating);
                } else {
                  Int.abs(rating);
                };
                (currentCount, safeSum);
              };
            };

            let newTeamCounts = natMap.put(teamCounts, playerId, newCount);
            let newTeamSums = natMap.put(teamSums, playerId, newSum);

            playerRatings := textMap.put(playerRatings, teamName, newTeamRatings);
            playerRatingCounts := textMap.put(playerRatingCounts, teamName, newTeamCounts);
            playerRatingSums := textMap.put(playerRatingSums, teamName, newTeamSums);

            true;
          };
        };
      };
    };
  };

  public query func getPlayerRating(teamName : Text, playerId : Nat) : async {
    average : Float;
    count : Nat;
  } {
    let teamCounts = switch (textMap.get(playerRatingCounts, teamName)) {
      case (null) { natMap.empty() };
      case (?counts) { counts };
    };

    let teamSums = switch (textMap.get(playerRatingSums, teamName)) {
      case (null) { natMap.empty() };
      case (?sums) { sums };
    };

    let count = switch (natMap.get(teamCounts, playerId)) {
      case (null) { 0 };
      case (?c) { c };
    };

    let sum = switch (natMap.get(teamSums, playerId)) {
      case (null) { 0 };
      case (?s) { s };
    };

    let average = if (count == 0) { 0.0 } else {
      Float.fromInt(sum) / Float.fromInt(count);
    };

    {
      average;
      count;
    };
  };

  public query func getTopRatedPlayers(teamName : Text, limit : Nat) : async [(Nat, Float, Nat)] {
    let teamCounts = switch (textMap.get(playerRatingCounts, teamName)) {
      case (null) { natMap.empty() };
      case (?counts) { counts };
    };

    let teamSums = switch (textMap.get(playerRatingSums, teamName)) {
      case (null) { natMap.empty() };
      case (?sums) { sums };
    };

    let entries = Iter.toArray(natMap.entries(teamCounts));
    let ratings = Array.map<(Nat, Nat), (Nat, Float, Nat)>(
      entries,
      func((playerId, count)) {
        let sum = switch (natMap.get(teamSums, playerId)) {
          case (null) { 0 };
          case (?s) { s };
        };
        let average = if (count == 0) { 0.0 } else {
          Float.fromInt(sum) / Float.fromInt(count);
        };
        (playerId, average, count);
      },
    );

    let sorted = Array.sort<(Nat, Float, Nat)>(
      ratings,
      func(a, b) {
        if (a.1 > b.1) { #less } else if (a.1 < b.1) { #greater } else {
          #equal;
        };
      },
    );

    let resultSize = if (sorted.size() < limit) { sorted.size() } else { limit };
    Array.tabulate<(Nat, Float, Nat)>(resultSize, func(i) { sorted[i] });
  };

  // New function to get feature section data
  public query func getFeatureSectionData(teamName : Text) : async ?{
    fixtures : [Text];
    newsFeed : [Text];
    communityPosts : [(Text, Int)];
    fanPredictions : [Text];
    teamColor : Text;
    teamLogo : ?Storage.ExternalBlob;
    playerImages : [(Text, Storage.ExternalBlob)];
  } {
    textMap.get(featureSectionData, teamName);
  };

  // News ticker functions
  public query func getNewsTickerHeadlines() : async [Text] {
    switch (textMap.get(newsTickerHeadlines, "default")) {
      case (null) { defaultHeadlines };
      case (?headlines) { headlines };
    };
  };

  public func refreshNewsTicker() : async [Text] {
    let newHeadlines = Array.map<Text, Text>(
      defaultHeadlines,
      func(headline) {
        let randomIndex = Int.abs(Time.now()) % defaultHeadlines.size();
        defaultHeadlines[randomIndex];
      },
    );

    newsTickerHeadlines := textMap.put(newsTickerHeadlines, "default", newHeadlines);
    lastUpdated := textMap.put(lastUpdated, "default", Time.now());
    newHeadlines;
  };

  public func startTickerTimer<system>() : async () {
    switch (tickerTimer) {
      case (?timerId) {
        Timer.cancelTimer(timerId);
      };
      case (null) {};
    };

    let interval = 20_000_000_000; // 20 seconds in nanoseconds
    tickerTimer := ?Timer.recurringTimer<system>(#nanoseconds interval, updateTicker);
  };

  func updateTicker() : async () {
    let newHeadlines = Array.map<Text, Text>(
      defaultHeadlines,
      func(headline) {
        let randomIndex = Int.abs(Time.now()) % defaultHeadlines.size();
        defaultHeadlines[randomIndex];
      },
    );

    newsTickerHeadlines := textMap.put(newsTickerHeadlines, "default", newHeadlines);
    lastUpdated := textMap.put(lastUpdated, "default", Time.now());
  };

  func detectTeamColor(teamName : Text) : Text {
    let colorMap = [
      ("lakers", "#552583"),
      ("warriors", "#1D428A"),
      ("celtics", "#007A33"),
      ("bulls", "#CE1141"),
      ("yankees", "#003087"),
      ("dodgers", "#005A9C"),
      ("patriots", "#002244"),
      ("cowboys", "#041E42"),
      ("packers", "#203731"),
      ("manchester united", "#DA291C"),
      ("real madrid", "#FEBE10"),
      ("barcelona", "#A50044"),
      ("juventus", "#000000"),
      ("bayern munich", "#DC052D"),
      ("psg", "#004170"),
      ("toronto maple leafs", "#00205B"),
      ("montreal canadiens", "#AF1E2D"),
      ("boston bruins", "#FFB81C"),
      ("chicago blackhawks", "#CF0A2C"),
      ("new york rangers", "#0038A8"),
    ];

    let lowerTeamName = Text.toLowercase(teamName);

    for ((team, color) in colorMap.vals()) {
      if (Text.contains(lowerTeamName, #text team)) {
        return color;
      };
    };

    "#FFFFFF";
  };

  // Migration function to update news ticker headlines
  public func migrateNewsTicker() : async () {
    let currentHeadlines = switch (textMap.get(newsTickerHeadlines, "default")) {
      case (null) { defaultHeadlines };
      case (?headlines) { headlines };
    };

    if (currentHeadlines.size() < 5) {
      let newHeadlines = Array.append(currentHeadlines, defaultHeadlines);
      newsTickerHeadlines := textMap.put(newsTickerHeadlines, "default", newHeadlines);
    };
  };

  // Function to check ticker timer status
  public func checkTickerTimer() : async Bool {
    switch (tickerTimer) {
      case (null) {
        Debug.trap("Ticker timer is not running");
      };
      case (?_) {
        true;
      };
    };
  };

  // New function to get next 5 fixtures for a team
  public query func getNextFiveFixtures(teamName : Text) : async [Text] {
    let fixturesData = [
      (
        "arsenal",
        [
          "Sat 4 Oct 2025 vs West Ham United (Home)",
          "Sat 18 Oct 2025 vs Fulham (Away)",
          "Tue 21 Oct 2025 vs Atlético Madrid (Home)",
          "Sat 25 Oct 2025 vs Crystal Palace (Home)",
          "Sat 1 Nov 2025 vs Burnley (Away)",
        ],
      ),
      (
        "manchester united",
        [
          "Sat 4 Oct 2025 vs Sunderland (Home)",
          "Sun 19 Oct 2025 vs Liverpool (Away)",
          "Sat 25 Oct 2025 vs Brighton & Hove Albion (Home)",
          "Sat 1 Nov 2025 vs Nottingham Forest (Away)",
          "TBD",
        ],
      ),
      (
        "los angeles lakers",
        [
          "Tue 21 Oct 2025 vs Golden State Warriors (Home)",
          "Fri 24 Oct 2025 vs Minnesota Timberwolves (Home)",
          "Sun 26 Oct 2025 @ Sacramento Kings (Away)",
          "Mon 27 Oct 2025 vs Portland Trail Blazers (Home)",
          "Wed 29 Oct 2025 @ Minnesota Timberwolves (Away)",
        ],
      ),
    ];

    let lowerTeamName = Text.toLowercase(teamName);

    for ((team, fixtures) in fixturesData.vals()) {
      if (Text.contains(lowerTeamName, #text team)) {
        return fixtures;
      };
    };

    // Default to empty array if team not found
    [];
  };

  // Authentication system state
  let accessControlState = AccessControl.initState();

  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    avatar : Text;
    points : Nat;
  };

  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    principalMap.get(userProfiles, caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Invite links system state
  let inviteState = InviteLinksModule.initState();

  // Generate invite code (admin only)
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  // Submit RSVP (public, but requires valid invite code)
  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  // Get all RSVPs (admin only)
  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  // Get all invite codes (admin only)
  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};

