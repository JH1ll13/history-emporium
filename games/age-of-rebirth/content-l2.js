// =====================================================================
//  THE AGE OF REBIRTH — LEVEL 2 CONTENT: THE REFORMATION (Germany)
//  Teachers: edit this file to change Level 2 terms, Codex cards, or
//  questions. Same tiers and question types as content.js.
// =====================================================================

Object.assign(CONCEPTS, {
  cat: {
    name: "Catholic Church", kind: "Key Term", icon: "✠",
    def: "The main Christian church in western Europe, led by the pope in Rome. In 1500 it was very wealthy and powerful, and almost everyone in western Europe belonged to it.",
    example: "A village church in Germany, a cathedral in Spain, and St. Peter’s Basilica in Rome were all part of the same Catholic Church.",
    hook: "One church, led from Rome."
  },
  ind: {
    name: "Indulgences", kind: "Key Term", icon: "✉",
    def: "In Catholic teaching, a reduction of the punishment for sins. By 1517, indulgences were being sold to raise money, which many people, including Martin Luther, criticized.",
    example: "Money from indulgences sold in Germany helped pay to rebuild St. Peter’s Basilica in Rome.",
    hook: "Pay to reduce the punishment for sin."
  },
  lut: {
    name: "Martin Luther", kind: "Key Person", icon: "✒",
    def: "(1483–1546) A German monk and professor in Wittenberg. In 1517 he wrote the 95 Theses criticizing the sale of indulgences. He taught that people are saved by faith alone, and he translated the Bible into German.",
    example: "At the Diet of Worms in 1521, Martin Luther refused to take back his writings.",
    hook: "The monk who started the Reformation."
  },
  alb: {
    name: "Archbishop of Mainz", kind: "Key Person", icon: "⚜",
    def: "Albrecht of Brandenburg, the powerful Archbishop of Mainz, borrowed money to pay for his church offices. Pope Leo X let him sell indulgences in Germany; half the money repaid his debts and half went to Rome.",
    example: "Martin Luther sent his 95 Theses to the Archbishop of Mainz in 1517.",
    hook: "The archbishop who sold indulgences in Germany."
  },
  ref: {
    name: "Reformation", kind: "Key Term", icon: "✎",
    def: "A religious movement that began in 1517 when Martin Luther challenged practices of the Catholic Church. It split western Christianity and created new Protestant churches.",
    example: "Towns in Germany began holding church services in German instead of Latin.",
    hook: "Re-form: a movement to change the Church."
  },
  leox: {
    name: "Pope Leo X", kind: "Key Person", icon: "♔",
    def: "(1475–1521) Born Giovanni de’ Medici, a son of Lorenzo de’ Medici. As pope, he approved selling indulgences to help pay for rebuilding St. Peter’s Basilica, and in 1521 he excommunicated Martin Luther.",
    example: "Like his father, Pope Leo X was a great patron of artists, including the painter Raphael.",
    hook: "A Medici pope who needed money."
  },
  cen: {
    name: "Censorship", kind: "Key Term", icon: "✂",
    def: "Controlling or banning books, speech, or ideas that leaders consider dangerous.",
    example: "Martin Luther’s books were banned and burned in some places, and later the Catholic Church published a list of forbidden books.",
    hook: "Censor = cut out ideas."
  },
  ger: {
    name: "Germany", kind: "Key Place", icon: "⛫", map: true,
    def: "In the 1500s, Germany was not one country. It was a patchwork of hundreds of states inside the Holy Roman Empire, each with its own ruler. The Reformation began there, in the town of Wittenberg.",
    example: "Prince Frederick the Wise of Saxony protected Martin Luther and hid him in Wartburg Castle.",
    hook: "Many princes, one big protest."
  },
  hsy: {
    name: "Heresy", kind: "Key Term", icon: "✕",
    def: "A belief or idea that goes against the official teachings of a church.",
    example: "Saying the pope had no special authority was considered heresy by the Catholic Church.",
    hook: "Heresy = the forbidden idea."
  },
  htc: {
    name: "Heretic", kind: "Key Term", icon: "☍",
    def: "A person who holds beliefs that go against official church teachings. Heretics could be put on trial and severely punished.",
    example: "In 1521, Martin Luther was declared a heretic.",
    hook: "Heretic = the person. Heresy = the idea."
  },
  inq: {
    name: "Inquisition", kind: "Key Term", icon: "⚖",
    def: "A court of the Catholic Church that searched for, put on trial, and punished people accused of heresy.",
    example: "The Spanish Inquisition began in 1478; the Roman Inquisition began in 1542.",
    hook: "Inquire = ask questions. The court that hunted heresy."
  }
});

LEVEL_CODEX.L2 = ["cat", "ind", "lut", "alb", "ref", "leox", "cen", "ger", "hsy", "htc", "inq"];
CODEX_ORDER.push(...LEVEL_CODEX.L2);

Object.assign(SHORT, {
  cat: "Catholic Church", ind: "Indulgences", lut: "Martin Luther", alb: "Archbishop of Mainz", ref: "Reformation",
  leox: "Pope Leo X", cen: "Censorship", ger: "Germany", hsy: "Heresy", htc: "Heretic", inq: "Inquisition"
});
Object.assign(FLASH, {
  cat: ["Led by the pope in Rome", "Main church of western Europe", "Wealthy and powerful in 1500"],
  ind: ["Pardon for sins, sold for money", "Sold to rebuild St. Peter’s", "What the 95 Theses criticized"],
  lut: ["Wrote the 95 Theses", "German monk who protested", "Translated the Bible into German"],
  alb: ["Sold indulgences in Germany", "Borrowed money to buy his office", "Received the 95 Theses"],
  ref: ["Split western Christianity", "Created Protestant churches", "Began in 1517"],
  leox: ["Medici pope", "Excommunicated Martin Luther", "Son of Lorenzo de’ Medici"],
  cen: ["Banning books and ideas", "Burning forbidden books", "Controlling what people read"],
  ger: ["Where the Reformation began", "Home of Wittenberg", "Hundreds of states, many princes"],
  hsy: ["A forbidden belief", "Idea against church teaching", "What a heretic believes"],
  htc: ["Person accused of heresy", "Martin Luther was declared one", "Holds forbidden beliefs"],
  inq: ["Church court against heresy", "Tried people accused of heresy", "Spanish one began in 1478"]
});
Object.assign(CONFUSE, {
  cat: ["ref", "leox"], ind: ["cat", "alb"], lut: ["leox", "alb"], alb: ["leox", "ind"], ref: ["ren", "lut"],
  leox: ["alb", "lor"], cen: ["inq", "hsy"], ger: ["ita", "ref"], hsy: ["htc", "cen"], htc: ["hsy", "lut"], inq: ["cen", "htc"]
});

QUESTIONS.push(
  // ---------------- TIER 1 ----------------
  { id: "r_ref1", c: ["ref"], t: 1, type: "mc", q: "What was the Reformation?",
    a: "A movement that challenged the Catholic Church",
    o: ["A rebirth of ancient Greek and Roman art", "A war between the kings of Italy and France", "A new method for printing books quickly"],
    why: "The Reformation (beginning in 1517) split western Christianity into Catholic and Protestant churches." },
  { id: "r_ref2", c: ["ref"], t: 1, type: "fill", q: "The religious movement that began in 1517 and split western Christianity is called the ___.",
    a: "Reformation", o: ["Renaissance", "Inquisition", "Humanism"],
    why: "Don’t mix them up: the Renaissance was a rebirth of art and learning; the Reformation changed the Church." },
  { id: "r_ref3", c: ["ref", "ger"], t: 1, type: "tf", q: "The Reformation began in Germany in 1517.",
    a: true, why: "It began in the German town of Wittenberg." },
  { id: "r_cat1", c: ["cat"], t: 1, type: "mc", q: "Who led the Catholic Church?",
    a: "The pope in Rome", o: ["The Archbishop of Mainz", "The king of France", "Martin Luther"],
    why: "The pope, based in Rome, was the head of the Catholic Church." },
  { id: "r_cat2", c: ["cat"], t: 1, type: "tf", q: "In 1500, almost everyone in western Europe belonged to the Catholic Church.",
    a: true, why: "Before the Reformation, the Catholic Church was the one main church of western Europe." },
  { id: "r_ind1", c: ["ind"], t: 1, type: "mc", q: "What were indulgences?",
    a: "Pardons that reduced the punishment for sins",
    o: ["Lists of books that the Church had banned", "Courts that put accused heretics on trial", "Taxes that Germans paid to their princes"],
    why: "By 1517, indulgences were being sold to raise money, which sparked criticism." },
  { id: "r_ind2", c: ["ind"], t: 1, type: "tf", q: "Money from indulgences sold in Germany helped pay to rebuild St. Peter’s Basilica in Rome.",
    a: true, why: "Pope Leo X needed money for the huge new St. Peter’s Basilica." },
  { id: "r_hsy1", c: ["hsy"], t: 1, type: "mc", q: "Heresy is…",
    a: "a belief that goes against official church teachings",
    o: ["a person accused of holding beliefs the Church forbids", "a church court that puts accused people on trial", "the banning of books and dangerous ideas"],
    why: "Heresy is the IDEA. A heretic is the PERSON." },
  { id: "r_htc1", c: ["htc"], t: 1, type: "mc", q: "A heretic is…",
    a: "a person who holds forbidden church beliefs",
    o: ["a forbidden belief that goes against the Church", "a church leader who sells indulgences", "a printer who spreads pamphlets across Germany"],
    why: "Heretic = the person. Heresy = the idea." },
  { id: "r_htc2", c: ["htc", "lut"], t: 1, type: "fill", q: "In 1521, Martin Luther was declared a ___.",
    a: "heretic", o: ["heresy", "patron", "humanist"],
    why: "A person is a heretic. (“Heresy” is the belief.)" },
  { id: "r_cen1", c: ["cen"], t: 1, type: "mc", q: "Banning or controlling books and ideas is called…",
    a: "censorship", o: ["heresy", "the Inquisition", "the Reformation"],
    why: "Censorship = cutting out ideas that leaders consider dangerous." },
  { id: "r_cen2", c: ["cen"], t: 1, type: "tf", q: "Censorship means printing as many books as possible.",
    a: false, why: "Censorship is the opposite: stopping books and ideas from spreading." },
  { id: "r_inq1", c: ["inq"], t: 1, type: "mc", q: "What was the Inquisition?",
    a: "A church court that tried people for heresy",
    o: ["A list of all the books that the Church had banned", "Martin Luther’s list of 95 complaints", "A German prince who protected reformers"],
    why: "Inquisition comes from “inquire”: to ask questions, as in a trial." },
  { id: "r_inq2", c: ["inq"], t: 1, type: "fill", q: "The ___ was a Catholic Church court that searched for and punished heresy.",
    a: "Inquisition", o: ["Reformation", "Renaissance", "indulgence"],
    why: "The Spanish Inquisition began in 1478 and the Roman Inquisition in 1542." },
  { id: "r_lut1", c: ["lut"], t: 1, type: "mc", q: "Who wrote the 95 Theses in 1517?",
    a: "Martin Luther", o: ["Pope Leo X", "The Archbishop of Mainz", "Leonardo da Vinci"],
    why: "Martin Luther’s 95 Theses criticized the sale of indulgences." },
  { id: "r_lut2", c: ["lut"], t: 1, type: "tf", q: "Martin Luther translated the Bible into German so ordinary people could read it.",
    a: true, why: "Before this, most Bibles in western Europe were in Latin." },
  { id: "r_leox1", c: ["leox"], t: 1, type: "mc", q: "Who was Pope Leo X?",
    a: "The pope who excommunicated Martin Luther",
    o: ["The German monk who wrote the 95 Theses", "The prince of Saxony who hid Martin Luther", "The German inventor of the printing press"],
    why: "Pope Leo X led the Catholic Church from 1513 to 1521." },
  { id: "r_alb1", c: ["alb"], t: 1, type: "mc", q: "In 1517, Martin Luther sent his 95 Theses to which church leader?",
    a: "The Archbishop of Mainz", o: ["King Francis I of France", "Lorenzo de’ Medici", "The Archbishop of Florence"],
    why: "The Archbishop of Mainz was in charge of selling indulgences in that part of Germany." },
  { id: "r_alb2", c: ["alb"], t: 1, type: "fill", q: "The Archbishop of ___ sold indulgences in Germany, partly to repay his debts.",
    a: "Mainz", o: ["Florence", "Rome", "Wittenberg"],
    why: "Albrecht of Brandenburg, Archbishop of Mainz, had borrowed money to pay for his church offices." },
  { id: "r_ger1", c: ["ger"], t: 1, type: "mc", q: "Where did the Reformation begin?",
    a: "Germany", o: ["Italy", "Spain", "England"],
    why: "It began in Wittenberg, a town in Saxony, in Germany." },
  { id: "r_ger2", c: ["ger"], t: 1, type: "map", mode: "id", a: "de", o: ["France", "Netherlands", "Switzerland"],
    q: "The Reformation began in the highlighted nation. Which is it?", why: "Germany, north of the Alps." },

  // ---------------- TIER 2 ----------------
  { id: "r_s1", c: ["hsy", "htc"], t: 2, type: "sort", boss: true, q: "Is each one a heresy (an idea) or a heretic (a person)?",
    bins: ["Heresy (an idea)", "Heretic (a person)"],
    items: [["An idea the Church officially rejects", 0], ["Someone put on trial for forbidden beliefs", 1],
            ["A belief that goes against church teaching", 0], ["A person who refuses to give up a forbidden belief", 1]],
    why: "The -ic ending names the person. Heresy is what that person believes." },
  { id: "r_m1", c: ["ref", "ind", "cen", "inq"], t: 2, type: "match", q: "Match each key term to its meaning.",
    pairs: [["Reformation", "Movement that split western Christianity"],
            ["Indulgences", "Reductions of punishment for sin, sold for money"],
            ["Censorship", "Banning books and ideas"],
            ["Inquisition", "Church court that tried people for heresy"]],
    why: "Saying the terms and meanings together helps you tell them apart." },
  { id: "r_m2", c: ["lut", "leox", "alb", "cat"], t: 2, type: "match", q: "Match each person or institution to its description.",
    pairs: [["Martin Luther", "Wrote the 95 Theses"],
            ["Pope Leo X", "Medici pope who excommunicated Martin Luther"],
            ["Archbishop of Mainz", "Sold indulgences in Germany to repay debts"],
            ["Catholic Church", "Led by the pope in Rome"]],
    why: "Each played a different part in the same story of 1517–1521." },
  { id: "r_cen3", c: ["cen"], t: 2, type: "mc", q: "A ruler orders that every copy of a pamphlet be collected and burned so no one can read it. This is an example of…",
    a: "censorship", o: ["heresy", "an indulgence", "the Reformation"],
    why: "Destroying or banning writing to stop ideas is censorship." },
  { id: "r_inq3", c: ["inq"], t: 2, type: "mc", q: "A church court questions a man accused of holding forbidden beliefs. This court is part of…",
    a: "the Inquisition", o: ["the Reformation", "the Renaissance", "an indulgence"],
    why: "The Inquisition investigated and tried people accused of heresy." },
  { id: "r_ind3", c: ["ind"], t: 2, type: "odd", q: "Which is NOT connected to the sale of indulgences?",
    a: "Painting the Mona Lisa",
    o: ["Rebuilding St. Peter’s Basilica", "The Archbishop of Mainz’s debts", "Martin Luther’s 95 Theses"],
    why: "The Mona Lisa belongs to the Renaissance story, not the indulgence controversy." },
  { id: "r_lut3", c: ["lut"], t: 2, type: "mc", q: "What did Martin Luther teach about how people are saved?",
    a: "By faith alone, not by buying indulgences",
    o: ["Only by paying the Church", "Only by obeying the Archbishop of Mainz", "By studying Greek statues"],
    why: "“Faith alone” was one of Martin Luther’s central teachings." },
  { id: "r_ger3", c: ["ger"], t: 2, type: "tf", q: "In the 1500s, Germany was one united country ruled by a single king.",
    a: false, why: "Germany was a patchwork of hundreds of states inside the Holy Roman Empire." },
  { id: "r_cat3", c: ["cat"], t: 2, type: "tf", q: "In 1500, the Catholic Church was poor and had little power.",
    a: false, why: "It was one of the wealthiest and most powerful institutions in Europe." },
  { id: "r_leox2", c: ["leox", "lor"], t: 2, type: "tf", q: "Pope Leo X was a son of Lorenzo de’ Medici.",
    a: true, why: "Giovanni de’ Medici, Lorenzo de’ Medici’s son, became Pope Leo X in 1513." },
  { id: "r_ref4", c: ["ref"], t: 2, type: "odd", q: "Which does NOT describe the Reformation?",
    a: "It began in Florence in 1350",
    o: ["It began in 1517", "It created Protestant churches", "It challenged the Catholic Church"],
    why: "That describes the Renaissance’s time and place, not the Reformation’s." },
  { id: "r_hsy2", c: ["hsy", "cat"], t: 2, type: "mc", q: "A preacher in 1520 says the pope has no special authority. What would the Catholic Church call this idea?",
    a: "heresy", o: ["censorship", "an indulgence", "the Inquisition"],
    why: "An idea against official church teaching is heresy." },
  { id: "r_ger4", c: ["ger"], t: 2, type: "map", mode: "click", a: "de",
    q: "Click the modern nation where Martin Luther lived and the Reformation began.", why: "Germany. Wittenberg is in eastern Germany." },

  // ---------------- TIER 3 ----------------
  { id: "r_c1", c: ["lut", "ind"], t: 3, type: "mc", q: "How are Martin Luther and indulgences connected?",
    a: "Martin Luther’s 95 Theses criticized the sale of indulgences",
    o: ["Martin Luther invented indulgences to raise money for his church", "Martin Luther sold indulgences to pay for St. Peter’s", "“Indulgences” was Martin Luther’s name for the Bible"],
    why: "The sale of indulgences is what first pushed Martin Luther to protest." },
  { id: "r_c2", c: ["leox", "alb"], t: 3, type: "mc", q: "How were Pope Leo X and the Archbishop of Mainz connected?",
    a: "Pope Leo X let the archbishop sell indulgences",
    o: ["They were brothers who ran the Medici bank together", "Both helped write the 95 Theses together", "Both protected Martin Luther from arrest"],
    why: "Half the money repaid the archbishop’s debts; half went to Rome for St. Peter’s." },
  { id: "r_c3", c: ["hsy", "inq"], t: 3, type: "mc", q: "How are heresy and the Inquisition connected?",
    a: "The Inquisition was a court that punished heresy",
    o: ["The Inquisition invented heresy to sell more books", "Heresy was a court; the Inquisition was a belief", "They are not connected to each other at all"],
    why: "Heresy was the crime (in the Church’s eyes); the Inquisition was the court." },
  { id: "r_c4", c: ["cen", "ref"], t: 3, type: "mc", q: "Why was censorship harder for leaders after the printing press?",
    a: "Printers made copies faster than leaders could ban them",
    o: ["Printed books were made of paper that could not burn", "The printing press was used only for printing Bibles", "German law made censorship illegal after 1517"],
    why: "Martin Luther’s writings spread across Germany in weeks thanks to printers." },
  { id: "r_c5", c: ["htc", "lut"], t: 3, type: "mc", q: "Why did the Catholic Church declare Martin Luther a heretic?",
    a: "He refused to take back teachings it rejected",
    o: ["He sold too many indulgences in Wittenberg", "He painted forbidden pictures of the pope", "He moved to Italy to start a rival church"],
    why: "At the Diet of Worms in 1521, he would not recant his writings." },
  { id: "r_c6", c: ["ger", "lut"], t: 3, type: "mc", q: "Why was Martin Luther able to survive after being declared a heretic and an outlaw?",
    a: "His prince, Frederick the Wise, protected him",
    o: ["The pope forgave him at the end of 1521", "He hid in Rome, where no one looked for him", "Germany had no laws, so no one could arrest him"],
    why: "A divided Germany meant no single ruler could easily capture him." },
  { id: "r_c7", c: ["cat", "ind", "lut", "ref"], t: 3, type: "order", q: "Put the chain of events in order.",
    seq: ["The Church needs money to rebuild St. Peter’s Basilica", "Indulgences are sold in Germany",
          "Martin Luther writes the 95 Theses (1517)", "The Reformation splits western Christianity"],
    why: "Money → indulgences → protest → Reformation." },
  { id: "r_c8", c: ["leox", "lor", "ref"], t: 3, type: "mc", q: "How does Pope Leo X connect the Renaissance and the Reformation?",
    a: "A Medici art patron whose indulgence sales sparked protest",
    o: ["He painted the Sistine Chapel ceiling and also wrote the 95 Theses", "A German prince who protected Martin Luther in Saxony", "He invented the printing press and spread new ideas"],
    why: "The same Medici wealth and love of grand art that built the Renaissance also needed money." },
  { id: "r_c9", c: ["cat", "lut", "cen", "inq"], t: 3, type: "sort", boss: true, q: "Sort each action: was it taken by Catholic Church leaders or by reformers?",
    bins: ["Catholic Church leaders", "Reformers"],
    items: [["Declaring Martin Luther a heretic", 0], ["Translating the Bible into German", 1],
            ["Banning Martin Luther’s books", 0], ["Writing criticism of indulgences", 1],
            ["Using courts to try people for heresy", 0], ["Printing pamphlets that spread new ideas", 1]],
    why: "Both sides used powerful tools: courts and bans on one side, printing on the other." },
  { id: "r_c10", c: ["cen", "inq"], t: 3, type: "mc", q: "What is the DIFFERENCE between censorship and the Inquisition?",
    a: "Censorship targets ideas; the Inquisition tried people",
    o: ["Censorship was a court; the Inquisition banned books", "They are two names for exactly the same thing", "Censorship happened only in Italy, never in Germany"],
    why: "One targets ideas and writing; the other targeted people accused of heresy." },
  { id: "r_c11", c: ["leox", "lut", "weu"], t: 3, type: "map", mode: "mc", hi: "de",
    q: "Pope Leo X led the Church from Rome. Martin Luther taught in Wittenberg, in the highlighted nation. Which TWO modern nations were the centers of this conflict?",
    a: "Italy and Germany", o: ["France and Spain", "England and Portugal", "Belgium and Switzerland"],
    why: "Rome is in Italy; Wittenberg is in Germany." },

  // ---------------- TIER 4 ----------------
  { id: "r_x1", c: ["ref", "lut", "ind", "ger"], t: 4, type: "mc",
    q: "Why did a dispute about indulgences in one German town grow into a movement that split Europe?",
    a: "Printing, anger at Church wealth, and protecting princes",
    o: ["The pope ordered everyone in Europe to become Protestant", "Martin Luther raised a large army and conquered Germany", "Indulgences were banned in Italy first, then everywhere"],
    why: "Big changes usually have several causes working together." },
  { id: "r_x2", c: ["ind", "alb", "leox", "ref"], t: 4, type: "mc",
    q: "A historian claims: “Money problems helped spark the Reformation.” Which evidence BEST supports this claim?",
    a: "Indulgences paid for St. Peter’s and an archbishop’s debts",
    o: ["Martin Luther was born in 1483 in the town of Eisleben", "Wittenberg had a new university where Martin Luther taught", "Heretics could be put on trial by the Church’s courts"],
    why: "All are true, but only one links MONEY to the protest." },
  { id: "r_x3", c: ["htc", "lut", "cat"], t: 4, type: "mc",
    q: "How would the Catholic Church and Martin Luther each have described Martin Luther in 1521?",
    a: "Church: a heretic. Martin Luther: a reformer fixing errors",
    o: ["Church: a reformer. Martin Luther: a heretic who was wrong", "Both: a loyal Catholic who fully agreed with the pope", "Both: a Renaissance artist painting for the Church"],
    why: "Historians look at how each side saw the same events. Perspective matters." },
  { id: "r_x4", c: ["hum", "ref"], t: 4, type: "mc",
    q: "How did Renaissance humanism help prepare the way for the Reformation?",
    a: "Humanists’ close reading led scholars to the Bible itself",
    o: ["Humanists ordered the sale of indulgences across Europe", "Humanists banned the printing press to protect old books", "Humanism and the Reformation had no connection at all"],
    why: "Going back to the sources (classical texts, then the Bible) encouraged questioning." },
  { id: "r_x5", c: ["cen"], t: 4, type: "mc", q: "Which modern example is MOST like censorship?",
    a: "A government blocking websites that criticize it",
    o: ["A library buying many new books for its readers", "A student writing a book report about a novel", "A newspaper printing letters sent in by readers"],
    why: "Censorship means those in power stopping ideas from spreading." },
  { id: "r_x6", c: ["leox", "lut", "htc", "inq"], t: 4, type: "order", q: "Put these events in order, earliest first.",
    seq: ["1513: Pope Leo X becomes pope", "1517: Martin Luther writes the 95 Theses",
          "1521: Martin Luther is excommunicated and declared a heretic", "1542: The Roman Inquisition is set up"],
    why: "A timeline shows how one protest led to a long struggle." }
);

MANUSCRIPTS.push(
  { id: "ms_86", level: "L2", needs: null, title: "Thesis 86",
    text: "“Why does not the pope, whose wealth today is greater than the wealth of the richest Crassus, build the basilica of St. Peter with his own money rather than with the money of poor believers?”",
    cite: "Martin Luther, the 95 Theses, Thesis 86, Wittenberg, 1517",
    q: { id: "ms_86_q", c: ["lut", "ind", "leox"], t: 3, type: "mc", ms: "ms_86",
      q: "Sourcing: What is Martin Luther’s PURPOSE in Thesis 86?",
      a: "To criticize spending poor people’s money on St. Peter’s",
      o: ["To praise Pope Leo X for his great generosity to the poor", "To persuade people to buy more indulgences for St. Peter’s", "To explain to builders how to construct a basilica"],
      why: "Ask what an author wants the reader to think. Martin Luther uses a pointed question to criticize the indulgence campaign." } },
  { id: "ms_27", level: "L2", needs: "wall", title: "Thesis 27",
    text: "“They preach only human doctrines who say that as soon as the money clinks into the money chest, the soul flies out of purgatory.”",
    cite: "Martin Luther, the 95 Theses, Thesis 27, 1517 (criticizing indulgence preachers such as Johann Tetzel)",
    q: { id: "ms_27_q", c: ["lut", "ind"], t: 3, type: "mc", ms: "ms_27",
      q: "Sourcing: This thesis describes what indulgence preachers said, but it was written by their critic. What should a historian keep in mind?",
      a: "A critic may describe opponents unfairly, so check others",
      o: ["Critics always quote their opponents perfectly and fairly", "The source must be false because it is so very old", "Only sources written by the preachers can be trusted"],
      why: "Every author has a PERSPECTIVE. Good historians compare sources from different sides." } },
  { id: "ms_worms", level: "L2", needs: "glide", title: "The Edict of Worms",
    text: "“We forbid anyone from this time forward to dare, either by words or by deeds, to receive, defend, sustain, or favour the said Martin Luther. On the contrary, we want him to be apprehended and punished as a notorious heretic.”",
    cite: "Emperor Charles V, the Edict of Worms, May 1521",
    q: { id: "ms_worms_q", c: ["htc", "cen", "ger"], t: 3, type: "mc", ms: "ms_worms",
      q: "Sourcing: Who issued this document, and what does it show?",
      a: "The emperor, declaring Martin Luther an outlaw",
      o: ["Martin Luther, defending his own writings", "Pope Leo X, selling indulgences in Germany", "A printer, advertising his newest pamphlets"],
      why: "Identify the AUTHOR first. An emperor’s edict carries the power of law, which is why German princes protecting Martin Luther mattered." } }
);
MANUSCRIPTS.filter(m => m.level === "L2").forEach(m => { m.q.src = { text: m.text, cite: m.cite }; QUESTIONS.push(m.q); });

// =====================================================================
//  THE PRINTING PRESS PUZZLE — set the type for an argument:
//  pick the CLAIM, two pieces of EVIDENCE that support it, and the
//  REASONING that connects them. Two perspectives, chosen at random.
// =====================================================================
const PAMPHLETS = [
  { side: "A reformer’s pamphlet", author: "a supporter of Martin Luther",
    claims: [["Selling indulgences is wrong and should stop.", true], ["The printing press was invented around 1450.", false], ["Wittenberg is a town in Saxony.", false]],
    evidence: [["Indulgence money from ordinary Germans was sent to Rome to build St. Peter’s Basilica.", true],
               ["The Archbishop of Mainz used indulgence sales to repay his own debts.", true],
               ["Wittenberg has a university.", false], ["Florence is famous for its painters.", false]],
    reasons: [["So the sale of indulgences serves money, not people’s faith.", true], ["So everyone should move to Florence.", false], ["So printing presses should be banned.", false]],
    why: "A claim is an arguable statement. Facts like dates or places can be evidence, but they are not claims. Good evidence must support THIS claim." },
  { side: "A church official’s pamphlet", author: "a Catholic official in 1521",
    claims: [["Martin Luther’s writings should be banned.", true], ["Martin Luther was born in 1483.", false], ["Paper is made from linen rags.", false]],
    evidence: [["Martin Luther questions the authority of the pope.", true],
               ["His pamphlets are spreading quickly to every German town.", true],
               ["Martin Luther was a professor at Wittenberg.", false], ["The Rhine River flows past Mainz.", false]],
    reasons: [["So church leaders fear his ideas will divide the Church.", true], ["So the Rhine should be closed to boats.", false], ["So every professor should be banned.", false]],
    why: "Historians practice seeing an argument from more than one side. The same events looked very different to church leaders and to reformers." }
];
const PRESS_CITIES = [["Leipzig", 12.37, 51.34], ["Nuremberg", 11.08, 49.45], ["Augsburg", 10.9, 48.37], ["Mainz", 8.27, 50.0]];

// Source-reliability questions: the Rumor Mill's final phase draws from these.
QUESTIONS.push(
  { id: "src1", c: ["lut", "ref"], t: 3, type: "mc", skill: "source",
    q: "After the Diet of Worms in 1521, rumors spread that Martin Luther had been killed. Which source would BEST help check what really happened?",
    a: "A letter from the prince’s court about hiding him",
    o: ["A rumor repeated in a tavern many years after the event", "A cartoon that mocks Martin Luther as a fool", "A poem by someone who never met Martin Luther"],
    why: "Frederick’s men secretly took Martin Luther to Wartburg Castle. Sources close to the event, from people who knew, are usually more reliable." },
  { id: "src2", c: ["lut"], t: 3, type: "mc", skill: "source",
    q: "Which is the MOST reliable source for what Martin Luther wrote in 1517?",
    a: "A printed copy of the 95 Theses from 1517",
    o: ["A story told by someone’s grandchildren in 1600", "A modern movie about Martin Luther", "An anonymous rumor"],
    why: "A primary source from the time, created by the author, beats later retellings." },
  { id: "src3", c: ["lut", "cat"], t: 3, type: "mc", skill: "source",
    q: "One account of the Diet of Worms was written by a supporter of Martin Luther, another by an official of the emperor. What should a historian do?",
    a: "Compare both, noting each author’s point of view",
    o: ["Trust only the account that they agree with most", "Ignore both, since neither author is neutral", "Use whichever account is shorter and clearer"],
    why: "Comparing sources from different sides helps historians find what is most likely true." },
  { id: "src4", c: ["leox", "ref"], t: 3, type: "mc", skill: "source",
    q: "A 1521 woodcut made by Martin Luther’s supporters shows the pope as greedy and cruel. How should a historian use it as evidence?",
    a: "As evidence of reformers’ views, not of facts",
    o: ["As proof of exactly what the pope was like", "As useless, because pictures are never evidence", "As evidence that woodcuts were banned in 1521"],
    why: "Propaganda shows its maker’s point of view. It is great evidence about attitudes, weak evidence about facts." },
  { id: "src5", c: ["cen", "ref"], t: 2, type: "mc", skill: "source",
    q: "Which question helps you judge whether a source is reliable?",
    a: "Who made it, and what did they want readers to think?",
    o: ["How many pages does it have, and is it long enough?", "Is it printed in color, with attractive pictures?", "Does it have an exciting title that grabs attention?"],
    why: "Author and purpose are the first things historians check." }
);
