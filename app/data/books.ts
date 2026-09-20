// BookMap data. Edit freely: this is the single source of truth for the site.
// `stats` are points each book grants toward a reader stat (0-3 each).
// `takeaway` is what I took from a book I read; `why` is why an unread book is on the list.

export type Status = 'read' | 'want' | 'reading'

export type Genre =
  | 'Literary Fiction'
  | 'Fantasy & Sci-Fi'
  | 'Dystopia & Satire'
  | 'Historical & War'
  | 'Philosophy'
  | 'Mind & Self'
  | 'Money & Craft'
  | 'Memoir & Biography'

export type Form =
  | 'Novel'
  | 'Novella'
  | 'Memoir'
  | 'Treatise'
  | 'Aphorisms'
  | 'Guide'
  | 'Conversation'
  | 'Workbook'

export type StatKey = 'empathy' | 'resilience' | 'thinking' | 'wealth' | 'craft' | 'imagination'

export interface Book {
  id: string
  title: string
  series?: string
  author: string
  authorId: string
  country: string      // display name
  place: string        // author's birthplace or home city
  lat: number
  lng: number
  language: string     // original language
  year: number         // first publication (negative = BC)
  genre: Genre
  form: Form
  themes: string[]
  status: Status
  myRating?: number
  avgRating: number
  dateRead?: string
  dateAdded: string
  pages: number
  stats: Partial<Record<StatKey, number>>
  takeaway?: string
  why?: string
}

export const GENRES: Genre[] = [
  'Literary Fiction',
  'Fantasy & Sci-Fi',
  'Dystopia & Satire',
  'Historical & War',
  'Philosophy',
  'Mind & Self',
  'Money & Craft',
  'Memoir & Biography',
]

export const STATS: { key: StatKey; label: string; blurb: string }[] = [
  { key: 'empathy', label: 'Empathy', blurb: 'Living other lives: perspective, tenderness, moral imagination.' },
  { key: 'resilience', label: 'Resilience', blurb: 'Meaning under pressure: stoicism, mood, endurance.' },
  { key: 'thinking', label: 'Thinking', blurb: 'Seeing systems: power, politics, argument, structure.' },
  { key: 'wealth', label: 'Wealth', blurb: 'Money as a tool: habits, independence, ownership.' },
  { key: 'craft', label: 'Craft', blurb: 'Doing the work well: discipline, professionalism, taste.' },
  { key: 'imagination', label: 'Imagination', blurb: 'Wonder: myth, invented worlds, the strange.' },
]

export const books: Book[] = [
  // ───────────── READ ─────────────
  {
    id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', authorId: 'marcus-aurelius',
    country: 'Italy', place: 'Rome', lat: 41.9028, lng: 12.4964, language: 'Greek', year: 180,
    genre: 'Philosophy', form: 'Aphorisms', themes: ['stoicism', 'duty', 'mortality', 'self-discipline'],
    status: 'read', avgRating: 4.27, dateAdded: '2026-01-01', pages: 254,
    stats: { resilience: 3, thinking: 2 },
    takeaway: 'A private notebook by the most powerful man alive, reminding himself to be small, patient and useful. What is not in my control is not my problem; how I meet it is.',
  },
  {
    id: 'stop-worrying', title: 'How to Stop Worrying and Start Living', author: 'Dale Carnegie', authorId: 'dale-carnegie',
    country: 'United States', place: 'Maryville, Missouri', lat: 40.3461, lng: -94.8725, language: 'English', year: 1948,
    genre: 'Mind & Self', form: 'Guide', themes: ['worry', 'habits', 'practical wisdom'],
    status: 'read', myRating: 4, avgRating: 4.16, dateAdded: '2026-01-01', pages: 306,
    stats: { resilience: 3, thinking: 1 },
    takeaway: 'Live in day-tight compartments. Ask what the worst case really is, accept it, then improve on it. Most worry evaporates the moment it is written down and given a deadline.',
  },
  {
    id: 'malcolm-x', title: 'The Autobiography of Malcolm X', author: 'Malcolm X', authorId: 'malcolm-x',
    country: 'United States', place: 'Omaha, Nebraska', lat: 41.2565, lng: -95.9345, language: 'English', year: 1965,
    genre: 'Memoir & Biography', form: 'Memoir', themes: ['race', 'identity', 'transformation', 'faith'],
    status: 'read', myRating: 5, avgRating: 4.37, dateAdded: '2026-01-01', pages: 460,
    stats: { empathy: 3, thinking: 3, resilience: 2 },
    takeaway: 'A person can rebuild themselves completely, more than once, and the last version can contradict the earlier ones with honesty. Self-education in a prison library changed history.',
  },
  {
    id: '1984', title: '1984', author: 'George Orwell', authorId: 'george-orwell',
    country: 'United Kingdom', place: 'London', lat: 51.5074, lng: -0.1278, language: 'English', year: 1949,
    genre: 'Dystopia & Satire', form: 'Novel', themes: ['surveillance', 'truth', 'power', 'language'],
    status: 'read', myRating: 5, avgRating: 4.21, dateAdded: '2023-12-10', pages: 328,
    stats: { thinking: 3, resilience: 1, imagination: 1 },
    takeaway: 'Control the words and you control what can be thought. Truth is not what happened but what the record says happened. The most frightening thing is how reasonable it all sounds from the inside.',
  },
  {
    id: 'gatsby', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', authorId: 'f-scott-fitzgerald',
    country: 'United States', place: 'St. Paul, Minnesota', lat: 44.9537, lng: -93.09, language: 'English', year: 1925,
    genre: 'Literary Fiction', form: 'Novel', themes: ['wealth', 'longing', 'the American dream', 'illusion'],
    status: 'read', avgRating: 3.93, dateAdded: '2023-12-10', pages: 180,
    stats: { empathy: 2, wealth: 1, thinking: 1 },
    takeaway: 'Money buys the party but not the past. Gatsby wanted a moment back, not a woman. The green light is the perfect image of wanting something precisely because it is out of reach.',
  },
  {
    id: 'four-agreements', title: 'The Four Agreements', author: 'Don Miguel Ruiz', authorId: 'miguel-ruiz',
    country: 'Mexico', place: 'Guadalajara', lat: 20.6597, lng: -103.3496, language: 'English', year: 1997,
    genre: 'Mind & Self', form: 'Guide', themes: ['integrity', 'assumptions', 'freedom'],
    status: 'read', avgRating: 4.19, dateAdded: '2026-01-01', pages: 138,
    stats: { resilience: 2, empathy: 2 },
    takeaway: 'Be impeccable with your word, take nothing personally, make no assumptions, always do your best. Simple enough to remember on a bad day, which is the point.',
  },
  {
    id: 'giovannis-room', title: "Giovanni's Room", author: 'James Baldwin', authorId: 'james-baldwin',
    country: 'United States', place: 'Harlem, New York', lat: 40.8116, lng: -73.9465, language: 'English', year: 1956,
    genre: 'Literary Fiction', form: 'Novel', themes: ['desire', 'shame', 'exile', 'identity'],
    status: 'read', avgRating: 4.34, dateAdded: '2026-09-20', pages: 169,
    stats: { empathy: 3, thinking: 1 },
    takeaway: 'Shame does more damage than any lover can. David destroys what he loves because he cannot admit he loves it. Baldwin writes self-deception from the inside better than anyone.',
  },
  {
    id: 'millionaire-mind', title: 'The Millionaire Mind', author: 'Thomas J. Stanley', authorId: 'thomas-stanley',
    country: 'United States', place: 'New York', lat: 40.7128, lng: -74.006, language: 'English', year: 2000,
    genre: 'Money & Craft', form: 'Guide', themes: ['wealth', 'habits', 'frugality'],
    status: 'read', myRating: 4, avgRating: 4.22, dateAdded: '2026-01-01', pages: 406,
    stats: { wealth: 3, thinking: 1 },
    takeaway: 'Real millionaires are boring: long marriages, cheap houses relative to income, one business they understand deeply. Integrity and discipline outrank raw intelligence in the data.',
  },
  {
    id: 'power-of-myth', title: 'The Power of Myth', author: 'Joseph Campbell', authorId: 'joseph-campbell',
    country: 'United States', place: 'White Plains, New York', lat: 41.034, lng: -73.7629, language: 'English', year: 1988,
    genre: 'Philosophy', form: 'Conversation', themes: ['myth', 'the hero', 'meaning', 'ritual'],
    status: 'read', avgRating: 4.26, dateAdded: '2026-06-11', pages: 293,
    stats: { imagination: 3, thinking: 2, empathy: 1 },
    takeaway: 'Every culture tells the same story with different costumes: leave, suffer, return with something to give. Follow your bliss is not hedonism; it is picking the path where your effort feels like play.',
  },
  {
    id: 'beale-street', title: 'If Beale Street Could Talk', author: 'James Baldwin', authorId: 'james-baldwin',
    country: 'United States', place: 'Harlem, New York', lat: 40.8116, lng: -73.9465, language: 'English', year: 1974,
    genre: 'Literary Fiction', form: 'Novel', themes: ['love', 'injustice', 'family', 'race'],
    status: 'read', myRating: 5, avgRating: 4.26, dateAdded: '2026-01-01', pages: 197,
    stats: { empathy: 3, resilience: 1, thinking: 1 },
    takeaway: 'A love story where the enemy is a system, not a rival. Tish and Fonny stay tender while everything around them is engineered to make tenderness impossible. Family is the only institution that shows up.',
  },
  {
    id: 'stoner', title: 'Stoner', author: 'John Williams', authorId: 'john-williams',
    country: 'United States', place: 'Clarksville, Texas', lat: 33.6106, lng: -95.0527, language: 'English', year: 1965,
    genre: 'Literary Fiction', form: 'Novel', themes: ['quiet life', 'work', 'marriage', 'dignity'],
    status: 'read', avgRating: 4.36, dateRead: '2026-06-22', dateAdded: '2026-06-11', pages: 288,
    stats: { empathy: 3, resilience: 2, craft: 1 },
    takeaway: 'A whole life in which almost nothing happens and I could not stop reading. A modest, unglamorous devotion to one\'s work can be a kind of heroism. Also a warning about marrying wrong.',
  },
  {
    id: 'feeling-good', title: 'Feeling Good: The New Mood Therapy', author: 'David D. Burns', authorId: 'david-burns',
    country: 'United States', place: 'Philadelphia', lat: 39.9526, lng: -75.1652, language: 'English', year: 1980,
    genre: 'Mind & Self', form: 'Guide', themes: ['CBT', 'depression', 'cognitive distortions'],
    status: 'read', myRating: 5, avgRating: 4.06, dateAdded: '2026-03-10', pages: 736,
    stats: { resilience: 3, thinking: 2 },
    takeaway: 'Feelings follow thoughts, and thoughts can be wrong in ten predictable ways. Naming the distortion (all-or-nothing, mind reading, should statements) takes half its power. Write the thought down, answer it.',
  },
  {
    id: 'animal-farm', title: 'Animal Farm', author: 'George Orwell', authorId: 'george-orwell',
    country: 'United Kingdom', place: 'London', lat: 51.5074, lng: -0.1278, language: 'English', year: 1945,
    genre: 'Dystopia & Satire', form: 'Novella', themes: ['revolution', 'power', 'propaganda'],
    status: 'read', avgRating: 4.03, dateRead: '2026-08-02', dateAdded: '2026-08-02', pages: 112,
    stats: { thinking: 3, empathy: 1 },
    takeaway: 'Revolutions are betrayed slowly, one edited commandment at a time. Boxer\'s "I will work harder" is the saddest line: loyalty without scrutiny is what tyrants run on.',
  },
  {
    id: 'metamorphosis', title: 'The Metamorphosis', author: 'Franz Kafka', authorId: 'franz-kafka',
    country: 'Czechia', place: 'Prague', lat: 50.0755, lng: 14.4378, language: 'German', year: 1915,
    genre: 'Literary Fiction', form: 'Novella', themes: ['alienation', 'family', 'work', 'the absurd'],
    status: 'read', avgRating: 3.91, dateAdded: '2026-06-11', pages: 55,
    stats: { empathy: 2, imagination: 2, thinking: 1 },
    takeaway: 'Nobody asks why Gregor became an insect; they ask how he will get to work. A family\'s love turns out to be conditional on usefulness. Funnier and sadder than its reputation.',
  },
  {
    id: 'name-of-the-wind', title: 'The Name of the Wind', series: 'The Kingkiller Chronicle #1', author: 'Patrick Rothfuss', authorId: 'patrick-rothfuss',
    country: 'United States', place: 'Madison, Wisconsin', lat: 43.0731, lng: -89.4012, language: 'English', year: 2007,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['music', 'storytelling', 'magic', 'coming of age'],
    status: 'read', myRating: 5, avgRating: 4.52, dateRead: '2026-05-02', dateAdded: '2026-04-13', pages: 662,
    stats: { imagination: 3, craft: 1, empathy: 1 },
    takeaway: 'A story about how stories get told, and how the legend and the man drift apart. The magic system is basically physics with better marketing. Prose you can hear.',
  },
  {
    id: 'wise-mans-fear', title: "The Wise Man's Fear", series: 'The Kingkiller Chronicle #2', author: 'Patrick Rothfuss', authorId: 'patrick-rothfuss',
    country: 'United States', place: 'Madison, Wisconsin', lat: 43.0731, lng: -89.4012, language: 'English', year: 2011,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['mastery', 'travel', 'myth', 'consequence'],
    status: 'read', myRating: 5, avgRating: 4.55, dateAdded: '2026-06-10', pages: 994,
    stats: { imagination: 3, craft: 1 },
    takeaway: 'Longer, stranger, more self-indulgent, and I loved it anyway. The Adem chapters are a meditation on craft and discipline dressed as fantasy. Still waiting for book three like everyone else.',
  },
  {
    id: 'east-of-eden', title: 'East of Eden', author: 'John Steinbeck', authorId: 'john-steinbeck',
    country: 'United States', place: 'Salinas, California', lat: 36.6777, lng: -121.6555, language: 'English', year: 1952,
    genre: 'Literary Fiction', form: 'Novel', themes: ['good and evil', 'choice', 'family', 'brothers'],
    status: 'read', avgRating: 4.46, dateAdded: '2026-01-01', pages: 601,
    stats: { empathy: 3, thinking: 2, resilience: 1 },
    takeaway: 'Timshel: thou mayest. Nobody is doomed by blood; the choice is always open, which is both the freedom and the burden. Lee the servant is the wisest character in American fiction.',
  },
  {
    id: 'grapes-of-wrath', title: 'The Grapes of Wrath', author: 'John Steinbeck', authorId: 'john-steinbeck',
    country: 'United States', place: 'Salinas, California', lat: 36.6777, lng: -121.6555, language: 'English', year: 1939,
    genre: 'Literary Fiction', form: 'Novel', themes: ['poverty', 'migration', 'dignity', 'solidarity'],
    status: 'read', myRating: 4, avgRating: 4.04, dateRead: '2026-03-23', dateAdded: '2026-01-01', pages: 464,
    stats: { empathy: 3, thinking: 2 },
    takeaway: 'Economic systems are made of decisions, and the people making them are always somewhere else. Ma Joad holds a family together by force of will. The ending is one of the bravest in literature.',
  },
  {
    id: 'hitchhikers', title: "The Hitchhiker's Guide to the Galaxy", series: "Hitchhiker's Guide #1", author: 'Douglas Adams', authorId: 'douglas-adams',
    country: 'United Kingdom', place: 'Cambridge', lat: 52.2053, lng: 0.1218, language: 'English', year: 1979,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['absurdity', 'bureaucracy', 'humour'],
    status: 'read', myRating: 5, avgRating: 4.22, dateAdded: '2025-05-02', pages: 193,
    stats: { imagination: 3, thinking: 1 },
    takeaway: 'Don\'t panic, carry a towel, and remember the universe does not owe you a sensible answer. Comedy is a valid response to cosmic indifference, maybe the best one.',
  },
  {
    id: 'brave-new-world', title: 'Brave New World', author: 'Aldous Huxley', authorId: 'aldous-huxley',
    country: 'United Kingdom', place: 'Godalming, Surrey', lat: 51.1859, lng: -0.6155, language: 'English', year: 1932,
    genre: 'Dystopia & Satire', form: 'Novel', themes: ['pleasure', 'conditioning', 'freedom', 'technology'],
    status: 'read', avgRating: 3.98, dateAdded: '2026-01-01', pages: 268,
    stats: { thinking: 3, imagination: 1 },
    takeaway: 'Orwell feared the boot; Huxley feared the drug. A society can be enslaved by comfort more thoroughly than by fear. The Savage claiming the right to be unhappy is the whole argument.',
  },
  {
    id: '2666', title: '2666', author: 'Roberto Bolaño', authorId: 'roberto-bolano',
    country: 'Chile', place: 'Santiago', lat: -33.4489, lng: -70.6693, language: 'Spanish', year: 2004,
    genre: 'Literary Fiction', form: 'Novel', themes: ['violence', 'literature', 'evil', 'obsession'],
    status: 'read', avgRating: 4.22, dateRead: '2026-09-20', dateAdded: '2026-07-29', pages: 898,
    stats: { thinking: 3, empathy: 2, imagination: 2, resilience: 1 },
    takeaway: 'Five novels that refuse to resolve into one. The Part About the Crimes is a moral endurance test: hundreds of murders listed flatly until the flatness itself becomes the horror. Literature as a way of looking directly at evil.',
  },
  {
    id: 'hundred-years', title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', authorId: 'gabriel-garcia-marquez',
    country: 'Colombia', place: 'Aracataca', lat: 10.5917, lng: -74.1894, language: 'Spanish', year: 1967,
    genre: 'Literary Fiction', form: 'Novel', themes: ['family', 'time', 'memory', 'magical realism'],
    status: 'read', avgRating: 4.13, dateAdded: '2026-01-01', pages: 417,
    stats: { imagination: 3, empathy: 2, thinking: 1 },
    takeaway: 'Time is a circle and families repeat themselves down to the names. Miracles are reported in the same tone as the weather. The massacre nobody remembers is the political heart of it.',
  },
  {
    id: 'rich-dad', title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', authorId: 'robert-kiyosaki',
    country: 'United States', place: 'Hilo, Hawaii', lat: 19.7241, lng: -155.0868, language: 'English', year: 1997,
    genre: 'Money & Craft', form: 'Guide', themes: ['assets', 'financial literacy', 'mindset'],
    status: 'read', avgRating: 4.08, dateAdded: '2026-01-01', pages: 336,
    stats: { wealth: 3 },
    takeaway: 'An asset puts money in your pocket; a liability takes it out. Most people work for money instead of making money work. Take the framing, ignore the salesmanship.',
  },
  {
    id: 'mans-search', title: "Man's Search for Meaning", author: 'Viktor E. Frankl', authorId: 'viktor-frankl',
    country: 'Austria', place: 'Vienna', lat: 48.2082, lng: 16.3738, language: 'German', year: 1946,
    genre: 'Memoir & Biography', form: 'Memoir', themes: ['meaning', 'suffering', 'the Holocaust', 'logotherapy'],
    status: 'read', avgRating: 4.37, dateAdded: '2026-06-11', pages: 165,
    stats: { resilience: 3, empathy: 2, thinking: 1 },
    takeaway: 'Those who have a why can bear almost any how. Between stimulus and response there is a space, and in that space is our freedom. Read it when things are fine so it is there when they are not.',
  },
  {
    id: 'crime-and-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', authorId: 'fyodor-dostoevsky',
    country: 'Russia', place: 'Moscow', lat: 55.7558, lng: 37.6173, language: 'Russian', year: 1866,
    genre: 'Literary Fiction', form: 'Novel', themes: ['guilt', 'morality', 'poverty', 'redemption'],
    status: 'read', myRating: 5, avgRating: 4.29, dateAdded: '2026-01-01', pages: 671,
    stats: { thinking: 3, empathy: 2, resilience: 1 },
    takeaway: 'The theory that some men are above the law collapses the second it meets a real conscience. Punishment begins before anyone finds out. Sonya\'s quiet faith beats Raskolnikov\'s clever ideas.',
  },
  {
    id: 'clean-code', title: 'Clean Code', author: 'Robert C. Martin', authorId: 'robert-martin',
    country: 'United States', place: 'Chicago', lat: 41.8781, lng: -87.6298, language: 'English', year: 2008,
    genre: 'Money & Craft', form: 'Guide', themes: ['software', 'naming', 'readability'],
    status: 'read', myRating: 5, avgRating: 4.35, dateAdded: '2025-05-02', pages: 464,
    stats: { craft: 3, thinking: 1 },
    takeaway: 'Code is read far more than it is written, so write for the reader. Small functions, honest names, no comments that lie. Leave the campground cleaner than you found it.',
  },
  {
    id: 'alchemist', title: 'The Alchemist', author: 'Paulo Coelho', authorId: 'paulo-coelho',
    country: 'Brazil', place: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, language: 'Portuguese', year: 1988,
    genre: 'Literary Fiction', form: 'Novella', themes: ['destiny', 'journey', 'omens'],
    status: 'read', myRating: 4, avgRating: 3.92, dateAdded: '2023-12-10', pages: 197,
    stats: { imagination: 2, resilience: 1 },
    takeaway: 'The treasure was at home the whole time, but you had to go to Egypt to be able to see it. A fable about how the journey is what makes you capable of receiving the ending.',
  },
  {
    id: 'total-money-makeover', title: 'The Total Money Makeover Workbook', author: 'Dave Ramsey', authorId: 'dave-ramsey',
    country: 'United States', place: 'Antioch, Tennessee', lat: 36.06, lng: -86.6716, language: 'English', year: 2003,
    genre: 'Money & Craft', form: 'Workbook', themes: ['debt', 'budgeting', 'baby steps'],
    status: 'read', myRating: 4, avgRating: 4.28, dateAdded: '2026-01-01', pages: 208,
    stats: { wealth: 3, resilience: 1 },
    takeaway: 'Emergency fund first, then kill debt smallest to largest for momentum, then invest. Personal finance is 80% behaviour and 20% maths, so pick the plan you will actually follow.',
  },
  {
    id: 'clean-coder', title: 'The Clean Coder', author: 'Robert C. Martin', authorId: 'robert-martin',
    country: 'United States', place: 'Chicago', lat: 41.8781, lng: -87.6298, language: 'English', year: 2011,
    genre: 'Money & Craft', form: 'Guide', themes: ['professionalism', 'estimation', 'saying no'],
    status: 'read', myRating: 5, avgRating: 4.26, dateAdded: '2025-05-02', pages: 256,
    stats: { craft: 3, resilience: 1 },
    takeaway: 'A professional says no, gives honest estimates as ranges, and practices outside work hours. "I\'ll try" is a lie you tell to avoid a conversation.',
  },
  {
    id: 'love-languages', title: 'The 5 Love Languages for Men', author: 'Gary Chapman', authorId: 'gary-chapman',
    country: 'United States', place: 'China Grove, North Carolina', lat: 35.5693, lng: -80.5817, language: 'English', year: 2004,
    genre: 'Mind & Self', form: 'Guide', themes: ['relationships', 'communication'],
    status: 'read', myRating: 4, avgRating: 4.25, dateAdded: '2026-01-01', pages: 208,
    stats: { empathy: 3 },
    takeaway: 'People give love in the language they want to receive it, then feel unloved when it is not returned in kind. Learn your partner\'s dialect: words, time, gifts, service or touch.',
  },

  // ───────────── WANT TO READ ─────────────
  {
    id: 'catch-22', title: 'Catch-22', author: 'Joseph Heller', authorId: 'joseph-heller',
    country: 'United States', place: 'Brooklyn, New York', lat: 40.6782, lng: -73.9442, language: 'English', year: 1961,
    genre: 'Dystopia & Satire', form: 'Novel', themes: ['war', 'bureaucracy', 'absurdity'],
    status: 'want', avgRating: 3.99, dateAdded: '2023-12-10', pages: 453,
    stats: { thinking: 3, imagination: 1 },
    why: 'The definitive satire of institutional logic. After Orwell and Huxley, this is the funny one.',
  },
  {
    id: 'lonesome-dove', title: 'Lonesome Dove', series: 'Lonesome Dove #1', author: 'Larry McMurtry', authorId: 'larry-mcmurtry',
    country: 'United States', place: 'Archer City, Texas', lat: 33.5951, lng: -98.6256, language: 'English', year: 1985,
    genre: 'Historical & War', form: 'Novel', themes: ['friendship', 'the West', 'ageing'],
    status: 'want', avgRating: 4.60, dateAdded: '2026-06-11', pages: 864,
    stats: { empathy: 3, resilience: 1 },
    why: 'The highest-rated book on my list. A Western that people describe as a friendship story first.',
  },
  {
    id: 'the-idiot', title: 'The Idiot', author: 'Fyodor Dostoevsky', authorId: 'fyodor-dostoevsky',
    country: 'Russia', place: 'Moscow', lat: 55.7558, lng: 37.6173, language: 'Russian', year: 1869,
    genre: 'Literary Fiction', form: 'Novel', themes: ['goodness', 'society', 'innocence'],
    status: 'want', avgRating: 4.21, dateAdded: '2026-06-11', pages: 656,
    stats: { empathy: 3, thinking: 2 },
    why: 'Dostoevsky tries to write a truly good man and watches society tear him apart. The follow-up to Crime and Punishment.',
  },
  {
    id: 'lost-lambs', title: 'Lost Lambs', author: 'Madeline Cash', authorId: 'madeline-cash',
    country: 'United States', place: 'Los Angeles', lat: 34.0522, lng: -118.2437, language: 'English', year: 2025,
    genre: 'Literary Fiction', form: 'Novel', themes: ['contemporary', 'irony', 'youth'],
    status: 'want', avgRating: 3.82, dateAdded: '2026-06-11', pages: 240,
    stats: { empathy: 1, imagination: 1 },
    why: 'A contemporary voice to balance all the classics. Something written this decade.',
  },
  {
    id: 'sailor', title: 'The Sailor Who Fell from Grace with the Sea', author: 'Yukio Mishima', authorId: 'yukio-mishima',
    country: 'Japan', place: 'Tokyo', lat: 35.6762, lng: 139.6503, language: 'Japanese', year: 1963,
    genre: 'Literary Fiction', form: 'Novella', themes: ['honour', 'cruelty', 'adolescence'],
    status: 'want', avgRating: 3.83, dateAdded: '2026-06-11', pages: 181,
    stats: { empathy: 2, thinking: 1, imagination: 1 },
    why: 'My first Mishima and my first Japanese novel on the map. Short, beautiful and reportedly brutal.',
  },
  {
    id: 'enders-game', title: "Ender's Game", series: "Ender's Saga #1", author: 'Orson Scott Card', authorId: 'orson-scott-card',
    country: 'United States', place: 'Richland, Washington', lat: 46.2857, lng: -119.2845, language: 'English', year: 1985,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['strategy', 'childhood', 'war', 'empathy'],
    status: 'want', avgRating: 4.31, dateAdded: '2026-06-11', pages: 324,
    stats: { thinking: 3, imagination: 2, empathy: 1 },
    why: 'A book about strategy and about understanding your enemy well enough to love them. Great for the thinking stat.',
  },
  {
    id: 'fahrenheit-451', title: 'Fahrenheit 451', author: 'Ray Bradbury', authorId: 'ray-bradbury',
    country: 'United States', place: 'Waukegan, Illinois', lat: 42.3636, lng: -87.8448, language: 'English', year: 1953,
    genre: 'Dystopia & Satire', form: 'Novel', themes: ['censorship', 'books', 'distraction'],
    status: 'want', avgRating: 3.97, dateAdded: '2026-06-11', pages: 194,
    stats: { thinking: 2, imagination: 2 },
    why: 'Completes the dystopia trilogy with 1984 and Brave New World. A book about why books matter.',
  },
  {
    id: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen', authorId: 'jane-austen',
    country: 'United Kingdom', place: 'Steventon, Hampshire', lat: 51.2374, lng: -1.2406, language: 'English', year: 1813,
    genre: 'Literary Fiction', form: 'Novel', themes: ['marriage', 'class', 'wit', 'first impressions'],
    status: 'want', avgRating: 4.30, dateAdded: '2026-06-11', pages: 279,
    stats: { empathy: 2, thinking: 2 },
    why: 'Oldest novel on the list and the sharpest social comedy in English. Also, the first woman author on my map.',
  },
  {
    id: 'of-mice-and-men', title: 'Of Mice and Men', author: 'John Steinbeck', authorId: 'john-steinbeck',
    country: 'United States', place: 'Salinas, California', lat: 36.6777, lng: -121.6555, language: 'English', year: 1937,
    genre: 'Literary Fiction', form: 'Novella', themes: ['friendship', 'loneliness', 'dreams'],
    status: 'want', avgRating: 3.90, dateAdded: '2026-06-11', pages: 107,
    stats: { empathy: 3 },
    why: 'Third Steinbeck. Short enough for one sitting and reportedly devastating.',
  },
  {
    id: 'art-of-war', title: 'The Art of War', author: 'Sun Tzu', authorId: 'sun-tzu',
    country: 'China', place: 'Qi (Shandong)', lat: 36.6512, lng: 117.1201, language: 'Chinese', year: -500,
    genre: 'Philosophy', form: 'Treatise', themes: ['strategy', 'conflict', 'leadership'],
    status: 'want', avgRating: 3.94, dateAdded: '2026-06-11', pages: 273,
    stats: { thinking: 3 },
    why: 'The oldest book on the list by a millennium. Strategy distilled to a few hundred lines.',
  },
  {
    id: 'little-prince', title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', authorId: 'antoine-de-saint-exupery',
    country: 'France', place: 'Lyon', lat: 45.764, lng: 4.8357, language: 'French', year: 1943,
    genre: 'Literary Fiction', form: 'Novella', themes: ['childhood', 'love', 'what is essential'],
    status: 'want', avgRating: 4.34, dateAdded: '2026-06-11', pages: 96,
    stats: { empathy: 2, imagination: 2 },
    why: 'A fable about what grown-ups forget. One evening, and it stays for life apparently.',
  },
  {
    id: 'all-quiet', title: 'All Quiet on the Western Front', author: 'Erich Maria Remarque', authorId: 'erich-maria-remarque',
    country: 'Germany', place: 'Osnabrück', lat: 52.2799, lng: 8.0472, language: 'German', year: 1929,
    genre: 'Historical & War', form: 'Novel', themes: ['WWI', 'lost generation', 'trauma'],
    status: 'want', avgRating: 4.12, dateAdded: '2026-06-11', pages: 296,
    stats: { empathy: 3, resilience: 1, thinking: 1 },
    why: 'The war novel from the losing side. A counterweight to every heroic version of WWI.',
  },
  {
    id: 'the-stranger', title: 'The Stranger', author: 'Albert Camus', authorId: 'albert-camus',
    country: 'Algeria', place: 'Dréan (Mondovi)', lat: 36.6853, lng: 7.7522, language: 'French', year: 1942,
    genre: 'Literary Fiction', form: 'Novella', themes: ['the absurd', 'indifference', 'judgement'],
    status: 'want', avgRating: 4.03, dateAdded: '2026-06-11', pages: 123,
    stats: { thinking: 3, resilience: 1 },
    why: 'Absurdism in novel form. Pairs with Kafka and Frankl on the question of meaning.',
  },
  {
    id: 'kite-runner', title: 'The Kite Runner', author: 'Khaled Hosseini', authorId: 'khaled-hosseini',
    country: 'Afghanistan', place: 'Kabul', lat: 34.5553, lng: 69.2075, language: 'English', year: 2003,
    genre: 'Literary Fiction', form: 'Novel', themes: ['guilt', 'friendship', 'Afghanistan', 'redemption'],
    status: 'want', avgRating: 4.36, dateAdded: '2026-06-11', pages: 371,
    stats: { empathy: 3, resilience: 1 },
    why: 'Guilt and redemption across decades and continents. Everyone I know who read it cried.',
  },
  {
    id: 'sula', title: 'Sula', author: 'Toni Morrison', authorId: 'toni-morrison',
    country: 'United States', place: 'Lorain, Ohio', lat: 41.4528, lng: -82.1824, language: 'English', year: 1973,
    genre: 'Literary Fiction', form: 'Novel', themes: ['friendship', 'community', 'freedom', 'women'],
    status: 'want', avgRating: 4.06, dateAdded: '2026-06-11', pages: 174,
    stats: { empathy: 3, thinking: 1 },
    why: 'Morrison on female friendship and what a town does to a woman who refuses its rules. My way into her work.',
  },
  {
    id: 'blood-of-elves', title: 'Blood of Elves', series: 'The Witcher #1', author: 'Andrzej Sapkowski', authorId: 'andrzej-sapkowski',
    country: 'Poland', place: 'Łódź', lat: 51.7592, lng: 19.456, language: 'Polish', year: 1994,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['destiny', 'monsters', 'politics'],
    status: 'want', avgRating: 4.10, dateAdded: '2026-06-11', pages: 320,
    stats: { imagination: 3, thinking: 1 },
    why: 'Slavic fantasy with moral grey everywhere. Also, a Polish author, which is close to home.',
  },
  {
    id: 'poisonwood-bible', title: 'The Poisonwood Bible', author: 'Barbara Kingsolver', authorId: 'barbara-kingsolver',
    country: 'United States', place: 'Annapolis, Maryland', lat: 38.9784, lng: -76.4922, language: 'English', year: 1998,
    genre: 'Literary Fiction', form: 'Novel', themes: ['colonialism', 'family', 'faith', 'the Congo'],
    status: 'want', avgRating: 4.12, dateAdded: '2026-06-11', pages: 546,
    stats: { empathy: 3, thinking: 2 },
    why: 'A missionary family in the Congo told by four daughters. Colonialism seen through a kitchen window.',
  },
  {
    id: 'thousand-splendid-suns', title: 'A Thousand Splendid Suns', author: 'Khaled Hosseini', authorId: 'khaled-hosseini',
    country: 'Afghanistan', place: 'Kabul', lat: 34.5553, lng: 69.2075, language: 'English', year: 2007,
    genre: 'Literary Fiction', form: 'Novel', themes: ['women', 'war', 'endurance', 'Afghanistan'],
    status: 'want', avgRating: 4.46, dateAdded: '2026-06-11', pages: 372,
    stats: { empathy: 3, resilience: 2 },
    why: 'Two women, thirty years of Afghan history. Rated even higher than The Kite Runner.',
  },
  {
    id: 'tree-grows-brooklyn', title: 'A Tree Grows in Brooklyn', author: 'Betty Smith', authorId: 'betty-smith',
    country: 'United States', place: 'Brooklyn, New York', lat: 40.6782, lng: -73.9442, language: 'English', year: 1943,
    genre: 'Literary Fiction', form: 'Novel', themes: ['poverty', 'growing up', 'reading', 'family'],
    status: 'want', avgRating: 4.31, dateAdded: '2026-06-11', pages: 496,
    stats: { empathy: 3, resilience: 2 },
    why: 'A girl who reads her way out of a tenement. A book about books and stubbornness.',
  },
  {
    id: 'cuckoos-nest', title: "One Flew Over the Cuckoo's Nest", author: 'Ken Kesey', authorId: 'ken-kesey',
    country: 'United States', place: 'La Junta, Colorado', lat: 37.985, lng: -103.5438, language: 'English', year: 1962,
    genre: 'Literary Fiction', form: 'Novel', themes: ['institutions', 'rebellion', 'sanity'],
    status: 'want', avgRating: 4.20, dateAdded: '2026-06-11', pages: 325,
    stats: { thinking: 2, empathy: 2 },
    why: 'Institutions and the people who refuse to be managed by them. Fits the Orwell and Kafka thread.',
  },
  {
    id: 'the-republic', title: 'The Republic', author: 'Plato', authorId: 'plato',
    country: 'Greece', place: 'Athens', lat: 37.9838, lng: 23.7275, language: 'Greek', year: -375,
    genre: 'Philosophy', form: 'Treatise', themes: ['justice', 'the ideal state', 'the cave'],
    status: 'want', avgRating: 3.97, dateAdded: '2026-06-11', pages: 416,
    stats: { thinking: 3 },
    why: 'The source code for Western political philosophy. The allegory of the cave in its original context.',
  },
  {
    id: 'shogun', title: 'Shōgun', series: 'Asian Saga #1', author: 'James Clavell', authorId: 'james-clavell',
    country: 'Australia', place: 'Sydney', lat: -33.8688, lng: 151.2093, language: 'English', year: 1975,
    genre: 'Historical & War', form: 'Novel', themes: ['Japan', 'culture clash', 'power', 'honour'],
    status: 'want', avgRating: 4.41, dateAdded: '2026-06-11', pages: 1152,
    stats: { thinking: 2, imagination: 2, empathy: 1 },
    why: 'Feudal Japan through a shipwrecked Englishman. Longest book on the list and a doorstop I actually want.',
  },
  {
    id: 'red-seas', title: 'Red Seas Under Red Skies', series: 'Gentleman Bastard #2', author: 'Scott Lynch', authorId: 'scott-lynch',
    country: 'United States', place: 'St. Paul, Minnesota', lat: 44.9537, lng: -93.09, language: 'English', year: 2007,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['heists', 'friendship', 'pirates'],
    status: 'want', avgRating: 4.25, dateAdded: '2026-06-11', pages: 558,
    stats: { imagination: 3 },
    why: 'Con artists and pirates. Pure fun after the heavy stuff.',
  },
  {
    id: 'overstory', title: 'The Overstory', author: 'Richard Powers', authorId: 'richard-powers',
    country: 'United States', place: 'Evanston, Illinois', lat: 42.0451, lng: -87.6877, language: 'English', year: 2018,
    genre: 'Literary Fiction', form: 'Novel', themes: ['trees', 'activism', 'time', 'ecology'],
    status: 'want', avgRating: 4.10, dateAdded: '2026-06-11', pages: 502,
    stats: { empathy: 2, thinking: 2, imagination: 1 },
    why: 'A novel that tries to make you feel time the way a tree does. The most recent Pulitzer on the list.',
  },
  {
    id: 'golden-son', title: 'Golden Son', series: 'Red Rising Saga #2', author: 'Pierce Brown', authorId: 'pierce-brown',
    country: 'United States', place: 'Denver, Colorado', lat: 39.7392, lng: -104.9903, language: 'English', year: 2015,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['rebellion', 'class', 'war'],
    status: 'want', avgRating: 4.51, dateAdded: '2026-06-11', pages: 442,
    stats: { imagination: 3, thinking: 1 },
    why: 'The sequel everyone says is better than the first. Queued behind Red Rising.',
  },
  {
    id: 'red-rising', title: 'Red Rising', series: 'Red Rising Saga #1', author: 'Pierce Brown', authorId: 'pierce-brown',
    country: 'United States', place: 'Denver, Colorado', lat: 39.7392, lng: -104.9903, language: 'English', year: 2014,
    genre: 'Fantasy & Sci-Fi', form: 'Novel', themes: ['rebellion', 'class', 'Mars'],
    status: 'want', avgRating: 4.27, dateAdded: '2026-06-11', pages: 382,
    stats: { imagination: 3, thinking: 1 },
    why: 'A class system on Mars and a miner who infiltrates the elite. Fast, angry sci-fi.',
  },
  {
    id: 'night', title: 'Night', author: 'Elie Wiesel', authorId: 'elie-wiesel',
    country: 'Romania', place: 'Sighet', lat: 47.9286, lng: 23.8878, language: 'French', year: 1956,
    genre: 'Memoir & Biography', form: 'Memoir', themes: ['the Holocaust', 'faith', 'father and son'],
    status: 'want', avgRating: 4.38, dateAdded: '2026-06-24', pages: 120,
    stats: { empathy: 3, resilience: 2 },
    why: 'Frankl gave me the meaning; Wiesel gives the witness. Short, and necessary.',
  },
  {
    id: 'unbroken', title: 'Unbroken', author: 'Laura Hillenbrand', authorId: 'laura-hillenbrand',
    country: 'United States', place: 'Fairfax, Virginia', lat: 38.8462, lng: -77.3064, language: 'English', year: 2010,
    genre: 'Memoir & Biography', form: 'Memoir', themes: ['WWII', 'survival', 'forgiveness'],
    status: 'want', avgRating: 4.39, dateAdded: '2026-06-24', pages: 473,
    stats: { resilience: 3, empathy: 1 },
    why: 'An Olympic runner, a plane crash, a raft, a prison camp, and forgiveness afterwards. Resilience in its rawest form.',
  },
  {
    id: 'almond', title: 'Almond', author: 'Sohn Won-pyung', authorId: 'sohn-won-pyung',
    country: 'South Korea', place: 'Seoul', lat: 37.5665, lng: 126.978, language: 'Korean', year: 2017,
    genre: 'Literary Fiction', form: 'Novel', themes: ['empathy', 'emotion', 'friendship', 'adolescence'],
    status: 'want', avgRating: 4.13, dateAdded: '2026-08-13', pages: 272,
    stats: { empathy: 3 },
    why: 'A boy who cannot feel emotions learns empathy from the outside in. Literally a book about the empathy stat.',
  },
]
