// =====================================================================
//  THE AGE OF REBIRTH — CONTENT
//  Teachers: edit this file to change terms, Codex cards, or questions.
//
//  Question tiers (ascending complexity, per cognitive load theory):
//    1 = recognize / recall a single term, person, or place
//    2 = apply or discriminate (scenarios, sorting, matching)
//    3 = connect two ideas (how / why one relates to another)
//    4 = synthesize several ideas (claims, evidence, transfer)
//
//  Question types: mc, tf, fill, odd, match, sort, order
// =====================================================================

const CONCEPTS = {
  ren: {
    name: "Renaissance", kind: "Key Term", icon: "☀",
    def: "French for “rebirth.” A period (about the 1300s–1600s) when Europeans renewed their interest in the art and learning of ancient Greece and Rome.",
    example: "Artists studied old Roman statues so their own paintings and sculptures would look more lifelike.",
    hook: "Re-naissance = the re-birth of ancient ideas."
  },
  ita: {
    name: "Italy", kind: "Key Place", icon: "⛰",
    def: "Where the Renaissance began. Its city-states, like Florence, Venice, and Milan, grew rich from trade, and the ruins and writings of ancient Rome were all around.",
    example: "A Florentine merchant could walk past Roman ruins on his way to a bank that traded across the Mediterranean.",
    hook: "Trade money + Rome’s ruins = Italy’s head start."
  },
  pat: {
    name: "Patron", kind: "Key Term", icon: "⚖",
    def: "A person who supports artists, writers, or scholars with money.",
    example: "A wealthy banker pays a painter to create a portrait of his family.",
    hook: "The patron pays."
  },
  lor: {
    name: "Lorenzo de’ Medici", kind: "Key Person", icon: "♛",
    def: "“Lorenzo the Magnificent” ruled Florence from 1469 to 1492. His family, the Medici, grew rich from banking, and he was a famous patron of artists like Sandro Botticelli and the young Michelangelo Buonarroti.",
    example: "Lorenzo de’ Medici invited a teenage Michelangelo Buonarroti to live and study in the Medici household.",
    hook: "Lorenzo de’ Medici = Florence’s big spender on art."
  },
  hum: {
    name: "Humanism", kind: "Key Term", icon: "✎",
    def: "A Renaissance way of thinking that celebrated human potential and achievement, and encouraged the study of classical Greek and Roman writings (history, poetry, philosophy).",
    example: "A student reads speeches by the Roman writer Cicero to learn how to be a good citizen.",
    hook: "Humanism = humans can achieve great things."
  },
  sec: {
    name: "Secularism", kind: "Key Term", icon: "⌂",
    def: "A focus on worldly, everyday matters rather than only on religion. Renaissance people were still religious, but they paid more attention to life here on Earth.",
    example: "A painter makes a portrait of a merchant at his desk instead of a scene of saints.",
    hook: "Secular = of this world."
  },
  leo: {
    name: "Leonardo da Vinci", kind: "Key Person", icon: "✦",
    def: "(1452–1519) A painter, inventor, engineer, and scientist who trained in Florence. He painted the Mona Lisa and The Last Supper and filled notebooks with flying-machine designs and studies of human anatomy.",
    example: "Leonardo da Vinci dissected bodies so he could draw muscles and bones accurately.",
    hook: "The ultimate Renaissance man."
  },
  rman: {
    name: "Renaissance man", kind: "Key Term", icon: "✺",
    def: "A person who is skilled and knowledgeable in many different fields, such as art, science, and writing. Today we also say “Renaissance person.”",
    example: "Leonardo da Vinci painted, designed machines, and studied anatomy and nature.",
    hook: "Many talents, one person."
  },
  weu: {
    name: "Western Europe", kind: "Key Places", icon: "✥", map: true,
    def: "The Renaissance began in Italy, then spread north and west across the Alps and by sea to the lands that are today France, Spain, Portugal, Germany, the Netherlands, Belgium, and the United Kingdom.",
    example: "Leonardo da Vinci spent his last years in France. Johannes Gutenberg’s printing press in Germany helped Renaissance ideas spread fast.",
    hook: "Born in Italy, spread across Europe."
  }
};

// The order Codex pages are discovered in Level 1 (pre-training).
const CODEX_ORDER = ["ren", "ita", "pat", "lor", "hum", "sec", "leo", "rman", "weu"];
// Codex pages per level (later levels add theirs in their own content file).
const LEVEL_CODEX = { L1: CODEX_ORDER.slice() };

const QUESTIONS = [
  // ---------------- TIER 1: recognize & recall ----------------
  { id: "ren1", c: ["ren"], t: 1, type: "mc", q: "What does the word “Renaissance” mean?",
    a: "Rebirth", o: ["Revolution", "Discovery", "Victory"],
    why: "Renaissance is French for “rebirth”: a rebirth of ancient Greek and Roman ideas." },
  { id: "ren2", c: ["ren"], t: 1, type: "tf", q: "During the Renaissance, Europeans became interested again in the ideas of ancient Greece and Rome.",
    a: true, why: "That renewed interest in classical learning is exactly what the Renaissance was." },
  { id: "ren3", c: ["ren"], t: 1, type: "fill", q: "The period of renewed interest in classical art and learning is called the ___.",
    a: "Renaissance", o: ["Humanism", "Secularism", "Patron"],
    why: "The Renaissance is the period. Humanism and secularism are ideas that grew during it." },

  { id: "ita1", c: ["ita"], t: 1, type: "mc", q: "In which country did the Renaissance begin?",
    a: "Italy", o: ["England", "France", "Spain"],
    why: "The Renaissance began in the city-states of Italy, then spread across Europe." },
  { id: "ita2", c: ["ita"], t: 1, type: "fill", q: "The Renaissance began in the city-states of ___, such as Florence and Venice.",
    a: "Italy", o: ["Germany", "England", "Egypt"],
    why: "Florence, Venice, and Milan were Italian city-states." },

  { id: "pat1", c: ["pat"], t: 1, type: "mc", q: "A person who supports artists or scholars with money is called a…",
    a: "Patron", o: ["Humanist", "Renaissance man", "Apprentice"],
    why: "Remember: the patron pays." },
  { id: "pat2", c: ["pat"], t: 1, type: "mc", q: "What is a patron?",
    a: "A person who pays to support artists or scholars",
    o: ["A person skilled in many different fields, like Leonardo", "A focus on worldly, non-religious matters", "A student who copies Greek books"],
    why: "A patron provides money. The other choices describe a Renaissance man, secularism, and a student." },
  { id: "pat3", c: ["pat"], t: 1, type: "tf", q: "A patron is an artist who is skilled in many different fields.",
    a: false, why: "That describes a Renaissance man. A patron is the person who PAYS artists." },

  { id: "lor1", c: ["lor"], t: 1, type: "mc", q: "Who was Lorenzo de’ Medici?",
    a: "Ruler of Florence and a great patron of the arts",
    o: ["Painter of the Mona Lisa and inventor of flying machines", "A Roman emperor who rebuilt ancient Florence", "A French king who invaded Italy and Florence"],
    why: "Lorenzo de’ Medici ruled Florence (1469–1492) and paid artists like Sandro Botticelli and Michelangelo Buonarroti." },
  { id: "lor2", c: ["lor"], t: 1, type: "fill", q: "Lorenzo de’ Medici was nicknamed “Lorenzo the ___.”",
    a: "Magnificent", o: ["Terrible", "Inventor", "Painter"],
    why: "He was called Lorenzo the Magnificent for his wealth, power, and support of the arts." },
  { id: "lor3", c: ["lor"], t: 1, type: "tf", q: "Lorenzo de’ Medici ruled the city of Florence.",
    a: true, why: "Lorenzo de’ Medici led Florence from 1469 until his death in 1492." },

  { id: "hum1", c: ["hum"], t: 1, type: "fill", q: "___ was a way of thinking that celebrated human potential and studied classical Greek and Roman writings.",
    a: "Humanism", o: ["Secularism", "Patronage", "Renaissance man"],
    why: "Humanism = humans can achieve great things, and ancient writers can teach us how." },
  { id: "hum2", c: ["hum"], t: 1, type: "tf", q: "Humanists believed people should ignore the writings of ancient Greece and Rome.",
    a: false, why: "The opposite! Humanists eagerly studied classical Greek and Roman writings." },

  { id: "sec1", c: ["sec"], t: 1, type: "mc", q: "Secularism means a focus on…",
    a: "Worldly, everyday (non-religious) matters",
    o: ["Only religious and spiritual matters, like prayer", "Ancient Greek and Roman texts", "Paying artists to create work"],
    why: "Secular = of this world. Think everyday life, business, and government." },
  { id: "sec2", c: ["sec"], t: 1, type: "tf", q: "“Secular” describes things that are worldly rather than religious.",
    a: true, why: "Secular things are about life on Earth, like trade, politics, and family." },
  { id: "sec3", c: ["sec"], t: 1, type: "fill", q: "Interest in worldly, non-religious matters is called ___.",
    a: "secularism", o: ["humanism", "patronage", "the Renaissance"],
    why: "Secularism = focus on this world." },

  { id: "leo1", c: ["leo"], t: 1, type: "mc", q: "Who painted the Mona Lisa?",
    a: "Leonardo da Vinci", o: ["Lorenzo de’ Medici", "Michelangelo Buonarroti", "Julius Caesar"],
    why: "Leonardo da Vinci painted the Mona Lisa. Lorenzo de’ Medici was a patron, not a painter." },
  { id: "leo2", c: ["leo"], t: 1, type: "fill", q: "Leonardo da Vinci painted The Last Supper and the ___.",
    a: "Mona Lisa", o: ["Sistine Chapel ceiling", "Statue of David", "Starry Night"],
    why: "The Sistine Chapel ceiling and David are by Michelangelo Buonarroti; Starry Night is by Vincent van Gogh, centuries later." },
  { id: "leo3", c: ["leo"], t: 1, type: "tf", q: "Leonardo da Vinci was only a painter and had no interest in science.",
    a: false, why: "Leonardo da Vinci studied anatomy, engineering, flight, and nature. That is why he is famous for so much more than painting." },

  { id: "rman1", c: ["rman"], t: 1, type: "mc", q: "A “Renaissance man” is someone who…",
    a: "skilled in many different fields",
    o: ["born in Italy during the Renaissance", "wealthy enough to pay many artists", "devoted only to studying religion"],
    why: "Careful: it is NOT just someone who lived back then. It means many talents in one person." },
  { id: "rman2", c: ["rman"], t: 1, type: "tf", q: "Anyone who lived between 1300 and 1600 is called a Renaissance man.",
    a: false, why: "The term means a person with many talents, like Leonardo da Vinci, not just anyone from that time." },
  { id: "rman3", c: ["rman"], t: 1, type: "fill", q: "Someone who is a talented painter, engineer, musician, and scientist could be called a ___.",
    a: "Renaissance man", o: ["patron of the arts", "Medici", "city-state"],
    why: "Many talents, one person: a Renaissance man (or Renaissance person)." },

  // ---------------- TIER 2: apply, discriminate, vary ----------------
  { id: "m1", c: ["ren", "hum", "sec", "pat"], t: 2, type: "match", q: "Match each key term to its meaning.",
    pairs: [["Renaissance", "A rebirth of classical art and learning"],
            ["Humanism", "Celebrating human potential; studying Greek and Roman texts"],
            ["Secularism", "A focus on worldly, non-religious matters"],
            ["Patron", "A person who pays to support artists"]],
    why: "Retrieving all four together helps you tell them apart." },
  { id: "m2", c: ["leo", "lor", "ita", "rman"], t: 2, type: "match", q: "Match each person, place, or term to its description.",
    pairs: [["Leonardo da Vinci", "Painted the Mona Lisa and designed flying machines"],
            ["Lorenzo de’ Medici", "Ruler of Florence who paid for art"],
            ["Italy", "Land of city-states where the Renaissance began"],
            ["Renaissance man", "A person skilled in many fields"]],
    why: "People, places, and terms are linked. Notice how each fits into the same story." },
  { id: "s1", c: ["sec"], t: 2, type: "sort", boss: true, q: "Sort each artwork or book: is it mainly secular or religious?",
    bins: ["Secular (worldly)", "Religious (spiritual)"],
    items: [["A portrait of a banker’s family", 0], ["A painting of a saint praying", 1],
            ["A book on how to run a city government", 0], ["A statue of an angel for a church", 1],
            ["A map of Mediterranean trade routes", 0]],
    why: "Secular works focus on this world: families, money, government, trade." },
  { id: "s2", c: ["hum"], t: 2, type: "sort", boss: true, q: "Sort these ideas: would a Renaissance humanist agree?",
    bins: ["Humanist idea", "Not a humanist idea"],
    items: [["We should study Greek and Roman writers", 0], ["People can achieve great things through learning", 0],
            ["Ancient books are useless and should be thrown away", 1], ["Education should create well-rounded citizens", 0],
            ["Humans can’t really accomplish anything important", 1]],
    why: "Humanists believed in human potential and valued classical learning." },
  { id: "s3", c: ["leo", "lor", "ita", "hum", "pat"], t: 2, type: "sort", boss: true, q: "Sort each item into the right category.",
    bins: ["Key Person", "Key Term", "Key Place"],
    items: [["Leonardo da Vinci", 0], ["Humanism", 1], ["Italy", 2], ["Lorenzo de’ Medici", 0], ["Patron", 1], ["Florence", 2]],
    why: "Sorting people, terms, and places builds a mental filing system you can search fast." },
  { id: "pat4", c: ["pat"], t: 2, type: "mc", q: "A rich wool merchant pays a young sculptor to make a statue for his palace. The merchant is acting as a…",
    a: "patron", o: ["Renaissance man", "humanist", "apprentice"],
    why: "He is paying for art, so he is the patron." },
  { id: "pat5", c: ["pat"], t: 2, type: "odd", q: "Which person is NOT acting as a patron?",
    a: "A painter selling her own paintings at a market",
    o: ["A banker paying for new paintings in a church", "A duke paying a scientist to work at his court", "A pope hiring an artist to paint a chapel ceiling"],
    why: "A patron pays someone else to create. The painter is the creator, not the patron." },
  { id: "rman4", c: ["rman"], t: 2, type: "mc", q: "Which person BEST fits the description “Renaissance man”?",
    a: "Someone who paints, designs bridges and studies stars",
    o: ["Someone who has lived in Florence for their whole long life", "A banker who pays painters to decorate his home", "A monk who spends his life copying holy books"],
    why: "Many fields of skill is the key, not the time period or wealth." },
  { id: "leo4", c: ["leo"], t: 2, type: "mc", q: "Which of these would you find in Leonardo da Vinci’s notebooks?",
    a: "Flying machines and drawings of human anatomy",
    o: ["Rules for how cardinals should elect new popes", "Maps of the Americas from his own voyages", "Plans for the very first printing press"],
    why: "Leonardo da Vinci’s notebooks are full of inventions and scientific studies." },
  { id: "lr1", c: ["leo", "rman"], t: 2, type: "tf", q: "Leonardo da Vinci is a good example of a Renaissance man.",
    a: true, why: "Painter, inventor, engineer, scientist: Leonardo da Vinci is THE classic example." },
  { id: "lor4", c: ["lor"], t: 2, type: "mc", q: "Lorenzo de’ Medici’s family, the Medici, became rich mainly through…",
    a: "banking", o: ["farming", "winning wars", "selling their own paintings"],
    why: "The Medici Bank had branches across Europe, which paid for their power and patronage." },
  { id: "sec4", c: ["sec"], t: 2, type: "tf", q: "Secularism during the Renaissance meant that people stopped believing in religion.",
    a: false, why: "Most people stayed deeply religious. They simply paid MORE attention to worldly life alongside their faith." },
  { id: "hum3", c: ["hum"], t: 2, type: "mc", q: "A Florentine student reads ancient Roman speeches by Cicero to learn how to be a good citizen. This is an example of…",
    a: "humanism", o: ["secularism", "patronage", "a Renaissance man"],
    why: "Studying classical writers to improve yourself is the heart of humanism." },
  { id: "ren4", c: ["ren"], t: 2, type: "fill", q: "Renaissance thinkers looked back to the ideas of ancient ___ and Rome.",
    a: "Greece", o: ["Egypt", "China", "England"],
    why: "“Classical” means ancient Greece and Rome." },
  { id: "ren5", c: ["ren"], t: 2, type: "tf", q: "The Renaissance happened in just a few years around 1500.",
    a: false, why: "It lasted roughly from the 1300s to the 1600s and spread slowly across Europe." },
  { id: "ita3", c: ["ita"], t: 2, type: "mc", q: "Florence, Venice, and Milan were Italian ___: independent cities that ruled themselves and the land around them.",
    a: "city-states", o: ["colonies", "villages", "empires"],
    why: "Italy wasn’t one country yet. It was made up of competing city-states." },
  { id: "ita4", c: ["ita"], t: 2, type: "odd", q: "Which does NOT help explain why the Renaissance started in Italy?",
    a: "Italy was cut off from all trade",
    o: ["Italian city-states were wealthy from trade", "Ruins of ancient Rome were all around", "Rich families could afford to be patrons"],
    why: "Italy was at the center of Mediterranean trade, not cut off from it." },

  // ---------------- TIER 3: connect two ideas ----------------
  { id: "c1", c: ["pat", "lor"], t: 3, type: "mc", q: "How are Lorenzo de’ Medici and the term “patron” connected?",
    a: "His banking wealth paid artists, making him a patron",
    o: ["He was an artist, and Leonardo da Vinci was his patron", "“Patron” was his official title as ruler of Florence", "He passed a law forbidding patrons in Florence"],
    why: "Banking wealth → paying artists → patron." },
  { id: "c2", c: ["leo", "rman"], t: 3, type: "mc", q: "WHY is Leonardo da Vinci called a Renaissance man?",
    a: "He mastered painting, engineering, anatomy and invention",
    o: ["He was born in Italy at the very start of the Renaissance period", "He paid many other artists to work for him", "He painted only religious scenes for the Church"],
    why: "The term is about range of talent, and Leonardo da Vinci’s range was enormous." },
  { id: "c3", c: ["hum", "sec"], t: 3, type: "mc", q: "How are humanism and secularism SIMILAR?",
    a: "Both focused on life in this world and human ability",
    o: ["Both rejected religion completely and closed Italy’s churches", "Both were systems for paying artists’ wages", "Both began in England and then spread to Italy"],
    why: "Both ideas shifted attention toward people and earthly life." },
  { id: "c4", c: ["hum", "sec"], t: 3, type: "mc", q: "What is the key DIFFERENCE between humanism and secularism?",
    a: "Humanism: human potential and old texts. Secularism: worldly life",
    o: ["Humanism: money and banking in Florence. Secularism: art and painting", "Humanism came after the Renaissance; secularism came before", "No difference: both words mean exactly the same thing"],
    why: "Related, but different: humanism = human potential + classics; secularism = this-world focus." },
  { id: "c5", c: ["ita", "pat"], t: 3, type: "mc", q: "Why did Italy have so many patrons during the Renaissance?",
    a: "Trade made city-states rich enough to pay artists",
    o: ["Italian law required every family to buy art", "Italian artists were happy to work for free", "Italy’s huge army seized art from all of Europe"],
    why: "Wealth from trade → money to spend on art → patrons." },
  { id: "c6", c: ["ren", "hum"], t: 3, type: "mc", q: "How did humanism help create the Renaissance?",
    a: "Humanists revived ancient Greek and Roman learning",
    o: ["Humanists built the very first banks in Florence", "Humanists ended religion everywhere in Europe", "Humanists invented painting and sculpture"],
    why: "The rebirth was a rebirth of classical learning, and humanists led it." },
  { id: "c7", c: ["ita", "pat", "ren"], t: 3, type: "order", q: "Build the chain of causes, from first to last.",
    seq: ["Italian city-states grow rich from trade", "Wealthy families like the Medici have money to spend",
          "They become patrons who pay artists and scholars", "Art and learning flourish: the Renaissance"],
    why: "Trade → wealth → patrons → Renaissance. Each link causes the next." },
  { id: "c8", c: ["hum", "sec"], t: 3, type: "sort", boss: true, q: "Which idea does each example show BEST?",
    bins: ["Humanism", "Secularism"],
    items: [["Reading Plato and Cicero to learn about virtue", 0], ["Believing people can achieve greatness through education", 0],
            ["Painting everyday scenes of merchants at work", 1], ["Caring more about business and politics in this life", 1]],
    why: "Classics + human potential = humanism. Everyday, worldly focus = secularism." },
  { id: "c9", c: ["lor", "leo"], t: 3, type: "tf", q: "Lorenzo de’ Medici and Leonardo da Vinci both lived in Florence during the Renaissance.",
    a: true, why: "Leonardo da Vinci trained in a Florence workshop while Lorenzo de’ Medici ruled the city." },
  { id: "c10", c: ["sec", "pat"], t: 3, type: "mc", q: "Renaissance patrons often paid for portraits of themselves and their families. Which idea does this show?",
    a: "Secularism: interest in worldly life and real people",
    o: ["That patrons had stopped believing in God at all", "That Italy had torn down all of its old churches", "That only famous artists were allowed to be patrons"],
    why: "Portraits of real people celebrate life in this world. (Humanism’s respect for individuals shows here too.)" },
  { id: "c11", c: ["ren", "ita"], t: 3, type: "mc", q: "Why does it make sense that a “rebirth” of ancient Roman ideas started in Italy?",
    a: "Italy had been the heart of the Roman Empire",
    o: ["Italy was the only place in Europe with artists", "Ancient Rome had actually been located in Spain", "Italians had never heard of ancient Rome before"],
    why: "Rome was IN Italy. The past was literally all around them." },
  { id: "c12", c: ["lor", "leo", "pat", "rman"], t: 3, type: "mc", q: "Which statement is TRUE?",
    a: "Lorenzo de’ Medici: a patron. Leonardo da Vinci: a Renaissance man",
    o: ["Lorenzo de’ Medici: a Renaissance man. Leonardo da Vinci: a patron", "Both are best known as the key places where the Renaissance began", "Both are best known as rulers of the city-state of Florence"],
    why: "Lorenzo de’ Medici paid for art. Leonardo da Vinci did a bit of everything." },

  // ---------------- TIER 4: synthesize ----------------
  { id: "x1", c: ["lor", "pat", "leo", "rman"], t: 4, type: "mc",
    q: "Imagine no one in Florence would pay artists. What would MOST likely happen to talented people like Leonardo da Vinci?",
    a: "They would have less support to develop their talents",
    o: ["They would all become kings and princes in their own cities instead", "Nothing, because artists never needed any money", "They would move away and stop being Italian"],
    why: "Patrons gave artists the time and money to experiment. Without them, fewer Renaissance men could flourish." },
  { id: "x2", c: ["ren", "hum", "sec", "ita"], t: 4, type: "mc", q: "Which statement BEST summarizes the Renaissance?",
    a: "A rebirth of classical learning that began in rich Italian cities",
    o: ["A long war between Italy and France that ended the Middle Ages", "A time when people rejected all the art and learning of the past", "A religious movement that banned the study of ancient Greece"],
    why: "A strong summary combines the WHAT (rebirth), WHERE (Italy), and the big IDEAS (humanism, secularism)." },
  { id: "x3", c: ["hum", "rman", "leo"], t: 4, type: "order", q: "Connect the ideas, from belief to example.",
    seq: ["Humanism says humans have great potential", "So people try to develop talents in many fields",
          "A person who does this is called a “Renaissance man”", "Example: Leonardo da Vinci, painter, inventor, and scientist"],
    why: "An idea (humanism) shapes a goal (many talents), which produces a type of person (Renaissance man) and a real example (Leonardo da Vinci)." },
  { id: "x4", c: ["sec", "hum", "leo"], t: 4, type: "mc",
    q: "Leonardo da Vinci studied real human bodies to draw them accurately and filled notebooks about how the natural world works. Which TWO Renaissance ideas does this show?",
    a: "Humanism and secularism", o: ["Patronage only", "Neither; he was a medieval monk", "Only religious devotion"],
    why: "Interest in the human body and human ability (humanism) and in the physical world (secularism)." },
  { id: "x5", c: ["ita", "lor", "pat", "ren"], t: 4, type: "mc",
    q: "A historian claims: “Money made the Renaissance possible.” Which evidence BEST supports this claim?",
    a: "Lorenzo de’ Medici’s bank wealth paid Florence’s artists",
    o: ["Leonardo da Vinci was born in the year 1452 near Florence", "The word “Renaissance” means “rebirth” in French", "Humanist scholars read and translated old Greek texts"],
    why: "All four are true, but only one connects MONEY to the art and learning. Good evidence must match the claim." },
  { id: "x6", c: ["rman", "pat"], t: 4, type: "mc", q: "Which modern person is MOST like a Renaissance man or woman?",
    a: "A doctor who also composes music and builds robots",
    o: ["An actor who acts only in movies, and nothing else", "Someone who has lived in Italy for many years", "A billionaire who gives money to art museums"],
    why: "Many fields of skill. (The billionaire is acting like a modern patron!)" },
  { id: "x7", c: ["pat", "lor"], t: 4, type: "mc", q: "Which modern example works MOST like Lorenzo de’ Medici’s role in Florence?",
    a: "A company pays local artists to paint city murals",
    o: ["A student paints a picture for her art class", "A museum guard protects valuable old paintings", "A tourist buys a postcard of the Mona Lisa"],
    why: "Using wealth to fund artists for the city is patronage, just like Lorenzo de’ Medici." },
  { id: "x8", c: ["sec", "hum", "ren"], t: 4, type: "mc",
    q: "Medieval art mostly showed religious scenes with flat figures. Renaissance art added lifelike portraits of merchants and everyday life. What BEST explains this change?",
    a: "Humanism and secularism made real life worth painting",
    o: ["Paint became much cheaper at the end of the Middle Ages", "The Church banned all religious art in Italy", "Artists had forgotten how to paint saints"],
    why: "New ideas changed what people valued, and so changed what artists painted." }
];

// "Become a Patron" — spend florins to commission works (cosmetic + fact).
const COMMISSIONS = [
  { id: "portrait", name: "A Family Portrait", cost: 40, cape: "#2f6db3",
    fact: "Patrons often paid for portraits to show off their wealth and status. Portraits of real people are a secular subject." },
  { id: "bronze", name: "A Bronze Statue for the Piazza", cost: 80, cape: "#3c8a5a",
    fact: "Florence’s leaders and guilds paid for public statues to show civic pride in their city." },
  { id: "fresco", name: "A Chapel Fresco", cost: 120, cape: "#c9a227",
    fact: "A fresco is painted onto wet plaster. Patrons paid for religious art too. Faith and secular interests lived side by side." },
  { id: "notebook", name: "An Apprentice’s Notebook", cost: 200, cape: "#7a3fa0",
    fact: "Leonardo da Vinci trained as an apprentice in the Florence workshop of Andrea del Verrocchio before becoming a master himself." }
];

// =====================================================================
//  QUICK RECALL (automaticity practice)
//  Short clues only, so simple facts can be rehearsed quickly with
//  little reading. Used by ? blocks, word blocks, flight rings, and the
//  Hall of Memory.
// =====================================================================
const SHORT = {
  ren: "Renaissance", ita: "Italy", pat: "Patron", lor: "Lorenzo de’ Medici",
  hum: "Humanism", sec: "Secularism", leo: "Leonardo da Vinci", rman: "Renaissance man"
};
const FLASH = {
  ren: ["Means “rebirth”", "Revival of Greek & Roman ideas", "About 1300–1600"],
  ita: ["Where the Renaissance began", "Home of Florence & Venice", "Rich from Mediterranean trade"],
  pat: ["Pays artists", "Funds artists & scholars", "Commissions artwork"],
  lor: ["“The Magnificent”", "Ruled Florence", "Medici banker & patron"],
  hum: ["Celebrates human potential", "Studies Greek & Roman texts", "Humans can achieve great things"],
  sec: ["Focus on worldly life", "Everyday, non-religious matters", "“Of this world”"],
  leo: ["Painted the Mona Lisa", "Designed flying machines", "Painted The Last Supper"],
  rman: ["Skilled in many fields", "Many talents, one person", "Expert in art AND science"]
};
// Easily confused pairs: used first as distractors to sharpen discrimination.
const CONFUSE = {
  ren: ["hum", "ita"], ita: ["ren", "lor"], pat: ["lor", "rman"], lor: ["pat", "leo"],
  hum: ["sec", "ren"], sec: ["hum", "ren"], leo: ["rman", "lor"], rman: ["leo", "pat"]
};
// Fillers for early in the level, before enough Codex pages are found.
const FILLER = ["Middle Ages", "Feudalism", "Crusades"];
const FILLER_CUES = ["A medieval knight’s duty", "Lived in a castle", "Fought in the Crusades"];

SHORT.weu = "Western Europe";
FLASH.weu = ["Where the Renaissance spread"];
CONFUSE.weu = ["ita", "ren"];

// =====================================================================
//  GEOGRAPHY — modern nations of western Europe (simplified outlines,
//  [longitude, latitude]). `clue` links each nation to the Renaissance;
//  nations with quiz: false are drawn but never asked about.
// =====================================================================
const COUNTRIES = {
  it: { name: "Italy", clue: "Where the Renaissance began", label: [12.6, 42.9], polys: [
    [[6.8,45.1],[7.0,45.9],[7.9,45.95],[8.4,46.45],[9.0,45.85],[9.3,46.5],[10.1,46.6],[10.5,46.9],[11.2,46.95],[12.2,47.1],[12.7,46.65],[13.7,46.5],[13.6,45.8],[13.1,45.75],[12.4,45.45],[12.3,45.0],[12.3,44.6],[12.6,44.0],[13.5,43.6],[13.9,42.9],[14.3,42.4],[15.0,42.0],[15.9,41.95],[16.2,41.85],[15.9,41.5],[16.8,41.15],[17.9,40.65],[18.5,40.15],[18.35,39.8],[17.9,40.3],[17.2,40.45],[16.6,40.1],[16.6,39.6],[17.1,39.1],[16.6,38.4],[16.1,37.95],[15.65,38.0],[15.7,38.4],[16.0,38.7],[15.8,39.4],[15.6,40.0],[15.0,40.25],[14.4,40.6],[14.25,40.85],[13.7,41.25],[12.9,41.4],[12.25,41.75],[11.7,42.15],[11.1,42.4],[10.5,42.95],[10.3,43.5],[10.1,44.0],[9.8,44.1],[8.9,44.4],[8.2,43.95],[7.5,43.78],[7.0,44.2]],
    [[12.4,37.8],[13.3,38.2],[14.3,38.05],[15.65,38.25],[15.1,37.3],[15.1,36.65],[14.3,37.0],[12.6,37.6]],
    [[8.4,41.1],[9.2,41.25],[9.8,40.9],[9.65,40.0],[9.6,39.15],[9.0,39.2],[8.4,38.95],[8.4,39.7],[8.5,40.6]]] },
  fr: { name: "France", clue: "Leonardo da Vinci’s final home", label: [2.4, 46.8], polys: [
    [[-1.8,43.4],[-1.2,44.6],[-1.2,46.2],[-2.2,47.1],[-4.7,47.9],[-4.6,48.6],[-3.0,48.8],[-1.6,48.65],[-1.4,49.7],[0.1,49.5],[1.6,50.9],[2.55,51.1],[3.2,50.7],[4.2,49.95],[4.9,50.1],[5.8,49.5],[6.4,49.45],[8.2,49.0],[7.6,47.6],[7.0,47.45],[6.1,46.4],[7.0,45.9],[6.8,45.1],[7.0,44.2],[7.5,43.78],[6.2,43.1],[4.6,43.4],[3.2,43.3],[3.1,42.45],[1.7,42.5],[0.7,42.8],[-1.3,43.05]],
    [[9.4,43.0],[9.55,42.6],[9.4,41.4],[8.9,41.4],[8.6,41.9],[8.6,42.6]]] },
  es: { name: "Spain", clue: "Paid for Christopher Columbus’s voyage", label: [-3.6, 40.0], polys: [
    [[-9.3,43.0],[-8.0,43.75],[-5.7,43.6],[-3.6,43.5],[-1.8,43.4],[-1.3,43.05],[0.7,42.8],[1.7,42.5],[3.2,42.4],[3.2,41.9],[1.0,41.0],[0.0,39.8],[-0.3,39.0],[0.2,38.75],[-0.7,37.6],[-2.1,36.7],[-4.4,36.7],[-5.6,36.0],[-6.4,36.8],[-7.4,37.2],[-7.0,38.0],[-7.3,38.4],[-7.0,38.9],[-7.5,39.6],[-7.0,39.6],[-6.9,40.25],[-6.9,41.0],[-6.2,41.6],[-6.6,41.95],[-8.2,42.15],[-8.87,41.87]],
    [[2.4,39.6],[3.1,39.95],[3.4,39.7],[2.8,39.35]]] },
  pt: { name: "Portugal", clue: "Homeland of explorer Vasco da Gama", label: [-8.2, 39.6], polys: [
    [[-8.87,41.87],[-8.2,42.15],[-6.6,41.95],[-6.2,41.6],[-6.9,41.0],[-6.9,40.25],[-7.0,39.6],[-7.5,39.6],[-7.0,38.9],[-7.3,38.4],[-7.0,38.0],[-7.4,37.2],[-8.9,37.0],[-8.8,38.0],[-9.5,38.75],[-8.9,40.0],[-8.7,41.2]]] },
  de: { name: "Germany", clue: "Johannes Gutenberg’s printing press", label: [10.3, 51.1], polys: [
    [[7.2,53.2],[7.0,53.6],[8.6,53.9],[8.9,54.9],[9.9,54.8],[11.0,54.0],[12.5,54.5],[14.2,53.9],[14.4,53.2],[14.6,52.6],[15.0,51.1],[14.0,50.9],[12.3,50.3],[13.8,48.8],[13.0,48.3],[12.8,47.7],[10.5,47.55],[9.6,47.55],[7.6,47.6],[8.2,49.0],[6.4,49.45],[6.1,50.1],[6.4,50.3],[5.95,51.0],[6.2,51.3],[6.1,51.85],[7.0,52.2]]] },
  nl: { name: "Netherlands", clue: "Homeland of humanist Desiderius Erasmus", label: [5.6, 52.3], polys: [
    [[3.4,51.4],[4.0,51.9],[4.7,52.9],[5.3,53.4],[6.9,53.4],[7.2,53.2],[7.0,52.2],[6.1,51.85],[6.2,51.3],[5.85,51.15],[5.0,51.45],[4.3,51.35]]] },
  be: { name: "Belgium", clue: "Van Eyck painted in Flanders", label: [4.6, 50.6], polys: [
    [[2.55,51.1],[3.4,51.4],[4.3,51.35],[5.0,51.45],[5.85,51.15],[5.95,51.0],[6.4,50.3],[6.1,50.1],[5.8,49.5],[4.9,50.1],[4.2,49.95],[3.2,50.7]]] },
  gb: { name: "United Kingdom", clue: "William Shakespeare’s homeland", label: [-1.8, 52.6], polys: [
    [[-5.7,50.05],[-3.5,50.2],[-1.0,50.75],[1.4,51.15],[1.75,52.5],[0.3,53.4],[-0.2,54.1],[-1.2,54.6],[-1.6,55.6],[-2.5,56.3],[-1.8,57.5],[-3.3,58.6],[-5.0,58.6],[-5.7,57.5],[-5.6,56.4],[-5.0,55.8],[-4.9,54.9],[-3.0,54.95],[-3.4,54.4],[-3.0,53.9],[-3.1,53.3],[-4.6,53.3],[-4.1,52.7],[-5.2,51.9],[-4.2,51.6],[-3.0,51.5],[-4.5,51.1]],
    [[-7.4,55.05],[-6.0,55.25],[-5.5,54.65],[-5.6,54.25],[-6.3,54.1],[-7.3,54.15],[-8.15,54.45]]] },
  ch: { name: "Switzerland", clue: null, label: [8.2, 46.8], polys: [
    [[6.1,46.4],[7.0,45.9],[8.4,46.45],[9.0,45.85],[9.3,46.5],[10.1,46.6],[10.5,46.9],[9.6,47.55],[7.6,47.6],[7.0,47.45]]] },
  ie: { name: "Ireland", clue: null, quiz: false, label: [-8.1, 53.2], polys: [
    [[-6.3,54.1],[-6.0,53.35],[-6.1,52.2],[-6.9,52.15],[-8.5,51.6],[-10.3,51.85],[-9.7,52.6],[-9.9,53.4],[-10.1,54.2],[-8.6,54.65],[-8.4,55.2],[-7.3,55.3],[-7.4,55.05],[-8.15,54.45],[-7.3,54.15]]] },
  at: { name: "Austria", clue: null, quiz: false, label: [14.2, 47.6], polys: [
    [[9.6,47.55],[10.5,46.9],[11.2,46.95],[12.2,47.1],[12.7,46.65],[13.7,46.5],[14.6,46.4],[16.1,46.8],[16.5,47.5],[17.1,48.0],[16.9,48.6],[15.0,49.0],[13.8,48.8],[13.0,48.3],[12.8,47.7],[10.5,47.55]]] }
};
// Land that is drawn for context only (central Europe, Scandinavia, North Africa).
const OTHER_LAND = [
  [[14.6,52.6],[14.4,53.2],[14.2,53.9],[18,54.8],[20,54.8],[20,46],[16.1,46.8],[16.5,47.5],[17.1,48.0],[16.9,48.6],[15.0,49.0],[13.8,48.8],[12.3,50.3],[14.0,50.9],[15.0,51.1]],
  [[13.7,46.5],[14.6,46.4],[16.1,46.8],[20,46],[20,42],[19.4,41.8],[18.5,42.45],[17.6,43.0],[16.4,43.5],[15.2,44.3],[14.5,45.3],[13.7,45.6]],
  [[8.1,55.5],[8.6,57.1],[10.6,57.7],[10.9,56.4],[12.6,55.7],[11.0,54.9],[9.9,54.8],[8.9,54.9]],
  [[11.5,58.8],[12.5,56.3],[14.2,55.4],[16.0,56.2],[17,59],[11.5,59]],
  [[-6.0,35.8],[-5.3,35.9],[-2.0,35.1],[1.0,36.5],[5.0,36.8],[9.0,37.3],[10.3,37.2],[11.0,36.8],[11.0,35.0],[-6.5,35.0]]
];
const MAP_VIEW = { lon0: -11, lon1: 17, lat0: 35.5, lat1: 59 };

// Geography questions. type "map": mode "id" (name the highlighted nation),
// "click" (click the right nation), or "mc" (multiple choice beside a map).
QUESTIONS.push(
  { id: "g1", c: ["weu"], t: 1, type: "map", mode: "id", a: "fr", o: ["Spain", "Germany", "Italy"],
    q: "Which modern nation is highlighted?", why: "France lies west of Italy, across the Alps." },
  { id: "g2", c: ["weu"], t: 1, type: "map", mode: "id", a: "es", o: ["Portugal", "France", "Italy"],
    q: "Which modern nation is highlighted?", why: "Spain covers most of the Iberian Peninsula. Portugal is the narrow nation on its west coast." },
  { id: "g3", c: ["weu"], t: 1, type: "map", mode: "id", a: "gb", o: ["France", "Netherlands", "Germany"],
    q: "Which modern nation is highlighted?", why: "The United Kingdom (England, Scotland, Wales, and Northern Ireland) is across the English Channel from France." },
  { id: "g4", c: ["weu"], t: 1, type: "map", mode: "id", a: "de", o: ["Netherlands", "Belgium", "France"],
    q: "Which modern nation is highlighted?", why: "Germany is in central Europe, north of Switzerland and Austria." },
  { id: "g5", c: ["ita", "weu"], t: 2, type: "map", mode: "click", a: "it",
    q: "Click the modern nation where the Renaissance began.", why: "Italy, the boot-shaped peninsula in the Mediterranean." },
  { id: "g6", c: ["leo", "weu"], t: 2, type: "map", mode: "click", a: "fr",
    q: "Leonardo da Vinci spent his last years in this nation, invited by its king, Francis I of France. Click it.",
    why: "Leonardo da Vinci moved to France in 1516 and died there in 1519. Kings outside Italy wanted Italian Renaissance talent." },
  { id: "g7", c: ["ita", "weu"], t: 2, type: "map", mode: "id", a: "ch", o: ["Germany", "France", "Belgium"],
    q: "Renaissance ideas heading north from Milan had to cross the Alps through this small nation. Which is it?",
    why: "Switzerland sits in the Alps, right on the route north from Italy." },
  { id: "g8", c: ["pat", "weu"], t: 3, type: "map", mode: "click", a: "es",
    q: "Queen Isabella I and King Ferdinand II paid for Christopher Columbus’s 1492 voyage, acting as his patrons. Click their kingdom, today a modern nation.",
    why: "Spain. Royal patrons funded explorers just as the Medici funded artists." },
  { id: "g9", c: ["ren", "weu"], t: 3, type: "map", mode: "click", a: "de",
    q: "Johannes Gutenberg’s printing press (about 1450, in the city of Mainz) helped Renaissance ideas spread quickly. Click the modern nation where Mainz is.",
    why: "Germany. Printed books carried humanist ideas far beyond Italy." },
  { id: "g10", c: ["hum", "weu"], t: 3, type: "map", mode: "click", a: "nl",
    q: "Desiderius Erasmus, one of the most famous humanists, was born in Rotterdam. Click the modern nation where Rotterdam is.",
    why: "The Netherlands. Humanism spread north, where scholars like Desiderius Erasmus studied classical texts too." },
  { id: "g11", c: ["ren", "weu"], t: 3, type: "map", mode: "click", a: "be",
    q: "The painter Jan van Eyck worked in Bruges, in Flanders, during the Northern Renaissance. Click the modern nation where Bruges is.",
    why: "Belgium. Flemish painters became famous for detailed, lifelike oil paintings." },
  { id: "g12", c: ["ren", "hum", "weu"], t: 3, type: "map", mode: "click", a: "gb",
    q: "William Shakespeare wrote his plays during the English Renaissance. Click the modern nation that includes England.",
    why: "The United Kingdom. The Renaissance reached England late, around 1500–1600." },
  { id: "g13", c: ["ren", "ita", "weu"], t: 4, type: "map", mode: "mc", hi: "it",
    q: "Renaissance ideas began in Italy (highlighted) and later reached France, Germany, the Netherlands, and England. What BEST explains how they spread?",
    a: "Trade, travel and printed books carried ideas north and west",
    o: ["Italy conquered all of these nations and forced its ideas on them", "Each nation began its own Renaissance at the same moment, alone", "The ideas only spread after 1900, by newspapers and radio"],
    why: "Merchants, students, artists, and printed books moved ideas along trade routes." },
  { id: "g14", c: ["ren", "weu"], t: 4, type: "order", showMap: true,
    q: "Places farther from Italy generally felt the Renaissance later. Order these nations from CLOSEST to FARTHEST from Florence.",
    seq: ["Switzerland", "Germany", "Netherlands", "United Kingdom"],
    why: "Distance slowed the spread. England’s Renaissance peaked around 1600, about a century after Italy’s." },
  { id: "g15", c: ["pat", "leo", "weu"], t: 4, type: "map", mode: "mc", hi: "fr",
    q: "King Francis I of the highlighted nation invited Leonardo da Vinci to live there and paid him well. What role was King Francis I playing?",
    a: "A patron, using royal wealth to support an artist", o: ["A humanist scholar copying Greek texts", "A Renaissance man, skilled in many fields", "A merchant selling Leonardo da Vinci’s paintings"],
    why: "Patrons existed outside Italy too. Francis I supported Leonardo da Vinci in France." }
);

// =====================================================================
//  LOST MANUSCRIPTS — primary sources hidden in each level.
//  Each has a sourcing question (who wrote it, when, why, how reliable).
//  `needs` names the ability required to reach it (see ABILITIES).
//  Once found, its question joins the review pool.
// =====================================================================
const MANUSCRIPTS = [
  { id: "ms_leo", level: "L1", needs: null, title: "A Letter Seeking a Patron",
    text: "“I can make bridges, very light and strong… In time of peace I believe I can give perfect satisfaction in architecture… I can carry out sculpture in marble, bronze, or clay, and also in painting whatever may be done, as well as any other man.”",
    cite: "Leonardo da Vinci, draft of a letter to Ludovico Sforza, Duke of Milan, about 1482",
    q: { id: "ms_leo_q", c: ["leo", "pat", "rman"], t: 3, type: "mc", ms: "ms_leo",
      q: "Sourcing: WHY did Leonardo da Vinci write this letter?",
      a: "To persuade a ruler to hire him as his patron",
      o: ["To criticize the Catholic Church in Milan", "To teach young students how to paint well", "To boast about a war he had already won for Milan"],
      why: "Read a source’s PURPOSE: Leonardo da Vinci lists his many skills (a true Renaissance man) to win a patron." } },
  { id: "ms_lor", level: "L1", needs: "wall", title: "A Song from the Carnival",
    text: "“How beautiful is youth, that is always slipping away! Whoever wants to be happy, let him be: of tomorrow there is no certainty.”",
    cite: "Lorenzo de’ Medici, “Song of Bacchus,” written for the carnival in Florence, about 1490",
    q: { id: "ms_lor_q", c: ["lor", "sec"], t: 3, type: "mc", ms: "ms_lor",
      q: "Sourcing: What does this song by Lorenzo de’ Medici suggest about life in Renaissance Florence?",
      a: "Many people valued enjoying life in this world",
      o: ["People only cared about life after death", "Florence had banned all music and festivals", "Lorenzo de’ Medici wanted to leave Florence"],
      why: "A source can reveal VALUES. A carnival song celebrating youth and pleasure shows worldly, secular interests." } },
  { id: "ms_pico", level: "L1", needs: "pound", title: "On the Dignity of Man",
    text: "“We have made you neither of heaven nor of earth… so that you may, as the free and proud shaper of your own being, fashion yourself in the form you may prefer.”",
    cite: "Giovanni Pico della Mirandola, Oration on the Dignity of Man, 1486 (God speaking to Adam)",
    q: { id: "ms_pico_q", c: ["hum"], t: 3, type: "mc", ms: "ms_pico",
      q: "Sourcing: Which Renaissance idea does this 1486 speech express most clearly?",
      a: "Humanism: people can shape their own lives",
      o: ["Patronage: rich families should pay artists", "Censorship: dangerous ideas should be banned", "Secularism: religion should be ignored"],
      why: "Pico della Mirandola was a humanist scholar; the passage celebrates human freedom and potential." } }
];
// Abilities are earned by making concepts automatic (fast, accurate recall over time).
const ABILITIES = [
  { id: "wall", name: "Vitruvian Leap", need: 2, how: "Wall-jump: in mid-air, press jump while touching a wall to leap off it.", short: "wall-jump" },
  { id: "pound", name: "Printer’s Press", need: 4, how: "Ground-pound: press ↓ in mid-air to slam down and smash cracked stone.", short: "ground-pound" },
  { id: "glide", name: "Da Vinci’s Cloak", need: 7, how: "Glide: hold jump while falling to drift across wide gaps.", short: "glide" }
];
MANUSCRIPTS.forEach(m => { m.q.src = { text: m.text, cite: m.cite }; QUESTIONS.push(m.q); });
