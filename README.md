# ⛏️ Craft Voca - 마인크래프트풍 초등 5학년 영어 단어 모험

> **초등학교 5학년 영어 교육과정 맞춤 단어를 마인크래프트 콘셉트의 1분 미니게임, 보스전, 명예의 전당으로 재미있게 학습하는 교수학습 웹 애플리케이션**

---

## 🌟 주요 기능 (Key Features)

1. **👨‍🏫 선생님 페이지 (Teacher Portal)**:
   - 초등 5학년 필수 어휘 35개 이상 프리셋 내장
   - 단어 추가 / 수정 / 삭제 (CRUD)
   - 프린트용 영어 단어 플래시카드 자동 생성 및 인쇄 기능
   - 단어장 JSON 저장 및 5학년 기본 단어장 복원

2. **📖 학생 단어 익히기 (Student Study Hub)**:
   - 3D 픽셀 카드 뒤집기 (앞면: 영어/발음기호, 뒷면: 뜻/예문)
   - Web Speech API 기반 미국식 발음(TTS) 자동 재생
   - 단어 랜덤 섞기 및 순차 탐색

3. **🎮 1분 타임어택 미니게임 3종 (Mini-Games)**:
   - 🎧 **듣기말하기 미니게임 (Sound Mining)**: 영어 발음 듣고 올바른 광석 블록 채굴하기
   - 📖 **스피드 읽기 미니게임 (Speed Pixel Reader)**: 다가오는 몬스터 카드의 뜻을 빠르게 맞추기
   - ✏️ **크래프트 쓰기 미니게임 (Alphabet Crafting)**: 조합대에서 알파벳 블록을 조합하여 단어 완성하기
   - 60초 타임어택, 콤보 multiplier, 레트로 Web Audio 8비트 효과음

4. **🐉 보스 도전 (Ender Dragon Raid)**:
   - 미니게임으로 모은 **100 Gold**를 사용하여 입장
   - 듣기/읽기/쓰기 믹스 10문항 대결 + 엔더 드래곤 HP 바 연출
   - 보스 처치 시 대량의 골드 보상 및 명예의 전당 등극

5. **🏆 명예의 전당 (Hall of Fame)**:
   - **골드 보유량 TOP 10** 랭킹
   - **미니게임 클리어 횟수 TOP 10** 랭킹
   - 마인크래프트 아바타 스킨 (스티브, 알렉스, 다이아 용사, 크리퍼, 엔더맨) 표시

6. **🔥 Firebase & Vercel 연동**:
   - Firebase Auth (Google 로그인, 익명 로그인)
   - Firebase Firestore DB (실시간 단어장 및 명예의 전당 연동)
   - Firebase 미설정 시에도 즉시 동작하는 **Local Storage Fallback (Zero-Crash)** 지원

---

## 🚀 GitHub에 올리기 (Pushing to GitHub)

터미널에서 다음 명령어를 실행하여 GitHub 레포지토리에 푸시하세요:

```bash
git init
git add .
git commit -m "Feat: Initial commit for Craft Voca 5th grade English web app"
git branch -M main
git remote add origin https://github.com/사용자이름/craft-voca.git
git push -u origin main
```

---

## 🔥 Firebase 연동 설정 (Firebase Setup Guide)

1. [Firebase Console](https://console.firebase.google.com/) 접속 및 프로젝트 생성
2. **Authentication** 설정:
   - 로그인 방법에서 **Google 로그인** 및 **익명 로그인** 활성화
3. **Firestore Database** 생성:
   - 규칙(Rules)에서 읽기/쓰기 허용 설정 (`allow read, write: if true;`)
4. 웹 앱 등록 후 발급받은 `firebaseConfig` 객체 값을 앱 오른쪽 상단의 **[⚙️ 설정]** 버튼을 통해 입력하거나 `js/firebase-config.js`에 설정하세요.

---

## 🔺 Vercel 배포 방법 (Vercel Deployment)

1. [Vercel](https://vercel.com/) 로그인 후 **[Add New...] -> [Project]** 클릭
2. GitHub 계정을 연동하고 본 `craft-voca` 레포지토리를 클릭하여 **Import**
3. Framework Preset: `Other` (Static App) 설정 후 **Deploy** 클릭
4. 배포 완료된 도메인 URL로 접속하여 즉시 이용 가능!
