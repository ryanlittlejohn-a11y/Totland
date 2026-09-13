/**
 * Word Finds — 100 original themed puzzles written for Totland.
 * Short, picture-friendly words only (3–8 letters, A–Z, no spaces),
 * so pre-readers can trace them with a finger.
 */

export interface WordFindTheme {
  id: string;
  title: string;
  emoji: string;
  words: string[];
}

/** Picture hints shown beside each word. Falls back to the theme emoji. */
export const WORD_EMOJI: Record<string, string> = {
  cow: "🐄", pig: "🐷", hen: "🐔", duck: "🦆", goat: "🐐", sheep: "🐑", horse: "🐴", barn: "🛖",
  dog: "🐶", cat: "🐱", fox: "🦊", bear: "🐻", owl: "🦉", bat: "🦇", deer: "🦌", frog: "🐸",
  lion: "🦁", tiger: "🐯", zebra: "🦓", monkey: "🐵", snake: "🐍", parrot: "🦜", panda: "🐼",
  whale: "🐳", crab: "🦀", fish: "🐟", shark: "🦈", seal: "🦭", squid: "🦑", turtle: "🐢",
  bee: "🐝", ant: "🐜", moth: "🦋", snail: "🐌", spider: "🕷️", worm: "🪱", ladybug: "🐞",
  apple: "🍎", pear: "🍐", plum: "🫐", grape: "🍇", lemon: "🍋", peach: "🍑", melon: "🍈",
  banana: "🍌", cherry: "🍒", berry: "🍓", kiwi: "🥝", mango: "🥭", orange: "🍊",
  bread: "🍞", cheese: "🧀", egg: "🥚", milk: "🥛", soup: "🍲", rice: "🍚", pasta: "🍝",
  pizza: "🍕", taco: "🌮", cake: "🍰", donut: "🍩", cookie: "🍪", candy: "🍬", jam: "🍯",
  carrot: "🥕", peas: "🫛", corn: "🌽", bean: "🫘", potato: "🥔", onion: "🧅", salad: "🥗",
  water: "💧", juice: "🧃", tea: "🍵", honey: "🍯", nuts: "🥜", toast: "🍞", waffle: "🧇",
  red: "🔴", blue: "🔵", green: "🟢", pink: "🩷", black: "⚫", white: "⚪", brown: "🟤",
  yellow: "🟡", purple: "🟣", gold: "🥇", gray: "🩶",
  circle: "⚪", square: "🟥", star: "⭐", heart: "❤️", oval: "🥚", cube: "🧊", cone: "🍦",
  one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣", six: "6️⃣", seven: "7️⃣",
  eight: "8️⃣", nine: "9️⃣", ten: "🔟", zero: "0️⃣",
  sun: "☀️", moon: "🌙", cloud: "☁️", rain: "🌧️", snow: "❄️", wind: "🌬️", storm: "⛈️",
  fog: "🌫️", ice: "🧊", rainbow: "🌈", sky: "🌤️", night: "🌌",
  tree: "🌳", leaf: "🍃", grass: "🌿", flower: "🌻", rose: "🌹", seed: "🌱", root: "🪴",
  rock: "🪨", sand: "🏖️", hill: "⛰️", river: "🏞️", lake: "🏕️", pond: "🦆", woods: "🌲",
  car: "🚗", bus: "🚌", train: "🚂", boat: "⛵", ship: "🚢", plane: "✈️", truck: "🚚",
  bike: "🚲", taxi: "🚕", van: "🚐", tram: "🚊", rocket: "🚀", wagon: "🛻", sled: "🛷",
  house: "🏠", door: "🚪", roof: "🏚️", bed: "🛏️", lamp: "💡", chair: "🪑", table: "🪑",
  cup: "🍵", plate: "🍽️", spoon: "🥄", fork: "🍴", bowl: "🥣", pot: "🍲", broom: "🧹",
  soap: "🧼", towel: "🧻", brush: "🪥", comb: "💇", mirror: "🪞", clock: "🕰️", key: "🔑",
  hat: "🎩", coat: "🧥", shirt: "👕", socks: "🧦", shoes: "👟", boots: "🥾", scarf: "🧣",
  glove: "🧤", dress: "👗", pants: "👖", belt: "🧷",
  ball: "⚽", kite: "🪁", drum: "🥁", blocks: "🧱", doll: "🪆", puzzle: "🧩", robot: "🤖",
  teddy: "🧸", yoyo: "🪀", train2: "🚂", bubble: "🫧", slide: "🛝", swing: "🎠",
  eye: "👁️", nose: "👃", ear: "👂", hand: "✋", foot: "🦶", hair: "💇", knee: "🦵",
  arm: "💪", leg: "🦵", tooth: "🦷", smile: "😀", tummy: "🫄",
  book: "📖", page: "📄", pen: "🖊️", paint: "🎨", glue: "🧴", chalk: "🖍️", paper: "📄",
  desk: "🪑", bag: "🎒", ruler: "📏", crayon: "🖍️", school: "🏫",
  drum2: "🥁", horn: "📯", flute: "🪈", bell: "🔔", song: "🎵", dance: "💃", band: "🎺",
  guitar: "🎸", piano: "🎹", violin: "🎻",
  moonrock: "🌑", planet: "🪐", comet: "☄️", space: "🌌", alien: "👽", orbit: "🛰️",
  king: "🤴", queen: "👑", crown: "👑", castle: "🏰", dragon: "🐉", knight: "🛡️", magic: "✨",
  fairy: "🧚", wand: "🪄", witch: "🧙", giant: "🧌", troll: "🧌",
  cap: "🧢", mask: "🎭", gift: "🎁", balloon: "🎈", party: "🎉", cake2: "🎂", candle: "🕯️",
  camp: "🏕️", tent: "⛺", fire: "🔥", map: "🗺️", torch: "🔦", rope: "🪢", trail: "🥾",
  beach: "🏖️", shell: "🐚", wave: "🌊", surf: "🏄", boatie: "⛵", pail: "🪣", straw: "🥤",
  farm: "🚜", tractor: "🚜", hay: "🌾", field: "🌾", fence: "🚧", crop: "🌾", milkjug: "🥛",
  bird: "🐦", nest: "🪹", wing: "🪽", feather: "🪶", egg2: "🥚", robin: "🐦", swan: "🦢",
  dino: "🦖", bone: "🦴", fossil: "🦴", claw: "🦖", roar: "🦕", tail: "🦎",
  doctor: "🩺", nurse: "💉", chef: "👩‍🍳", baker: "🥐", farmer: "👨‍🌾", pilot: "✈️",
  vet: "🐾", police: "🚓", mail: "📮", teacher: "🧑‍🏫",
  happy: "😀", sad: "😢", angry: "😠", sleepy: "😴", shy: "😊", proud: "🥰", calm: "😌",
  big: "🐘", small: "🐭", tall: "🦒", short: "🐛", fast: "🐆", slow: "🐌", soft: "🧸",
  hard: "🪨", hot: "🔥", cold: "🧊", wet: "💧", dry: "🌵", loud: "📣", quiet: "🤫",
  up: "⬆️", down: "⬇️", in: "📥", out: "📤", over: "🌈", under: "🌂", near: "🤏", far: "🔭",
  mom: "👩", dad: "👨", baby: "👶", sister: "👧", brother: "👦", granny: "👵", family: "👨‍👩‍👧",
  friend: "🧑‍🤝‍🧑", hug: "🤗", share: "🤝", help: "🙌", please: "🙏", thanks: "💝",
  spring: "🌷", summer: "🌞", fall: "🍂", winter: "⛄", snowman: "⛄", pumpkin: "🎃",
  bunny: "🐰", chick: "🐤", lamb: "🐑", puppy: "🐶", kitten: "🐱", foal: "🐴", calf: "🐄",
  train3: "🚆", road: "🛣️", bridge: "🌉", tunnel: "🚇", city: "🏙️", town: "🏘️", shop: "🏪",
  park: "🏞️", zoo: "🦁", farm2: "🚜", pool: "🏊", gym: "🤸", store: "🛒", bank: "🏦",
  wash: "🧼", brushteeth: "🪥", sleep: "😴", wake: "⏰", eat: "🍽️", play: "🧸", read: "📖",
  run: "🏃", jump: "🤸", walk: "🚶", swim: "🏊", climb: "🧗", sing: "🎤", clap: "👏",
};

const t = (id: string, title: string, emoji: string, words: string[]): WordFindTheme => ({
  id,
  title,
  emoji,
  words,
});

/** 100 themed puzzles. The first FREE_WORD_FINDS are playable without premium. */
export const WORD_FIND_THEMES: WordFindTheme[] = [
  t("farm-animals", "Farm Animals", "🐄", ["cow", "pig", "hen", "duck", "goat", "sheep", "horse", "barn", "dog", "cat"]),
  t("pets", "Our Pets", "🐶", ["dog", "cat", "fish", "bird", "puppy", "kitten", "bunny", "bone", "ball", "nest"]),
  t("zoo-day", "A Day at the Zoo", "🦁", ["lion", "tiger", "zebra", "monkey", "snake", "panda", "bear", "seal", "owl", "zoo"]),
  t("under-the-sea", "Under the Sea", "🐳", ["fish", "crab", "whale", "shark", "seal", "squid", "shell", "wave", "sand", "boat"]),
  t("tiny-bugs", "Tiny Bugs", "🐝", ["bee", "ant", "moth", "snail", "worm", "spider", "leaf", "nest", "log", "web"]),
  t("rainbow-colors", "Rainbow Colors", "🌈", ["red", "blue", "green", "pink", "black", "white", "brown", "gold", "gray", "orange"]),
  t("fruit-basket", "Fruit Basket", "🍎", ["apple", "pear", "plum", "grape", "lemon", "peach", "melon", "kiwi", "berry", "mango"]),
  t("snack-time", "Snack Time", "🍪", ["cake", "donut", "cookie", "candy", "jam", "toast", "nuts", "juice", "milk", "waffle"]),
  t("dinner-table", "Dinner Table", "🍽️", ["soup", "rice", "pasta", "pizza", "taco", "bread", "cheese", "egg", "salad", "bowl"]),
  t("garden-veggies", "Garden Veggies", "🥕", ["carrot", "peas", "corn", "bean", "potato", "onion", "seed", "root", "soil", "water"]),
  t("counting-one", "Counting to Five", "5️⃣", ["one", "two", "three", "four", "five", "zero", "count", "add", "ten", "six"]),
  t("counting-two", "Counting to Ten", "🔟", ["six", "seven", "eight", "nine", "ten", "more", "less", "same", "pair", "set"]),
  t("shapes-around", "Shapes Around Me", "🔷", ["circle", "square", "star", "heart", "oval", "cube", "cone", "side", "round", "line"]),
  t("weather-today", "Weather Today", "🌤️", ["sun", "rain", "snow", "wind", "cloud", "storm", "fog", "ice", "warm", "cold"]),
  t("in-the-woods", "In the Woods", "🌳", ["tree", "leaf", "grass", "rock", "deer", "fox", "owl", "moss", "log", "path"]),
  t("things-that-go", "Things That Go", "🚗", ["car", "bus", "train", "boat", "plane", "truck", "bike", "van", "taxi", "tram"]),
  t("my-house", "My House", "🏠", ["house", "door", "roof", "bed", "lamp", "chair", "table", "rug", "wall", "key"]),
  t("getting-dressed", "Getting Dressed", "🧦", ["hat", "coat", "shirt", "socks", "shoes", "boots", "scarf", "glove", "dress", "pants"]),
  t("toy-box", "Toy Box", "🧸", ["ball", "kite", "drum", "doll", "robot", "teddy", "yoyo", "blocks", "puzzle", "train"]),
  t("my-body", "My Body", "✋", ["eye", "nose", "ear", "hand", "foot", "hair", "knee", "arm", "leg", "tooth"]),
  t("bedtime", "Bedtime", "🌙", ["moon", "star", "bed", "book", "sleep", "hug", "night", "quiet", "dream", "yawn"]),
  t("morning-time", "Morning Time", "☀️", ["sun", "wake", "wash", "eat", "brush", "dress", "toast", "milk", "smile", "bag"]),
  t("at-school", "At School", "🏫", ["book", "desk", "pen", "paper", "glue", "chalk", "bag", "ruler", "read", "learn"]),
  t("art-time", "Art Time", "🎨", ["paint", "brush", "paper", "glue", "crayon", "red", "blue", "draw", "mess", "art"]),
  t("music-makers", "Music Makers", "🎵", ["drum", "horn", "flute", "bell", "song", "band", "guitar", "piano", "sing", "dance"]),
  t("outer-space", "Outer Space", "🚀", ["moon", "star", "space", "rocket", "planet", "comet", "alien", "orbit", "dark", "sky"]),
  t("castle-tales", "Castle Tales", "🏰", ["king", "queen", "crown", "castle", "dragon", "knight", "magic", "wand", "fairy", "gold"]),
  t("party-day", "Party Day", "🎈", ["cake", "gift", "party", "hat", "candy", "song", "game", "smile", "friend", "balloon"]),
  t("camping-out", "Camping Out", "⛺", ["tent", "fire", "map", "torch", "rope", "trail", "woods", "bag", "star", "camp"]),
  t("beach-day", "Beach Day", "🏖️", ["sand", "wave", "shell", "crab", "sun", "boat", "surf", "pail", "swim", "hat"]),
  t("busy-farm", "Busy Farm", "🚜", ["farm", "hay", "field", "fence", "crop", "barn", "seed", "cow", "duck", "mud"]),
  t("birds-everywhere", "Birds Everywhere", "🐦", ["bird", "nest", "wing", "egg", "robin", "swan", "owl", "duck", "sky", "tree"]),
  t("dino-dig", "Dino Dig", "🦖", ["dino", "bone", "claw", "roar", "tail", "egg", "big", "old", "dig", "rock"]),
  t("jobs-we-do", "Jobs We Do", "🩺", ["doctor", "nurse", "chef", "baker", "farmer", "pilot", "vet", "mail", "help", "work"]),
  t("how-i-feel", "How I Feel", "😀", ["happy", "sad", "angry", "sleepy", "shy", "proud", "calm", "smile", "cry", "hug"]),
  t("big-and-small", "Big and Small", "🐘", ["big", "small", "tall", "short", "fast", "slow", "soft", "hard", "wide", "thin"]),
  t("hot-and-cold", "Hot and Cold", "🧊", ["hot", "cold", "wet", "dry", "ice", "fire", "snow", "sun", "warm", "cool"]),
  t("where-is-it", "Where Is It?", "🔭", ["up", "down", "over", "near", "far", "top", "side", "back", "left", "out"]),
  t("my-family", "My Family", "👨‍👩‍👧", ["mom", "dad", "baby", "sister", "granny", "family", "hug", "love", "home", "kind"]),
  t("kind-words", "Kind Words", "💝", ["please", "thanks", "share", "help", "hug", "kind", "sorry", "smile", "care", "friend"]),
  t("spring-days", "Spring Days", "🌷", ["rain", "seed", "bud", "green", "bird", "nest", "chick", "lamb", "warm", "grow"]),
  t("summer-fun", "Summer Fun", "🌞", ["sun", "swim", "beach", "park", "ice", "hot", "bike", "play", "picnic", "hat"]),
  t("fall-leaves", "Fall Leaves", "🍂", ["leaf", "tree", "wind", "red", "gold", "apple", "boots", "rake", "cool", "nuts"]),
  t("winter-snow", "Winter Snow", "⛄", ["snow", "ice", "cold", "sled", "coat", "mitten", "boots", "warm", "hot", "soup"]),
  t("baby-animals", "Baby Animals", "🐤", ["chick", "lamb", "puppy", "kitten", "foal", "calf", "cub", "duck", "baby", "nest"]),
  t("jungle-walk", "Jungle Walk", "🌴", ["vine", "leaf", "monkey", "snake", "parrot", "frog", "rain", "tree", "wild", "bug"]),
  t("desert-sun", "Desert Sun", "🌵", ["sand", "sun", "hot", "dry", "camel", "snake", "rock", "dune", "cool", "shade"]),
  t("polar-ice", "Polar Ice", "🧊", ["ice", "snow", "seal", "cold", "white", "fish", "wind", "swim", "fur", "sled"]),
  t("pond-life", "Pond Life", "🦆", ["pond", "frog", "duck", "fish", "reed", "lily", "mud", "swim", "hop", "wet"]),
  t("night-sky", "Night Sky", "🌌", ["moon", "star", "dark", "owl", "bat", "sky", "night", "quiet", "dream", "light"]),
  t("letters-a-e", "Letters A to E", "🔤", ["ant", "ball", "cat", "dog", "egg", "apple", "bear", "cake", "duck", "ear"]),
  t("letters-f-j", "Letters F to J", "🔤", ["fox", "goat", "hat", "ice", "jam", "fish", "gift", "house", "igloo", "jump"]),
  t("letters-k-o", "Letters K to O", "🔤", ["kite", "lion", "moon", "nest", "owl", "key", "leaf", "milk", "nose", "one"]),
  t("letters-p-t", "Letters P to T", "🔤", ["pig", "queen", "rain", "sun", "tree", "pear", "rock", "star", "toy", "top"]),
  t("letters-u-z", "Letters U to Z", "🔤", ["up", "van", "web", "box", "yarn", "zoo", "under", "vet", "wind", "zebra"]),
  t("rhyme-time", "Rhyme Time", "🎶", ["cat", "hat", "dog", "frog", "star", "car", "bee", "tree", "moon", "spoon"]),
  t("cvc-words", "Little Words", "📗", ["cat", "sun", "hat", "bus", "pig", "cup", "net", "van", "bed", "fox"]),
  t("sight-words", "Sight Words", "👀", ["the", "and", "see", "you", "was", "can", "big", "run", "for", "her"]),
  t("action-words", "Action Words", "🏃", ["run", "jump", "walk", "swim", "climb", "sing", "clap", "hop", "spin", "skip"]),
  t("sound-words", "Noisy Words", "📣", ["bang", "buzz", "pop", "drip", "ring", "roar", "hiss", "purr", "clap", "boom"]),
  t("shape-hunt", "Shape Hunt", "⭐", ["star", "heart", "cube", "cone", "oval", "round", "flat", "edge", "side", "box"]),
  t("number-words", "Number Words", "🔢", ["one", "two", "six", "ten", "nine", "four", "five", "eight", "three", "seven"]),
  t("opposites", "Opposites", "↔️", ["hot", "cold", "big", "small", "up", "down", "day", "night", "fast", "slow"]),
  t("in-the-kitchen", "In the Kitchen", "🍳", ["cup", "plate", "spoon", "fork", "bowl", "pot", "pan", "oven", "sink", "mug"]),
  t("clean-up", "Clean Up Time", "🧼", ["soap", "towel", "broom", "wash", "tidy", "mop", "dust", "bin", "sink", "neat"]),
  t("garden-tools", "In the Garden", "🌻", ["seed", "soil", "water", "rake", "pot", "flower", "rose", "grow", "weed", "bee"]),
  t("build-it", "Build It", "🔨", ["nail", "wood", "saw", "tape", "glue", "bolt", "brick", "plan", "fix", "tool"]),
  t("city-streets", "City Streets", "🏙️", ["city", "road", "shop", "bus", "park", "sign", "taxi", "bank", "walk", "light"]),
  t("at-the-park", "At the Park", "🛝", ["park", "swing", "slide", "grass", "tree", "ball", "dog", "bench", "run", "play"]),
  t("rainy-day", "Rainy Day", "☔", ["rain", "drip", "boots", "puddle", "cloud", "wet", "wind", "cozy", "book", "warm"]),
  t("sunny-day", "Sunny Day", "😎", ["sun", "warm", "hat", "shade", "bike", "park", "play", "sky", "blue", "smile"]),
  t("ocean-boats", "Boats and Ships", "⛵", ["boat", "ship", "sail", "wave", "rope", "dock", "sea", "oar", "flag", "deck"]),
  t("train-ride", "Train Ride", "🚂", ["train", "track", "seat", "ride", "stop", "fast", "bell", "steam", "station", "wheel"]),
  t("plane-trip", "Plane Trip", "✈️", ["plane", "wing", "sky", "cloud", "bag", "seat", "land", "fly", "pilot", "trip"]),
  t("fire-station", "Fire Station", "🚒", ["fire", "hose", "truck", "boots", "bell", "help", "ladder", "water", "siren", "brave"]),
  t("doctor-visit", "Doctor Visit", "🩺", ["doctor", "nurse", "care", "band", "well", "rest", "brave", "check", "kind", "help"]),
  t("market-day", "Market Day", "🛒", ["shop", "cart", "bag", "list", "milk", "bread", "apple", "pay", "cash", "food"]),
  t("bakery", "At the Bakery", "🥐", ["cake", "bread", "bun", "roll", "oven", "flour", "sweet", "warm", "baker", "treat"]),
  t("ice-cream", "Ice Cream Shop", "🍦", ["cone", "scoop", "cold", "sweet", "cup", "melt", "lick", "pink", "cream", "treat"]),
  t("pizza-night", "Pizza Night", "🍕", ["pizza", "slice", "cheese", "dough", "oven", "hot", "corn", "share", "plate", "yum"]),
  t("tea-party", "Tea Party", "🫖", ["tea", "cup", "pot", "cake", "spoon", "chair", "doll", "sweet", "share", "smile"]),
  t("magic-forest", "Magic Forest", "🧚", ["fairy", "wand", "magic", "tree", "glow", "moss", "wish", "elf", "star", "path"]),
  t("pirate-map", "Pirate Map", "🏴‍☠️", ["map", "gold", "ship", "sail", "chest", "sand", "sea", "hat", "rope", "coin"]),
  t("robot-shop", "Robot Shop", "🤖", ["robot", "beep", "bolt", "wire", "gear", "light", "arm", "walk", "fix", "metal"]),
  t("dragon-cave", "Dragon Cave", "🐉", ["dragon", "cave", "fire", "wing", "gold", "rock", "dark", "roar", "brave", "egg"]),
  t("circus-fun", "Circus Fun", "🎪", ["tent", "clown", "ring", "hoop", "ball", "drum", "hat", "show", "flip", "smile"]),
  t("sports-day", "Sports Day", "🏅", ["run", "jump", "ball", "team", "race", "kick", "goal", "win", "hop", "play"]),
  t("water-fun", "Water Fun", "💦", ["swim", "pool", "splash", "wet", "float", "dive", "wave", "towel", "kick", "fun"]),
  t("snow-play", "Snow Play", "❄️", ["snow", "sled", "ice", "cold", "coat", "hat", "slide", "ball", "white", "fun"]),
  t("picnic", "Picnic Lunch", "🧺", ["food", "rug", "grass", "cup", "fruit", "bread", "ant", "sun", "share", "cake"]),
  t("birthday", "Birthday", "🎂", ["cake", "gift", "song", "hat", "candle", "wish", "party", "card", "smile", "friend"]),
  t("good-manners", "Good Manners", "🙏", ["please", "thanks", "share", "wait", "kind", "help", "sorry", "listen", "tidy", "smile"]),
  t("safety-first", "Safety First", "🦺", ["stop", "look", "hold", "belt", "safe", "help", "walk", "wait", "calm", "ask"]),
  
  t("things-that-fly", "Things That Fly", "🪁", ["bird", "kite", "plane", "bee", "bat", "wing", "sky", "fly", "cloud", "high"]),
  t("things-that-float", "Things That Float", "🛟", ["boat", "duck", "raft", "leaf", "cork", "ship", "foam", "sail", "swim", "wave"]),
  t("shiny-things", "Shiny Things", "✨", ["star", "gold", "lamp", "coin", "glow", "shine", "moon", "glass", "light", "ring"]),
  t("soft-things", "Soft Things", "🧸", ["teddy", "wool", "cloud", "fur", "pillow", "sock", "cat", "moss", "soft", "warm"]),
  t("round-things", "Round Things", "⚽", ["ball", "moon", "coin", "plate", "wheel", "pea", "sun", "ring", "dot", "round"]),
  t("loud-and-quiet", "Loud and Quiet", "🔊", ["loud", "quiet", "bell", "drum", "hush", "roar", "purr", "clap", "soft", "buzz"]),
  t("day-and-night", "Day and Night", "🌗", ["day", "night", "sun", "moon", "star", "wake", "sleep", "light", "dark", "dream"]),
];

/** Puzzles playable without premium — replayable as often as the child likes. */
export const FREE_WORD_FINDS = 30;

export function themeById(id: string): WordFindTheme | undefined {
  return WORD_FIND_THEMES.find((x) => x.id === id);
}

export function themeIndex(id: string): number {
  return WORD_FIND_THEMES.findIndex((x) => x.id === id);
}

export function isFreeTheme(id: string): boolean {
  const i = themeIndex(id);
  return i >= 0 && i < FREE_WORD_FINDS;
}

export function wordEmoji(word: string, fallback: string): string {
  return WORD_EMOJI[word.toLowerCase()] ?? fallback;
}
