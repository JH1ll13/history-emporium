// =====================================================================
//  THE AGE OF REBIRTH — PHASE II, VOYAGE 1: AROUND THE CAPE (1487–1488)
//  The Age of Exploration begins: Bartolomeu Dias sails from Lisbon
//  down the coast of Africa and rounds its southern tip.
//  Teachers: edit this file to change these terms, Codex cards, or questions.
//  Same tiers and question types as content.js. Answer options are kept
//  close in length so the longest option is never a giveaway.
// =====================================================================

Object.assign(CONCEPTS, {
  por: {
    name: "Portugal", kind: "Key Place", icon: "⚓", map: true,
    def: "A small kingdom on the western edge of Europe, facing the Atlantic Ocean. In the 1400s its sailors led Europe in exploring the coast of Africa, sponsored by Prince Henry the Navigator and later King John II.",
    example: "Ships left the Portuguese capital, Lisbon, for Africa, and later for India and Brazil.",
    hook: "Small kingdom, big ocean, first explorers."
  },
  mer: {
    name: "Merchant", kind: "Key Term", icon: "⚖",
    def: "A person who buys and sells goods to make a profit. European merchants wanted spices, silk, and gold from Asia and Africa without paying the high prices of middlemen.",
    example: "A merchant in Lisbon could grow rich by selling pepper brought straight from India.",
    hook: "Buys, sells, wants profit."
  },
  nav: {
    name: "Navigator", kind: "Key Term", icon: "✧",
    def: "A person who plans and steers a ship’s route, using instruments, maps, the sun, and the stars to know where the ship is.",
    example: "Bartolomeu Dias was a navigator who led ships around the southern tip of Africa.",
    hook: "Finds the way across the sea."
  },
  car: {
    name: "Caravel", kind: "Key Term", icon: "⛵",
    def: "A small, fast ship developed by the Portuguese. Its triangular (lateen) sails let it sail against the wind, so it could explore unknown coasts and still sail home.",
    example: "Bartolomeu Dias sailed with two caravels and a supply ship.",
    hook: "Small, fast, sails into the wind."
  },
  ast: {
    name: "Astrolabe", kind: "Key Term", icon: "◎",
    def: "An instrument that measures the angle of the sun or a star above the horizon. Navigators used that angle to work out their latitude: how far north or south they were.",
    example: "Far down the coast of Africa, where the North Star sinks out of sight, navigators measured the noon sun instead.",
    hook: "Measures the sun’s angle to find latitude."
  },
  cmp: {
    name: "Compass", kind: "Key Term", icon: "✛",
    def: "An instrument with a magnetized needle that points north, showing a ship’s direction even under clouds. It came to Europe from China by way of Arab and Mediterranean traders.",
    example: "In a storm with no sun or stars, the compass still showed which way was north.",
    hook: "The needle that always points north."
  },
  dias: {
    name: "Bartolomeu Dias", kind: "Key Person", icon: "☸",
    def: "(about 1450–1500) A Portuguese navigator. In 1487–88, sent by King John II, he became the first European to sail around the southern tip of Africa, proving a sea route to the Indian Ocean existed.",
    example: "A storm drove his ships south for about 13 days. When they turned north, they found the coast beyond Africa’s tip.",
    hook: "First European around Africa’s tip."
  },
  atl: {
    name: "Atlantic Ocean", kind: "Key Place", icon: "≋",
    def: "The huge ocean west of Europe and Africa. Portuguese sailors explored its coasts, islands, and winds, and learned to swing far out to sea to catch winds that carried them south and home.",
    example: "Lisbon faces the Atlantic, which made Portugal a natural starting point for ocean voyages.",
    hook: "The great ocean west of Europe and Africa."
  },
  med: {
    name: "Mediterranean Sea", kind: "Key Place", icon: "◒",
    def: "The sea between Europe, Africa, and Asia. For centuries, Italian merchants from Venice and Genoa controlled the trade that reached Europe across it, and the Ottoman Empire controlled its eastern ports.",
    example: "Spices from India reached Europe through Mediterranean ports, getting more expensive at every stop.",
    hook: "The sea in the middle of the old trade routes."
  },
  cape: {
    name: "Cape of Good Hope", kind: "Key Place", icon: "⛰",
    def: "A rocky point near the southern tip of Africa. Bartolomeu Dias called it the Cape of Storms; King John II renamed it the Cape of Good Hope, because it promised a sea route to India. (The very southernmost point is nearby Cape Agulhas.)",
    example: "Ten years after Dias, Vasco da Gama rounded the Cape of Good Hope and reached India in 1498.",
    hook: "Storms, then hope: the way to India."
  },
  why: {
    name: "Causes of exploration", kind: "Key Idea", icon: "✪",
    def: "Why Europeans explored: wealth from trade (spices, gold, silk), spreading Christianity, and fame for rulers and sailors. Many remember them as “God, gold, and glory.” New ships and instruments made it possible.",
    example: "Portugal hoped a sea route to India would let its merchants buy spices directly, skipping the Mediterranean middlemen.",
    hook: "God, gold, and glory."
  },
  risk: {
    name: "Dangers of navigation", kind: "Key Idea", icon: "☠",
    def: "What made early voyages deadly: storms, hidden reefs, getting lost, running out of fresh water and food, and scurvy, a disease caused by a lack of vitamin C. Sailors also feared unknown waters and tales of sea monsters.",
    example: "On long voyages, scurvy could sicken or kill many of the crew.",
    hook: "Storms, reefs, scurvy, and the unknown."
  }
});

LEVEL_CODEX.L4 = ["por", "mer", "why", "med", "atl", "car", "cmp", "nav", "ast", "risk", "dias", "cape"];
CODEX_ORDER.push(...LEVEL_CODEX.L4);

Object.assign(SHORT, {
  por: "Portugal", mer: "Merchant", nav: "Navigator", car: "Caravel", ast: "Astrolabe", cmp: "Compass", dias: "Bartolomeu Dias",
  atl: "Atlantic Ocean", med: "Mediterranean Sea", cape: "Cape of Good Hope", why: "God, gold, glory", risk: "Scurvy and storms"
});
Object.assign(FLASH, {
  por: ["Led early European exploration", "Kingdom with Lisbon as capital", "Small kingdom facing the Atlantic"],
  mer: ["Buys and sells for profit", "Wanted spices without middlemen", "Trader seeking profit"],
  nav: ["Plans and steers a ship’s route", "Finds the way by sun and stars", "Sea route-finder"],
  car: ["Small, fast Portuguese ship", "Triangular sails, sails into the wind", "Ship type Dias sailed"],
  ast: ["Measures the sun’s angle", "Tool for finding latitude", "How far north or south"],
  cmp: ["Needle that points north", "Shows direction under clouds", "Came from China via traders"],
  dias: ["First European around Africa’s tip", "Sailed for King John II, 1488", "Named the Cape of Storms"],
  atl: ["Ocean west of Europe and Africa", "Ocean Lisbon faces", "Ocean Portugal explored"],
  med: ["Sea of Venice and Genoa traders", "Sea between Europe and Africa", "Old route for spices to Europe"],
  cape: ["Renamed by King John II", "First called the Cape of Storms", "Point near Africa’s southern tip"],
  why: ["Reasons Europeans explored", "Spices, faith, and fame", "God, gold, and glory"],
  risk: ["What made voyages deadly", "Lack of vitamin C at sea", "Reefs, storms, getting lost"]
});
Object.assign(CONFUSE, {
  por: ["eng", "ita"], mer: ["pat", "nav"], nav: ["mer", "dias"], car: ["arm", "ast"], ast: ["cmp", "car"], cmp: ["ast", "nav"],
  dias: ["nav", "h8"], atl: ["med", "eng"], med: ["atl", "ita"], cape: ["atl", "por"], why: ["risk", "ren"], risk: ["why", "arm"]
});

QUESTIONS.push(
  // ---------------- TIER 1 ----------------
  { id: "e_por1", c: ["por"], t: 1, type: "map", mode: "id", a: "pt", o: ["Spain", "France", "Italy"],
    q: "The Age of Exploration began in the highlighted kingdom. Which modern nation is it?", why: "Portugal, on the Atlantic edge of Europe." },
  { id: "e_por2", c: ["por"], t: 1, type: "map", mode: "click", a: "pt",
    q: "Click the nation whose sailors led Europe in exploring the coast of Africa.", why: "Portugal: small, but facing the open Atlantic." },
  { id: "e_mer1", c: ["mer"], t: 1, type: "mc", q: "A merchant is someone who…",
    a: "buys and sells goods to make a profit", o: ["plans and steers a ship’s route across the sea", "pays artists to create new works", "rules a kingdom with total power"],
    why: "Merchants trade for profit. Navigators steer ships; patrons pay artists." },
  { id: "e_nav1", c: ["nav"], t: 1, type: "mc", q: "A navigator is someone who…",
    a: "plans and steers a ship’s route", o: ["buys and sells spices for profit", "builds ships in a Lisbon shipyard", "draws portraits of kings and queens"],
    why: "Navigators find the way, using instruments, maps, the sun, and the stars." },
  { id: "e_car1", c: ["car"], t: 1, type: "mc", q: "What made the caravel good for exploring?",
    a: "Its triangular sails could sail against the wind", o: ["Its hundred oars let it cross whole oceans quickly", "Its giant cannons scared away all enemies", "Its huge size let it carry entire armies"],
    why: "Sailing into the wind meant explorers could always get home." },
  { id: "e_car2", c: ["car"], t: 1, type: "fill", q: "Bartolomeu Dias sailed with two small, fast ships called ___.",
    a: "caravels", o: ["galleons", "armadas", "astrolabes"], why: "Caravels: small, fast, and good at sailing into the wind." },
  { id: "e_ast1", c: ["ast"], t: 1, type: "mc", q: "What did a navigator use an astrolabe to find?",
    a: "How far north or south the ship was", o: ["Which direction was magnetic north", "How deep the water was below the hull", "How fast the ship was sailing"],
    why: "The astrolabe measured the sun’s or a star’s angle, which gives latitude." },
  { id: "e_cmp1", c: ["cmp"], t: 1, type: "mc", q: "Which instrument showed a ship’s direction, even under clouds?",
    a: "The compass", o: ["The astrolabe", "The telescope", "The hourglass"],
    why: "A magnetized needle points north, sun or no sun." },
  { id: "e_dias1", c: ["dias"], t: 1, type: "mc", q: "What did Bartolomeu Dias do in 1488?",
    a: "Sailed around the southern tip of Africa", o: ["Sailed across the Atlantic to the Americas", "Sailed all the way to India and back home", "Sailed around the entire world for Spain"],
    why: "The first European around Africa’s tip. Vasco da Gama reached India in 1498; Columbus reached the Americas in 1492." },
  { id: "e_dias2", c: ["dias", "por"], t: 1, type: "tf", q: "Bartolomeu Dias sailed for the king of Portugal.",
    a: true, why: "King John II of Portugal sent him in 1487." },
  { id: "e_atl1", c: ["atl"], t: 1, type: "mc", q: "Which body of water lies west of Europe and Africa?",
    a: "The Atlantic Ocean", o: ["The Mediterranean Sea", "The Indian Ocean", "The Baltic Sea"],
    why: "The Atlantic: the great ocean Portugal faces." },
  { id: "e_med1", c: ["med"], t: 1, type: "mc", q: "Which sea lies between Europe and Africa, with Italy in its middle?",
    a: "The Mediterranean Sea", o: ["The Atlantic Ocean", "The North Sea", "The Arabian Sea"],
    why: "Medi-terranean: “in the middle of the land.”" },
  { id: "e_cape1", c: ["cape"], t: 1, type: "mc", q: "What did Bartolomeu Dias first call the cape at Africa’s tip?",
    a: "The Cape of Storms", o: ["The Cape of Gold", "The Cape of Spices", "The Cape of Kings"],
    why: "King John II renamed it the Cape of Good Hope." },
  { id: "e_why1", c: ["why"], t: 1, type: "mc", q: "Which phrase sums up the main causes of exploration?",
    a: "God, gold, and glory", o: ["Art, music, and poetry", "Farms, forests, and fish", "Peace, rest, and comfort"],
    why: "Faith, wealth, and fame drove explorers and the rulers who paid them." },
  { id: "e_risk1", c: ["risk"], t: 1, type: "mc", q: "Scurvy, a danger on long voyages, was caused by…",
    a: "a lack of vitamin C", o: ["drinking too much seawater", "too much time in the sun", "the bites of sea monsters"],
    why: "Without fresh fruit and vegetables, sailors’ gums bled and wounds would not heal." },
  { id: "e_risk2", c: ["risk"], t: 1, type: "tf", q: "Storms, reefs, and running out of food were real dangers for early sailors.",
    a: true, why: "Many ships and sailors never came home." },

  // ---------------- TIER 2 ----------------
  { id: "e_m1", c: ["mer", "nav", "car", "ast"], t: 2, type: "match", q: "Match each word to its meaning.",
    pairs: [["Merchant", "Buys and sells for profit"], ["Navigator", "Plans and steers the route"], ["Caravel", "Small, fast ship"], ["Astrolabe", "Measures the sun’s angle"]],
    why: "Two kinds of people, one ship, one instrument." },
  { id: "e_m2", c: ["por", "atl", "med", "cape"], t: 2, type: "match", q: "Match each place to its description.",
    pairs: [["Portugal", "Kingdom that led early exploration"], ["Atlantic Ocean", "Ocean west of Europe and Africa"], ["Mediterranean Sea", "Sea of the old trade routes"], ["Cape of Good Hope", "Point near Africa’s southern tip"]],
    why: "Knowing where each place is makes the voyage make sense." },
  { id: "e_ast2", c: ["ast", "cmp"], t: 2, type: "mc", q: "A navigator knows the ship is heading south but not how far south it has sailed. Which tool helps?",
    a: "An astrolabe, to measure the sun’s height", o: ["A compass, to check which way is north at sea", "A telescope, to look for distant ships", "An hourglass, to count hours at sea"],
    why: "The compass gives direction; the astrolabe gives latitude." },
  { id: "e_mer2", c: ["mer", "why"], t: 2, type: "mc", q: "A Lisbon trader hopes to buy pepper in India and sell it at home for ten times the price. He is a…",
    a: "merchant", o: ["navigator", "patron", "heretic"], why: "Profit from trade is the merchant’s goal: the “gold” in God, gold, and glory." },
  { id: "e_risk3", c: ["risk"], t: 2, type: "odd", q: "Which was NOT a danger of early ocean voyages?",
    a: "Running out of paint for portraits", o: ["Scurvy from a lack of vitamin C", "Hidden reefs that could tear open hulls", "Storms that blow ships off course"],
    why: "Paint was a problem for painters, not navigators." },
  { id: "e_why2", c: ["why"], t: 2, type: "mc", q: "A king pays for a voyage hoping to be remembered as a great ruler. Which cause of exploration is that?",
    a: "Glory", o: ["Gold", "God", "Scurvy"], why: "Glory means fame and honor for rulers and sailors." },
  { id: "e_why3", c: ["why"], t: 2, type: "mc", q: "A missionary sails to Africa to teach about Christianity. Which cause of exploration is that?",
    a: "God", o: ["Gold", "Glory", "Trade"], why: "Spreading Christianity was one of the main motives." },
  { id: "e_dias3", c: ["dias", "cape", "risk"], t: 2, type: "order", q: "Put Dias’s voyage in order.",
    seq: ["Ships leave Lisbon in 1487", "They sail south along Africa’s coast", "A great storm drives them south, out of sight of land", "They turn north and find the coast beyond Africa’s tip", "The tired crew insists on turning back"],
    why: "On the way home, Dias saw the cape he had passed and named it the Cape of Storms." },
  { id: "e_car3", c: ["car", "nav"], t: 2, type: "tf", q: "Caravels could sail against the wind, so navigators could explore unknown coasts and still return home.",
    a: true, why: "That ability made the caravel the explorer’s ship." },
  { id: "e_med2", c: ["med", "ita"], t: 2, type: "tf", q: "Italian merchants from cities like Venice and Genoa grew rich from Mediterranean trade.",
    a: true, why: "That wealth also paid for Renaissance art: think of the Medici." },

  // ---------------- TIER 3 (connect, often across levels) ----------------
  { id: "e_c1", c: ["why", "med", "mer"], t: 3, type: "mc", q: "Why did Portugal want a sea route around Africa to India?",
    a: "So its merchants could buy spices without middlemen", o: ["So its army could conquer Venice and Genoa from the sea", "So it could avoid paying taxes to the Holy Roman Emperor", "So it could escape the Spanish Armada’s attacks"],
    why: "Every stop on the old route through the Mediterranean added to the price." },
  { id: "e_c2", c: ["car", "ast", "why"], t: 3, type: "mc", q: "How did new technology help cause the Age of Exploration?",
    a: "Caravels and astrolabes made long voyages possible", o: ["Telescopes let sailors see India all the way from Portugal", "Printing presses on ships replaced navigators", "Steam engines let ships sail without any wind"],
    why: "Motive plus means: people wanted to explore, and new tools let them." },
  { id: "e_c3", c: ["med", "pat", "ita"], t: 3, type: "mc", q: "How does Mediterranean trade connect to the Renaissance in Italy?",
    a: "Trade made Italian families rich enough to be patrons", o: ["Mediterranean pirates painted the churches of Florence", "Trade ended the Renaissance by making Italy poor", "Italian merchants banned all art from the sea route"],
    why: "The Medici fortune came from banking and trade. Wealth funded art." },
  { id: "e_c4", c: ["mer", "pat"], t: 3, type: "mc", q: "What is the DIFFERENCE between a merchant and a patron?",
    a: "A merchant trades for profit; a patron pays artists", o: ["A merchant pays artists; a patron trades for profit", "A merchant steers ships; a patron draws the maps", "There is none; the two words mean the same thing"],
    why: "One person could be both: Lorenzo de’ Medici’s family were bankers and patrons." },
  { id: "e_c5", c: ["dias", "cape", "why"], t: 3, type: "mc", q: "Why did King John II rename the Cape of Storms the Cape of Good Hope?",
    a: "It gave hope of a sea route to India’s riches", o: ["The storms there had finally stopped for good", "Dias had found gold mines at the cape itself", "The pope ordered every cape renamed for saints"],
    why: "Ten years later, Vasco da Gama proved the hope right, reaching India in 1498." },
  { id: "e_c6", c: ["cmp", "ast", "nav"], t: 3, type: "mc", q: "How did a navigator use a compass and an astrolabe TOGETHER?",
    a: "Compass for direction; astrolabe for latitude", o: ["Compass for latitude; astrolabe for direction", "Both measured how fast the ship was moving", "Both were used only to read the maps at night"],
    why: "Which way am I going? How far north or south am I? Two questions, two tools." },
  { id: "e_c7", c: ["why", "ref", "cat"], t: 3, type: "mc", q: "How does the “God” in God, gold, and glory connect to Europe in the 1500s?",
    a: "Catholic rulers wanted to spread their faith worldwide", o: ["Martin Luther sailed to Africa to preach his ideas", "The pope banned all voyages beyond the Mediterranean", "Explorers wanted to escape the Catholic Church forever"],
    why: "Spreading Christianity was a goal of Portugal’s and Spain’s Catholic rulers." },
  { id: "e_c8", c: ["dias", "por"], t: 3, type: "mc", q: "Christopher Columbus asked King John II to pay for a voyage west. Why did the king say no in 1488?",
    a: "Dias had just shown the route to India around Africa", o: ["Portugal had no ships or sailors able to cross the sea", "Columbus wanted to sail for Portugal’s enemy, Venice", "The king believed that the world was completely flat"],
    why: "With Dias’s news, Portugal bet on Africa. Columbus sailed for Spain instead in 1492." },
  { id: "e_c9", c: ["risk", "atl", "nav"], t: 3, type: "mc", q: "Why did fear of the unknown Atlantic make navigation dangerous?",
    a: "With no maps of new waters, ships could be lost forever", o: ["The Atlantic was much smaller than sailors had believed", "Sea monsters really did sink most Portuguese ships", "The Atlantic froze solid every winter near Africa"],
    why: "Unknown coasts, currents, and winds were real dangers. Monster stories reflected the fear." },
  { id: "e_c10", c: ["por", "eng", "ita", "ger"], t: 3, type: "map", mode: "mc", hi: "pt",
    q: "Your journey so far: Italy, Germany, England, and now the highlighted kingdom. Which movement begins here?",
    a: "The Age of Exploration", o: ["The Protestant Reformation", "The Italian Renaissance", "The Scientific Revolution"],
    why: "Portugal’s sailors opened the Age of Exploration." },

  // ---------------- TIER 4 (synthesize) ----------------
  { id: "e_x1", c: ["why", "risk", "dias"], t: 4, type: "mc", q: "Voyages were deadly, yet rulers kept paying for them. What BEST explains why?",
    a: "The possible rewards of trade, faith, and fame", o: ["Rulers did not know that any voyages were dangerous", "Sailors were forced to sail and were never paid at all", "Every voyage was guaranteed to find gold for the king"],
    why: "Weighing risks against rewards is how historians explain choices." },
  { id: "e_x2", c: ["dias", "cape", "why"], t: 4, type: "mc", q: "A historian claims: “Dias’s voyage changed world trade.” Which evidence BEST supports this?",
    a: "Da Gama used his route to reach India by sea in 1498", o: ["Dias was born in Portugal around the year 1450, near Lisbon", "Dias sailed with two caravels and a supply ship", "Dias named the cape after its terrible storms"],
    why: "All true, but only one shows the route changing trade." },
  { id: "e_x3", c: ["ren", "scr", "why"], t: 4, type: "mc", q: "What links the Renaissance, the Scientific Revolution, and the Age of Exploration?",
    a: "Curiosity and confidence to explore the unknown", o: ["All three were started by the same Portuguese king", "All three were led by the Catholic Church in Rome", "All three ended the use of maps and instruments"],
    why: "The same spirit of curiosity drove artists, scientists, and explorers." },
  { id: "e_x4", c: ["mer", "med", "por"], t: 4, type: "mc", q: "If Portugal found a sea route to India, who would MOST likely lose out?",
    a: "Italian merchants who ran the Mediterranean trade", o: ["English farmers who grew wheat and barley at home", "German printers who made pamphlets in Wittenberg", "French painters who worked for the royal court"],
    why: "A new route around Africa bypassed Venice and Genoa. Trade shifted west to the Atlantic." }
);

MANUSCRIPTS.push(
  { id: "ms_zurara", level: "L4", needs: null, title: "Why Prince Henry Sent His Ships",
    text: "“The second reason was that if there chanced to be in those lands some population of Christians, or some havens into which it would be possible to sail without peril, many kinds of merchandise might be brought to this realm.”",
    cite: "Gomes Eanes de Zurara, Chronicle of the Discovery and Conquest of Guinea, about 1453 (adapted translation)",
    q: { id: "ms_zurara_q", c: ["why", "mer"], t: 3, type: "mc", ms: "ms_zurara",
      q: "Sourcing: Which causes of exploration does this passage show?",
      a: "Trade for profit, and finding fellow Christians", o: ["Fame for the artists and scholars of Florence", "Escaping storms and the danger of scurvy", "Testing the heliocentric theory at sea"],
      why: "Zurara was Prince Henry’s royal chronicler, so he presents Henry’s motives in the best light: worth remembering." } },
  { id: "ms_padrao", level: "L4", needs: null, title: "Words on a Stone Pillar",
    text: "“In the year 1482 since the birth of our Lord Jesus Christ, the most excellent prince, King John II of Portugal, ordered this land to be discovered and this pillar to be placed.”",
    cite: "Inscription on a stone padrão (pillar) left on the African coast by Portuguese explorer Diogo Cão, 1480s (adapted). Dias also set up padrões.",
    q: { id: "ms_padrao_q", c: ["por", "why"], t: 3, type: "mc", ms: "ms_padrao",
      q: "Sourcing: Why would explorers carve this on a stone pillar on a faraway coast?",
      a: "To claim the land for Portugal’s king and faith", o: ["To warn later sailors about storms near the coast", "To sell the pillar to merchants for a large profit", "To record the depth of the water for navigators"],
      why: "A padrão announced who had arrived first. Its message was about glory, God, and a king’s claim." } },
  { id: "ms_barros", level: "L4", needs: null, title: "Naming the Cape",
    text: "“He called it the Stormy Cape, on account of the dangers and storms they had passed in rounding it. But the King gave it a more illustrious name, calling it the Cape of Good Hope, for the promise it gave of the discovery of India.”",
    cite: "João de Barros, Decades of Asia, 1552, about Bartolomeu Dias in 1488 (adapted translation)",
    q: { id: "ms_barros_q", c: ["dias", "cape"], t: 3, type: "mc", ms: "ms_barros",
      q: "Sourcing: Barros wrote this in 1552, about 64 years after the voyage. What should a historian keep in mind?",
      a: "He was not there, so check his story with others", o: ["He must be right because he wrote in Portuguese", "His account is useless because it is very old", "Only accounts written by kings can be trusted"],
      why: "Later histories can be valuable but may repeat legends or simplify events." } }
);
MANUSCRIPTS.filter(m => m.level === "L4").forEach(m => { m.q.src = { text: m.text, cite: m.cite }; QUESTIONS.push(m.q); });

// The astrolabe moment: the noon sun's height tells the navigator how far south the ship has come.
const ASTROLABE_STOPS = [
  { place: "off Cape Bojador", lat: 26, dir: "N", sunAngle: 64 },
  { place: "near the Cape of Good Hope", lat: 34, dir: "S", sunAngle: 56 }
];
