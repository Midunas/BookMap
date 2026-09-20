// Cross-book learnings: the "education" layer. Each thread stitches several books into one lesson.
export interface Thread { id: string; title: string; books: string[]; text: string }

export const threads: Thread[] = [
  {
    id: 'meaning', title: 'Meaning is made, not found',
    books: ['mans-search', 'meditations', 'four-agreements', 'power-of-myth', 'alchemist'],
    text: 'Frankl in a camp and Marcus Aurelius on a throne arrive at the same place: circumstances are assigned, attitude is chosen. Campbell adds that every culture has told this story as a journey out and back. The treasure in The Alchemist is at home; the trip is what makes you able to see it.',
  },
  {
    id: 'mind', title: 'Thoughts come first, feelings follow',
    books: ['feeling-good', 'stop-worrying', 'four-agreements', 'love-languages'],
    text: 'Burns gives the mechanism (cognitive distortions), Carnegie the daily practice (day-tight compartments, worst-case acceptance), Ruiz the rules of thumb (assume nothing, take nothing personally). Chapman applies the same idea to relationships: most hurt is a translation error.',
  },
  {
    id: 'power', title: 'How power actually works',
    books: ['1984', 'animal-farm', 'brave-new-world', 'malcolm-x', 'crime-and-punishment'],
    text: 'Orwell shows control through fear and language, Huxley through comfort and distraction. Animal Farm shows how revolutions rot one edited rule at a time. Malcolm X is the counter-story: a mind that refused to be managed. Dostoevsky warns what happens when a clever theory decides some people are above the rules.',
  },
  {
    id: 'money', title: 'Money is a behaviour problem',
    books: ['rich-dad', 'millionaire-mind', 'total-money-makeover', 'gatsby'],
    text: 'Kiyosaki gives the vocabulary (assets vs liabilities), Stanley the evidence (real millionaires live below their means and stay married), Ramsey the sequence (emergency fund, kill debt, invest). Gatsby is the cautionary tale: money can buy the party but never the past.',
  },
  {
    id: 'craft', title: 'Professionalism is a set of habits',
    books: ['clean-code', 'clean-coder', 'stoner', 'wise-mans-fear'],
    text: 'Martin\'s two books are about writing for the next reader and saying no honestly. Stoner is the same idea as a novel: a quiet, unglamorous devotion to work done well. The Adem chapters of The Wise Man\'s Fear turn discipline into something almost sacred.',
  },
  {
    id: 'america', title: 'The American novel, from the bottom up',
    books: ['grapes-of-wrath', 'east-of-eden', 'beale-street', 'giovannis-room', 'stoner', 'gatsby'],
    text: 'Steinbeck writes poverty and choice, Baldwin writes love inside systems designed to break it, Williams writes the dignity of an ordinary life, Fitzgerald writes the glitter that hides all of it. Together they are a history of the country its textbooks skip.',
  },
  {
    id: 'latin', title: 'Latin America and the shape of time',
    books: ['hundred-years', '2666', 'alchemist', 'four-agreements'],
    text: 'García Márquez makes time a circle where families repeat themselves. Bolaño makes it a spiral around an unnamed evil. Coelho and Ruiz distil the same continent\'s spiritual vocabulary into fables and rules. Between them: miracles reported like weather, and violence reported the same way.',
  },
  {
    id: 'wonder', title: 'Wonder is a skill',
    books: ['name-of-the-wind', 'wise-mans-fear', 'hitchhikers', 'metamorphosis', 'hundred-years'],
    text: 'Rothfuss builds a magic system that is basically physics with better marketing. Adams answers cosmic indifference with a towel and a joke. Kafka and García Márquez show that the strange is most powerful when nobody in the story finds it strange.',
  },
]
