/* ==========================================================================
   content.js — EVERYTHING PERSONAL LIVES IN THIS FILE
   --------------------------------------------------------------------------
   You never need to touch script.js to personalise the site. Edit the values
   below, save, and upload this file to GitHub again.

   Quick map of this file:
     1. SETTINGS      – default language, music file, optional bouquet image
     2. NICKNAMES     – her nickname and yours (used as {her} and {me})
     3. PHOTOS        – the photos on the last page (revealed by scratching)
     4. LETTER        – the typewriter letter (Kyrgyz and English, separately)
     5. LOVE_NOTES    – the "From your Daddy" messages
     6. translations  – every other piece of interface text (ky + en)

   Placeholders you can use inside interface text:
     {her} -> "my beautiful girl"      {me} -> "Daddy"
   (The letter itself is shown exactly as written — no placeholders there.)

   IMPORTANT: Kyrgyz and English are written separately on purpose.
   Nothing is machine-translated. When you change one language, change the
   other one by hand.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. SETTINGS
     ------------------------------------------------------------------------ */
  const SETTINGS = {
    // 'ky' = Kyrgyz (Cyrillic) is shown first. She can switch to English.
    defaultLanguage: 'ky',

    // Put a legally usable instrumental track at this exact path.
    // See assets/audio/README.md. If the file is missing, the site still works.
    musicFile: 'assets/audio/music.mp3',
    musicVolume: 0.45, // 0.0 – 1.0 (ignored by iPhones, which use the system volume)

    // OPTIONAL: replace the hand-drawn bouquet with your own image, e.g.
    //   bouquetImage: 'assets/images/bouquet.png',
    // Keep it null to use the built-in animated illustration (recommended).
    bouquetImage: null
  };

  /* ------------------------------------------------------------------------
     2. NICKNAMES  (intimate words, kept warm in both languages)
     ------------------------------------------------------------------------ */
  const NICKNAMES = {
    her: { ky: 'менин сулуу кызым', en: 'my beautiful girl' },
    me:  { ky: 'дэддиң',            en: 'Daddy' }
  };

  /* ------------------------------------------------------------------------
     3. PHOTOS
     Paths are RELATIVE (no leading slash) so they work on GitHub Pages.
     Filenames are case-sensitive on GitHub: "Photo.JPG" is not "photo.jpg".

     To use a real photo:
       1. Upload it into assets/images/ (e.g. assets/images/memory-1.jpg)
       2. Change the matching `src` below to that path.
     Remember: anything in a public repository can be seen by anyone.
     ------------------------------------------------------------------------ */
  const PHOTOS = {
    // The photos on the last page. Each one is hidden under a pink scratch card.
    gallery: [
      {
        src: 'assets/images/memory-1-placeholder.jpeg', // e.g. 'assets/images/memory-1.jpg'
        alt: { ky: 'Биздин оюндардын бир көз ирмеми', en: 'A moment from one of our games' },
        caption: { ky: 'Биздин оюндардын бир көз ирмеми', en: 'A moment from one of our games' }
      },
      {
        src: 'assets/images/memory-2-placeholder.jpeg', // e.g. 'assets/images/memory-2.jpg'
        alt: { ky: 'Экран аркылуу, бирок чогуу', en: 'Through a screen, but together' },
        caption: { ky: 'Экран аркылуу, бирок чогуу', en: 'Through a screen, but together' }
      },
      {
        src: 'assets/images/memory-3-placeholder.jpeg', // e.g. 'assets/images/memory-3.jpg'
        alt: { ky: 'Дагы бир сүйүктүү эстелик', en: 'Another favourite memory' },
        caption: { ky: 'Дагы бир сүйүктүү эстелик', en: 'Another favourite memory' }
      }
    ]
  };

  /* ------------------------------------------------------------------------
     4. LETTER  (the typewriter scene)
     ------------------------------------------------------------------------
     • Each item in `paragraphs` is one paragraph. It is typed out and then
       STAYS on the page; the next paragraph starts underneath it.
     • The text is shown exactly as written here (no placeholders, no edits).
     • Each paragraph is wrapped in `backticks`, so you can freely use
       ' and " inside. Just don't use a backtick ` inside the text.
     • Keep the same number of paragraphs in ky and en, in the same order,
       so switching language mid-letter lands on the matching paragraph.
     ------------------------------------------------------------------------ */
  const LETTER = {
    ky: {
      heading: 'Айткым келген сөздөр',
      paragraphs: [
        `Салам, менин сулуу кызым.`,
        `Билем, сен сүйүүңдү сөздөр менен билдире бербейсиң. Бирок алыста жүргөндө сен үчүн эмне кыла аларымды ойлонуп, ушундай нерсе жасоону чечтим. Балким, сага чыныгы гүлдү колуңа кармата албай жаткандырмын, бирок бул аны өзгөртө албайм дегенди билдирбейт.`,
        `Өмүр бою көп эмгектендим жана көп адамдарды жолуктурдум, бирок ушул убакка чейин сендей жүрөгү сулуу адамды жолуктура элекмин. Сен мага ар бир жолу жүрөгүңдүн канчалык сулуу экенин кайрадан көрсөтөсүң. Сен бардык нерсенин эң сулуусуна жана эң жакшысына татыктуусуң.`,
        `Мен сени чын жүрөгүмдөн абдан сүйөм. Сени менен ар бир мүнөтүмдү өткөрүп, бүт өмүрүмдү бирге өткөргүм келгендей сүйөм.`,
        `Кээде сезимдериңди мага жеткире албай калам деп коркосуң. Бирок билип кой, мен сени түшүнөм жана сүйүүңдү толугу менен сезем. Сен мага муну мамилең менен абдан жакшы сездиресиң. Менин билдирүүлөрүмө бат жооп бергениңди, мага дайыма көңүл бурганыңды, кыйналып жатканымды байкаганыңды, ал-акыбалымды сурап, оор учурларда мени колдогонуңду байкап жүрөм. Ушунун баары мага сүйүүңдү сездирет. Балким, баарын сөз менен айтып бере албайсың, бирок сүйүүңдү өз жолуң менен көрсөтөсүң.`,
        `Адамдар көбүнчө «Мен сени сүйөм» деп айтып, кайра-кайра шылтоо табышат. Сен болсо чындап сүйөсүң жана шылтоолордун артына жашынбайсың. Айтпасаң да болот.`,
        `Мен сени кандай болсоң, ошондой сүйөм. Уялганыңды, унчукпай калганыңды, сүйлөй албай кыйналганыңды, каалоолоруңду, сүйүүңдү көрсөтүү ыкмаңды… Чынында, жүрөгүмдө мындан да көп нерселер бар, бирок аларды сөз менен жеткирүү мага кыйын.`,
        `Көпөлөктөр үч күндүк өмүрүндө өз канаттарынын сулуулугун эч качан биле алышпайт. Сен да жүрөгүңдүн башка адамдарга болгон мамилеңде канчалык сулуу бойдон каларын эч качан толук түшүнбөшүң мүмкүн.`,
        `Сен куурап бараткан бир гүлгө өмүрүндөгү алгачкы сууну бердиң.`,
        `Бул гүл сага карап туруудан эч качан баш тартпайт.`,
        `Мен сени бардык жактарың менен кабыл алам жана абдан сүйөм. Сен үчүн колумдан келгендин эң жакшысын кылгым келет. Кана, өзүңдү менин көзүм менен көрө алсаң. Балким, ошондо жүрөгүңдө канчалык көп сулуулук бар экенин жана өзүңдүн канчалык баалуу экениңди бир аз болсо да көрмөксүң.`,
        `Сенин баалуулугуң мага канчалык сүйүү көрсөтө алганыңа же сезимдериңди канчалык жакшы сөз менен жеткире алганыңа байланыштуу эмес. Сен ансыз деле абдан баалуусуң. Сен бардык нерсенин эң сулуусуна жана эң жакшысына татыктуусуң.`,
        `Сага татыктуу баа бербегендерге карабай, жүрөгүмдүн үнүн угуп, сени ханбийкедей эркелетип, кам көргүм келет. Сенин жакшы-жаман жактарыңдын баары менен сага абдан байланып калдым. Сен жөнүндө ойлогон сайын сага уламдан-улам тереңирээк байланып баратам.`,
        `Бир күнү сени чындап кучагыма алып, өбүп, жытыңды жыттагым абдан келет. Бир диванда жанаша уктап калып, эртең менен көзүмдү ачканда сени жанымдан көргүм жана ар бир жаңы күндү сени менен баштагым келет. Сени менен өзгөчө учурларды гана эмес, жөнөкөй күндөрдү да чогуу өткөргүм келет.`,
        `Ооба, менин сулуу кызым, сенин дэддиң сени дайыма сүйөт. Бактылуу кезиңде да, кайгырганда да, жакшы күндөрдө да, жаман күндөрдө да… Эмне болсо да, эмне өзгөрсө да, сага болгон сүйүүм менен көңүлүм эч качан өзгөрбөйт.`
      ]
    },
    en: {
      heading: 'The words I wanted to say',
      paragraphs: [
        `Hello, my beautiful girl.`,
        `I know that words aren't really your love language. But when I thought about what I could do for you while we're far apart, I decided to make something like this. Maybe I can't place a real flower in your hands right now, but that doesn't mean I can't change that.`,
        `I've worked hard throughout my life and met many people, but until now, I've never met anyone with a heart as beautiful as yours. Every time, you show me all over again just how beautiful your heart is. You deserve all the most beautiful and wonderful things in life.`,
        `I truly love you so much. I love you enough to want to spend every minute with you and my entire life by your side.`,
        `Sometimes you're afraid that you can't express your feelings to me, but I want you to know that I understand you, and I feel your love completely. You make me feel it so deeply through the way you treat me. I notice how quickly you reply to my messages, how you always care about me, how you notice when I'm hurting, how you check on me, and how you support me when things are difficult. All of these things make me feel your love. Maybe you can't put everything into words, but you show me your love in your own way.`,
        `People often say, "I love you," and then keep making excuses. But you truly love, and you don't hide behind excuses. You don't have to say it.`,
        `I love you in every way you are. Your shyness, your silence, the moments when you struggle to speak, your desires, and the way you show your love… There is so much more in my heart than I can explain, but sometimes I struggle to put it into words.`,
        `Butterflies can never know how beautiful their own wings are during their three days of life. And you may never truly realize how beautiful your heart remains in the way you treat other people.`,
        `You gave the first water of its life to a flower that was about to wither.`,
        `And this flower will never stop looking toward you.`,
        `I accept and love every part of you. I want to do the very best I can for you. I wish you could see yourself through my eyes. Maybe then, you would begin to see just how much beauty your heart holds and how precious you truly are.`,
        `Your worth doesn't depend on how much love you can show me or how beautifully you can put your feelings into words. You are already so precious. You deserve all the most beautiful and wonderful things in life.`,
        `Despite everyone who has failed to give you the value you deserve, I want to listen to my heart and treat you like a princess. I've grown deeply attached to you, with all your wonderful sides and all your difficult ones. Every thought I have about you draws me deeper and deeper into loving you.`,
        `I want so much to hold you in my arms for real one day, kiss you, and breathe in your scent. I want us to fall asleep side by side on the same couch, to open my eyes in the morning and find you beside me, and to begin every new day with you. I don't want to share only special moments with you; I want to experience ordinary days together, too.`,
        `Yes, my beautiful girl, your Daddy will always love you. In happiness and sadness, in good times and bad… No matter what happens, no matter what changes, my love and care for you will never change.`
      ]
    }
  };

  /* ------------------------------------------------------------------------
     5. LOVE NOTES — the "From your Daddy" section
     Small closed cards; each opens one message. No scores, no counting.
     Add, remove or reorder freely (6–10 notes looks best).
     ------------------------------------------------------------------------ */
  const LOVE_NOTES = [
    { ky: 'Дэддиң сени абдан сүйөт, менин сулуу кызым.',
      en: 'Your Daddy loves you so much, my beautiful girl.' },
    { ky: 'Дал азыр сени бекем кучактагым абдан келип жатат.',
      en: 'I want to hold you tight so badly right now.' },
    { ky: 'Кана, азыр жаныңда болуп, сени кучагыма алсам.',
      en: 'I wish I could be next to you right now and hold you in my arms.' },
    { ky: 'Сен менин эң коопсуз жайымсың. Башкаларга көрсөтө албаган оорумду жана алсыз жактарымды бир гана сага ача алам.',
      en: 'You are my safest place. You’re the only one I can show my pain to and share the parts of myself I can’t show anyone else.' },
    { ky: 'Сенин дэддиң сени ар дайым сүйүп, коргоп, жаныңда болот.',
      en: 'Your Daddy is always going to love you, protect you, and stand by your side.' },
    { ky: 'Мен сени бүтүндөй, бардык жактарың менен каалайм. Сенин ар бир өзгөчөлүгүңдү жакшы көрөм жана сен мени тандагандай, мен да сени кайра-кайра тандагым келет.',
      en: 'I want you so much, all of you, with every little thing that makes you who you are. I want you to be mine in every way, just as I want to be yours.' },
    { ky: 'Колумдан келишинче сени ар дайым бактылуу кылгым келет. Жүзүңдөгү жылмаюуну көрүү мен үчүн абдан маанилүү.',
      en: 'I want to make you happy in every way I can. Seeing you smile means so much to me.' },
    { ky: 'Сени жашоомдун ар бир бөлүгүндө көргүм келет — күнүмдүк майда нерселерде да, чоң пландарымда да. Келечегимди сен менен бөлүшкүм келет.',
      en: 'I want you in every part of my life — in the little everyday things and in my biggest plans. I want to share my future with you.' }
  ];

  /* ------------------------------------------------------------------------
     6. INTERFACE TRANSLATIONS
     Every visible label lives here. {n} and {total} are filled in by the
     code — keep them inside the text.
     ------------------------------------------------------------------------ */
  const translations = {
    ky: {
      meta: { title: 'Сөздөр кучактай алса 🌹' },
      ui: {
        langGroup: 'Тилди тандоо',
        siteTitle: 'Сөздөр кучактай алса'
      },
      nav: {
        chapters: 'Бөлүмдөр',
        openChapters: 'Бөлүмдөрдү ачуу',
        closeChapters: 'Бөлүмдөрдү жабуу',
        chaptersHint: 'Ачылган бөлүмдөргө каалаган убакта кайтсаң болот.',
        locked: 'азырынча жабык',
        back: 'Артка',
        continue: 'Андан ары',
        progress: '{n}-бөлүм, жалпы {total}'
      },
      scenes: {
        intro: 'Башталыш',
        bouquet: 'Гүлдөр',
        letter: 'Кат',
        notes: 'Дэддиңден сага',
        final: 'Акыркы барак'
      },
      music: {
        turnOn: 'Музыканы күйгүзүү',
        turnOff: 'Музыканы өчүрүү',
        unavailable: 'Азырынча музыка кошула элек. Бул кичинекей дүйнө тынчтыкта да сулуу 🌸',
        blocked: 'Браузер музыканы токтотту. Баскычты дагы бир жолу басып көр.'
      },
      intro: {
        eyebrow: 'Сен үчүн',
        title: 'Сөздөр кучактай алса',
        greeting: 'Мен сен үчүн кичинекей бир дүйнө жасадым. Эч шашпа — каалаган убагыңда, акырындап карап чык.',
        open: 'Кичинекей сюрпризимди ач',
        soundNote: 'Музыка кошулган болсо, акырын ойной баштайт. Аны жогору жактан өчүрсөң болот.'
      },
      bouquet: {
        alt: 'Кызгылт розалардан турган гүлдесте',
        message: 'Булар сен үчүн, {her}. Ар бири.',
        take: 'Гүлдөрүмдү ал',
        skipHint: 'Анимацияны өткөрүү үчүн гүлдөрдү бас.'
      },
      letter: {
        controls: 'Каттын башкаруусу',
        panelLabel: 'Кат',
        pause: 'Тындыруу',
        resume: 'Улантуу',
        skip: 'Баарын азыр көрсөт',
        replay: 'Кайра жазып көрсөт',
        toTop: 'Башынан оку',
        complete: 'Кат толугу менен ушул жерде. Каалаган убакта кайра окуй аласың.'
      },
      notes: {
        title: 'Дэддиңден сага',
        intro: 'Каалаганыңды ач. Бардыгы ушул жерде калат — каалаган убакта кайра окусаң болот.',
        gridLabel: 'Сүйүү каттары',
        open: 'Ач',
        again: 'Кайра оку',
        cardLabel: '{n}-кат, ачуу',
        cardLabelOpened: '{n}-кат, кайра окуу',
        close: 'Жабуу',
        signature: '— сенин {me}'
      },
      final: {
        title: 'Акыркы барак — азырынча',
        galleryTitle: 'Биздин эстеликтер',
        galleryHint: 'Ар бир сүрөттү акырын сүртүп ач — астында экөөбүздүн оюндардагы эстеликтерибиз жашырылган.',
        scratchHint: 'Сүрт ✨',
        revealNow: 'Дароо ач',
        canvasLabel: '{n}-сүрөт, сүртүлүүчү карточканын астында. Сүрт же «Дароо ач» баскычын бас.',
        allRevealed: 'Бардык эстеликтер ачылды. Экран аркылуу болсо да, булар чыныгы көз ирмемдер болчу.',
        message: 'Биз азырынча бир жерде, жанаша боло элекпиз. Бирок экөөбүз бөлүшкөн көз ирмемдер мен үчүн чындап маанилүү. Ортобузда экран жок, чогуу эстелик жарата турган күндү чын жүрөктөн күтөм. Ага чейин бул кичинекей дүйнөнү мен сен үчүн гана жасадым.',
        signature: '— сенин {me}',
        replay: 'Башынан кайра',
        revisit: 'Каалаган бөлүмгө жогору жактагы меню аркылуу кайтсаң болот.',
        photoMissing: 'Сүрөт азырынча кошула элек'
      }
    },

    en: {
      meta: { title: 'If words could hug you 🌹' },
      ui: {
        langGroup: 'Choose language',
        siteTitle: 'If words could hug you'
      },
      nav: {
        chapters: 'Chapters',
        openChapters: 'Open chapters',
        closeChapters: 'Close chapters',
        chaptersHint: 'You can go back to any chapter you’ve opened.',
        locked: 'not opened yet',
        back: 'Back',
        continue: 'Continue',
        progress: 'Chapter {n} of {total}'
      },
      scenes: {
        intro: 'Beginning',
        bouquet: 'Flowers',
        letter: 'The letter',
        notes: 'From your Daddy',
        final: 'Last page'
      },
      music: {
        turnOn: 'Turn music on',
        turnOff: 'Turn music off',
        unavailable: 'No music has been added yet. This little world is lovely in the quiet, too 🌸',
        blocked: 'Your browser paused the music. Try the button once more.'
      },
      intro: {
        eyebrow: 'For you',
        title: 'If words could hug you',
        greeting: 'I made a little world for you. There’s no rush — explore it slowly, whenever you like.',
        open: 'Open my little surprise',
        soundNote: 'If music has been added, it will start softly. You can turn it off at the top.'
      },
      bouquet: {
        alt: 'A bouquet of pink roses',
        message: 'These are for you, {her}. Every single one.',
        take: 'Take my flowers',
        skipHint: 'Tap the flowers to skip the animation.'
      },
      letter: {
        controls: 'Letter controls',
        panelLabel: 'Letter',
        pause: 'Pause',
        resume: 'Resume',
        skip: 'Show it all now',
        replay: 'Type it again',
        toTop: 'Read from the beginning',
        complete: 'The whole letter is here. You can read it again anytime.'
      },
      notes: {
        title: 'From your Daddy, with love',
        intro: 'Open whichever you like. They all stay right here — you can read them again anytime.',
        gridLabel: 'Love notes',
        open: 'Open',
        again: 'Read again',
        cardLabel: 'Note {n}, open',
        cardLabelOpened: 'Note {n}, read again',
        close: 'Close',
        signature: '— your {me}'
      },
      final: {
        title: 'The last page — for now',
        galleryTitle: 'Our memories',
        galleryHint: 'Gently scratch each photo — our memories from our games are hiding underneath.',
        scratchHint: 'Scratch ✨',
        revealNow: 'Reveal now',
        canvasLabel: 'Photo {n}, under a scratch card. Scratch it, or use the “Reveal now” button.',
        allRevealed: 'Every memory is uncovered. Even through a screen, these moments were real.',
        message: 'We haven’t shared the same physical space yet, but the moments we’ve already shared matter to me. I look forward to the day when we can make memories without a screen between us. Until then, this little world is something I made just for you.',
        signature: '— your {me}',
        replay: 'Start again',
        revisit: 'You can revisit any chapter from the menu at the top.',
        photoMissing: 'Photo not added yet'
      }
    }
  };

  // Exposed to script.js. (Do not rename.)
  window.SITE_CONTENT = {
    settings: SETTINGS,
    nicknames: NICKNAMES,
    photos: PHOTOS,
    letterContent: LETTER,
    loveNotes: LOVE_NOTES,
    translations: translations
  };
})();
