export interface PersuasiveConnector {
  phrase: string;
  category: "Rebuttal" | "Evidence" | "Concession" | "Emphasis" | "Questioning" | "Personal";
  meaning: string;
  example: string;
}

export interface DebateTopic {
  id: string;
  title: string;
  category: string;
  emoji: string;
  description: string;
  proStance: string;
  conStance: string;
  starterArguments: {
    pro: string[];
    con: string[];
  };
  sampleRebuttals?: {
    proTutor: string[]; // when tutor is PRO and user is CON
    conTutor: string[]; // when tutor is CON and user is PRO
  };
  keyVocabulary: Array<{
    word: string;
    meaning: string;
    ipa?: string;
  }>;
}

export const PERSUASIVE_CONNECTORS: PersuasiveConnector[] = [
  {
    phrase: "To be fair...",
    category: "Concession",
    meaning: "Para ser justos / Siendo honestos... (reconoce el punto con simpatía)",
    example: "To be fair, pizza with pineapple is an incredible sweet and salty combination.",
  },
  {
    phrase: "At the end of the day...",
    category: "Emphasis",
    meaning: "Al fin y al cabo / Al final del día...",
    example: "At the end of the day, comfort and good company matter more than luxury.",
  },
  {
    phrase: "You have to admit that...",
    category: "Evidence",
    meaning: "Tienes que admitir que... (invita al acuerdo)",
    example: "You have to admit that dogs give you an unconditional welcome when you arrive home.",
  },
  {
    phrase: "While I see your point, don't forget that...",
    category: "Concession",
    meaning: "Aunque entiendo tu punto, no olvides que...",
    example: "While I see your point, don't forget that movies cannot fit all 500 pages of the book.",
  },
  {
    phrase: "On the flip side, what about...",
    category: "Rebuttal",
    meaning: "Por otra parte / Mirándolo del otro lado, ¿qué hay de...?",
    example: "On the flip side, what about the cozy vibe of drinking hot tea on a rainy afternoon?",
  },
  {
    phrase: "Let's be completely honest...",
    category: "Emphasis",
    meaning: "Seamos totalmente sinceros...",
    example: "Let's be completely honest, nobody likes having to wake up at 5:00 AM on a cold Monday.",
  },
  {
    phrase: "From my own experience...",
    category: "Personal",
    meaning: "Por mi propia experiencia / En lo personal...",
    example: "From my own experience, streaming on the couch with popcorn is 10 times more relaxing.",
  },
  {
    phrase: "Without a doubt, nothing beats...",
    category: "Emphasis",
    meaning: "Sin duda alguna, nada supera a...",
    example: "Without a doubt, nothing beats listening to the sound of ocean waves on a warm sunny beach.",
  },
];

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: "pineapple-pizza",
    title: "Pineapple on Pizza 🍍🍕",
    category: "Comida & Sabores",
    emoji: "🍕",
    description: "¿La piña en la pizza es una delicia genial o un crimen culinario?",
    proStance: "Pineapple on pizza is a delicious, sweet-and-savory masterpiece.",
    conStance: "Fruit does not belong on pizza; it ruins the crust and classic Italian flavor.",
    starterArguments: {
      pro: [
        "The sweet acidity of warm pineapple pairs harmoniously with salty bacon and melted cheese.",
        "Hawaiian pizza is enjoyed by millions worldwide because contrasting flavors make food exciting.",
      ],
      con: [
        "Warm pineapple releases excess juice that makes the dough soggy and overly sweet.",
        "Traditional pizza is savory and savory toppings like garlic, mushrooms, and herbs shouldn't compete with sugary fruit.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "Hold on! If you want dessert, eat fruit salad. Why ruin a crispy, golden pizza crust with watery fruit juice?",
        "To be fair, traditional Italian cuisine has centuries of culinary wisdom, and warm pineapple violates that balance!",
        "Let's be real: when you bite into savory melted mozzarella, expecting salty pepperoni, sugary pineapple is a shock to the palate!",
      ],
      proTutor: [
        "Come on! Sweet and savory pairings exist in almost every great cuisine, like sweet chili chicken or cheese with honey!",
        "You have to admit that the slight tanginess of pineapple cuts through rich, oily cheese and makes it feel refreshing.",
        "Millions of pizza lovers order Hawaiian every single day. If it were truly bad, pizzerias would have stopped selling it decades ago!",
      ],
    },
    keyVocabulary: [
      { word: "sweet and savory", meaning: "Agridulce (combinación dulce y salada)", ipa: "/swiːt ənd ˈseɪ.vɚ.i/" },
      { word: "soggy crust", meaning: "Masa aguada / blanda", ipa: "/ˈsɑː.ɡi krʌst/" },
      { word: "culinary masterpiece", meaning: "Obra maestra gastronómica", ipa: "/ˈkʌl.ə.ner.i ˈmæs.tɚ.piːs/" },
    ],
  },
  {
    id: "cats-vs-dogs",
    title: "Cats vs Dogs: Supreme Pet 🐾",
    category: "Mascotas & Animales",
    emoji: "🐱",
    description: "¿Quién es el compañero definitivo: la lealtad perruna o la elegancia felina?",
    proStance: "Dogs are the supreme companion: loyal, joyful, and always eager to play.",
    conStance: "Cats are the ultimate pet: clean, peaceful, independent, and purr with calm affection.",
    starterArguments: {
      pro: [
        "Dogs give you pure unconditional love, greet you excitedly at the door, and motivate you to exercise.",
        "Dogs are protective, highly trainable, and build an emotional bond that feels like family.",
      ],
      con: [
        "Cats are low-maintenance, groom themselves, and never require walking outside in freezing rain.",
        "A cat's gentle purr is scientifically proven to reduce human stress and blood pressure.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "While dogs are cute, let's be honest: who wants to pick up waste in the freezing rain at 6:00 AM? Cats are quiet and self-sufficient!",
        "Dogs can be overwhelming and noisy with loud barking. A peaceful purring cat on your lap is pure zen!",
        "Cats respect personal space. When a cat chooses to sit next to you, you know you've earned genuine love!",
      ],
      proTutor: [
        "Sure cats are independent, but dogs actually celebrate your existence every single time you walk through the door!",
        "You can take dogs on beach adventures, mountain hikes, and jogging sessions. Try taking a cat for a 5k run!",
        "Dogs have formed a unique biological bond with humans for thousands of years. They are truly humanity's best friend.",
      ],
    },
    keyVocabulary: [
      { word: "unconditional loyalty", meaning: "Lealtad incondicional", ipa: "/ˌʌn.kənˈdɪʃ.ən.əl ˈlɔɪ.əl.t̬i/" },
      { word: "low-maintenance", meaning: "De poco cuidado / fácil de mantener", ipa: "/loʊ ˈmeɪn.tən.əns/" },
      { word: "soothing purr", meaning: "Ronroneo relajante", ipa: "/ˈsuː.ðɪŋ pɝː/" },
    ],
  },
  {
    id: "cinema-vs-couch",
    title: "Cinema Theatre vs Home Streaming 🍿",
    category: "Cine & Entretenimiento",
    emoji: "🎬",
    description: "¿Es mejor la magia de la gran pantalla o la comodidad de ver películas en pijama en el sofá?",
    proStance: "The big screen, booming sound, and shared crowd laughter make cinema an unforgettable experience.",
    conStance: "Streaming from home is far superior: pause whenever you want, wear pajamas, and eat cheap snacks.",
    starterArguments: {
      pro: [
        "Cinemas offer gigantic IMAX screens and Dolby Atmos sound that no living room can replicate.",
        "Going to the movies is a special social event that forces you to put your phone away and focus on the story.",
      ],
      con: [
        "At home, you can pause to use the bathroom, turn on subtitles, and avoid paying $15 for popcorn.",
        "You don't have to deal with noisy strangers talking, kicking your seat, or bright phone screens in the dark.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "Be that as it may, ticket and snack prices have become ridiculous! Why pay $30 when you can relax in comfy clothes on your sofa?",
        "Have you ever had someone tall sit right in front of you or someone talk during the movie climax? Home streaming has zero distractions!",
        "With modern 4K OLED TVs and high-quality soundbars, living rooms provide 90% of the cinema quality with 100% more comfort!",
      ],
      proTutor: [
        "Nothing compares to the collective gasp or roar of laughter in a crowded theatre during a blockbuster premiere!",
        "At home, people constantly check notifications, pause every 10 minutes, and lose all emotional immersion in the story.",
        "Great directors like Christopher Nolan film specifically for massive IMAX screens. Watching on a laptop doesn't do art justice!",
      ],
    },
    keyVocabulary: [
      { word: "immersive atmosphere", meaning: "Atmósfera inmersiva y envolvente", ipa: "/ɪˈmɝː.sɪv ˈæt.məs.fɪr/" },
      { word: "couch potato comfort", meaning: "Comodidad relajada en el sofá", ipa: "/kaʊtʃ pəˈteɪ.toʊ/" },
      { word: "blockbuster premiere", meaning: "Estreno de película taquillera", ipa: "/ˈblɑːkˌbʌs.tɚ/" },
    ],
  },
  {
    id: "coffee-vs-tea",
    title: "Coffee vs Tea: The Morning Fuel ☕",
    category: "Estilo de Vida & Hábitos",
    emoji: "☕",
    description: "¿Qué bebida reina en el desayuno: el aroma intenso del café o la serenidad herbal del té?",
    proStance: "Coffee is the supreme morning ritual: rich aroma, instant focus boost, and heavenly flavor.",
    conStance: "Tea is the healthier, refined choice: smooth sustained energy without jitters or sudden crashes.",
    starterArguments: {
      pro: [
        "The rich roasted aroma of espresso instantly wakes up the brain and fuels high productivity.",
        "Coffee culture with artisanal cappuccinos, lattes, and cold brews is unmatched in craft and variety.",
      ],
      con: [
        "Tea provides L-Theanine, giving you laser focus without anxiety, heart palpitations, or afternoon crashes.",
        "With thousands of varieties like green tea, Earl Grey, chamomile, and matcha, tea is gentle on the stomach.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "Coffee might give a quick kick, but what about the 3:00 PM energy crash? Green tea gives smooth, clean energy all day!",
        "Coffee is acidic and often upsets people's stomachs. Tea is soothing, full of gentle antioxidants, and promotes calm focus.",
        "Tea ceremonies have over four thousand years of mindfulness and heritage. It's an art of living, not just a caffeine rush!",
      ],
      proTutor: [
        "Let's be real: when you have a 9:00 AM meeting and zero sleep, a cup of chamomile tea isn't going to save your workday!",
        "The aroma of freshly ground coffee beans brewing in the morning is scientifically proven to boost positive mood instantly.",
        "From flat whites to iced caramel macchiatos, coffee offers bold, complex flavors that hot flavored water simply cannot match!",
      ],
    },
    keyVocabulary: [
      { word: "caffeine kick", meaning: "Golpe de energía de la cafeína", ipa: "/ˈkæf.iːn kɪk/" },
      { word: "jitter-free energy", meaning: "Energía suave sin temblores ni nervios", ipa: "/ˈdʒɪt̬.ɚ friː/" },
      { word: "artisanal roast", meaning: "Tueste artesanal de café", ipa: "/ɑːrˈtɪz.ən.əl roʊst/" },
    ],
  },
  {
    id: "beach-vs-mountain",
    title: "Sunny Beach vs Snowy Mountain Cabin 🏖️❄️",
    category: "Viajes & Vacaciones",
    emoji: "🏖️",
    description: "¿Vacaciones ideales: brisa marina y arena caliente o chimenea y nieve en las montañas?",
    proStance: "Sunny tropical beaches with turquoise water and cool drinks are the ultimate escape.",
    conStance: "A cozy mountain wooden cabin with a fireplace, crisp fresh air, and hot chocolate is paradise.",
    starterArguments: {
      pro: [
        "Warm ocean breezes, sunbathing, swimming in crystal water, and golden sunsets recharge your soul.",
        "Beach vacations allow you to wear sandals, swim, play volleyball, and enjoy vibrant seaside nightlife.",
      ],
      con: [
        "Mountain cabins offer complete silence, starry skies, crackling fires, and peaceful snowy pine forests.",
        "At the beach, sticky sand gets into everything, while mountains give you fresh pine scent and cozy sweaters.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "Sure the beach sounds nice until sunburn hurts your shoulders and sand gets trapped inside your car and shoes for weeks!",
        "There is nothing on Earth as magical as drinking hot spiced cider while sitting by a real fireplace watching snow fall softly.",
        "Mountains provide peaceful hiking trails, majestic peaks, and crisp air that clears your mind away from noisy tourist crowds.",
      ],
      proTutor: [
        "Who wants to freeze in three layers of heavy winter clothes on vacation? Vitamin D and warm sun make people genuinely happy!",
        "Swimming in warm ocean water and sipping a chilled coconut while listening to tropical music is the definition of relaxation.",
        "Beach sunsets painting the whole sky pink and orange are 10 times more spectacular than freezing cold wind on a mountain!",
      ],
    },
    keyVocabulary: [
      { word: "sun-drenched beach", meaning: "Playa bañada por el sol", ipa: "/sʌn drentʃt/" },
      { word: "crackling fireplace", meaning: "Chimenea crepitante", ipa: "/ˈkræk.lɪŋ ˈfaɪr.pleɪs/" },
      { word: "breathtaking scenery", meaning: "Paisaje que quita el aliento", ipa: "/ˈbreθˌteɪ.kɪŋ/" },
    ],
  },
  {
    id: "early-bird-night-owl",
    title: "Early Bird vs Night Owl 🌅🦉",
    category: "Hábitos & Vida Diaria",
    emoji: "🌅",
    description: "¿Cuándo se vive mejor: aprovechando el amanecer o disfrutando la magia creativa de la noche?",
    proStance: "Waking up early gives peaceful mornings, glowing energy, sunshine, and peak productive focus.",
    conStance: "Night owls experience deep creative flow, magical quiet hours, and vibrant nightlife.",
    starterArguments: {
      pro: [
        "Early risers enjoy peaceful hours before the world wakes up, see the sunrise, and start the day ahead of everyone.",
        "Morning sunlight aligns with our natural circadian rhythm, improving deep sleep quality and physical energy.",
      ],
      con: [
        "The quiet hours past midnight offer zero notifications, no distractions, and ideal focus for creative thinkers.",
        "Nighttime is when live concerts, dinner dates, stargazing, and great social memories happen.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "Early mornings are cold and stressful with alarms ringing! At 1:00 AM, the world is quiet and your creativity is at its absolute peak.",
        "Night owls have the freedom to enjoy movies, night markets, and deep conversations with friends without checking the clock.",
        "Many of history's greatest writers, artists, and musicians produced their masterpieces in the mystical silence of midnight!",
      ],
      proTutor: [
        "When you wake up early, you finish your workouts and top tasks before noon, leaving the entire afternoon free to relax!",
        "Staying up late often turns into mindless social media scrolling. Morning people get real sun and feel energized all day.",
        "Society, businesses, and sunny outdoor activities run on daytime schedules. Early birds get the best of the world!",
      ],
    },
    keyVocabulary: [
      { word: "early riser", meaning: "Madrugador / persona que despierta temprano", ipa: "/ˈɝː.li ˈraɪ.zɚ/" },
      { word: "midnight creative flow", meaning: "Inspiración creativa de medianoche", ipa: "/ˈmɪd.naɪt kriˈeɪ.t̬ɪv/" },
      { word: "peaceful dawn", meaning: "Amanecer apacible", ipa: "/ˈpiːs.fəl dɑːn/" },
    ],
  },
  {
    id: "book-vs-movie",
    title: "Reading the Book vs Watching the Movie 📚🎬",
    category: "Cultura & Imaginación",
    emoji: "📖",
    description: "¿Es el libro siempre superior a su adaptación cinematográfica?",
    proStance: "Books allow boundless imagination, detailed character thoughts, and deep storytelling.",
    conStance: "Movies bring stories alive with stunning visuals, epic soundtracks, and powerful acting in just 2 hours.",
    starterArguments: {
      pro: [
        "In a book, your mind paints the world with limitless imagination, discovering secrets films skip for time.",
        "You truly understand a character's inner monologue, emotions, and subtle psychological growth.",
      ],
      con: [
        "Films combine breathtaking cinematography, emotional acting, and orchestral scores to create instant goosebumps.",
        "Not everyone has 20 hours to finish a 700-page book when a movie delivers the full emotional climax in 120 minutes.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "While books are detailed, can words on paper give you goosebumps the way a Hans Zimmer movie soundtrack does?",
        "Watching a brilliant actor deliver an iconic line with tears in their eyes captures emotional depth faster than 50 pages of text!",
        "Movies are a shared experience you can enjoy with friends and family on a Friday night, unlike solitary reading!",
      ],
      proTutor: [
        "Movies almost always cut out the best secondary characters and alter the ending just to fit a short Hollywood runtime!",
        "In your imagination, the castle and magical creatures look exactly as spectacular as you dream, not like cheap CGI!",
        "Reading exercises empathy and vocabulary. Once you've read the rich novel, the movie almost always feels rushed.",
      ],
    },
    keyVocabulary: [
      { word: "inner monologue", meaning: "Monólogo interior del personaje", ipa: "/ˈɪn.ɚ ˈmɑː.nə.lɑːɡ/" },
      { word: "breathtaking visual", meaning: "Efecto visual deslumbrante", ipa: "/ˈbreθˌteɪ.kɪŋ ˈvɪʒ.u.əl/" },
      { word: "unabridged story", meaning: "Historia completa sin recortes", ipa: "/ˌʌn.əˈbrɪdʒd/" },
    ],
  },
  {
    id: "texting-vs-calling",
    title: "Text Messages vs Phone Calls / Voice Notes 📱🗣️",
    category: "Comunicación & Amistad",
    emoji: "📱",
    description: "¿Qué prefieres hoy en día: escribir por chat a tu ritmo o hablar por llamada/audio?",
    proStance: "Texting is flexible, respectful of people's busy schedules, and lets you craft thoughtful responses.",
    conStance: "Calling and voice notes carry genuine human emotion, warmth, humor, and resolve topics in seconds.",
    starterArguments: {
      pro: [
        "Texting allows you to reply whenever convenient without putting the other person on the spot.",
        "You have written records of addresses, recommendations, and plans so you never forget important details.",
      ],
      con: [
        "Hearing a friend's voice and genuine laughter builds deeper human connection than cold text emojis.",
        "A 30-second quick phone call solves complex plans that take 45 back-and-forth text messages.",
      ],
    },
    sampleRebuttals: {
      conTutor: [
        "Texting is so impersonal! Half the time people misunderstand tone and argue over a message that had zero bad intent!",
        "Nothing beats hearing your best friend's genuine laughter when telling a crazy story over the phone.",
        "Have you ever spent 20 minutes typing back and forth just to pick a restaurant? A 20-second call fixes it instantly!",
      ],
      proTutor: [
        "Surprise phone calls put people under unnecessary stress! Texting gives everyone time to think before replying.",
        "With texting, you can share links, photos, exact Google Maps locations, and check details later anytime.",
        "You can chat with multiple friends while in a quiet library, train, or work break without making noisy calls!",
      ],
    },
    keyVocabulary: [
      { word: "genuine tone", meaning: "Tono de voz auténtico y natural", ipa: "/ˈdʒen.ju.ɪn toʊn/" },
      { word: "misinterpreted message", meaning: "Mensaje malinterpretado", ipa: "/ˌmɪs.ɪnˈtɝː.prə.t̬ɪd/" },
      { word: "thoughtful reply", meaning: "Respuesta reflexiva y bien pensada", ipa: "/ˈθɑːt.fəl rɪˈplaɪ/" },
    ],
  },
];
