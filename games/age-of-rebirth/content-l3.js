// =====================================================================
//  THE AGE OF REBIRTH — LEVEL 3 CONTENT: CROWN AND COSMOS (England)
//  Tudor monarchs, the Spanish Armada, and the Scientific Revolution.
//  Teachers: edit this file to change Level 3 terms, Codex cards, or
//  questions. Same tiers and question types as content.js.
//  Level 3 leans on interleaving: many questions connect these ideas
//  to the Renaissance (Level 1) and the Reformation (Level 2).
// =====================================================================

Object.assign(CONCEPTS, {
  eng: {
    name: "England", kind: "Key Place", icon: "♜", map: true,
    def: "A kingdom on the island of Great Britain, ruled from London. Under the Tudor monarchs (1485–1603) it broke away from the Catholic Church and became a major sea power. Today England is part of the United Kingdom.",
    example: "London’s Tower, its bridge lined with houses, and Queen Elizabeth I’s navy all belonged to Tudor England.",
    hook: "Island kingdom, ruled from London."
  },
  h8: {
    name: "Henry VIII", kind: "Key Person", icon: "♚",
    def: "(1491–1547) Tudor king of England. When the pope refused to end his first marriage, he broke with the Catholic Church and made himself head of a new Church of England (1534). He married six times.",
    example: "In 1521, Pope Leo X named Henry VIII “Defender of the Faith” for a book attacking Martin Luther. Thirteen years later, Henry VIII broke with Rome himself.",
    hook: "The king who broke with Rome."
  },
  e6: {
    name: "Edward VI", kind: "Key Person", icon: "♙",
    def: "(1537–1553) Henry VIII’s only son. He became king at age 9 and made England’s church strongly Protestant, with prayers and services in English. He died at 15.",
    example: "In 1549, Edward VI’s government replaced Latin church services with an English Book of Common Prayer.",
    hook: "The boy king who made England Protestant."
  },
  mry: {
    name: "Mary I (“Bloody Mary”)", kind: "Key Person", icon: "✝",
    def: "(1516–1558) Henry VIII’s eldest daughter, queen from 1553. A devout Catholic, she returned England to the Catholic Church and had nearly 300 Protestants burned as heretics, which earned her the nickname “Bloody Mary.”",
    example: "Mary I married King Philip II of Catholic Spain in 1554.",
    hook: "The Catholic queen who burned heretics."
  },
  eliz: {
    name: "Elizabeth I", kind: "Key Person", icon: "♛",
    def: "(1533–1603) Henry VIII’s daughter, queen for 44 years. She set up a moderate Protestant Church of England, was a patron of the arts in the age of William Shakespeare, and her navy defeated the Spanish Armada in 1588.",
    example: "Elizabeth I never married. She was called “the Virgin Queen” and “Good Queen Bess.”",
    hook: "The Protestant queen who beat the Armada."
  },
  abs: {
    name: "Absolute monarch", kind: "Key Term", icon: "♔",
    def: "A king or queen who holds nearly total power over a country and does not share it with an elected body such as a parliament. Their word is law.",
    example: "Henry VIII ruled with enormous power, even taking control of the church. Later, King Louis XIV of France became the most famous absolute monarch.",
    hook: "All the power in one ruler’s hands."
  },
  arm: {
    name: "Spanish Armada", kind: "Key Term", icon: "⛵",
    def: "A huge fleet of about 130 warships sent by King Philip II of Catholic Spain in 1588 to invade Protestant England. English ships, fireships, and storms defeated it.",
    example: "Fewer than half the Armada’s ships made it home to Spain; many were wrecked by storms off Scotland and Ireland.",
    hook: "Spain’s fleet that failed to conquer England."
  },
  scr: {
    name: "Scientific Revolution", kind: "Key Term", icon: "⚗",
    def: "A period (about 1540–1700) when thinkers began explaining nature with observation, experiments, and math, instead of relying only on ancient authorities and church teachings.",
    example: "In 1610, Galileo Galilei used a telescope to discover moons circling Jupiter. In 1687, the Englishman Isaac Newton explained gravity.",
    hook: "Observe it, test it, measure it."
  },
  geo: {
    name: "Geocentric theory", kind: "Key Term", icon: "⊕",
    def: "The old idea that Earth stands still at the center of the universe and the sun, moon, planets, and stars all circle around it. It was taught by the ancient Greek astronomer Ptolemy and accepted by the Church.",
    example: "To explain why planets sometimes seem to move backward, Ptolemy’s model needed planets to loop in extra little circles called epicycles.",
    hook: "Geo = Earth (as in geography). Earth at the center."
  },
  hel: {
    name: "Heliocentric theory", kind: "Key Term", icon: "☉",
    def: "The idea that the sun is at the center and Earth and the other planets orbit around it. Nicolaus Copernicus published it in 1543, and Galileo Galilei’s telescope observations supported it.",
    example: "In 1633 the Roman Inquisition put Galileo Galilei on trial for teaching heliocentric theory.",
    hook: "Helios = Sun (as in helium). Sun at the center."
  }
});

LEVEL_CODEX.L3 = ["eng", "h8", "abs", "e6", "mry", "eliz", "scr", "geo", "hel", "arm"];
CODEX_ORDER.push(...LEVEL_CODEX.L3);

Object.assign(SHORT, {
  eng: "England", h8: "Henry VIII", e6: "Edward VI", mry: "Mary I", eliz: "Elizabeth I", abs: "Absolute monarch",
  arm: "Spanish Armada", scr: "Scientific Revolution", geo: "Geocentric theory", hel: "Heliocentric theory"
});
Object.assign(FLASH, {
  eng: ["Island kingdom ruled from London", "Home of the Tudor monarchs", "Part of today’s United Kingdom"],
  h8: ["Broke with the pope in 1534", "Head of the new Church of England", "Tudor king with six wives"],
  e6: ["Henry VIII’s only son", "Boy king, crowned at age 9", "Made England more Protestant"],
  mry: ["“Bloody Mary”", "Catholic queen who burned Protestants", "Henry VIII’s eldest daughter"],
  eliz: ["Queen who defeated the Armada", "Protestant queen in Shakespeare’s age", "“The Virgin Queen”"],
  abs: ["Ruler with nearly total power", "Power not shared with a parliament", "A ruler whose word is law"],
  arm: ["Spain’s fleet sent to invade England", "Defeated in 1588", "Philip II’s 130 warships"],
  scr: ["Explaining nature with experiments", "Observation and math over old authority", "Galileo Galilei and Isaac Newton"],
  geo: ["Earth at the center", "Ptolemy’s old model", "The sun circles the Earth"],
  hel: ["Sun at the center", "Copernicus’s model, 1543", "Earth orbits the sun"]
});
Object.assign(CONFUSE, {
  eng: ["ger", "ita"], h8: ["e6", "abs"], e6: ["h8", "mry"], mry: ["eliz", "e6"], eliz: ["mry", "h8"],
  abs: ["h8", "pat"], arm: ["inq", "eng"], scr: ["ren", "ref"], geo: ["hel", "scr"], hel: ["geo", "scr"]
});

QUESTIONS.push(
  // ---------------- TIER 1 ----------------
  { id: "t_eng1", c: ["eng"], t: 1, type: "map", mode: "id", a: "gb", o: ["France", "Netherlands", "Germany"],
    q: "England is part of the highlighted modern nation. Which is it?", why: "England, Scotland, Wales, and Northern Ireland make up the United Kingdom." },
  { id: "t_eng2", c: ["eng"], t: 1, type: "tf", q: "England is on an island, separated from the rest of Europe by the sea.",
    a: true, why: "The English Channel lies between England and France. The sea shaped England’s history." },
  { id: "t_h81", c: ["h8"], t: 1, type: "mc", q: "Which king broke away from the Catholic Church and made himself head of the Church of England?",
    a: "Henry VIII", o: ["Edward VI", "Philip II", "Pope Leo X"],
    why: "In 1534, Henry VIII made himself Supreme Head of the Church of England." },
  { id: "t_h82", c: ["h8"], t: 1, type: "fill", q: "When the pope would not end his first marriage, ___ broke with Rome in 1534.",
    a: "Henry VIII", o: ["Edward VI", "Martin Luther", "Lorenzo de’ Medici"],
    why: "Henry VIII wanted a son and a new wife. The pope refused, so Henry VIII broke with the Catholic Church." },
  { id: "t_e61", c: ["e6"], t: 1, type: "mc", q: "Who was Edward VI?",
    a: "Henry VIII’s son, a boy king who made England Protestant",
    o: ["A Spanish admiral who led the Armada in its attack on England", "The Roman pope who excommunicated King Henry VIII", "Elizabeth I’s husband, who ruled England beside her"],
    why: "Edward VI ruled from 1547 to 1553 and died at 15." },
  { id: "t_mry1", c: ["mry"], t: 1, type: "mc", q: "Why was Mary I nicknamed “Bloody Mary”?",
    a: "She had nearly 300 Protestants burned as heretics",
    o: ["She led England’s army in a bloody war with the Armada", "She signed all her royal orders in blood-red ink", "She executed every Catholic bishop in England"],
    why: "Mary I was a devout Catholic who punished Protestants as heretics." },
  { id: "t_mry2", c: ["mry"], t: 1, type: "tf", q: "Mary I tried to return England to the Catholic Church.",
    a: true, why: "Mary I reversed the Protestant changes of Edward VI." },
  { id: "t_eli1", c: ["eliz"], t: 1, type: "mc", q: "Which queen’s navy defeated the Spanish Armada in 1588?",
    a: "Elizabeth I", o: ["Mary I", "Catherine of Aragon", "Isabella of Spain"],
    why: "Elizabeth I ruled England from 1558 to 1603." },
  { id: "t_eli2", c: ["eliz"], t: 1, type: "fill", q: "William Shakespeare wrote many of his plays during the reign of ___.",
    a: "Elizabeth I", o: ["Henry VIII", "Edward VI", "Mary I"],
    why: "The Elizabethan age was a golden age for English theater and poetry." },
  { id: "t_abs1", c: ["abs"], t: 1, type: "mc", q: "An absolute monarch is…",
    a: "a ruler whose power is not shared with a parliament",
    o: ["a ruler elected by the people every four years", "a church court that tries people accused of heresy", "a rich family that pays artists to make great works"],
    why: "Absolute = complete. All the power in one ruler’s hands." },
  { id: "t_abs2", c: ["abs"], t: 1, type: "tf", q: "An absolute monarch must get permission from voters before making laws.",
    a: false, why: "An absolute monarch’s word is law. No voters, no limits." },
  { id: "t_arm1", c: ["arm"], t: 1, type: "mc", q: "What was the Spanish Armada?",
    a: "A huge Spanish fleet sent to invade England in 1588",
    o: ["A Spanish court that tried heretics in Madrid and Seville", "A peace treaty signed by England and Spain in 1588", "A famous school of Spanish painters in Toledo"],
    why: "King Philip II sent about 130 warships against Elizabeth I’s England." },
  { id: "t_arm2", c: ["arm"], t: 1, type: "tf", q: "The Spanish Armada conquered England in 1588.",
    a: false, why: "English ships, fireships, and storms defeated the Armada." },
  { id: "t_scr1", c: ["scr"], t: 1, type: "mc", q: "During the Scientific Revolution, thinkers began to explain nature by…",
    a: "observing, experimenting, and measuring",
    o: ["only reading the books of ancient authorities", "asking the king or the Church to decide", "trusting old traditions passed down by elders"],
    why: "Evidence from observation and experiments became the test of an idea." },
  { id: "t_scr2", c: ["scr"], t: 1, type: "fill", q: "The period when thinkers began using observation, experiments, and math to explain nature is called the ___.",
    a: "Scientific Revolution", o: ["Protestant Reformation", "Italian Renaissance", "Spanish Inquisition"],
    why: "It ran from about 1540 to 1700." },
  { id: "t_geo1", c: ["geo"], t: 1, type: "mc", q: "In geocentric theory, what is at the center of the universe?",
    a: "Earth", o: ["The sun", "The moon", "Jupiter"],
    why: "Geo = Earth, as in geography and geology." },
  { id: "t_hel1", c: ["hel"], t: 1, type: "mc", q: "In heliocentric theory, what is at the center?",
    a: "The sun", o: ["Earth", "The moon", "Rome"],
    why: "Helios = sun, as in helium (first found in the sun’s light)." },
  { id: "t_hel2", c: ["hel"], t: 1, type: "fill", q: "In 1543, Nicolaus Copernicus published the ___ theory, putting the sun at the center.",
    a: "heliocentric", o: ["geocentric", "humanist", "absolute"],
    why: "Copernicus’s book was published the year he died." },

  // ---------------- TIER 2 ----------------
  { id: "t_succ", c: ["h8", "e6", "mry", "eliz"], t: 2, type: "order", q: "Put the Tudor monarchs in order, first to last.",
    seq: ["Henry VIII", "Edward VI", "Mary I (“Bloody Mary”)", "Elizabeth I"],
    why: "Father, then son, then two daughters: Henry VIII → Edward VI → Mary I → Elizabeth I." },
  { id: "t_s1", c: ["geo", "hel"], t: 2, type: "sort", boss: true, q: "Geocentric or heliocentric? Sort each statement.",
    bins: ["Geocentric (Earth at center)", "Heliocentric (Sun at center)"],
    items: [["Taught by the ancient Greek Ptolemy", 0], ["Published by Nicolaus Copernicus in 1543", 1],
            ["The sun circles a motionless Earth", 0], ["Earth is one planet orbiting the sun", 1],
            ["Needed planets to loop in epicycles", 0], ["Supported by Galileo Galilei’s telescope", 1]],
    why: "Geo = Earth, helio = sun. The sun-centered model explained the sky more simply." },
  { id: "t_s2", c: ["e6", "mry", "eliz"], t: 2, type: "sort", boss: true, q: "Protestant or Catholic? Sort each Tudor monarch’s church policy.",
    bins: ["Protestant", "Catholic"],
    items: [["Edward VI’s English Book of Common Prayer", 0], ["Mary I’s return to obedience to the pope", 1],
            ["Elizabeth I’s Church of England", 0], ["Mary I’s burning of Protestant heretics", 1]],
    why: "England’s official religion switched with each monarch: a dizzying time to be a believer." },
  { id: "t_m1", c: ["h8", "e6", "mry", "eliz"], t: 2, type: "match", q: "Match each Tudor monarch to a fact.",
    pairs: [["Henry VIII", "Broke with the pope in 1534"], ["Edward VI", "Boy king who made England Protestant"],
            ["Mary I", "Catholic queen called “Bloody Mary”"], ["Elizabeth I", "Defeated the Spanish Armada"]],
    why: "Four monarchs, one family, three changes of religion." },
  { id: "t_m2", c: ["abs", "arm", "scr", "hel"], t: 2, type: "match", q: "Match each key term to its meaning.",
    pairs: [["Absolute monarch", "Ruler with nearly total power"], ["Spanish Armada", "Spain’s invasion fleet of 1588"],
            ["Scientific Revolution", "Explaining nature with experiments and math"], ["Heliocentric theory", "The sun is at the center"]],
    why: "Saying each term with its meaning helps you tell them apart." },
  { id: "t_abs3", c: ["abs"], t: 2, type: "mc", q: "A king declares new taxes, closes the parliament, and orders that no one may question him. He is acting like…",
    a: "an absolute monarch", o: ["a generous patron", "a Renaissance man", "a notorious heretic"],
    why: "Total, unshared power is the mark of an absolute monarch." },
  { id: "t_arm3", c: ["arm", "eliz"], t: 2, type: "odd", q: "Which is NOT part of the story of the Spanish Armada?",
    a: "Martin Luther nailing the 95 Theses",
    o: ["King Philip II of Spain", "English fireships at night", "Storms wrecking ships off Ireland"],
    why: "That was Germany in 1517. The Armada sailed in 1588." },
  { id: "t_scr3", c: ["scr"], t: 2, type: "mc", q: "A scientist drops two balls of different weights to test whether heavier things fall faster. This is an example of…",
    a: "the experimental method", o: ["the geocentric theory", "religious censorship", "artistic patronage"],
    why: "Testing an idea with an experiment, instead of trusting an old book, was the big change." },
  { id: "t_h83", c: ["h8", "cat"], t: 2, type: "tf", q: "After 1534, the pope was still the head of the church in England.",
    a: false, why: "The Act of Supremacy made Henry VIII Supreme Head of the Church of England." },
  { id: "t_eng3", c: ["eng", "arm"], t: 2, type: "map", mode: "click", a: "es",
    q: "Click the modern nation that sent the Spanish Armada against England in 1588.", why: "Spain. The Armada sailed from Lisbon and up the English Channel." },
  { id: "t_eng4", c: ["eng", "weu"], t: 2, type: "map", mode: "click", a: "gb",
    q: "Click the modern nation that includes England, home of the Tudor monarchs.", why: "The United Kingdom, northwest of France across the English Channel." },
  { id: "t_geo2", c: ["geo"], t: 2, type: "mc", q: "Why did most people in 1500 believe in geocentric theory?",
    a: "It matched what they saw, and authorities taught it",
    o: ["Galileo Galilei had proved it with his telescope", "Copernicus had invented it just a few years before", "The Spanish Armada forced all of Europe to believe it"],
    why: "Everyday experience plus respected authority made the Earth-centered model feel obvious." },

  // ---------------- TIER 3 (connect, often across levels) ----------------
  { id: "t_c1", c: ["h8", "lut", "ref"], t: 3, type: "mc", q: "How was Henry VIII’s break with Rome DIFFERENT from Martin Luther’s?",
    a: "Henry VIII: marriage and power. Martin Luther: religious beliefs",
    o: ["Henry VIII: religious beliefs. Martin Luther: marriage and power", "Both broke away because Spain had invaded their lands", "There was no real difference between their reasons"],
    why: "Same result (a split from the pope), different causes. Henry VIII even kept many Catholic practices." },
  { id: "t_c2", c: ["h8", "leox", "lut"], t: 3, type: "mc", q: "In 1521, Pope Leo X named Henry VIII “Defender of the Faith.” Why is this surprising?",
    a: "He defended the pope against Martin Luther, then broke with Rome",
    o: ["He attacked the pope in 1521, then became a loyal Catholic again", "Pope Leo X was English, and Henry VIII was his cousin", "He invented the printing press, then banned all books"],
    why: "People and alliances change. Henry VIII went from the pope’s defender to his opponent in 13 years." },
  { id: "t_c3", c: ["mry", "htc", "hsy"], t: 3, type: "mc", q: "Mary I had Protestants burned. In Mary I’s eyes, why?",
    a: "As a Catholic, she saw their beliefs as heresy",
    o: ["They had been caught selling false indulgences", "They had secretly helped the Spanish Armada", "They believed in geocentric theory, which she rejected"],
    why: "Heresy is relative to which church holds power. Under Edward VI, Protestantism was official; under Mary I, it was heresy." },
  { id: "t_c4", c: ["arm", "cat", "eliz"], t: 3, type: "mc", q: "Which BEST explains why Catholic Spain sent the Armada against Elizabeth I’s England?",
    a: "To restore Catholicism in England and stop English raids",
    o: ["To punish Elizabeth I for secretly joining the Spanish Inquisition", "To buy English paintings for the king of Spain", "To stop England from invading and conquering Italy"],
    why: "The Reformation split Europe into rival Catholic and Protestant powers." },
  { id: "t_c5", c: ["hel", "inq", "cen"], t: 3, type: "mc", q: "In 1633, Galileo Galilei was tried by the Roman Inquisition and his book was banned. This shows…",
    a: "how censorship and church courts fought new science",
    o: ["that the Inquisition welcomed heliocentric theory", "that Galileo Galilei had been selling indulgences", "that England had conquered Italy and its scholars"],
    why: "Galileo Galilei spent his last years under house arrest. Ideas from Level 2 return here!" },
  { id: "t_c6", c: ["scr", "hum"], t: 3, type: "mc", q: "How did Renaissance humanism help prepare the way for the Scientific Revolution?",
    a: "They encouraged questioning and confidence in human reason",
    o: ["They required everyone to believe in geocentric theory without question", "They banned all ancient books so new ideas could grow", "They invented the telescope to study ancient texts"],
    why: "Confidence in human reason grew into testing ideas against evidence." },
  { id: "t_c7", c: ["scr", "rman", "leo"], t: 3, type: "mc", q: "Why is Leonardo da Vinci sometimes called a forerunner of the Scientific Revolution?",
    a: "He studied nature by observing, dissecting and sketching",
    o: ["He proved heliocentric theory with his own telescope", "He wrote the 95 Theses to protest against old science", "He commanded the Spanish Armada’s fleet of warships"],
    why: "A Renaissance man’s curiosity and observation pointed toward science." },
  { id: "t_c8", c: ["eliz", "pat"], t: 3, type: "mc", q: "How did Elizabeth I act like a Renaissance patron?",
    a: "Her court supported poets, playwrights and musicians",
    o: ["She sold indulgences to pay for royal portraits of herself", "She banned all plays and closed the theaters", "She invented a printing press for English poets"],
    why: "Patrons pay for and protect artists. William Shakespeare’s company even performed at her court." },
  { id: "t_c9", c: ["h8", "abs", "cat"], t: 3, type: "mc", q: "How did breaking with the Catholic Church make Henry VIII MORE powerful?",
    a: "He now controlled the church’s lands and wealth",
    o: ["The pope sent him more money as a reward for his loyalty", "He was elected pope by the English bishops", "He gave all his power to Parliament instead"],
    why: "Taking over the church moved power and money from Rome to the king: a step toward absolute rule." },
  { id: "t_c10", c: ["geo", "hel", "scr"], t: 3, type: "order", q: "Put the change in astronomy in order, earliest first.",
    seq: ["About 150 CE: Ptolemy describes an Earth-centered universe", "1543: Nicolaus Copernicus publishes heliocentric theory",
          "1610: Galileo Galilei sees moons orbiting Jupiter", "1687: Isaac Newton explains gravity"],
    why: "It took nearly 150 years for the sun-centered model to win wide acceptance." },
  { id: "t_c11", c: ["e6", "mry", "eliz", "ref"], t: 3, type: "mc", q: "Why did ordinary English people’s church services change so often between 1547 and 1559?",
    a: "Each new monarch changed the official religion",
    o: ["The Spanish Armada invaded England every year", "Every town voted on its own religion each year", "The pope moved to London and changed the rules"],
    why: "In the Reformation, a ruler’s religion often became the country’s religion." },
  { id: "t_c12", c: ["eng", "ger", "ita"], t: 3, type: "map", mode: "mc", hi: "gb",
    q: "Your journey: the Renaissance began in Italy, the Reformation in Germany, and now the highlighted nation, home of Tudor England. In what order did you travel?",
    a: "Italy → Germany → United Kingdom", o: ["Germany → Italy → United Kingdom", "United Kingdom → Italy → Germany", "Italy → Spain → France"],
    why: "Ideas traveled north: from Italy over the Alps to Germany, then across the sea to England." },

  // ---------------- TIER 4 (synthesize) ----------------
  { id: "t_x1", c: ["ren", "ref", "scr"], t: 4, type: "sort", boss: true, q: "Which movement does each belong to?",
    bins: ["Renaissance", "Reformation", "Scientific Revolution"],
    items: [["Patrons pay for paintings and statues in Florence", 0], ["Martin Luther criticizes indulgences", 1],
            ["Galileo Galilei observes Jupiter’s moons", 2], ["Henry VIII breaks with the pope", 1],
            ["Humanists study ancient Greek and Roman texts", 0], ["Copernicus puts the sun at the center", 2]],
    why: "Three movements, three questions: Renaissance (art and learning), Reformation (the church), Scientific Revolution (nature)." },
  { id: "t_x2", c: ["lor", "lut", "h8", "hel", "arm"], t: 4, type: "order", q: "Put these events from your whole journey in order, earliest first.",
    seq: ["About 1480: Lorenzo de’ Medici is a great patron in Florence", "1517: Martin Luther writes the 95 Theses",
          "1534: Henry VIII breaks with the pope", "1543: Copernicus publishes heliocentric theory", "1588: England defeats the Spanish Armada"],
    why: "A timeline across the whole map shows how each movement led into the next." },
  { id: "t_x3", c: ["scr", "ref", "ren"], t: 4, type: "mc", q: "What do the Renaissance, the Reformation, and the Scientific Revolution have in common?",
    a: "Each challenged an accepted authority",
    o: ["Each began in England and spread to Italy", "Each was led by a powerful absolute monarch", "Each ended the use of printing in Europe"],
    why: "Big idea: across 200 years, Europeans grew more willing to question authority and look for themselves." },
  { id: "t_x4", c: ["abs", "h8", "eliz"], t: 4, type: "mc", q: "A historian argues: “The Tudor monarchs were powerful, but not truly absolute.” Which evidence BEST supports this?",
    a: "Henry VIII and Elizabeth I still needed Parliament for taxes",
    o: ["Henry VIII married six times and had three children who ruled", "Elizabeth I never married and ruled England for 44 years", "Edward VI became king at 9 and ruled for six years"],
    why: "All true facts, but only one shows a LIMIT on royal power." },
  { id: "t_x5", c: ["hel", "scr", "cen"], t: 4, type: "mc", q: "Why did heliocentric theory spread across Europe even after Galileo Galilei’s book was banned?",
    a: "Printed copies reached scholars beyond any censor’s reach",
    o: ["The Inquisition ordered everyone in Europe to accept it at once", "No one ever read Galileo Galilei’s book after 1633", "Absolute monarchs voted together to make it official"],
    why: "Just as with Martin Luther’s pamphlets, printing made censorship hard to enforce." },
  { id: "t_x6", c: ["arm", "eng", "eliz"], t: 4, type: "mc", q: "How did England’s victory over the Spanish Armada change its future?",
    a: "England stayed Protestant and grew into a sea power",
    o: ["England became part of Spain for the next century", "England returned to the Catholic Church right away", "England stopped building ships and lost its navy"],
    why: "Surviving 1588 let England build a navy and, later, a global empire." },
  { id: "t_x7", c: ["geo", "hel", "scr"], t: 4, type: "mc", q: "Both models could roughly predict where planets would appear. Why did scientists eventually choose the heliocentric model?",
    a: "It explained the evidence more simply and accurately",
    o: ["The king of England ordered scientists to accept it", "It was older and more respected than Ptolemy’s model", "It matched exactly what Ptolemy had written long ago"],
    why: "Science prefers the explanation that best fits the evidence, even when it overturns tradition." }
);

// The Great Orrery switches models with these in-world cues.
const ORRERY_CUES = [
  { c: "hel", prompt: "Heliocentric theory puts ___ at the center", answer: "The Sun", options: ["The Sun", "The Earth"] },
  { c: "geo", prompt: "Geocentric theory puts ___ at the center", answer: "The Earth", options: ["The Sun", "The Earth"] },
  { c: "hel", prompt: "Copernicus (1543) put ___ at the center", answer: "The Sun", options: ["The Sun", "The Earth"] },
  { c: "geo", prompt: "Ptolemy’s old model put ___ at the center", answer: "The Earth", options: ["The Sun", "The Earth"] }
];

MANUSCRIPTS.push(
  { id: "ms_sup", level: "L3", needs: null, title: "The Act of Supremacy",
    text: "“The King our sovereign lord, his heirs and successors, kings of this realm, shall be taken, accepted, and reputed the only supreme head in earth of the Church of England.”",
    cite: "Act of Supremacy, passed by the English Parliament, 1534",
    q: { id: "ms_sup_q", c: ["h8", "cat", "abs"], t: 3, type: "mc", ms: "ms_sup",
      q: "Sourcing: This is a law from 1534. What does it show?",
      a: "Henry VIII taking control of the church from the pope",
      o: ["The pope giving Henry VIII permission to remarry", "Elizabeth I preparing England’s navy for the Armada", "Parliament electing a new king to replace Henry VIII"],
      why: "Notice WHO made it: Parliament passed it at the king’s request. The law moved power over the church from Rome to the king." } },
  { id: "ms_cop", level: "L3", needs: "lens", title: "On the Revolutions of the Heavenly Spheres",
    text: "“In the middle of all sits the Sun. For who would place this lamp of a very beautiful temple in another or better place than this, from which it can light up everything at the same time?”",
    cite: "Nicolaus Copernicus, On the Revolutions of the Heavenly Spheres, 1543",
    q: { id: "ms_cop_q", c: ["hel", "geo", "scr"], t: 3, type: "mc", ms: "ms_cop",
      q: "Sourcing: Which idea does Copernicus support here, and why was it controversial in 1543?",
      a: "Heliocentric; it contradicted the Earth-centered view",
      o: ["Geocentric; it was a shocking new idea that no one had heard in 1543", "Absolute monarchy; it attacked the king’s power", "Humanism; it banned the study of ancient books"],
      why: "Copernicus, a church official himself, dedicated the book to Pope Paul III, perhaps hoping to soften the shock." } },
  { id: "ms_til", level: "L3", needs: "pound", title: "The Speech at Tilbury",
    text: "“I know I have the body but of a weak and feeble woman; but I have the heart and stomach of a king, and of a king of England too.”",
    cite: "Elizabeth I to her troops at Tilbury, August 1588, as recorded in a letter by Leonel Sharp, a chaplain, written decades later",
    q: { id: "ms_til_q", c: ["eliz", "arm"], t: 3, type: "mc", ms: "ms_til",
      q: "Sourcing: The only full text of this speech comes from a letter written decades after 1588. What should a historian conclude?",
      a: "She likely gave a speech, but the words may not be hers",
      o: ["The speech must have been invented by her enemies", "Every word is certainly exactly what she said", "Old letters can never be used as historical evidence"],
      why: "Check WHEN a source was made. A record written long after an event can keep the main idea but change the words." } }
);
MANUSCRIPTS.filter(m => m.level === "L3").forEach(m => { m.q.src = { text: m.text, cite: m.cite }; QUESTIONS.push(m.q); });

QUESTIONS.push(
  { id: "src6", c: ["hel", "inq"], t: 3, type: "mc", skill: "source",
    q: "In 1633, after his trial, Galileo Galilei signed a statement rejecting heliocentric theory. How reliable is it as evidence of what he truly believed?",
    a: "Not very: he was forced to sign it under threat",
    o: ["Completely reliable, because he signed it himself", "Completely reliable, because it is very old", "It proves that heliocentric theory is wrong"],
    why: "Ask whether the author was free to say what they thought. Pressure changes what people write." }
);

// Galileo's Lens: the fourth mastery ability, used in Level 3.
ABILITIES.push({ id: "lens", name: "Galileo’s Lens", need: 10, how: "See the unseen: hidden star-bridges appear and become solid wherever you go.", short: "the lens" });
