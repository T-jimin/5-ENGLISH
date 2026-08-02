// 초등 5학년 교육과정 맞춤 영어 단어 데이터베이스 (Default 5th Grade English Vocabulary)

export const DEFAULT_WORDS = [
  // Weather & Seasons
  { id: 'w1', word: 'weather', meaning: '날씨', category: '날씨/계절', example: 'How is the weather today?', phonetic: 'ˈweðər' },
  { id: 'w2', word: 'season', meaning: '계절', category: '날씨/계절', example: 'Spring is my favorite season.', phonetic: 'ˈsiːzn' },
  { id: 'w3', word: 'autumn', meaning: '가을', category: '날씨/계절', example: 'Leaves turn red in autumn.', phonetic: 'ˈɔːtəm' },
  { id: 'w4', word: 'winter', meaning: '겨울', category: '날씨/계절', example: 'It snows a lot in winter.', phonetic: 'ˈwɪntər' },
  { id: 'w5', word: 'sunny', meaning: '화창한', category: '날씨/계절', example: 'It is a sunny day.', phonetic: 'ˈsʌni' },

  // Daily Life & Time
  { id: 'w6', word: 'breakfast', meaning: '아침 식사', category: '일상/시간', example: 'I eat bread for breakfast.', phonetic: 'ˈbrekfəst' },
  { id: 'w7', word: 'exercise', meaning: '운동하다, 운동', category: '일상/시간', example: 'We exercise in the gym.', phonetic: 'ˈeksərsaɪz' },
  { id: 'w8', word: 'practice', meaning: '연습하다', category: '일상/시간', example: 'Practice makes perfect.', phonetic: 'ˈpræktɪs' },
  { id: 'w9', word: 'tomorrow', meaning: '내일', category: '일상/시간', example: 'See you tomorrow!', phonetic: 'təˈmɔːroʊ' },
  { id: 'w10', word: 'yesterday', meaning: '어제', category: '일상/시간', example: 'I played soccer yesterday.', phonetic: 'ˈjestərdeɪ' },
  { id: 'w11', word: 'favorite', meaning: '가장 좋아하는', category: '일상/시간', example: 'English is my favorite subject.', phonetic: 'ˈfeɪvərɪt' },
  { id: 'w12', word: 'remember', meaning: '기억하다', category: '일상/시간', example: 'Do you remember my name?', phonetic: 'rɪˈmembər' },

  // Places & Directions
  { id: 'w13', word: 'hospital', meaning: '병원', category: '장소/길안내', example: 'The doctor works in a hospital.', phonetic: 'ˈhɑːspɪtl' },
  { id: 'w14', word: 'museum', meaning: '박물관', category: '장소/길안내', example: 'We visited the science museum.', phonetic: 'mjuˈziːəm' },
  { id: 'w15', word: 'library', meaning: '도서관', category: '장소/길안내', example: 'Quiet please in the library.', phonetic: 'ˈlaɪbreri' },
  { id: 'w16', word: 'country', meaning: '나라, 시골', category: '장소/길안내', example: 'Korea is a beautiful country.', phonetic: 'ˈkʌntri' },
  { id: 'w17', word: 'airport', meaning: '공항', category: '장소/길안내', example: 'The airplane is at the airport.', phonetic: 'ˈerpɔːrt' },
  { id: 'w18', word: 'direction', meaning: '방향, 지시', category: '장소/길안내', example: 'Which direction is East?', phonetic: 'dəˈrekʃn' },

  // Hobbies & School Subjects
  { id: 'w19', word: 'science', meaning: '과학', category: '과목/취미', example: 'We do experiments in science class.', phonetic: 'ˈsaɪəns' },
  { id: 'w20', word: 'history', meaning: '역사', category: '과목/취미', example: 'I like reading history books.', phonetic: 'ˈhɪstri' },
  { id: 'w21', word: 'painting', meaning: '그림 그리기, 회화', category: '과목/취미', example: 'Painting is fun.', phonetic: 'ˈpeɪntɪŋ' },
  { id: 'w22', word: 'basketball', meaning: '농구', category: '과목/취미', example: 'Let us play basketball.', phonetic: 'ˈbæskɪtbɔːl' },
  { id: 'w23', word: 'adventure', meaning: '모험', category: '과목/취미', example: 'Minecraft is a fun adventure!', phonetic: 'ədˈventʃər' },

  // Describing Words
  { id: 'w24', word: 'delicious', meaning: '맛있는', category: '상태/묘사', example: 'This apple pie is delicious.', phonetic: 'dɪˈlɪʃəs' },
  { id: 'w25', word: 'beautiful', meaning: '아름다운', category: '상태/묘사', example: 'Look at the beautiful rainbow!', phonetic: 'ˈbjuːtɪfl' },
  { id: 'w26', word: 'dangerous', meaning: '위험한', category: '상태/묘사', example: 'Fire is very dangerous.', phonetic: 'ˈdeɪndʒərəs' },
  { id: 'w27', word: 'exciting', meaning: '신나는, 흥미진진한', category: '상태/묘사', example: 'The game was exciting.', phonetic: 'ɪkˈsaɪtɪŋ' },
  { id: 'w28', word: 'special', meaning: '특별한', category: '상태/묘사', example: 'Today is a special day.', phonetic: 'ˈspeʃl' },
  { id: 'w29', word: 'famous', meaning: '유명한', category: '상태/묘사', example: 'He is a famous singer.', phonetic: 'ˈfeɪməs' },

  // Nature & Animals
  { id: 'w30', word: 'dinosaur', meaning: '공룡', category: '자연/동물', example: 'T-Rex is a giant dinosaur.', phonetic: 'ˈdaɪnəsɔːr' },
  { id: 'w31', word: 'dolphin', meaning: '돌고래', category: '자연/동물', example: 'Dolphins swim very fast.', phonetic: 'ˈdɑːlfɪn' },
  { id: 'w32', word: 'mountain', meaning: '산', category: '자연/동물', example: 'We climbed the high mountain.', phonetic: 'ˈmaʊntn' },
  { id: 'w33', word: 'forest', meaning: '숲', category: '자연/동물', example: 'Many trees grow in the forest.', phonetic: 'ˈfɔːrɪst' },
  { id: 'w34', word: 'ocean', meaning: '대양, 바다', category: '자연/동물', example: 'Whales live in the ocean.', phonetic: 'ˈoʊʃn' },
  { id: 'w35', word: 'planet', meaning: '행성', category: '자연/동물', example: 'Earth is our planet.', phonetic: 'ˈplænɪt' }
];
