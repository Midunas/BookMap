/*
 * Refreshers for books already read. Shown behind "Remind me" in the drawer.
 * Written by hand to sit next to the takeaway in books.ts, not repeat it.
 *   gist   – what the book is, in three sentences
 *   ideas  – the handful of things worth keeping
 *   people – who to remember (fiction and memoir only)
 */

export interface Summary {
  gist: string
  ideas: string[]
  people?: string[]
}

export const summaries: Record<string, Summary> = {
  meditations: {
    gist: 'Twelve books of private notes the Roman emperor wrote to himself, mostly on campaign, never meant for readers. There is no argument to follow, only the same few reminders returned to from different angles: you will die, other people are difficult, most of what upsets you is your own judgement. It is the Stoic practice in its rawest form, a man talking himself down every morning.',
    ideas: [
      'Separate events from your opinion of them. The event is neutral; the distress is added by you.',
      'Everyone you meet today will be ungrateful, arrogant or dishonest. Expect it, then treat them as kin anyway.',
      'You could leave life right now. Let that decide what you say, do and think.',
      'The obstacle becomes the way: what blocks the action advances the action.',
      'Waste no more time arguing about what a good man should be. Be one.',
    ],
  },
  'stop-worrying': {
    gist: 'Carnegie collected the worry-handling habits of ordinary people and famous ones, then turned them into a numbered toolkit. Each chapter is a rule, a handful of anecdotes and a one-line summary. The tone is salesman-cheerful but the methods are close to what cognitive therapy later formalised.',
    ideas: [
      'Shut the iron doors on yesterday and tomorrow. Live in day-tight compartments.',
      'The magic formula: ask what the worst is, prepare to accept it, then calmly improve on it.',
      'Get the facts, write down the problem, write down the options, decide, then act and stop reconsidering.',
      'Cooperate with the inevitable. The bent willow survives the storm the oak does not.',
      'Put a stop-loss order on your worries: decide how much a thing is worth and refuse to pay more.',
    ],
  },
  'malcolm-x': {
    gist: 'Told to Alex Haley over two years and finished weeks before the assassination, the book follows Malcolm Little from a Michigan childhood marked by his father\'s killing, through Boston and Harlem hustling and a prison sentence, into the Nation of Islam and then out of it. The last chapters, after Mecca, show a man revising his own certainties in public. Haley\'s epilogue records the murder and what came after.',
    ideas: [
      'Copying the dictionary in prison, page by page, was the start of everything that followed.',
      'The conk, the zoot suit and the hustles are told without softening, so the later dignity means something.',
      'The break with Elijah Muhammad cost him his whole structure and he walked away anyway.',
      'Mecca showed him white Muslims praying beside him and he said so, knowing what it would cost.',
      'He expected to die young and violently and kept working at full pace.',
    ],
    people: [
      'Malcolm Little / Detroit Red / Malcolm X / El-Hajj Malik El-Shabazz, the same man at four stages',
      'Earl and Louise Little, the father killed and the mother institutionalised',
      'Elijah Muhammad, the Nation of Islam leader who made and then disowned him',
      'Alex Haley, who listened, pushed and wrote the epilogue',
    ],
  },
  1984: {
    gist: 'Winston Smith rewrites history for the Ministry of Truth in a London ruled by the Party and watched by Big Brother. He begins a diary, then an affair with Julia, then a supposed alliance with the inner-Party man O\'Brien, each a step deeper into a trap that was set before he started. The last third is his re-education in the Ministry of Love, ending in Room 101 and a man who genuinely loves Big Brother.',
    ideas: [
      'Doublethink: holding two contradictory beliefs and accepting both, on demand.',
      'Newspeak shrinks the language so that thoughtcrime becomes literally impossible.',
      'Who controls the past controls the future; who controls the present controls the past.',
      'Power is not a means but an end. The image of the future is a boot stamping on a human face, forever.',
      'The proles are the only hope and the only ones not watched, because they are not considered dangerous.',
    ],
    people: [
      'Winston Smith, the clerk who thinks he can keep one private corner',
      'Julia, the rebel from the waist down',
      'O\'Brien, the friend who was always the interrogator',
      'Mr Charrington, the shopkeeper with the room above the shop',
    ],
  },
  gatsby: {
    gist: 'Nick Carraway rents a cottage on Long Island next to the mansion of Jay Gatsby, a mysterious host of enormous parties. Gatsby, it turns out, built all of it to win back Daisy Buchanan, Nick\'s cousin, whom he loved five years earlier before the war and before her marriage to the brutal, wealthy Tom. The affair is rekindled, exposed in a hotel room in Manhattan, and ends with a hit-and-run, a murder and a funeral nobody attends.',
    ideas: [
      'The green light on Daisy\'s dock: the dream is only intact while it is unreachable.',
      'Gatsby\'s fortune is bootlegging money dressed up as old money, and everyone can tell.',
      'Tom and Daisy are careless people who smash things and retreat into their money.',
      'Nick claims to be honest and reserved in judgement, and is neither.',
      'The valley of ashes and the eyes of Doctor T. J. Eckleburg watch the whole thing.',
    ],
    people: [
      'Jay Gatsby, born James Gatz, self-invented',
      'Daisy Buchanan, the voice full of money',
      'Tom Buchanan, old money, a racist and a bully',
      'Nick Carraway, narrator and neighbour',
      'Jordan Baker, Myrtle and George Wilson',
    ],
  },
  'four-agreements': {
    gist: 'A short book presenting four rules drawn from what Ruiz calls Toltec wisdom. The frame is that we were domesticated as children into agreements we never chose, and these four replace them. Each chapter is one agreement, why the old habit hurts, and what changes when you keep the new one.',
    ideas: [
      'Be impeccable with your word: say only what you mean, and never use words against yourself.',
      'Don\'t take anything personally. What others do is a projection of their own dream.',
      'Don\'t make assumptions. Ask, and say what you actually want.',
      'Always do your best, knowing your best changes from day to day.',
      'The "dream of the planet" is the inherited set of rules; breaking one agreement weakens the rest.',
    ],
  },
  'giovannis-room': {
    gist: 'David, a young American in Paris, is engaged to Hella and waiting for her to return from Spain when he meets Giovanni, an Italian barman. They live together in Giovanni\'s cramped room for a spring, and David\'s inability to accept what he feels drives him out and back to Hella. Giovanni, abandoned, is ruined by the older men who run the bar scene, kills one of them, and the whole novel is told on the night before his execution.',
    ideas: [
      'David narrates from the future, so every happy scene carries its ending.',
      'The room itself, its clutter and its one window, is the closet made physical.',
      'Hella is not a villain; she is another person David uses to escape himself.',
      'Baldwin puts a white American at the centre and makes shame, not race, the subject.',
      'The final image is David tearing up the execution notice and the wind blowing the pieces back.',
    ],
    people: [
      'David, the narrator, engaged and in love with someone else',
      'Giovanni, who loses everything for him',
      'Hella, the fiancée in Spain deciding whether to marry',
      'Jacques and Guillaume, the older men who buy company',
    ],
  },
  'millionaire-mind': {
    gist: 'Stanley surveyed over seven hundred American millionaires about how they got there and what they believe. The follow-up to The Millionaire Next Door, it is less about spending habits and more about character, choice of spouse, choice of vocation and tolerance for risk. Tables and quotes from respondents fill it out.',
    ideas: [
      'Millionaires rank integrity, discipline and social skill above intelligence and grades.',
      'Most were not top students. Many say being told they were not gifted made them work harder.',
      'They chose a niche where they could be excellent and where competition was thin.',
      'They buy homes in stable neighbourhoods at well under what they could afford.',
      'A supportive, frugal spouse shows up in the data over and over.',
    ],
  },
  'power-of-myth': {
    gist: 'Transcripts of Bill Moyers interviewing Joseph Campbell over several days at Skywalker Ranch, filmed just before Campbell died. Moyers asks plain questions and Campbell answers with stories from every mythology he knows, circling back to the hero\'s journey and what modern life has lost by dropping ritual. It is Campbell\'s life work in conversation form.',
    ideas: [
      'Myths are public dreams; dreams are private myths.',
      'The hero\'s journey: departure, initiation, return. The return with a boon is the part people skip.',
      'Rites of passage exist to kill the child so the adult can be born. Without them, adolescents invent their own.',
      'Follow your bliss: find where your deepest engagement is and doors will open where there were none.',
      'People say they seek the meaning of life. What they seek is the experience of being alive.',
    ],
  },
  'beale-street': {
    gist: 'Tish, nineteen and pregnant, narrates from Harlem in the early 1970s while her fiancé Fonny sits in the Tombs, framed for a rape he did not commit. The two families react in opposite ways: hers closes ranks, his mother disowns them. Her mother Sharon flies to Puerto Rico to find the victim and fails. The novel ends with the case still unresolved and the baby coming.',
    ideas: [
      'The frame-up is engineered by one racist cop, and the whole system lines up behind him without effort.',
      'Fonny is a sculptor; his art is the freedom the city keeps trying to take.',
      'Baldwin lets Tish\'s voice be young and certain, and the certainty is the love story.',
      'Daniel, Fonny\'s friend, describes prison once and it explains everything Fonny faces.',
      'There is no verdict at the end. The love is the ending.',
    ],
    people: [
      'Tish Rivers, narrator, and Fonny Hunt, in jail',
      'Sharon and Joseph Rivers, and sister Ernestine, who fight',
      'Mrs Hunt, Fonny\'s mother, who prays and abandons him',
      'Officer Bell, who fixes the case',
    ],
  },
  stoner: {
    gist: 'William Stoner, a Missouri farm boy sent to study agriculture, falls in love with English literature in a required course and never leaves the university. He marries badly, is bullied for decades by a colleague over one failed doctoral student, has one real love affair that the university ends, and dies of cancer at his desk. The novel tells it plainly and refuses to call any of it a failure.',
    ideas: [
      'A single sonnet in a survey course changes the direction of a whole life.',
      'Edith, his wife, is at war with him from the wedding night and he never understands why.',
      'The fight with Lomax over Walker is petty and permanent; Stoner wins the point and loses the career.',
      'Katherine Driscoll gives him a year of happiness and both know it cannot last.',
      'The last page is Stoner holding his one book, and it is enough.',
    ],
    people: [
      'William Stoner, teacher of English at the University of Missouri',
      'Edith, his wife, and Grace, the daughter they damage between them',
      'Hollis Lomax, the department enemy',
      'Katherine Driscoll, the instructor he loves',
      'Dave Masters and Gordon Finch, the two friends from graduate school',
    ],
  },
  'feeling-good': {
    gist: 'Burns wrote the first mass-market guide to cognitive therapy, built on the idea that moods come from thoughts and that depressed thoughts are systematically distorted. The core of the book is a list of ten distortions and a set of paper exercises for catching and answering them. Later chapters cover perfectionism, approval addiction, guilt and medication.',
    ideas: [
      'The ten distortions: all-or-nothing, overgeneralisation, mental filter, disqualifying the positive, jumping to conclusions, magnification, emotional reasoning, should statements, labelling, personalisation.',
      'The triple-column technique: automatic thought, which distortion, rational response.',
      'Do-nothingism: depression removes motivation, so action has to come first and motivation follows.',
      'Your worth is not a thing to measure. Drop the scale rather than trying to score higher.',
      'Should statements aimed at yourself produce guilt; aimed at others they produce anger.',
    ],
  },
  'animal-farm': {
    gist: 'The animals of Manor Farm drive out the drunken farmer Jones and run the farm on the principles of Animalism, summed up in seven commandments painted on the barn. The pigs take charge; Napoleon drives out Snowball with his dogs, rewrites history, trades with humans and moves into the farmhouse. The final scene has the other animals looking from pig to man and back and no longer able to tell the difference.',
    ideas: [
      'The commandments are amended one at a time, overnight, and the animals doubt their own memory instead.',
      'Squealer explains every betrayal so reasonably that the animals apologise for questioning it.',
      'Boxer\'s "I will work harder" and "Napoleon is always right" are the loyalty that gets him sold to the knacker.',
      'Benjamin the donkey sees everything and says nothing until it is too late.',
      'All animals are equal, but some animals are more equal than others.',
    ],
    people: [
      'Napoleon, the Stalin pig, and Snowball, the Trotsky pig',
      'Squealer, the propagandist',
      'Boxer, the carthorse',
      'Old Major, whose dream started it, and Mr Jones',
    ],
  },
  metamorphosis: {
    gist: 'Gregor Samsa, a travelling salesman supporting his parents and sister, wakes one morning as a giant insect. His first worry is missing the train. The family locks him in his room, his sister Grete feeds him, then stops, and the household slowly adjusts to a world in which he is a burden. He dies of neglect and an apple lodged in his back; the family takes a tram to the countryside and notices Grete has grown into a pretty young woman.',
    ideas: [
      'The transformation is never explained and nobody asks for an explanation.',
      'Gregor was already an insect to his employer and family; the body just caught up.',
      'The father regains his authority the moment Gregor loses his wage.',
      'Grete\'s care is the tenderest thing in the story and she is the one who says he has to go.',
      'The ending is a relief for the family, and the reader is made to share it, which is the horror.',
    ],
    people: [
      'Gregor Samsa, the insect',
      'Grete, his sister, violinist',
      'Mr and Mrs Samsa',
      'The chief clerk, and the three lodgers',
    ],
  },
  'name-of-the-wind': {
    gist: 'Kvothe, now an innkeeper under a false name, tells the Chronicler the first day of his own story. It runs from a childhood in a troupe of travelling performers, to their massacre by the Chandrian, to years as a street orphan in Tarbean, to admission to the University at fifteen, where he studies sympathy and naming, makes an enemy of Ambrose, and chases the name of the wind. Interludes in the inn hint that the present is worse than the past.',
    ideas: [
      'The story is a story about telling stories; Kvothe controls what we hear and admits it.',
      'Money is the real antagonist at the University; tuition and the lute string cost more page-time than magic.',
      'Sympathy is physics with belief attached. Naming is something else, and the book withholds it.',
      'Denna appears, vanishes, and reappears; she is never where he can keep her.',
      'The Chandrian are only seen once, at the beginning, and the fear carries the rest.',
    ],
    people: [
      'Kvothe, also Kote the innkeeper',
      'Bast, his student, who is not human',
      'Denna, Ambrose, Simmon and Wilem',
      'Master Elodin, who teaches naming by seeming mad',
      'Abenthy, the first teacher, and the Edema Ruh',
    ],
  },
  'wise-mans-fear': {
    gist: 'Day two of Kvothe\'s telling. He is suspended from the University after a court case, goes to Vintas to serve the Maer Alveron, exposes a poisoner, negotiates a marriage, hunts bandits in the Eld, spends an unmeasurable time with the fae Felurian, and trains with the Adem mercenaries who teach him the Lethani and their sword tree. He returns with a name, a cloak and a reputation, and is expelled anyway. The frame story darkens.',
    ideas: [
      'The Cthaeh: a creature in a tree that tells only truth, chosen to cause the most harm.',
      'Felurian and the shaed are the fairy-tale middle of the book, and the tone shifts to match.',
      'The Adem believe men have no part in making children; Kvothe learns not to argue.',
      'Kvothe kills the false troupe at the end and it is the first time he is truly dangerous.',
      'Almost nothing about the Chandrian is resolved; every clue is another door.',
    ],
    people: [
      'Maer Alveron and Meluan Lackless',
      'Felurian, and Tempi of the Adem',
      'Vashet, the sword teacher, and Shehyn',
      'Denna, still with her unnamed patron',
    ],
  },
  'east-of-eden': {
    gist: 'Two families in the Salinas Valley across three generations, with the story of Cain and Abel retold twice. Adam Trask marries Cathy, a woman the narrator calls a monster; she shoots him and leaves to run a brothel, and he raises their twin sons Caleb and Aron with the help of his Chinese servant Lee. Cal, the dark one, wants his father\'s love, and his gift of money is rejected, and his revenge on Aron sets off the ending. Adam\'s dying word to Cal is "timshel".',
    ideas: [
      'Timshel, "thou mayest", from Genesis 4: sin crouches at the door but you may rule over it.',
      'Charles and Adam, then Cal and Aron: the same brother pair twice, with a different ending the second time.',
      'Lee plays the fool in pidgin English until he decides to stop, and the novel gets its wisest voice.',
      'Cathy / Kate is evil without explanation, and the narrator admits he cannot account for her.',
      'Samuel Hamilton, the narrator\'s own grandfather, is the book\'s good man, poor and delighted.',
    ],
    people: [
      'Adam Trask and his brother Charles',
      'Cathy Ames, later Kate',
      'Caleb and Aron Trask, and Abra',
      'Lee, and Samuel Hamilton',
    ],
  },
  'grapes-of-wrath': {
    gist: 'The Joads lose their Oklahoma farm to the bank and the dust, load a truck and drive Route 66 to California with twelve people and a preacher who has lost his faith. Grandpa and Grandma die on the way, the men drift off, and in California the work is scarce, the wages are cut and the camps are policed. Tom kills a man defending Casy and goes into hiding. The book ends in a flooded barn with Rose of Sharon nursing a starving stranger.',
    ideas: [
      'The intercalary chapters zoom out to the whole migration: the tractor, the used-car lot, the turtle.',
      'The bank is a monster made of men who each say it is not their fault.',
      'Ma Joad takes over the family by degrees and nobody argues.',
      'Casy stops preaching and starts organising, and that gets him killed.',
      'Tom\'s "I\'ll be there" speech is the moment the individual becomes the crowd.',
    ],
    people: [
      'Tom Joad, on parole, and Ma Joad',
      'Jim Casy, the ex-preacher',
      'Pa, Uncle John, Al, Noah, Rose of Sharon and Connie',
      'The Wilsons, met on the road',
    ],
  },
  hitchhikers: {
    gist: 'Arthur Dent\'s house is demolished for a bypass on the same morning the Earth is demolished for a hyperspace bypass. His friend Ford Prefect, a researcher for the Guide, gets them both off the planet by hitching a ride on a Vogon ship. They meet Zaphod Beeblebrox, two-headed President of the Galaxy, Trillian, and Marvin the depressed robot, and discover that the Earth was a computer built to find the question to the answer forty-two.',
    ideas: [
      'Don\'t Panic, and always know where your towel is.',
      'The Babel fish proves the non-existence of God by being too useful to have evolved.',
      'Vogon poetry is the third worst in the universe. Bureaucracy is the real weapon.',
      'The Infinite Improbability Drive turns missiles into a whale and a bowl of petunias.',
      'Forty-two: the answer is easy, the question is the hard part.',
    ],
    people: [
      'Arthur Dent, in a dressing gown',
      'Ford Prefect, from a small planet near Betelgeuse',
      'Zaphod Beeblebrox, Trillian and Marvin',
      'Slartibartfast, who did the fjords',
    ],
  },
  'brave-new-world': {
    gist: 'In the World State of 632 After Ford, humans are decanted from bottles into five castes, conditioned by sleep-teaching, and kept content with soma, promiscuity and entertainment. Bernard Marx, an Alpha who does not fit, brings back John, a young man born naturally on a Savage Reservation and raised on Shakespeare. John\'s disgust with the civilised world ends in a debate with the World Controller Mustapha Mond, exile, and suicide.',
    ideas: [
      'Nobody is oppressed. They have been made to love their servitude.',
      'Mond has read the banned books and explains, kindly, why happiness needs them gone.',
      'John claims the right to be unhappy, to grow old, to have cancer, to be tortured by unspeakable pains.',
      'Helmholtz, the writer who has nothing to write about, chooses the bad-weather island.',
      'History is bunk; the past is removed rather than rewritten.',
    ],
    people: [
      'John the Savage, and his mother Linda',
      'Bernard Marx and Helmholtz Watson',
      'Lenina Crowne',
      'Mustapha Mond, Resident World Controller for Western Europe',
    ],
  },
  2666: {
    gist: 'Five parts that barely touch. Four European critics hunt an invisible German novelist, Archimboldi, and end up in Santa Teresa, a Mexican border city. A Chilean professor there loses his mind. An American journalist covers a boxing match and gets pulled into the killings. The fourth part lists the murders of hundreds of women over years, one after another, in police-report prose. The fifth tells Archimboldi\'s whole life, from Prussia through the war to the moment he leaves for Santa Teresa.',
    ideas: [
      'Santa Teresa is Ciudad Juárez; the femicides are real and still unsolved.',
      'The Part About the Crimes refuses to make a plot out of the dead. That is the point.',
      'Hans Reiter becomes Benno von Archimboldi by taking a new name after the war; identity is chosen.',
      'Nobody finds anyone. Every search ends in a hotel, a hospital or a road out of town.',
      'The title is never explained inside the book.',
    ],
    people: [
      'Pelletier, Espinoza, Norton and Morini, the critics',
      'Óscar Amalfitano and his daughter Rosa',
      'Oscar Fate, the journalist',
      'Benno von Archimboldi, born Hans Reiter, and his sister Lotte',
    ],
  },
  'hundred-years': {
    gist: 'Seven generations of the Buendía family in Macondo, the town José Arcadio Buendía founded in the jungle, from the age of ice and magnets to a hurricane that wipes it off the map. Sons are all named Aureliano or José Arcadio and repeat their namesakes\' fates. Civil wars, a banana company, a massacre erased from memory, and a matriarch who lives past a hundred hold it together until the last Aureliano reads the manuscript that foretold it all.',
    ideas: [
      'The gypsy Melquíades\' parchments turn out to be the novel, finished as it is read.',
      'Colonel Aureliano Buendía fought thirty-two wars and lost them all, then made little gold fishes.',
      'The banana massacre happened, three thousand dead, and by morning the official story is that nothing did.',
      'Úrsula holds the house for a century and only she notices that time is going in circles.',
      'Remedios the Beauty rises to heaven with the laundry; it is reported like weather.',
    ],
    people: [
      'José Arcadio Buendía and Úrsula Iguarán, the founders',
      'Colonel Aureliano Buendía',
      'Melquíades, the gypsy',
      'Amaranta, Rebeca, Remedios the Beauty, Aureliano Babilonia',
    ],
  },
  'rich-dad': {
    gist: 'Kiyosaki contrasts his own educated, salaried father with his friend\'s father, a Hawaiian businessman who taught the two boys about money. The lessons are framed as a series of talks: the rich don\'t work for money, learn financial literacy, mind your own business, understand tax and corporations, invent money, work to learn. The second half is advice and a sales pitch for his other products.',
    ideas: [
      'Assets put money in your pocket. Liabilities take it out. Your house is a liability.',
      'The rat race: earn more, spend more, and the bigger paycheck never gets you out.',
      'Pay yourself first, then let the pressure of the bills make you inventive.',
      'Fear and greed drive most money decisions; notice which one is talking.',
      'Financial intelligence is accounting, investing, markets and law, learned together.',
    ],
  },
  'mans-search': {
    gist: 'Frankl, a Viennese psychiatrist, spent three years in Auschwitz, Dachau and other camps and wrote this in nine days after liberation. The first half describes camp life through the eyes of a psychologist noticing how people held on or let go. The second half explains logotherapy, his school of therapy built on the idea that the primary human drive is meaning, not pleasure or power.',
    ideas: [
      'Everything can be taken from a man but one thing: the last of the human freedoms, to choose one\'s attitude.',
      'Those with a why to live can bear almost any how. The ones who lost their why died within days.',
      'Meaning is found three ways: through work, through love, and through the stance we take toward unavoidable suffering.',
      'Love is the only way to grasp another person in the innermost core of their personality.',
      'Don\'t aim at success. The more you aim at it, the more you miss it. It must ensue as a side effect.',
    ],
  },
  'crime-and-punishment': {
    gist: 'Raskolnikov, a former student in a St Petersburg garret, murders a pawnbroker and her sister with an axe, partly for money, partly to prove he is one of the extraordinary men who may step over the law. He is undone not by evidence but by his own mind, by the detective Porfiry who plays with him, and by Sonya, a prostitute who reads him the raising of Lazarus. He confesses and goes to Siberia; Sonya follows.',
    ideas: [
      'The article on extraordinary men is the theory; the fever and the delirium are the refutation.',
      'Porfiry has no proof and does not need it; he waits for the confession like a spider.',
      'Svidrigailov is what Raskolnikov would be if he really felt nothing, and he shoots himself.',
      'Sonya kneels to him because he is suffering, and that undoes him more than any argument.',
      'The epilogue in Siberia is where the punishment finally ends and something else starts.',
    ],
    people: [
      'Rodion Raskolnikov, and his sister Dunya and mother',
      'Sonya Marmeladova, and her father Marmeladov',
      'Porfiry Petrovich, the examining magistrate',
      'Svidrigailov and Luzhin, the two suitors',
      'Razumikhin, the loyal friend',
    ],
  },
  'clean-code': {
    gist: 'Martin and colleagues lay out what makes code readable, chapter by chapter: names, functions, comments, formatting, objects and data structures, error handling, boundaries, unit tests, classes, systems, concurrency, and a long worked refactoring. The examples are Java but the rules are general. The final chapter is a list of "smells" to check code against.',
    ideas: [
      'Functions should be small, then smaller than that, and do one thing.',
      'A name should tell you why it exists, what it does and how it is used, without a comment.',
      'Comments are a failure to express yourself in code. Comments lie as the code changes.',
      'Handle errors with exceptions, not return codes, and never return or pass null.',
      'Tests are first-class code: fast, independent, repeatable, self-validating, timely.',
    ],
  },
  alchemist: {
    gist: 'Santiago, an Andalusian shepherd boy, dreams twice of treasure at the Egyptian pyramids. A gypsy and then Melchizedek, a king, tell him to go; he sells his sheep, is robbed in Tangier, works a year for a crystal merchant, crosses the desert with a caravan, meets Fatima at an oasis and the Alchemist who teaches him to listen to his heart. At the pyramids he is beaten by thieves whose leader tells him about his own dream of treasure buried under a sycamore in a ruined church in Spain.',
    ideas: [
      'Personal Legend: what you have always wanted to do. The universe conspires to help you achieve it.',
      'Beginner\'s luck, then the test, then the realisation: the pattern of every quest.',
      'The crystal merchant wants Mecca as a dream and refuses to go so he can keep dreaming.',
      'The Soul of the World, the Language of the World, omens: pay attention to the present.',
      'The treasure is at home, but only the journey makes you able to find it.',
    ],
    people: [
      'Santiago, the shepherd',
      'Melchizedek, king of Salem',
      'The crystal merchant, the Englishman, Fatima',
      'The Alchemist',
    ],
  },
  'total-money-makeover': {
    gist: 'Ramsey\'s plan for getting out of debt and building wealth, laid out as seven Baby Steps with worksheets. The tone is a coach shouting: sell the car, cut up the cards, get "gazelle intense". The workbook version adds budget forms, debt lists and prompts for each step.',
    ideas: [
      'Baby Steps: $1,000 starter emergency fund; pay off all debt with the snowball; 3 to 6 months of expenses; 15% to retirement; kids\' college; pay off the house; build wealth and give.',
      'Debt snowball: smallest balance first, ignoring interest rates, because quick wins keep you going.',
      'A zero-based budget every month: every dollar gets a job on paper before the month starts.',
      'No credit score is a goal, not a problem, if you never borrow.',
      'Live like no one else now so later you can live like no one else.',
    ],
  },
  'clean-coder': {
    gist: 'The companion to Clean Code, about the programmer rather than the program. Martin covers what professionalism means: taking responsibility, saying no, saying yes only when you mean it, coding when you are fit to, test-driven development, practising, estimating honestly, handling pressure, working with others and mentoring. Stories from his own career, including a disaster at a telecoms company, run through it.',
    ideas: [
      'Do no harm to function or structure. QA should find nothing.',
      'Say no; "try" is a lie. Commit to something or say you cannot.',
      'Estimates are probability distributions. Give three numbers, not one.',
      'Practise outside work: katas, contributing, reading. Your employer is not responsible for your career.',
      'When under pressure, slow down and follow your disciplines harder, not looser.',
    ],
  },
  'love-languages': {
    gist: 'Chapman\'s claim is that people express and receive love in five main ways, and that most relationship pain comes from partners speaking different ones. The men\'s edition restates the framework with examples aimed at husbands and a chapter on figuring out your wife\'s language. Each language gets a chapter with concrete acts.',
    ideas: [
      'The five: words of affirmation, quality time, receiving gifts, acts of service, physical touch.',
      'Your primary language is usually what you complain about not getting, or what you do most for others.',
      'The "love tank": when it is empty, everything the partner does is read as hostile.',
      'Doing the thing your partner needs, not the thing you would want, is the whole method.',
      'Love is a choice made daily after the in-love feeling fades, usually around two years in.',
    ],
  },
}
