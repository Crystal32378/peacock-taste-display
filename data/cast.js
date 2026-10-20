// Fictional adults (18+). Names, ages, cities and personalities are invented.
// Taste items are real, publicly known works/places/brands so Qloo can resolve
// them; no real person is depicted or implied by any portrait.
// Ten feathers = Qloo's ten entity types.
export const FEATHER_ORDER = ['movie', 'tv_show', 'artist', 'book', 'place', 'destination', 'podcast', 'video_game', 'brand', 'person'];

export const FEATHER_LABEL = {
  movie: { en: 'FILM', zh: '電影' },
  tv_show: { en: 'SERIES', zh: '影集' },
  artist: { en: 'ARTIST', zh: '藝人' },
  book: { en: 'BOOK', zh: '書' },
  place: { en: 'PLACE', zh: '地點' },
  destination: { en: 'DESTINATION', zh: '目的地' },
  podcast: { en: 'PODCAST', zh: 'Podcast' },
  video_game: { en: 'GAME', zh: '遊戲' },
  brand: { en: 'BRAND', zh: '品牌' },
  person: { en: 'PERSON', zh: '人物' },
};

// The visitor ("you") in the demo. Replaceable per request.
export const viewer = {
  id: 'you',
  name: '你',
  feathers: {
    movie: ['Perfect Days'],
    tv_show: ['Fleabag'],
    artist: ['Brian Eno'],
    book: ['Ways of Seeing'],
    place: ['Blue Bottle Coffee'],
    destination: ['Kyoto'],
    podcast: ['Song Exploder'],
    video_game: ['Hades'],
    brand: ['Jil Sander'],
    person: ['Hayao Miyazaki'],
  },
};

export const cast = [
  { id: 'mira', name: "Mira", age: 31, city: '台北', portrait: 'mira.jpg', blurb: "安靜、觀察入微。一件好外套穿十年。", cityEn: 'Taipei', blurbEn: "Quiet and watchful. One good coat, worn for ten years.",
    tag: "安靜極簡派", tagEn: "The quiet minimalist", taste: "環境音樂、藝術評論，和一杯很好的咖啡。", tasteEn: "Ambient records, art criticism, one very good coffee.",
    feathers: { movie: ["Lost in Translation"], tv_show: ["Mad Men"], artist: ["Brian Eno"], book: ["Ways of Seeing"], place: ["Blue Bottle Coffee"], destination: ["Copenhagen"], podcast: ["Desert Island Discs"], video_game: ["Gris"], brand: ["Jil Sander"], person: ["Sofia Coppola"] } },
  { id: 'dax', name: "Dax", age: 29, city: '新竹', portrait: 'dax.jpg', blurb: "輕鬆愛玩，Roguelike 時數 400 起跳。", cityEn: 'Hsinchu', blurbEn: "Easygoing and game-obsessed. Four hundred hours of roguelike, minimum.",
    tag: "Roguelike 重度玩家", tagEn: "The roguelike lifer", taste: "深夜遊戲、法式浩室，和節奏很快的動畫。", tasteEn: "Late-night games, French house, and animation that moves fast.",
    feathers: { movie: ["Spider-Man: Into the Spider-Verse"], tv_show: ["Arcane"], artist: ["Daft Punk"], book: ["Project Hail Mary"], place: ["Kura Sushi"], destination: ["Seoul"], podcast: ["Lex Fridman Podcast"], video_game: ["Celeste"], brand: ["Nintendo"], person: ["Hideo Kojima"] } },
  { id: 'lin', name: "Lin", age: 34, city: '高雄', portrait: 'lin.jpg', blurb: "為了一棟建築排整趟旅行，愛慢電影。", cityEn: 'Kaohsiung', blurbEn: "Plans whole trips around a single building. Loves a slow film.",
    tag: "慢電影建築迷", tagEn: "The slow-film architect", taste: "慢電影、安靜的建築，還有把歌拆開來看的好奇心。", tasteEn: "Slow films, quiet buildings, and songs taken apart to see how they work.",
    feathers: { movie: ["Perfect Days"], tv_show: ["Fleabag"], artist: ["Harold Budd"], book: ["In Praise of Shadows"], place: ["Saint Frank Coffee"], destination: ["Naoshima"], podcast: ["Song Exploder"], video_game: ["Journey"], brand: ["Muji"], person: ["Hayao Miyazaki"] } },
  { id: 'theo', name: "Theo", age: 38, city: '台中', portrait: 'theo.jpg', blurb: "表情很難讀。還沒決定自己喜不喜歡任何東西。", cityEn: 'Taichung', blurbEn: "Hard to read. Has not yet decided whether he likes anything.",
    tag: "精準派", tagEn: "The precision man", taste: "搶案電影、爵士搖滾的精準，和很長的歷史講座。", tasteEn: "Heist films, jazz-rock exactness, and very long history lectures.",
    feathers: { movie: ["Heat"], tv_show: ["Breaking Bad"], artist: ["Steely Dan"], book: ["The Power Broker"], place: ["Kinokuniya Bookstore"], destination: ["Las Vegas"], podcast: ["Hardcore History"], video_game: ["Civilization VI"], brand: ["Patagonia"], person: ["Al Pacino"] } },
  { id: 'ren', name: "Ren", age: 26, city: '台北', portrait: 'ren.jpg', blurb: "短髮、舊外套，收獨立遊戲原聲帶和小誌。", cityEn: 'Taipei', blurbEn: "Cropped hair, old jacket. Collects indie game soundtracks and zines.",
    tag: "小誌收藏派", tagEn: "The zine collector", taste: "故障電子樂、怪電影，和刻意看起來有點不對的衣服。", tasteEn: "Glitchy electronics, strange films, and clothes that look slightly wrong on purpose.",
    feathers: { movie: ["Under the Skin"], tv_show: ["Severance"], artist: ["Aphex Twin"], book: ["Gravity's Rainbow"], place: ["Dover Street Market"], destination: ["Berlin"], podcast: ["Stuff You Should Know"], video_game: ["Hollow Knight"], brand: ["Maison Margiela"], person: ["David Lynch"] } },
  { id: 'jun', name: "Jun", age: 45, city: '台南', portrait: 'jun.jpg', blurb: "認真煮飯，認真讀歷史。溫暖而穩。", cityEn: 'Tainan', blurbEn: "Cooks seriously, reads history seriously. Warm and steady.",
    tag: "耐心下廚派", tagEn: "The patient cook", taste: "美食電影、長篇小說，和慢慢講的歷史。", tasteEn: "Food films, long novels, and history told slowly.",
    feathers: { movie: ["Tampopo"], tv_show: ["Chef's Table"], artist: ["Nina Simone"], book: ["The Remains of the Day"], place: ["Blue Bottle Coffee"], destination: ["Lyon"], podcast: ["Revolutions"], video_game: ["Stardew Valley"], brand: ["Le Creuset"], person: ["Anthony Bourdain"] } },
  { id: 'bei', name: "Bei", age: 33, city: '台北', portrait: 'bei.jpg', blurb: "畫畫、愛陶器，常在舊書店消失一下午。", cityEn: 'Taipei', blurbEn: "Paints, loves ceramics, vanishes into second-hand bookshops for an afternoon.",
    tag: "陶器畫家", tagEn: "The ceramic painter", taste: "安靜的車、手工之城，和教你怎麼看的書。", tasteEn: "Quiet cars, craft towns, and books that teach you how to look.",
    feathers: { movie: ["Drive My Car"], tv_show: ["The Great Pottery Throw Down"], artist: ["Ryuichi Sakamoto"], book: ["About Looking"], place: ["Eslite Bookstore"], destination: ["Kanazawa"], podcast: ["The Rest Is History"], video_game: ["Unpacking"], brand: ["Aesop"], person: ["Yayoi Kusama"] } },
  { id: 'oliver', name: "Oliver", age: 37, city: '花蓮', portrait: 'oliver.jpg', blurb: "看海岸線排行程，長 Podcast 配長途山路。", cityEn: 'Hualien', blurbEn: "Plans trips around coastlines. Long podcasts for long mountain roads.",
    tag: "海岸線規劃派", tagEn: "The coastline planner", taste: "荒野、長長的 Podcast，和對著懸崖說話的導演。", tasteEn: "Wild places, long podcasts, and a director who talks to cliffs.",
    feathers: { movie: ["Into the Wild"], tv_show: ["Planet Earth"], artist: ["Sigur Rós"], book: ["Into Thin Air"], place: ["REI"], destination: ["Iceland"], podcast: ["Radiolab"], video_game: ["Red Dead Redemption 2"], brand: ["Patagonia"], person: ["Werner Herzog"] } },
  { id: 'suyin', name: "Su-yin", age: 52, city: '台北', portrait: 'suyin.jpg', blurb: "優雅、帶笑，對香水和建築都有定見。", cityEn: 'Taipei', blurbEn: "Elegant, quick to smile, with firm views on perfume and architecture.",
    tag: "香水與建築", tagEn: "Perfume and architecture", taste: "慢慢燒的電影、偉大的女高音，還有知道什麼時候該停的建築。", tasteEn: "Slow-burning films, great sopranos, and buildings that know when to stop.",
    feathers: { movie: ["In the Mood for Love"], tv_show: ["The Crown"], artist: ["Maria Callas"], book: ["Perfume: The Story of a Murderer"], place: ["Eslite Bookstore"], destination: ["Naoshima"], podcast: ["In Our Time"], video_game: ["Monument Valley"], brand: ["The Row"], person: ["Tadao Ando"] } },
  { id: 'kai', name: "Kai", age: 24, city: '台北', portrait: 'kai.jpg', blurb: "耳機掛脖子，愛 club、球鞋，閒不下來。", cityEn: 'Taipei', blurbEn: "Headphones round the neck. Clubs, sneakers, cannot sit still.",
    tag: "夜生活原住民", tagEn: "The nightlife native", taste: "倉庫派對的節拍、球鞋，和閃亮亮的影集。", tasteEn: "Warehouse beats, sneakers, and television with a lot of glitter.",
    feathers: { movie: ["Uncut Gems"], tv_show: ["Euphoria"], artist: ["Four Tet"], book: ["Dune"], place: ["Berghain"], destination: ["Ibiza"], podcast: ["Armchair Expert"], video_game: ["Fortnite"], brand: ["Nike"], person: ["Virgil Abloh"] } },
];

// a flicker, two folds in a row (yawn, then eye-roll), then a real match (the double take).
const WALK = ['mira', 'dax', 'theo', 'kai', 'suyin', 'lin', 'ren', 'oliver', 'jun', 'bei'];
cast.sort((a, b) => WALK.indexOf(a.id) - WALK.indexOf(b.id));
