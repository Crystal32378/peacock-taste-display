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
  { id: 'mira', name: 'Mira', age: 31, city: '台北', portrait: 'mira.jpg', blurb: '安靜、觀察入微。一件好外套穿十年。',
    feathers: { artist: ['Brian Eno'], book: ['Ways of Seeing'], place: ['Blue Bottle Coffee'], brand: ['Jil Sander'] } },
  { id: 'dax', name: 'Dax', age: 29, city: '新竹', portrait: 'dax.jpg', blurb: '輕鬆愛玩，Roguelike 時數 400 起跳。',
    feathers: { video_game: ['Celeste'], artist: ['Daft Punk'], tv_show: ['Arcane'], podcast: ['Armchair Expert'] } },
  { id: 'lin', name: 'Lin', age: 34, city: '高雄', portrait: 'lin.jpg', blurb: '為了一棟建築排整趟旅行，愛慢電影。',
    feathers: { movie: ['Perfect Days'], tv_show: ['Fleabag'], destination: ['Naoshima'], podcast: ['Song Exploder'], person: ['Hayao Miyazaki'] } },
  { id: 'theo', name: 'Theo', age: 38, city: '台中', portrait: 'theo.jpg', blurb: '表情很難讀。還沒決定自己喜不喜歡任何東西。',
    feathers: { movie: ['Heat'], artist: ['Steely Dan'], place: ['Kinokuniya Bookstore'], podcast: ['Hardcore History'], brand: ['Patagonia'] } },
  { id: 'ren', name: 'Ren', age: 26, city: '台北', portrait: 'ren.jpg', blurb: '短髮、舊外套，收獨立遊戲原聲帶和小誌。',
    feathers: { artist: ['Aphex Twin'], video_game: ['Hollow Knight'], brand: ['Maison Margiela'], tv_show: ['Severance'] } },
  { id: 'jun', name: 'Jun', age: 45, city: '台南', portrait: 'jun.jpg', blurb: '認真煮飯，認真讀歷史。溫暖而穩。',
    feathers: { place: ['Blue Bottle Coffee'], movie: ['Tampopo'], book: ['The Remains of the Day'], podcast: ['Hardcore History'] } },
  { id: 'bei', name: 'Bei', age: 33, city: '台北', portrait: 'bei.jpg', blurb: '畫畫、愛陶器，常在舊書店消失一下午。',
    feathers: { book: ['Letters to a Young Poet'], artist: ['Ryuichi Sakamoto'], person: ['Yayoi Kusama'], place: ['Eslite Bookstore'] } },
  { id: 'oliver', name: 'Oliver', age: 37, city: '花蓮', portrait: 'oliver.jpg', blurb: '看海岸線排行程，長 Podcast 配長途山路。',
    feathers: { destination: ['Iceland'], podcast: ['Radiolab'], brand: ['Patagonia'], video_game: ['Red Dead Redemption 2'], person: ['Werner Herzog'] } },
  { id: 'suyin', name: 'Su-yin', age: 52, city: '台北', portrait: 'suyin.jpg', blurb: '優雅、帶笑，對香水和建築都有定見。',
    feathers: { brand: ['The Row'], destination: ['Naoshima'], place: ['Eslite Bookstore'], movie: ['In the Mood for Love'] } },
  { id: 'kai', name: 'Kai', age: 24, city: '台北', portrait: 'kai.jpg', blurb: '耳機掛脖子，愛 club、球鞋，閒不下來。',
    feathers: { artist: ['Four Tet'], brand: ['Nike'], podcast: ['Armchair Expert'], tv_show: ['Euphoria'] } },
];
