const translation = {
  common: {
    brand: {
      filmolog: "FILMOLOG",
      filmographer: "Filmographer",
    },
    actions: {
      confirm: "OK",
      cancel: "Cancel",
      delete: "Delete",
      save: "Save",
      edit: "Edit",
      share: "Share",
      sharing: "Sharing…",
      remove: "Remove",
      add: "Add",
      next: "Next",
      viewAll: "View all",
      viewLog: "View log",
      home: "Home",
      saving: "Saving…",
      saveAction: "Save",
      saveWithCount: "Save ({{count}})",
    },
    accessibility: {
      back: "Go back",
      settings: "Settings",
      openCreateMenu: "Add log",
      closeCreateMenu: "Close menu",
      dayBefore: "Previous day",
      dayAfter: "Next day",
      starHalf: "{{rating}} stars",
      starFull: "{{rating}} stars",
      wishlistViewAll: "View full wishlist",
    },
    calendar: {
      weekdays: {
        sun: "Sun",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat",
      },
      yearMonth: "{{month}}/{{year}}",
      yearMonthPosterWall: "{{month}} {{year}} poster wall",
      selectedDate: "Selected: {{date}}",
      today: "Today",
      yesterday: "Yesterday",
    },
    units: {
      filmCount: "{{count}} films",
      filmCountSelected: "{{count}} selected",
      filmCountAdd: "Add {{count}} films",
      movieCount: "{{count}} movies",
      times: " times",
      peopleRated: "Rated by {{count}} people",
      nthLog: "{{count}}th",
      nthFilmWithRating: "{{count}}th film · ★ {{rating}}",
      monthProgress: "{{filledDays}}/{{eligibleDays}} days · {{reviewCount}} films",
      joinedAt: "Joined {{date}}",
      maxGenres: "Up to {{count}}",
      preferredGenresMax: "Preferred genres (up to {{count}})",
      moreItems: "+{{count}}",
    },
    movieMeta: {
      releaseDate: "Release date",
      runtime: "Runtime",
      genre: "Genre",
      genres: "Genres",
      director: "Director",
      cast: "Cast",
      castShort: "Cast",
      watchedDate: "Watched on",
      watchedPrefix: "Watched · {{date}}",
      addedPrefix: "Added · {{date}}",
      myRating: "My rating",
      runtimeMinutes: "{{minutes}} min",
      runtimeHours: "{{hours}} hr",
      runtimeHoursMinutes: "{{hours}} hr {{minutes}} min",
      fallbackMovieTitle: "Movie #{{id}}",
      fallbackGenre: "Genre #{{id}}",
      ratingPoint: "{{star}} stars",
      monthLabel: "Month {{month}}",
      decadeLabel: "{{decade}}s",
    },
    stats: {
      avgRating: "Avg. rating",
      reviewCount: "Films rated",
      wishlistCount: "Wishlist",
      collectionCount: "My collections",
      totalLogs: "Total logs",
      thisMonth: "This month",
      last30Days: "Last 30 days",
      thisYearLogs: "This year's logs",
      thisYearAvg: "This year's avg.",
      collections: "Collections",
      withJournal: "Logs with notes",
      avgChars: "Avg. characters",
      movies: "Films",
      avgRatingShort: "Avg. rating",
      earned: "Earned",
    },
    sort: {
      latest: "Newest",
      oldest: "Oldest",
      nameAsc: "Name A–Z",
      moviesDesc: "Most films",
      moviesAsc: "Fewest films",
      latestAdded: "Recently added",
      ratingDesc: "Highest rating",
      latestLog: "Latest logged",
      oldestLog: "Oldest logged",
      ratingAsc: "Lowest rating",
      watchedDesc: "Latest watched",
      sortPrefix: "Sort: {{label}}",
      periodPrefix: "Period · {{label}}",
      sortChipPrefix: "Sort · {{label}}",
    },
    period: {
      all: "All time",
      thisMonth: "This month",
      last30: "Last 30 days",
      last90: "Last 3 months",
      thisYear: "This year",
    },
    viewMode: {
      list: "List",
      timeline: "Timeline",
      calendar: "Calendar",
    },
    archive: {
      myArchive: {
        title: "My archive",
        subtitle: "Your film trail at a glance.",
      },
      recentLog: {
        title: "Recent logs",
        subtitle: "Your most recent impressions.",
      },
      myCollection: {
        title: "My collections",
        subtitle: "Curated archives by taste.",
      },
      searchResults: "Results for \"{{query}}\"",
      searchResultsFor: "Results for \"{{query}}\"",
      searchResultsArchive: "Logs for \"{{query}}\"",
      recentlyAdded: "Recently added: {{title}}",
      noData: "No data to display.",
      loadListFailed: "Couldn't load the list.",
      noItems: "No titles to show yet.",
    },
    attribution: {
      movieInfoProvider: "Movie data provided by",
    },
    splash: {
      tagline: "The most beautiful way to remember film",
    },
    rating: {
      selectPrompt: "Select a rating",
      scaleSuffix: "/ 5.0",
      starHint: "Tap left for half stars, right for full stars.",
    },
    collectionFallback: "Collection",
  },
  tabs: {
    home: "Home",
    explore: "Explore",
    statistics: "Stats",
    profile: "Profile",
    createMenu: {
      filmLog: {
        title: "Log a film",
        subtitle: "Rating, quick note, review",
      },
      collection: {
        title: "New collection",
        subtitle: "Build your own film set",
      },
    },
  },
  auth: {
    login: {
      google: "Sign in with Google",
      loading: "Signing in…",
    },
    nickname: {
      greeting: "Welcome, {{name}}.",
      title: "Choose a nickname.",
      placeholder: "Enter a nickname",
    },
    genre: {
      greeting: "Almost there, {{nickname}}.",
      title: "Pick your favorite genres.",
      subtitle: "You can select up to {{count}}.",
      loadFailed: "Couldn't load genres.",
      selectAtLeastOne: "Select at least one preferred genre.",
      start: "Get started",
      startWithCount: "Get started ({{count}})",
    },
    onboarding: {
      loginRequired: "Sign-in required.",
    },
  },
  home: {
    empty: {
      noLogs: "No logs yet. Record your first film.",
      noCollections: "No collections yet. Create your first archive.",
    },
  },
  explore: {
    searchPlaceholder: "Search titles in your archive",
    header: {
      title: "Explore",
      subtitle: "Discover unlogged gems in your archive.",
    },
    curation: {
      title: "Curated for you",
      subtitle: "Handpicked from your preferred genres.",
      setGenresFirst: "Set your preferred genres first.",
      loadFailed: "Couldn't load films.",
      noMatches: "No matching titles.",
    },
    directorShelf: {
      title: "More from {{name}}",
      subtitle: "Director’s Log · Revisit this director through your reviews.",
    },
    castShelf: {
      title: "Films with {{name}}",
      subtitle: "Your persona · An actor archive built from your reviews.",
    },
    communityTopRated: {
      title: "Community favorites",
      subtitle: "Highly rated by Filmolog users.",
    },
    genreTopRated: {
      title: "Top rated in your genres",
      subtitle: "Your genres × community ratings.",
      empty: "Recommendations appear as genre data grows. Write a review.",
    },
    mostLogged: {
      title: "Most logged films",
      subtitle: "The most reviewed films on Filmolog.",
    },
    mostCollected: {
      title: "Most collected films",
      subtitle: "Films often added to collections.",
    },
    search: {
      title: "Archive search",
      loadFailed: "Couldn't load search results.",
      notFound: "Couldn't find that title in your archive.",
    },
  },
  filmLog: {
    search: {
      placeholder: "Search a film to log",
      title: "Search films",
      hint: "Enter at least 2 characters to search.",
      loadFailed: "Couldn't load search results.",
      noResults: "No search results.",
    },
    selected: {
      title: "Basic info",
      subtitle: "Review the selected title.",
      loadFailed: "Couldn't load film info.",
      changeMovie: "Choose another film",
    },
    form: {
      watched: {
        title: "Watched on",
        subtitle: "When did you watch this?",
      },
      rating: {
        title: "Rating",
      },
      review: {
        title: "Quick note · Review",
        subtitle: "Even a short note is fine.",
        placeholder: "Write your thoughts about this film.",
      },
      collection: {
        title: "Add to collection",
        subtitle: "Add this title to selected collections.",
        empty: "No collections yet. Save the log only, or create a collection first.",
      },
      submit: "Save log",
    },
    wishlist: {
      title: "Wishlist",
      subtitle: "Did you watch any saved films?",
      loadFailed: "Couldn't load wishlist.",
      viewAll: "View full wishlist",
    },
    complete: {
      firstLog: "First log complete!",
      nthLog: "{{count}}th log complete!",
      recordAnother: "Log another film",
    },
  },
  review: {
    list: {
      title: "My logs",
      emptyAll: "No logs yet. Record your first film.",
      emptyPeriod: "No logs in the selected period.",
    },
    calendar: {
      monthComplete: "You filled every slot this month",
      tagline: "Your personal film calendar filled with posters",
      selectedHint: "Selected: {{date}} · Tap again for full month",
      hint: "Tap an empty cell for that day, or a poster for details.",
      emptyDay: "This day is empty. Log a film to fill it with a poster.",
      emptyMonth: "No logs this month.",
    },
    detail: {
      loadFailed: "Couldn't load this log.",
      catalog: {
        title: "Title card",
        subtitle: "Film info in your archive.",
      },
      rating: {
        title: "My rating",
        subtitle: "The score you gave this title.",
      },
      journal: {
        title: "Journal",
        subtitle: "Notes and thoughts you left.",
        empty: "No review text yet.",
      },
      menu: {
        movieInfo: "Title info",
      },
      shareTitle: "Share Filmolog log",
    },
    share: {
      footer: "filmolog archive",
    },
  },
  collection: {
    create: {
      basicInfo: {
        title: "Basic info",
        subtitle: "Name and describe your collection.",
      },
      nameLabel: "Name",
      namePlaceholder: "e.g. Films for a rainy mood",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Why did you put these films together?",
      theme: {
        title: "Collection theme",
        subtitle: "Choose the cover mood.",
      },
      films: {
        title: "Add films",
        subtitle: "Pick logged films to add.",
        empty: "No logged films yet. Log a film first.",
      },
      submit: "Create collection",
    },
    list: {
      title: "My collections",
      empty: "No collections yet. Create your first one.",
      createNew: "Create new collection",
    },
    detail: {
      loadFailed: "Couldn't load collection.",
      filmsTitle: "Films inside",
      emptyFilms: "No films added yet.",
      addFilm: "Add films",
      removeFromCollection: "Remove from collection",
      deleteCollection: "Delete collection",
    },
    addMovies: {
      searchPlaceholder: "Search logged films",
      subtitleDefault: "Pick logged films not yet in this collection.",
      selectPrompt: "Select films",
      empty: {
        noLogs: "No logged films yet. Log a film first.",
        allAdded: "Nothing left to add. All logged films are already here.",
        noSearchMatch: "No films match \"{{query}}\".",
        noneToShow: "No films to show.",
      },
    },
  },
  profile: {
    pageTitle: "Profile",
    tagline: "What single scene moved you today?",
    menu: {
      myLogs: {
        label: "My logs",
        subtitle: "View all your reviews",
      },
      myCollections: {
        label: "My collections",
        subtitle: "Your curated film lists",
      },
      wishlist: {
        label: "Wishlist",
        subtitle: "Saved films",
      },
      badges: {
        label: "Badges",
        subtitle: "See earned achievements",
      },
    },
    edit: {
      title: "Edit profile",
      subtitle: "Update your nickname and preferred genres.",
      nicknameLabel: "Nickname",
      nicknamePlaceholder: "Nickname",
    },
    genreEdit: {
      title: "Edit preferred genres",
      subtitle: "You can select up to {{count}}.",
    },
    wishlist: {
      loadFailed: "Couldn't load wishlist.",
      empty: "No saved films.",
    },
  },
  settings: {
    sections: {
      account: "Account",
      support: "Support",
      legal: "Legal",
      app: "App",
      accountManagement: "Account management",
    },
    account: {
      genreEdit: {
        label: "Edit preferred genres",
        subtitle: "Genres used for Explore recommendations",
      },
    },
    support: {
      notice: "Filmolog is run solo. Feedback is reviewed in order, and timing depends on scope.",
      featureRequest: {
        label: "Suggest a feature",
        subtitle: "Share an idea and we'll review it",
      },
      bugReport: {
        label: "Report a bug",
        subtitle: "Reviewed in order · version and account auto-filled",
      },
      feedbackForm: {
        feature: "Feature suggestion",
        bug: "Bug report",
      },
    },
    legal: {
      privacyPolicy: {
        label: "Privacy policy",
        subtitle: "How we collect, use, and store data",
      },
    },
    app: {
      version: {
        label: "Version",
        subtitle: "Filmolog",
      },
    },
    accountManagement: {
      logout: {
        label: "Log out",
        subtitle: "You can sign in again anytime",
      },
      deleteAccount: {
        label: "Delete account",
        subtitle: "All data will be permanently deleted",
      },
    },
    language: {
      label: "Language",
      subtitle: "App display language",
      ko: "Korean",
      en: "English",
    },
  },
  statistics: {
    pageTitle: "Statistics",
    tagline: "Every log becomes a film in the filmography that is you.",
    sections: {
      filmography: {
        title: "My filmography",
        subtitle: "The shape of your logs in numbers.",
      },
      thisYear: {
        title: "This year's logs",
        subtitle: "Your year in review.",
      },
      journalHabit: {
        title: "Logging habits",
        subtitle: "How often you write with your ratings.",
      },
      monthly: {
        title: "Monthly logs",
        subtitle: "Scenes logged over the last 6 months.",
        empty: "Monthly chart appears as you log more.",
      },
      ratingDistribution: {
        title: "Rating distribution",
        subtitle: "How your ratings are weighted.",
        empty: "Rating distribution appears after you log films.",
      },
      genreDistribution: {
        title: "Genre distribution",
        subtitle: "Taste revealed in your logs.",
        empty: "Genre chart appears when enough genre data exists.",
        excludedNote: "{{count}} logs without genre data are excluded.",
      },
      preferredVsActual: {
        title: "Preferred vs. actual genres",
        subtitle: "Traces of the taste you picked at onboarding.",
        empty: "No preferred-genre logs yet.",
      },
      genreRating: {
        title: "Average rating by genre",
        subtitle: "Only genres with 2+ logs.",
        empty: "Shown after 2+ logs per genre.",
        reviewsLabel: "reviews",
        avgLabel: "avg.",
      },
      decade: {
        title: "By release decade",
        subtitle: "Which eras you log most.",
        empty: "Shown when enough release-year data exists.",
        excludedNote: "{{count}} logs without release year are excluded.",
      },
      directors: {
        title: "Favorite directors",
        subtitle: "Directors who appear most in your logs.",
        empty: "Rankings appear with enough director data.",
        excludedNote: "{{count}} logs without director data are excluded.",
      },
      cast: {
        title: "Favorite actors",
        subtitle: "Based on top 5 billing.",
        empty: "Rankings appear with enough cast data.",
        excludedNote: "{{count}} logs without cast data are excluded.",
      },
      highlights: {
        title: "Top 3 highest ratings",
        subtitle: "Scenes that stayed with you.",
        empty: "No logged titles yet.",
      },
      badges: {
        title: "Badge progress",
        subtitle: "Achievements as you build your filmography.",
        viewAll: "View all badges",
      },
    },
    insights: {
      yearDeltaUp: "+{{delta}} vs last year",
      yearDeltaDown: "{{delta}} vs last year",
      yearDeltaSame: "Same as last year",
      journalEmpty: "Logging habits appear after your first review.",
      journalCount: "You wrote notes on {{count}} films.",
      preferredGenreEmpty: "No logs in your preferred genres yet. Log your first scene.",
      preferredGenreTop: "Among preferred genres, {{genre}} has the most logs.",
      raterEmpty: "Your taste profile appears after your first log.",
      raterGenerous: "Generous critic — you remember the good scenes generously.",
      raterStrict: "Strict critic — only chosen scenes make your filmography.",
      raterBalanced: "Balanced eye — each log keeps a steady emotional temperature.",
    },
  },
  badges: {
    list: {
      loadFailed: "Couldn't load badges.",
    },
    unlock: {
      title: "Badge unlocked!",
      dismissHint: "Tap to close",
    },
    categories: {
      activity: "Activity",
      taste: "Taste · Genre",
      curation: "Curation",
    },
    items: {
      first_ticket: {
        name: "First Ticket",
        description: "Write your first review",
      },
      short_film: {
        name: "Short Film",
        description: "Write 10 reviews",
      },
      indie_director: {
        name: "Indie Director",
        description: "Write 50 reviews",
      },
      blockbuster: {
        name: "Blockbuster",
        description: "Write 100 reviews",
      },
      masterpiece: {
        name: "Masterpiece",
        description: "Write 500 reviews",
      },
      popcorn_tears: {
        name: "Popcorn Tears",
        description: "Write 20 romance/drama reviews",
      },
      brave_heart: {
        name: "Brave Heart",
        description: "Write 20 horror/thriller reviews",
      },
      couch_critic: {
        name: "Couch Critic",
        description: "Keep avg. rating ≤ 2.5 across 50+ logs",
      },
      rotten_collector: {
        name: "Rotten Collector",
        description: "Rate 4.0+ on community ≤2.0 films 3 times",
      },
      chief_curator: {
        name: "Chief Curator",
        description: "Create 3 collections with 10+ films each",
      },
      treasure_hunter: {
        name: "Treasure Hunter",
        description: "Review 10 films from your wishlist",
      },
    },
  },
  movie: {
    detail: {
      catalog: {
        title: "Title info",
        subtitle: "Film metadata in your archive.",
      },
      community: {
        title: "Community rating",
        subtitle: "Average rating and log count from Filmolog users.",
        loadFailed: "Couldn't load community rating.",
        empty: "No Filmolog ratings yet.",
      },
      synopsis: {
        title: "Synopsis",
        subtitle: "About this title.",
        empty: "No synopsis available.",
      },
      loadFailed: "Couldn't load film info.",
      writeReview: "Write review",
    },
  },
  errors: {
    saveFailed: {
      generic: "Save failed",
      nickname: "Couldn't save nickname. Try again later.",
      genres: "Couldn't save preferred genres. Try again later.",
      profile: "Couldn't save profile. Try again later.",
      reviewUpdate: "Couldn't update log. Try again later.",
      reviewCreate: "Couldn't save film log. Try again later.",
      wishlist: "Couldn't update wishlist. Try again later.",
    },
    deleteFailed: {
      generic: "Delete failed",
      review: "Couldn't delete log. Try again later.",
      collectionMovie: "Couldn't remove film from collection. Try again later.",
      collection: "Couldn't delete collection. Try again later.",
    },
    createFailed: {
      generic: "Creation failed",
      collection: "Couldn't create collection. Try again later.",
    },
    addFailed: {
      generic: "Add failed",
      collectionMovies: "Couldn't add films to collection. Try again later.",
    },
    openFailed: {
      title: "Couldn't open",
      googleForm: "Couldn't open Google Form. Try again later.",
      privacyPolicy: "Couldn't open privacy policy. Try again later.",
    },
    logoutFailed: {
      title: "Log out failed",
      message: "Try again later.",
    },
    deleteAccount: {
      verifyFailed: "Error verifying account deletion.",
      dataNotRemoved: "Account data was not removed. Check that delete_user_account RPC is deployed.",
      rpcMissing: "Account deletion is not configured on the server yet.",
      rpcFailed: "Account deletion failed.",
      rpcFailedRetry: "Account deletion failed. Try again later.",
      signOutAfterDelete: "Data was deleted, but sign-out failed. Restart the app.",
    },
    auth: {
      googleConfig: {
        title: "Google sign-in configuration error",
        message: "Your app SHA-1 may not be registered in Google Cloud. Add the debug/release SHA-1 to the Android OAuth client (com.filmolog), then try again in 5–10 minutes.",
      },
      googleIdTokenMissing: "Google idToken is missing.",
    },
    validation: {
      selectRating: "Select a rating.",
      collectionNameRequired: "Enter a collection name.",
      selectFilmsToAdd: "Select films to add.",
    },
    duplicateReview: {
      title: "Already logged",
      message: "You already reviewed this film.",
    },
  },
  dialogs: {
    validation: {
      title: "Check your input",
    },
    selection: {
      title: "Confirm selection",
    },
    logout: {
      title: "Log out",
      message: "Are you sure you want to log out?",
      confirm: "Log out",
    },
    deleteAccount: {
      title: "Delete account",
      message: "Deleting your account permanently removes reviews, collections, wishlist, and all other data.",
      confirm: "Delete account",
      failedTitle: "Deletion failed",
    },
    deleteReview: {
      title: "Delete log",
      message: "Delete the log for \"{{title}}\"?",
    },
    deleteCollection: {
      title: "Delete collection",
      message: "Delete \"{{name}}\"?\nIts film list will be removed too. (Your film logs stay.)",
    },
  },
};

export default translation;
