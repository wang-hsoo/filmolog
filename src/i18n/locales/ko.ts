const translation = {
  common: {
    brand: {
      filmolog: "FILMOLOG",
      filmographer: "필모그래퍼",
    },
    actions: {
      confirm: "확인",
      cancel: "취소",
      delete: "삭제",
      save: "저장",
      edit: "수정",
      share: "공유",
      sharing: "공유 중…",
      remove: "제거",
      add: "담기",
      next: "다음",
      viewAll: "모두 보기",
      viewLog: "기록 보기",
      home: "홈",
      saving: "저장 중...",
      saveAction: "저장하기",
      saveWithCount: "저장하기 ({{count}})",
    },
    accessibility: {
      back: "뒤로",
      settings: "설정",
      openCreateMenu: "기록 추가",
      closeCreateMenu: "메뉴 닫기",
      dayBefore: "하루 전",
      dayAfter: "하루 후",
      starHalf: "{{rating}}점",
      starFull: "{{rating}}점",
      wishlistViewAll: "위시리스트 전체 보기",
    },
    calendar: {
      weekdays: {
        sun: "일",
        mon: "월",
        tue: "화",
        wed: "수",
        thu: "목",
        fri: "금",
        sat: "토",
      },
      yearMonth: "{{year}}년 {{month}}월",
      yearMonthPosterWall: "{{year}}년 {{month}}월 포스터 벽",
      selectedDate: "선택일: {{date}}",
      today: "오늘",
      yesterday: "어제",
    },
    units: {
      filmCount: "{{count}}편",
      filmCountSelected: "{{count}}편 선택됨",
      filmCountAdd: "{{count}}편 추가",
      movieCount: "{{count}}개 영화",
      times: "회",
      peopleRated: "{{count}}명이 평가함",
      nthLog: "{{count}}번째",
      nthFilmWithRating: "{{count}}번째 영화 · ★ {{rating}}",
      monthProgress: "{{filledDays}}/{{eligibleDays}}일 · {{reviewCount}}편",
      joinedAt: "{{date}} 가입",
      maxGenres: "최대 {{count}}개",
      preferredGenresMax: "선호 장르 (최대 {{count}}개)",
      moreItems: "+{{count}}",
    },
    movieMeta: {
      releaseDate: "출시일",
      runtime: "러닝타임",
      genre: "장르",
      genres: "장르",
      director: "감독",
      cast: "배우",
      castShort: "출연",
      watchedDate: "관람일",
      watchedPrefix: "시청 · {{date}}",
      addedPrefix: "담음 · {{date}}",
      myRating: "내 평점",
      runtimeMinutes: "{{minutes}}분",
      runtimeHours: "{{hours}}시간",
      runtimeHoursMinutes: "{{hours}}시간 {{minutes}}분",
      fallbackMovieTitle: "영화 #{{id}}",
      fallbackGenre: "장르 #{{id}}",
      ratingPoint: "{{star}}점",
      monthLabel: "{{month}}월",
      decadeLabel: "{{decade}}년대",
    },
    stats: {
      avgRating: "평균 평점",
      reviewCount: "평가한 영화",
      wishlistCount: "위시리스트",
      collectionCount: "나의 컬렉션",
      totalLogs: "총 기록",
      thisMonth: "이번 달",
      last30Days: "최근 30일",
      thisYearLogs: "올해 기록",
      thisYearAvg: "올해 평균",
      collections: "컬렉션",
      withJournal: "글 남긴 기록",
      avgChars: "평균 글자 수",
      movies: "영화",
      avgRatingShort: "평균 평점",
      earned: "획득",
    },
    sort: {
      latest: "최신순",
      oldest: "오래된순",
      nameAsc: "이름순",
      moviesDesc: "영화 많은순",
      moviesAsc: "영화 적은순",
      latestAdded: "최신 등록순",
      ratingDesc: "평점 높은순",
      latestLog: "최신 기록순",
      oldestLog: "오래된 기록순",
      ratingAsc: "평점 낮은순",
      watchedDesc: "관람일 최신순",
      sortPrefix: "정렬: {{label}}",
      periodPrefix: "기간 · {{label}}",
      sortChipPrefix: "정렬 · {{label}}",
    },
    period: {
      all: "전체 기간",
      thisMonth: "이번 달",
      last30: "최근 30일",
      last90: "최근 3개월",
      thisYear: "올해",
    },
    viewMode: {
      list: "목록",
      timeline: "타임라인",
      calendar: "캘린더",
    },
    archive: {
      myArchive: {
        title: "나의 기록",
        subtitle: "쌓아온 영화의 흔적을 한눈에.",
      },
      recentLog: {
        title: "최근 기록",
        subtitle: "가장 최근에 남긴 감상.",
      },
      myCollection: {
        title: "나의 컬렉션",
        subtitle: "취향대로 묶어둔 아카이브.",
      },
      searchResults: "\"{{query}}\" 검색 결과",
      searchResultsFor: "\"{{query}}\" 결과",
      searchResultsArchive: "\"{{query}}\" 에 대한 기록",
      recentlyAdded: "최근 추가: {{title}}",
      noData: "표시할 데이터가 없습니다.",
      loadListFailed: "목록을 불러오지 못했습니다.",
      noItems: "아직 표시할 작품이 없습니다.",
    },
    attribution: {
      movieInfoProvider: "영화 정보 제공",
    },
    splash: {
      tagline: "영화를 기억하는 가장 아름다운 방법",
    },
    rating: {
      selectPrompt: "평점을 선택하세요",
      scaleSuffix: "/ 5.0",
      starHint: "별 왼쪽은 0.5점, 오른쪽은 1점 단위예요.",
    },
    collectionFallback: "컬렉션",
  },
  tabs: {
    home: "홈",
    explore: "탐색",
    statistics: "통계",
    profile: "마이페이지",
    createMenu: {
      filmLog: {
        title: "영화기록",
        subtitle: "평점, 한줄평, 감상작성",
      },
      collection: {
        title: "컬렉션 생성",
        subtitle: "나만의 영화 모음 만들기",
      },
    },
  },
  auth: {
    login: {
      google: "구글로 로그인",
      loading: "로그인 중...",
    },
    nickname: {
      greeting: "{{name}}님, 환영해요.",
      title: "닉네임을 설정해주세요.",
      placeholder: "닉네임을 입력해주세요",
    },
    genre: {
      greeting: "{{nickname}}님, 거의 다 왔어요.",
      title: "선호 장르를 선택해주세요.",
      subtitle: "최대 {{count}}개까지 선택할 수 있어요.",
      loadFailed: "장르 목록을 불러오지 못했습니다.",
      selectAtLeastOne: "선호 장르를 하나 이상 선택하세요.",
      start: "시작하기",
      startWithCount: "시작하기 ({{count}})",
    },
    onboarding: {
      loginRequired: "로그인이 필요합니다.",
    },
  },
  home: {
    empty: {
      noLogs: "아직 남긴 기록이 없습니다. 첫 영화를 기록해보세요.",
      noCollections: "아직 컬렉션이 없습니다. 첫 아카이브를 만들어보세요.",
    },
  },
  explore: {
    searchPlaceholder: "컬렉션에서 작품 검색",
    header: {
      title: "탐색",
      subtitle: "기록되지 않은 걸작을, 나만의 아카이브에서 찾아보세요.",
    },
    curation: {
      title: "당신을 위한 큐레이션",
      subtitle: "선호 장르로 엄선한 작품을 아카이브에 담았습니다.",
      setGenresFirst: "선호 장르를 먼저 설정해주세요.",
      loadFailed: "영화 목록을 불러오지 못했습니다.",
      noMatches: "조건에 맞는 작품이 없습니다.",
    },
    directorShelf: {
      title: "{{name}}의 다른 작품",
      subtitle: "Director’s Log · 당신의 리뷰로 다시 읽는 감독의 작품들.",
    },
    castShelf: {
      title: "{{name}} 출연작",
      subtitle: "당신의 페르소나 · 리뷰로 쌓아 올린 배우 아카이브.",
    },
    communityTopRated: {
      title: "커뮤니티 고평점",
      subtitle: "Filmolog 유저들이 높게 평가한 작품.",
    },
    genreTopRated: {
      title: "내 장르, Filmolog 고평점",
      subtitle: "선호 장르 × 커뮤니티 평점.",
      empty: "장르 데이터가 쌓이면 추천이 표시됩니다. 리뷰를 작성해주세요.",
    },
    mostLogged: {
      title: "많이 기록된 작품",
      subtitle: "Filmolog에서 가장 많이 리뷰된 영화.",
    },
    mostCollected: {
      title: "많이 담긴 작품",
      subtitle: "컬렉션에 자주 담긴 영화.",
    },
    search: {
      title: "아카이브 검색",
      loadFailed: "검색 결과를 불러오지 못했습니다.",
      notFound: "아카이브에서 해당 작품을 찾지 못했습니다.",
    },
  },
  filmLog: {
    search: {
      placeholder: "기록할 영화를 검색하세요",
      title: "영화 검색",
      hint: "영화 제목을 2자 이상 입력해 검색하세요.",
      loadFailed: "검색 결과를 불러오지 못했습니다.",
      noResults: "검색 결과가 없습니다.",
    },
    selected: {
      title: "기본 정보",
      subtitle: "선택한 작품의 정보를 확인하세요.",
      loadFailed: "영화 정보를 불러오지 못했습니다.",
      changeMovie: "다른 영화 선택",
    },
    form: {
      watched: {
        title: "시청일",
        subtitle: "언제 이 작품을 보셨나요?",
      },
      rating: {
        title: "평점",
      },
      review: {
        title: "한줄평 · 감상",
        subtitle: "짧은 메모도 좋아요.",
        placeholder: "이 영화에 대한 생각을 적어보세요.",
      },
      collection: {
        title: "컬렉션에 담기",
        subtitle: "선택한 컬렉션에 이 작품을 바로 추가해요.",
        empty: "아직 컬렉션이 없습니다. 기록만 저장하거나 컬렉션을 먼저 만들어주세요.",
      },
      submit: "기록 저장",
    },
    wishlist: {
      title: "위시리스트",
      subtitle: "담아둔 영화 중, 보신 작품이 있으신가요?",
      loadFailed: "위시리스트를 불러오지 못했습니다.",
      viewAll: "위시리스트 전체 보기",
    },
    complete: {
      firstLog: "첫 번째 기록 완료!",
      nthLog: "{{count}}번째 기록 완료!",
      recordAnother: "다른 기록하기",
    },
  },
  review: {
    list: {
      title: "나의 기록",
      emptyAll: "아직 남긴 기록이 없습니다. 첫 영화를 기록해보세요.",
      emptyPeriod: "선택한 기간에 해당하는 기록이 없습니다.",
    },
    calendar: {
      monthComplete: "이번 달 칸을 모두 채웠어요",
      tagline: "포스터로 채워지는 나만의 영화 달력",
      selectedHint: "선택: {{date}} · 다시 누르면 월 전체",
      hint: "빈 칸을 눌러 그날 기록을, 포스터를 눌러 상세로 이동하세요.",
      emptyDay: "이 날은 아직 비어 있어요. 기록을 남기면 포스터가 채워집니다.",
      emptyMonth: "이번 달에 남긴 기록이 없습니다.",
    },
    detail: {
      loadFailed: "기록을 불러오지 못했습니다.",
      catalog: {
        title: "작품 카드",
        subtitle: "아카이브에 등록된 영화 정보.",
      },
      rating: {
        title: "내 평점",
        subtitle: "이 작품에 남긴 점수.",
      },
      journal: {
        title: "감상 기록",
        subtitle: "남긴 메모와 생각.",
        empty: "아직 감상을 적지 않았습니다.",
      },
      menu: {
        movieInfo: "작품 정보",
      },
      shareTitle: "Filmolog 기록 공유",
    },
    share: {
      footer: "filmolog archive",
    },
  },
  collection: {
    create: {
      basicInfo: {
        title: "기본 정보",
        subtitle: "컬렉션의 이름과 설명을 적어주세요.",
      },
      nameLabel: "이름",
      namePlaceholder: "예: 우울할 때 보는 영화",
      descriptionLabel: "설명",
      descriptionPlaceholder: "이 컬렉션에 담은 이유를 적어보세요.",
      theme: {
        title: "컬렉션 테마",
        subtitle: "아카이브 표지 분위기를 선택하세요.",
      },
      films: {
        title: "영화 추가",
        subtitle: "기록한 영화 중 컬렉션에 담을 작품을 고르세요.",
        empty: "아직 기록한 영화가 없습니다. 영화를 먼저 기록해주세요.",
      },
      submit: "컬렉션 만들기",
    },
    list: {
      title: "나의 컬렉션",
      empty: "아직 컬렉션이 없습니다. 첫 컬렉션을 만들어보세요.",
      createNew: "새 컬렉션 만들기",
    },
    detail: {
      loadFailed: "컬렉션을 불러오지 못했습니다.",
      filmsTitle: "담긴 영화",
      emptyFilms: "아직 담긴 영화가 없습니다.",
      addFilm: "영화 추가",
      removeFromCollection: "컬렉션에서 삭제",
      deleteCollection: "컬렉션 삭제",
    },
    addMovies: {
      searchPlaceholder: "기록한 영화 검색",
      subtitleDefault: "기록한 영화 중 아직 담지 않은 작품을 고르세요.",
      selectPrompt: "영화를 선택해주세요",
      empty: {
        noLogs: "아직 기록한 영화가 없습니다. 영화를 먼저 기록해주세요.",
        allAdded: "추가할 수 있는 영화가 없습니다. 이미 모두 담았어요.",
        noSearchMatch: "\"{{query}}\"에 맞는 영화가 없습니다.",
        noneToShow: "표시할 영화가 없습니다.",
      },
    },
  },
  profile: {
    pageTitle: "마이페이지",
    tagline: "오늘 당신의 마음을 움직인 단 하나의 장면은 무엇인가요?",
    menu: {
      myLogs: {
        label: "내 기록",
        subtitle: "작성한 리뷰 전체 보기",
      },
      myCollections: {
        label: "내 컬렉션",
        subtitle: "큐레이션한 영화 목록",
      },
      wishlist: {
        label: "위시리스트",
        subtitle: "담아둔 영화",
      },
      badges: {
        label: "배지",
        subtitle: "획득한 업적 확인",
      },
    },
    edit: {
      title: "프로필 수정",
      subtitle: "닉네임과 선호 장르를 변경할 수 있어요.",
      nicknameLabel: "닉네임",
      nicknamePlaceholder: "닉네임",
    },
    genreEdit: {
      title: "선호 장르 변경",
      subtitle: "최대 {{count}}개까지 선택할 수 있어요.",
    },
    wishlist: {
      loadFailed: "위시리스트를 불러오지 못했습니다.",
      empty: "담아둔 영화가 없습니다.",
    },
  },
  settings: {
    sections: {
      account: "계정",
      support: "지원",
      legal: "법적 고지",
      app: "앱",
      accountManagement: "계정 관리",
    },
    account: {
      genreEdit: {
        label: "선호 장르 변경",
        subtitle: "탐색 추천에 반영되는 장르",
      },
    },
    support: {
      notice: "Filmolog는 1인으로 운영 중이에요. 남겨주신 의견은 순차 검토하며, 반영 시점은 작업 규모에 따라 달라질 수 있어요.",
      featureRequest: {
        label: "기능 제안하기",
        subtitle: "아이디어를 남겨주시면 검토 후 반영해요",
      },
      bugReport: {
        label: "오류 제보하기",
        subtitle: "접수 후 순차 수정 · 버전·계정은 자동 입력",
      },
      feedbackForm: {
        feature: "기능제안",
        bug: "오류/버그 제보하기",
      },
    },
    legal: {
      privacyPolicy: {
        label: "개인정보처리방침",
        subtitle: "수집·이용·보관에 관한 안내",
      },
    },
    app: {
      version: {
        label: "버전",
        subtitle: "Filmolog",
      },
    },
    accountManagement: {
      logout: {
        label: "로그아웃",
        subtitle: "다시 로그인할 수 있어요",
      },
      deleteAccount: {
        label: "회원 탈퇴",
        subtitle: "모든 기록이 영구 삭제됩니다",
      },
    },
    language: {
      label: "언어",
      subtitle: "앱 표시 언어",
      ko: "한국어",
      en: "English",
    },
  },
  statistics: {
    pageTitle: "통계",
    tagline: "모든 기록은 한 편의 영화가 되어 당신이라는 필모그래피로 남습니다.",
    sections: {
      filmography: {
        title: "나의 필모그래피",
        subtitle: "숫자로 읽는 기록의 윤곽.",
      },
      thisYear: {
        title: "올해의 기록",
        subtitle: "한 해의 필모그래피 결산.",
      },
      journalHabit: {
        title: "기록 습관",
        subtitle: "평점과 함께 남긴 글의 온도.",
      },
      monthly: {
        title: "월별 기록",
        subtitle: "최근 6개월간 쌓인 장면 수.",
        empty: "기록이 쌓이면 월별 그래프가 표시됩니다.",
      },
      ratingDistribution: {
        title: "평점 분포",
        subtitle: "별점별로 남긴 기록의 무게.",
        empty: "리뷰를 작성하면 평점 분포가 표시됩니다.",
      },
      genreDistribution: {
        title: "장르 분포",
        subtitle: "기록 속에서 드러나는 취향.",
        empty: "장르 정보가 있는 기록이 쌓이면 파이 차트가 표시됩니다.",
        excludedNote: "장르 미등록 기록 {{count}}편은 집계에서 제외됩니다.",
      },
      preferredVsActual: {
        title: "선호 장르 vs 실제",
        subtitle: "온보딩에서 고른 취향의 흔적.",
        empty: "선호 장르 기록이 없습니다.",
      },
      genreRating: {
        title: "장르별 평균 평점",
        subtitle: "2편 이상 기록한 장르만 표시.",
        empty: "장르당 2편 이상 기록이 쌓이면 표시됩니다.",
        reviewsLabel: "리뷰",
        avgLabel: "평균",
      },
      decade: {
        title: "개봉 연대별",
        subtitle: "어떤 시대의 영화를 주로 남겼는지.",
        empty: "개봉 연도가 있는 기록이 쌓이면 표시됩니다.",
        excludedNote: "개봉 연도 미등록 기록 {{count}}편은 집계에서 제외됩니다.",
      },
      directors: {
        title: "선호 감독",
        subtitle: "기록 속에 자주 등장하는 연출.",
        empty: "감독 정보가 있는 기록이 쌓이면 순위가 표시됩니다.",
        excludedNote: "감독 미등록 기록 {{count}}편은 집계에서 제외됩니다.",
      },
      cast: {
        title: "선호 배우",
        subtitle: "주연 billing top 5 기준.",
        empty: "배우 정보가 있는 기록이 쌓이면 순위가 표시됩니다.",
        excludedNote: "배우 미등록 기록 {{count}}편은 집계에서 제외됩니다.",
      },
      highlights: {
        title: "높은 평점 Top 3",
        subtitle: "마음에 남은 장면들.",
        empty: "아직 기록된 작품이 없습니다.",
      },
      badges: {
        title: "배지 진행",
        subtitle: "필모그래피를 채워가는 업적.",
        viewAll: "배지 전체 보기",
      },
    },
    insights: {
      yearDeltaUp: "작년보다 +{{delta}}",
      yearDeltaDown: "작년보다 {{delta}}",
      yearDeltaSame: "작년과 동일",
      journalEmpty: "첫 리뷰를 남기면 기록 습관이 집계됩니다.",
      journalCount: "{{count}}편에 감상을 적었습니다.",
      preferredGenreEmpty: "선호 장르의 기록이 아직 없습니다. 첫 장면을 남겨보세요.",
      preferredGenreTop: "선호 장르 중 「{{genre}}」 기록이 가장 많습니다.",
      raterEmpty: "첫 기록을 남기면 취향의 윤곽이 드러납니다.",
      raterGenerous: "관대한 평론가 — 좋은 장면을 넉넉히 기억하는 타입.",
      raterStrict: "깐깐한 평론가 — 엄선한 장면만 필모그래피에 담습니다.",
      raterBalanced: "균형 잡힌 시선 — 기록마다 장면의 온도가 고르게 남아 있습니다.",
    },
  },
  badges: {
    list: {
      loadFailed: "배지를 불러오지 못했습니다.",
    },
    unlock: {
      title: "뱃지 획득!",
      dismissHint: "탭하여 닫기",
    },
    categories: {
      activity: "활동량",
      taste: "취향 · 장르",
      curation: "큐레이션",
    },
    items: {
      first_ticket: {
        name: "첫 발권",
        description: "첫 리뷰 작성",
      },
      short_film: {
        name: "단편 필름",
        description: "리뷰 10개 작성",
      },
      indie_director: {
        name: "독립 영화 감독",
        description: "리뷰 50개 작성",
      },
      blockbuster: {
        name: "블록버스터",
        description: "리뷰 100개 작성",
      },
      masterpiece: {
        name: "마스터피스",
        description: "리뷰 500개 작성",
      },
      popcorn_tears: {
        name: "눈물의 팝콘",
        description: "로맨스·드라마 영화 리뷰 20개 작성",
      },
      brave_heart: {
        name: "강심장",
        description: "공포·스릴러 영화 리뷰 20개 작성",
      },
      couch_critic: {
        name: "방구석 평론가",
        description: "50편 이상 평균 평점 2.5 이하 유지",
      },
      rotten_collector: {
        name: "로튼 토마토 수집가",
        description: "다른 사람 평점 2.0 이하 영화에 4.0 이상 평점 3회",
      },
      chief_curator: {
        name: "수석 큐레이터",
        description: "영화 10편 이상 담은 컬렉션 3개 생성",
      },
      treasure_hunter: {
        name: "보물 사냥꾼",
        description: "위시리스트에 담았던 영화 리뷰 10개 작성",
      },
    },
  },
  movie: {
    detail: {
      catalog: {
        title: "작품 정보",
        subtitle: "아카이브에 등록된 영화 메타데이터.",
      },
      community: {
        title: "커뮤니티 평가",
        subtitle: "Filmolog 유저들의 평균 평점과 기록 수.",
        loadFailed: "커뮤니티 평가를 불러오지 못했습니다.",
        empty: "아직 Filmolog에 기록된 평가가 없습니다.",
      },
      synopsis: {
        title: "줄거리",
        subtitle: "작품 소개.",
        empty: "등록된 줄거리가 없습니다.",
      },
      loadFailed: "영화 정보를 불러오지 못했습니다.",
      writeReview: "리뷰 작성",
    },
  },
  errors: {
    saveFailed: {
      generic: "저장 실패",
      nickname: "닉네임 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
      genres: "선호 장르 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
      profile: "프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
      reviewUpdate: "기록을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.",
      reviewCreate: "영화 기록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
      wishlist: "위시리스트를 업데이트하지 못했습니다. 잠시 후 다시 시도해주세요.",
    },
    deleteFailed: {
      generic: "삭제 실패",
      review: "기록을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
      collectionMovie: "영화를 컬렉션에서 제거하지 못했습니다. 잠시 후 다시 시도해주세요.",
      collection: "컬렉션을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
    },
    createFailed: {
      generic: "생성 실패",
      collection: "컬렉션을 만들지 못했습니다. 잠시 후 다시 시도해주세요.",
    },
    addFailed: {
      generic: "추가 실패",
      collectionMovies: "영화를 컬렉션에 담지 못했습니다. 잠시 후 다시 시도해주세요.",
    },
    openFailed: {
      title: "열기 실패",
      googleForm: "Google Form을 열 수 없습니다. 잠시 후 다시 시도해주세요.",
      privacyPolicy: "개인정보처리방침 페이지를 열 수 없습니다. 잠시 후 다시 시도해주세요.",
    },
    logoutFailed: {
      title: "로그아웃 실패",
      message: "잠시 후 다시 시도해주세요.",
    },
    deleteAccount: {
      verifyFailed: "탈퇴 확인 중 오류가 발생했습니다.",
      dataNotRemoved: "계정 데이터가 삭제되지 않았습니다. delete_user_account RPC를 적용했는지 확인해주세요.",
      rpcMissing: "탈퇴 기능이 아직 서버에 설정되지 않았습니다.",
      rpcFailed: "회원 탈퇴 처리에 실패했습니다.",
      rpcFailedRetry: "회원 탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.",
      signOutAfterDelete: "데이터는 삭제됐지만 로그아웃에 실패했습니다. 앱을 다시 실행해주세요.",
    },
    auth: {
      googleConfig: {
        title: "Google 로그인 설정 오류",
        message: "앱 서명(SHA-1)이 Google Cloud에 등록되지 않았을 수 있습니다. debug/release 빌드에 맞는 SHA-1을 Android OAuth 클라이언트(com.filmolog)에 추가한 뒤 5~10분 후 다시 시도해주세요.",
      },
      googleIdTokenMissing: "Google idToken이 없습니다.",
    },
    validation: {
      selectRating: "평점을 선택해주세요.",
      collectionNameRequired: "컬렉션 이름을 입력해주세요.",
      selectFilmsToAdd: "추가할 영화를 선택해주세요.",
    },
    duplicateReview: {
      title: "이미 기록됨",
      message: "이미 리뷰를 작성한 영화입니다.",
    },
  },
  dialogs: {
    validation: {
      title: "입력 확인",
    },
    selection: {
      title: "선택 확인",
    },
    logout: {
      title: "로그아웃",
      message: "정말 로그아웃하시겠습니까?",
      confirm: "로그아웃",
    },
    deleteAccount: {
      title: "회원 탈퇴",
      message: "탈퇴 시 작성한 리뷰, 컬렉션, 위시리스트 등 모든 기록이 삭제되며 복구할 수 없습니다.",
      confirm: "탈퇴하기",
      failedTitle: "탈퇴 실패",
    },
    deleteReview: {
      title: "기록 삭제",
      message: "\"{{title}}\" 기록을 삭제할까요?",
    },
    deleteCollection: {
      title: "컬렉션 삭제",
      message: "\"{{name}}\" 컬렉션을 삭제할까요?\n담긴 영화 목록도 함께 삭제됩니다. (영화 기록은 유지됩니다)",
    },
  },
};

export default translation;
