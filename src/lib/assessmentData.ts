export interface SpeechQuestion {
  id: string;
  type: "sentence-reading" | "word-reading" | "listen-repeat";
  text: string;
  expectedText: string;
}

export interface Topic {
  id: string;
  text: string;
}

export interface GrammarQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ListeningQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ListeningPassage {
  id: string;
  title: string;
  content: string; // The script read by TTS
  questions: ListeningQuestion[];
}

export const sectionAQuestions: SpeechQuestion[] = [
  // Sentence Reading (1-10)
  {
    id: "A1",
    type: "sentence-reading",
    text: "Last year, the best author received a cash prize and a trophy.",
    expectedText: "Last year, the best author received a cash prize and a trophy."
  },
  {
    id: "A2",
    type: "sentence-reading",
    text: "After his retirement, his decision is to immediately satisfy his ardent desire of becoming a navigator.",
    expectedText: "After his retirement, his decision is to immediately satisfy his ardent desire of becoming a navigator."
  },
  {
    id: "A3",
    type: "sentence-reading",
    text: "Her exposure to different cultures during her travels broadened her perspective on the world and sparked a newfound passion for painting. With zeal, she joined art classes to refine her skills and push the boundaries of her creativity.",
    expectedText: "Her exposure to different cultures during her travels broadened her perspective on the world and sparked a newfound passion for painting. With zeal, she joined art classes to refine her skills and push the boundaries of her creativity."
  },
  {
    id: "A4",
    type: "sentence-reading",
    text: "The mysterious artifact was discovered deep within the ancient temple ruins by an adventurous archaeologist.",
    expectedText: "The mysterious artifact was discovered deep within the ancient temple ruins by an adventurous archaeologist."
  },
  {
    id: "A5",
    type: "sentence-reading",
    text: "Environmental sustainability has become a critical focus for modern industries striving to reduce carbon emissions.",
    expectedText: "Environmental sustainability has become a critical focus for modern industries striving to reduce carbon emissions."
  },
  {
    id: "A6",
    type: "sentence-reading",
    text: "Optimism is a key trait that helps individuals navigate through challenging times with resilience and hope.",
    expectedText: "Optimism is a key trait that helps individuals navigate through challenging times with resilience and hope."
  },
  {
    id: "A7",
    type: "sentence-reading",
    text: "Scientific breakthroughs in medicine have significantly increased the life expectancy of global populations.",
    expectedText: "Scientific breakthroughs in medicine have significantly increased the life expectancy of global populations."
  },
  {
    id: "A8",
    type: "sentence-reading",
    text: "The orchestra delivered a spectacular performance that left the audience spellbound and cheering for an encore.",
    expectedText: "The orchestra delivered a spectacular performance that left the audience spellbound and cheering for an encore."
  },
  {
    id: "A9",
    type: "sentence-reading",
    text: "Effective communication is the foundation of healthy personal relationships and successful business collaborations.",
    expectedText: "Effective communication is the foundation of healthy personal relationships and successful business collaborations."
  },
  {
    id: "A10",
    type: "sentence-reading",
    text: "Exploring the deep oceans reveals a fascinating world of unique creatures that adapt to extreme pressures.",
    expectedText: "Exploring the deep oceans reveals a fascinating world of unique creatures that adapt to extreme pressures."
  },
  // Word Reading (11-15)
  {
    id: "A11",
    type: "word-reading",
    text: "Sphere, van, puffy, valuable, graphic, available, hyphen, viral",
    expectedText: "Sphere, van, puffy, valuable, graphic, available, hyphen, viral"
  },
  {
    id: "A12",
    type: "word-reading",
    text: "Civil, pharmacy, avoid, suffer, convince, phobia, clever, safari",
    expectedText: "Civil, pharmacy, avoid, suffer, convince, phobia, clever, safari"
  },
  {
    id: "A13",
    type: "word-reading",
    text: "Revision, bend, set, division, usual, vision.",
    expectedText: "Revision, bend, set, division, usual, vision."
  },
  {
    id: "A14",
    type: "word-reading",
    text: "Aesthetic, chaotic, rhythm, subtle, visual, dynamic, design, preview",
    expectedText: "Aesthetic, chaotic, rhythm, subtle, visual, dynamic, design, preview"
  },
  {
    id: "A15",
    type: "word-reading",
    text: "Generate, assess, whisper, llama, artificial, intelligence, prompt, model",
    expectedText: "Generate, assess, whisper, llama, artificial, intelligence, prompt, model"
  },
  // Listen and Repeat (16-23 - Statements are NOT visible, TTS reads them, user repeats)
  {
    id: "A16",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "Please close the door when you leave the classroom."
  },
  {
    id: "A17",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "The train will arrive at platform three in approximately five minutes."
  },
  {
    id: "A18",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "Would you mind helping me carry these books to the library?"
  },
  {
    id: "A19",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "The company plans to launch its new product line next month."
  },
  {
    id: "A20",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "It is important to wear a helmet while riding a bicycle on the main road."
  },
  {
    id: "A21",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "She decided to take a short walk to clear her mind after the long meeting."
  },
  {
    id: "A22",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "Can you tell me where the nearest post office is located?"
  },
  {
    id: "A23",
    type: "listen-repeat",
    text: "[Audio statement played. Listen and repeat.]",
    expectedText: "Success is not final, failure is not fatal: it is the courage to continue that counts."
  }
];

export const sectionBTopics: Topic[] = [
  { id: "B1", text: "Should students be allowed to drop subjects they are not interested in? Give reasons for your answer." },
  { id: "B2", text: "Describe a dish that you like." },
  { id: "B3", text: "Talk about a time you had to stay away from home for a few days and share your experience." },
  { id: "B4", text: "Describe an unforgettable scene from one of your favourite movies." },
  { id: "B5", text: "What are some ways in which schools and parents can keep a check on peer pressure and bullying?" },
  { id: "B6", text: "Talk about a movie you watched recently." },
  { id: "B7", text: "Talk about a modern invention you are thankful for and explain why." },
  { id: "B8", text: "If you could live the life of a famous personality, who would you choose? Give reasons for your answer." },
  { id: "B9", text: "Explain how social media influences people to buy things they don't need. Give examples and reasons." },
  { id: "B10", text: "Describe either a sport or a craft you want to learn." },
  { id: "B11", text: "What is your opinion on the growing disconnect between different generations in society?" },
  { id: "B12", text: "Talk about your favourite thing to do on holiday." },
  { id: "B13", text: "Talk about a memorable day spent with your family." },
  { id: "B14", text: "Talk about a time when you were pleased with the customer service you received." },
  { id: "B15", text: "What would motivate people to work harder — recognition or financial rewards? Give reasons for your answer." },
  { id: "B16", text: "Talk about things you like to do at a shopping mall." },
  { id: "B17", text: "Talk about a time you tried something new that scared you." },
  { id: "B18", text: "What can we do to build strong and impactful interpersonal relationships in our lives?" },
  { id: "B19", text: "Describe your favourite free-time activity when you were younger." },
  { id: "B20", text: "Talk about the last time you felt grateful for something that someone did for you." }
];

export const sectionCQuestions: GrammarQuestion[] = [
  // Subject-Verb Agreement (1-8)
  {
    id: 1,
    category: "Subject, verb",
    question: "Neither of the candidates ______ qualified for the position.",
    options: ["is", "are", "were", "have"],
    correctAnswer: 0
  },
  {
    id: 2,
    category: "Subject, verb",
    question: "The group of students ______ planning a field trip.",
    options: ["is", "are", "have", "were"],
    correctAnswer: 0
  },
  {
    id: 3,
    category: "Subject, verb",
    question: "Bread and butter ______ our daily food.",
    options: ["is", "are", "were", "have"],
    correctAnswer: 0
  },
  {
    id: 4,
    category: "Subject, verb",
    question: "Every book and magazine ______ been cataloged.",
    options: ["has", "have", "are", "were"],
    correctAnswer: 0
  },
  {
    id: 5,
    category: "Subject, verb",
    question: "Physics ______ my favorite subject in school.",
    options: ["is", "are", "were", "have"],
    correctAnswer: 0
  },
  {
    id: 6,
    category: "Subject, verb",
    question: "Either the supervisor or the employees ______ responsible for this shift.",
    options: ["is", "are", "was", "has"],
    correctAnswer: 1
  },
  {
    id: 7,
    category: "Subject, verb",
    question: "A number of workers ______ absent today.",
    options: ["is", "are", "was", "has"],
    correctAnswer: 1
  },
  {
    id: 8,
    category: "Subject, verb",
    question: "The captain, along with his crew members, ______ praised for the bravery.",
    options: ["was", "were", "are", "have"],
    correctAnswer: 0
  },
  // Tense (9-16)
  {
    id: 9,
    category: "Tense - Fill in the blanks",
    question: "By the time we arrived, the movie ______.",
    options: ["already started", "had already started", "has already started", "would start"],
    correctAnswer: 1
  },
  {
    id: 10,
    category: "Tense - Fill in the blanks",
    question: "She ______ English for five years before she moved to London.",
    options: ["studied", "has been studying", "had been studying", "was studying"],
    correctAnswer: 2
  },
  {
    id: 11,
    category: "Tense - Fill in the blanks",
    question: "I will call you when I ______ my work.",
    options: ["finish", "will finish", "finished", "am finishing"],
    correctAnswer: 0
  },
  {
    id: 12,
    category: "Tense - Fill in the blanks",
    question: "Water ______ at 100 degrees Celsius.",
    options: ["boil", "boils", "is boiling", "has boiled"],
    correctAnswer: 1
  },
  {
    id: 13,
    category: "Tense - Fill in the blanks",
    question: "Next year, they ______ married for twenty-five years.",
    options: ["will be", "will have been", "are", "have been"],
    correctAnswer: 1
  },
  {
    id: 14,
    category: "Tense - Fill in the blanks",
    question: "While they ______ soccer, it started to rain.",
    options: ["played", "were playing", "had played", "are playing"],
    correctAnswer: 1
  },
  {
    id: 15,
    category: "Tense - Fill in the blanks",
    question: "The train ______ at 9:00 PM tonight.",
    options: ["leaves", "will be left", "has left", "would leave"],
    correctAnswer: 0
  },
  {
    id: 16,
    category: "Tense - Fill in the blanks",
    question: "I wish I ______ how to speak French.",
    options: ["know", "knew", "known", "have known"],
    correctAnswer: 1
  },
  // Articles (17-22)
  {
    id: 17,
    category: "Articles",
    question: "She wants to buy ______ expensive car.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: 1
  },
  {
    id: 18,
    category: "Articles",
    question: "He is ______ honest man.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: 1
  },
  {
    id: 19,
    category: "Articles",
    question: "______ Amazon is the longest river in South America.",
    options: ["A", "An", "The", "no article"],
    correctAnswer: 2
  },
  {
    id: 20,
    category: "Articles",
    question: "I love listening to ______ classical music.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: 3
  },
  {
    id: 21,
    category: "Articles",
    question: "She is ______ tallest girl in our class.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: 2
  },
  {
    id: 22,
    category: "Articles",
    question: "We traveled to ______ USA last summer.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: 2
  },
  // Prepositions (23-28)
  {
    id: 23,
    category: "Prepositions",
    question: "The key is ______ the table.",
    options: ["on", "in", "at", "with"],
    correctAnswer: 0
  },
  {
    id: 24,
    category: "Prepositions",
    question: "She is good ______ playing the piano.",
    options: ["at", "in", "on", "with"],
    correctAnswer: 0
  },
  {
    id: 25,
    category: "Prepositions",
    question: "He has been living here ______ 2015.",
    options: ["since", "for", "from", "in"],
    correctAnswer: 0
  },
  {
    id: 26,
    category: "Prepositions",
    question: "We walked ______ the park to get to the library.",
    options: ["through", "at", "in", "on"],
    correctAnswer: 0
  },
  {
    id: 27,
    category: "Prepositions",
    question: "I am looking forward ______ meeting you.",
    options: ["to", "for", "at", "in"],
    correctAnswer: 0
  },
  {
    id: 28,
    category: "Prepositions",
    question: "Divide the apple ______ the four children.",
    options: ["between", "among", "with", "through"],
    correctAnswer: 1
  },
  // Voice (29-31)
  {
    id: 29,
    category: "Voice",
    question: "Identify the passive form of: 'The chef prepared a delicious meal.'",
    options: [
      "A delicious meal was prepared by the chef.",
      "A delicious meal is prepared by the chef.",
      "A delicious meal has been prepared by the chef.",
      "A delicious meal prepares the chef."
    ],
    correctAnswer: 0
  },
  {
    id: 30,
    category: "Voice",
    question: "Identify the active form of: 'The novel was written by Gabriel.'",
    options: [
      "Gabriel wrote the novel.",
      "Gabriel writes the novel.",
      "Gabriel had written the novel.",
      "Gabriel is writing the novel."
    ],
    correctAnswer: 0
  },
  {
    id: 31,
    category: "Voice",
    question: "Change to passive voice: 'People speak English all over the world.'",
    options: [
      "English is spoken all over the world.",
      "English was spoken all over the world.",
      "English is speaking all over the world.",
      "English speaks all over the world."
    ],
    correctAnswer: 0
  },
  // Grammatically Correcting Sentence (32-34)
  {
    id: 32,
    category: "Grammatically Correcting Sentence",
    question: "Choose the grammatically correct sentence:",
    options: [
      "She don't know the answer.",
      "She doesn't know the answer.",
      "She doesn't knows the answer.",
      "She not know the answer."
    ],
    correctAnswer: 1
  },
  {
    id: 33,
    category: "Grammatically Correcting Sentence",
    question: "Choose the grammatically correct sentence:",
    options: [
      "Between you and I, this is a secret.",
      "Between you and me, this is a secret.",
      "Between we, this is a secret.",
      "Between us and they, this is a secret."
    ],
    correctAnswer: 1
  },
  {
    id: 34,
    category: "Grammatically Correcting Sentence",
    question: "Choose the grammatically correct sentence:",
    options: [
      "Having finished his homework, the television was turned on.",
      "Having finished his homework, he turned on the television.",
      "He turned on the television having finished his homework.",
      "His homework being finished, the television turned on."
    ],
    correctAnswer: 1
  }
];

export const sectionDPassages: ListeningPassage[] = [
  {
    id: "D1",
    title: "Passage 1: The Library Project",
    content: "The university library is undergoing a major renovation project. Starting next Monday, the second floor will be closed to the public for three weeks. Students can access digital databases online, and study tables will be temporarily relocated to the student center. The project is expected to be completed before the final exams begin in September.",
    questions: [
      {
        id: 1,
        question: "When will the second floor close?",
        options: ["Next Monday", "Next Friday", "In three weeks", "Before final exams"],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "Where will the study tables be relocated?",
        options: ["Main lobby", "Computer lab", "Student center", "Library basement"],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "When is the project expected to be completed?",
        options: ["In three weeks", "Before final exams in September", "Next Monday", "By next year"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "D2",
    title: "Passage 2: The Weather Forecast",
    content: "Good morning! Here is your local weather update. Today, we expect clear skies in the morning, followed by scattered showers in the afternoon. Winds will blow from the northeast at fifteen miles per hour. Tomorrow will be much cooler with temperatures dropping to sixty degrees Fahrenheit. We recommend carrying an umbrella if you plan to go out after lunch.",
    questions: [
      {
        id: 4,
        question: "What weather is expected in the afternoon?",
        options: ["Clear skies", "Scattered showers", "Heavy snowfall", "Strong thunderstorms"],
        correctAnswer: 1
      },
      {
        id: 5,
        question: "What direction will the wind blow from?",
        options: ["Northeast", "Southwest", "Northwest", "Southeast"],
        correctAnswer: 0
      },
      {
        id: 6,
        question: "What is the recommended item to carry after lunch?",
        options: ["A jacket", "Sunglasses", "An umbrella", "A water bottle"],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "D3",
    title: "Passage 3: Business Quarterly Review",
    content: "Our sales performance for the second quarter has exceeded expectations, showing an increase of twelve percent compared to the first quarter. This growth was primarily driven by our new software subscription service, which attracted over five thousand new users. However, operational expenses also rose by four percent due to hiring extra support staff. In the third quarter, we plan to focus on expanding our marketing campaigns in Europe.",
    questions: [
      {
        id: 7,
        question: "By how much did the sales performance increase compared to the first quarter?",
        options: ["Four percent", "Twelve percent", "Ten percent", "Five percent"],
        correctAnswer: 1
      },
      {
        id: 8,
        question: "What primarily drove the sales growth?",
        options: ["New software subscription service", "Europe expansion", "Decreased operational expenses", "European marketing"],
        correctAnswer: 0
      },
      {
        id: 9,
        question: "Where does the company plan to expand marketing campaigns in the third quarter?",
        options: ["Europe", "North America", "Asia", "South America"],
        correctAnswer: 0
      }
    ]
  },
  {
    id: "D4",
    title: "Passage 4: Cooking Class Instructions",
    content: "Welcome to our Italian cooking workshop! Today, we are preparing a classic marinara sauce. First, heat three tablespoons of olive oil in a pan over medium heat. Add crushed garlic and sauté until it turns golden brown. Then, pour in the crushed tomatoes and add a pinch of salt and fresh basil leaves. Let the mixture simmer for twenty minutes, stirring occasionally, until it thickens.",
    questions: [
      {
        id: 10,
        question: "What are they preparing today?",
        options: ["Alfredo sauce", "Classic marinara sauce", "Garlic bread", "Basil pasta"],
        correctAnswer: 1
      },
      {
        id: 11,
        question: "How long should the mixture simmer?",
        options: ["Ten minutes", "Five minutes", "Twenty minutes", "Thirty minutes"],
        correctAnswer: 2
      },
      {
        id: 12,
        question: "What ingredients are added right after the tomatoes?",
        options: ["Crushed garlic", "Olive oil and garlic", "Black pepper", "Salt and fresh basil leaves"],
        correctAnswer: 3
      }
    ]
  }
];
