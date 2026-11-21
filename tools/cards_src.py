#!/usr/bin/env python3
"""Card data for the shared Emporium card collection.

Run:  python3 tools/cards_src.py   (writes assets/cards-data.js)

Each card: (name, type, year, rarity, clue)
  type   : term | person | place | event
  rarity : C common, U uncommon, R rare, E epic, L legendary
  clue   : one-sentence definition. It is shown on the card back and used as the
           question text in Quiz Battle, so keep it accurate and self-contained.
Card art is drawn in the browser (no photos of real people).
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
games = json.load(open(os.path.join(ROOT, "games.json"), encoding="utf-8"))
meta = {g["slug"]: g for g in games}

DECKS = {
 "age-of-rebirth": [
  ("Humanism", "term", "1300s", "C", "A Renaissance focus on human potential and achievement, inspired by classical writings."),
  ("Patron", "term", "1400s", "C", "A wealthy person who paid artists and scholars to create their work."),
  ("Secularism", "term", "1400s", "C", "A focus on worldly life and human affairs rather than on religion."),
  ("Movable type", "term", "c. 1450", "C", "Printing with reusable metal letters, which made books faster and cheaper to produce."),
  ("Indulgences", "term", "1500s", "C", "Church payments said to reduce punishment for sins, a major target of the Reformation."),
  ("Ninety-Five Theses", "event", "1517", "U", "Martin Luther's list of complaints about Church practices, posted in Wittenberg, Germany."),
  ("Scientific Revolution", "event", "1500s-1600s", "U", "A period when thinkers learned about nature through observation and experiment."),
  ("Leonardo da Vinci", "person", "1452-1519", "R", "Italian artist and inventor who painted the Mona Lisa and filled notebooks with designs."),
  ("Johannes Gutenberg", "person", "c. 1400-1468", "R", "German printer who developed movable-type printing in Europe around 1450."),
  ("Martin Luther", "person", "1483-1546", "R", "German monk whose challenge to the Church launched the Protestant Reformation."),
  ("Florence", "place", "1400s", "E", "Italian city where the Renaissance began, supported by wealthy banking families like the Medici."),
  ("Sistine Chapel ceiling", "event", "1508-1512", "L", "Michelangelo's famous frescoes in the Vatican, painted over four years."),
 ],
 "beyond-the-horizon": [
  ("Compass", "term", "1100s", "C", "A tool with a magnetic needle that shows direction, even far from land."),
  ("Astrolabe", "term", "1400s", "C", "An instrument sailors used to measure the height of the sun or stars to find latitude."),
  ("Caravel", "term", "1400s", "C", "A small, fast Portuguese ship that could sail against the wind."),
  ("Colony", "term", "1500s", "C", "A territory controlled by a distant country."),
  ("Circumnavigate", "term", "1522", "C", "To travel all the way around the world."),
  ("Columbian Exchange", "event", "after 1492", "U", "The movement of plants, animals, people and diseases between the Old and New Worlds."),
  ("Treaty of Tordesillas", "event", "1494", "U", "An agreement in which Spain and Portugal divided newly claimed lands outside Europe."),
  ("Bartolomeu Dias", "person", "1488", "R", "Portuguese captain who rounded the southern tip of Africa."),
  ("Vasco da Gama", "person", "1498", "R", "Portuguese explorer who reached India by sailing around Africa."),
  ("Christopher Columbus", "person", "1492", "R", "Italian navigator sailing for Spain whose voyage reached the Americas."),
  ("Cape of Good Hope", "place", "1488", "E", "The southern tip of Africa that opened the sea route from Europe to Asia."),
  ("Magellan's voyage", "event", "1519-1522", "L", "The first expedition to sail around the world; Magellan himself died along the way."),
 ],
 "lantern-of-reason": [
  ("Enlightenment", "term", "1700s", "C", "A period when thinkers used reason to question tradition and authority."),
  ("Natural rights", "term", "1600s-1700s", "C", "Rights people are born with, such as life, liberty and property."),
  ("Social contract", "term", "1600s-1700s", "C", "An agreement in which people give up some freedom to a government in return for order and protection."),
  ("Separation of powers", "term", "1748", "C", "Dividing government into branches so that no one group has too much power."),
  ("Divine right", "term", "1600s", "C", "The belief that a king's power comes directly from God."),
  ("Two Treatises of Government", "event", "1689", "U", "Locke's book arguing that government depends on the consent of the governed."),
  ("Encyclopedie", "event", "1751-1772", "U", "A huge French encyclopedia, edited by Diderot, that spread Enlightenment ideas."),
  ("Thomas Hobbes", "person", "1588-1679", "R", "English philosopher who argued people need a strong ruler to avoid chaos."),
  ("John Locke", "person", "1632-1704", "R", "English philosopher who argued that people have natural rights and can replace a bad government."),
  ("Montesquieu", "person", "1689-1755", "R", "French thinker who urged separating the powers of government."),
  ("Jean-Jacques Rousseau", "person", "1712-1778", "E", "French philosopher who wrote that a government's authority rests on the general will of the people."),
  ("Declaration of Independence", "event", "1776", "L", "American document that put Enlightenment ideas of natural rights into a call for independence."),
 ],
 "the-last-king": [
  ("Third Estate", "term", "1789", "C", "The largest social group in France: commoners from peasants to wealthy merchants."),
  ("Bastille", "place", "1789", "C", "A Paris fortress-prison stormed by a crowd on July 14, 1789."),
  ("Guillotine", "term", "1790s", "C", "A device for quick executions that became a symbol of the Revolution."),
  ("Reign of Terror", "event", "1793-1794", "C", "A period when the revolutionary government executed thousands of suspected enemies."),
  ("Declaration of the Rights of Man", "event", "1789", "C", "French document declaring that men are born free and equal in rights."),
  ("Tennis Court Oath", "event", "1789", "U", "Pledge by Third Estate delegates not to disband until France had a constitution."),
  ("Women's March on Versailles", "event", "1789", "U", "Thousands of Parisian women marched to Versailles over bread prices and brought the royal family to Paris."),
  ("Louis XVI", "person", "1754-1793", "R", "King of France who was executed during the Revolution."),
  ("Marie Antoinette", "person", "1755-1793", "R", "Austrian-born queen of France who was executed in 1793."),
  ("Maximilien Robespierre", "person", "1758-1794", "R", "Jacobin leader closely tied to the Reign of Terror."),
  ("Napoleon Bonaparte", "person", "1769-1821", "E", "General who seized power in 1799 and crowned himself emperor in 1804."),
  ("Palace of Versailles", "place", "1600s-1789", "L", "The grand royal palace outside Paris where the king and his court lived."),
 ],
 "full-steam": [
  ("Factory system", "term", "1700s", "C", "Making goods in one place with machines and many workers."),
  ("Urbanization", "term", "1800s", "C", "The growth of cities as people moved from farms to find work."),
  ("Capitalism", "term", "1700s", "C", "An economic system in which private owners run businesses for profit."),
  ("Child labor", "term", "1800s", "C", "Employment of children in dangerous factory and mine work."),
  ("Labor union", "term", "1800s", "C", "A group of workers who organize to win better pay and working conditions."),
  ("Spinning jenny", "event", "1760s", "U", "Hargreaves's machine that spun several threads at once."),
  ("Railroads", "event", "1800s", "U", "Steam-powered trains that sped up the movement of goods and people."),
  ("James Watt", "person", "1736-1819", "R", "Scottish inventor whose improvements made steam engines practical."),
  ("Eli Whitney", "person", "1765-1825", "R", "American inventor of the cotton gin, which sped up cotton processing and expanded slavery."),
  ("George Stephenson", "person", "1781-1848", "R", "English engineer who built some of the first successful steam locomotives."),
  ("Manchester", "place", "1800s", "E", "English city that became a center of the cotton textile industry."),
  ("The Crystal Palace", "event", "1851", "L", "A giant glass hall in London that showcased the inventions of the Industrial Age."),
 ],
 "empire-chase": [
  ("Imperialism", "term", "1800s", "C", "When a stronger country takes control of other lands and peoples."),
  ("Raw materials", "term", "1800s", "C", "Natural resources, like rubber and cotton, that industries need to make goods."),
  ("Nationalism", "term", "1800s", "C", "Pride in one's nation, which often fueled competition among countries."),
  ("Protectorate", "term", "1800s", "C", "A territory that is protected and controlled by a stronger power."),
  ("Sphere of influence", "term", "1800s", "C", "A region where one country has special economic or political control."),
  ("Berlin Conference", "event", "1884-1885", "U", "European powers set rules for dividing Africa; no African leaders were invited."),
  ("Opium Wars", "event", "1839-1860", "U", "Wars in which Britain forced China to accept the opium trade and open its ports."),
  ("Queen Victoria", "person", "1819-1901", "R", "British monarch whose empire spanned the globe."),
  ("Cecil Rhodes", "person", "1853-1902", "R", "British businessman and politician who expanded British power in southern Africa."),
  ("King Leopold II", "person", "1835-1909", "R", "Belgian king who ruled the brutal Congo Free State as his personal colony."),
  ("Suez Canal", "place", "1869", "E", "Egyptian waterway linking the Mediterranean and Red Seas and shortening trade routes to Asia."),
  ("The British Empire", "place", "1800s-1900s", "L", "At its height it covered about a quarter of the world's land and people."),
 ],
 "over-the-top": [
  ("Militarism", "term", "1900s", "C", "Building up strong armed forces and being ready to use them."),
  ("Alliance", "term", "1900s", "C", "An agreement among countries to defend one another."),
  ("Trench warfare", "term", "1914-1918", "C", "Fighting from long ditches, which created a deadly stalemate on the Western Front."),
  ("No man's land", "place", "1914-1918", "C", "The dangerous ground between opposing trenches."),
  ("Propaganda", "term", "1914-1918", "C", "Information, often one-sided, used to sway public opinion."),
  ("Assassination at Sarajevo", "event", "1914", "U", "The killing of Archduke Franz Ferdinand, which set off the chain of events leading to war."),
  ("Treaty of Versailles", "event", "1919", "U", "The peace treaty that ended the war with Germany and blamed Germany for the conflict."),
  ("Woodrow Wilson", "person", "1856-1924", "R", "U.S. president who took America into the war in 1917 and proposed the Fourteen Points."),
  ("Kaiser Wilhelm II", "person", "1859-1941", "R", "German emperor during World War I."),
  ("Gavrilo Princip", "person", "1894-1918", "R", "Bosnian Serb who assassinated Archduke Franz Ferdinand in 1914."),
  ("Battle of the Somme", "event", "1916", "E", "A huge Allied offensive in France that cost more than a million casualties on both sides."),
  ("Armistice Day", "event", "Nov 11, 1918", "L", "The day fighting ended, at 11 a.m. on the eleventh day of the eleventh month."),
 ],
 "front-line": [
  ("Blitzkrieg", "term", "1939", "C", "German for 'lightning war': fast attacks with tanks, planes and infantry together."),
  ("Axis Powers", "term", "1930s-1945", "C", "Germany, Italy and Japan, the main nations fighting the Allies."),
  ("Allied Powers", "term", "1939-1945", "C", "Britain, the Soviet Union, the United States, France and others fighting the Axis."),
  ("Appeasement", "term", "1930s", "C", "Giving in to an aggressor's demands in hopes of avoiding war."),
  ("Island hopping", "term", "1942-1945", "C", "A strategy of capturing selected Pacific islands and skipping others to move closer to Japan."),
  ("Battle of Britain", "event", "1940", "U", "The Royal Air Force stopped Germany from gaining control of the skies over Britain."),
  ("Pearl Harbor", "event", "Dec 7, 1941", "U", "Japan's surprise attack on a U.S. naval base in Hawaii that brought America into the war."),
  ("Winston Churchill", "person", "1874-1965", "R", "British prime minister who led Britain through most of the war."),
  ("Franklin D. Roosevelt", "person", "1882-1945", "R", "U.S. president who led America through most of World War II."),
  ("Dwight D. Eisenhower", "person", "1890-1969", "R", "Allied commander who led the D-Day invasion."),
  ("D-Day", "event", "June 6, 1944", "E", "The Allied invasion of Normandy, France, that opened a second front in Western Europe."),
  ("Battle of Midway", "event", "June 1942", "L", "A naval battle in which the U.S. sank four Japanese aircraft carriers and turned the tide in the Pacific."),
 ],
 "the-red-imposter": [
  ("Containment", "term", "1947", "C", "The U.S. policy of stopping the spread of communism."),
  ("Iron Curtain", "term", "1946", "C", "Churchill's phrase for the line dividing communist Eastern Europe from the democratic West."),
  ("Red Scare", "term", "1947-1957", "C", "Widespread fear that communists were secretly working inside the United States."),
  ("McCarthyism", "term", "1950s", "C", "Accusing people of disloyalty without real evidence."),
  ("Blacklist", "term", "1947-1960", "C", "A list of people denied jobs because of suspected communist ties."),
  ("Marshall Plan", "event", "1948-1952", "U", "U.S. aid to rebuild Western Europe after World War II."),
  ("Berlin Airlift", "event", "1948-1949", "U", "Allied planes flew supplies to West Berlin during a Soviet blockade."),
  ("Joseph McCarthy", "person", "1908-1957", "R", "Wisconsin senator who claimed, without proof, that communists had infiltrated the government."),
  ("Margaret Chase Smith", "person", "1897-1995", "R", "Maine senator who criticized McCarthy's tactics in her 1950 Declaration of Conscience."),
  ("Edward R. Murrow", "person", "1908-1965", "R", "CBS journalist whose 1954 broadcast challenged McCarthy."),
  ("HUAC", "event", "1938-1975", "E", "The House Un-American Activities Committee, which investigated suspected communists, including in Hollywood."),
  ("Berlin Wall", "place", "1961-1989", "L", "A barrier that divided East and West Berlin until it fell in 1989."),
 ],
}

out = {"units": [], "cards": []}
for slug, cards in DECKS.items():
    g = meta[slug]
    out["units"].append({"slug": slug, "title": g["title"], "unit": g["unit"], "years": g["years"], "color": g["color"]})
    for i, (name, typ, year, rar, clue) in enumerate(cards):
        out["cards"].append({"id": f"{slug}:{i}", "u": slug, "n": name, "t": typ, "y": year, "r": rar, "c": clue})

# sanity: 12 per unit, rarity mix
for slug, cards in DECKS.items():
    mix = "".join(c[3] for c in cards)
    assert len(cards) == 12 and mix.count("L") == 1 and mix.count("E") == 1, slug

js = "/* Generated by tools/cards_src.py - do not edit by hand. */\nwindow.EMP_CARDS = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(os.path.join(ROOT, "assets", "cards-data.js"), "w", encoding="utf-8").write(js)
print(f"{len(out['cards'])} cards in {len(out['units'])} units")
