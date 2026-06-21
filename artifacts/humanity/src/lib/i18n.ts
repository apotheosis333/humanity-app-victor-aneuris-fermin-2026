import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Curated UI languages. Auto-detection maps the visitor's device/region locale
// (e.g. an Israeli device reporting "he-IL") to the closest language here.
// Adding a language = add an entry below + a resources block. RTL is handled
// automatically for languages flagged `rtl: true`.
export const LANGUAGES = [
  { code: "en", label: "English", rtl: false },
  { code: "es", label: "Español", rtl: false },
  { code: "fr", label: "Français", rtl: false },
  { code: "de", label: "Deutsch", rtl: false },
  { code: "pt", label: "Português", rtl: false },
  { code: "ru", label: "Русский", rtl: false },
  { code: "zh", label: "中文", rtl: false },
  { code: "hi", label: "हिन्दी", rtl: false },
  { code: "ja", label: "日本語", rtl: false },
  { code: "ar", label: "العربية", rtl: true },
  { code: "he", label: "עברית", rtl: true },
] as const;

const RTL = new Set<string>(LANGUAGES.filter((l) => l.rtl).map((l) => l.code));

export function isRtl(code: string): boolean {
  return RTL.has(code.split("-")[0]);
}

const resources = {
  en: {
    translation: {
      common: { language: "Language" },
      nav: {
        home: "Home", explore: "Explore", table: "Table", liveMap: "Live Map",
        walk: "Walk", timeline: "Timeline", compare: "Compare", pledge: "Pledge",
        signIn: "Sign In", profile: "Profile", connections: "Connections", messages: "Messages", news: "World News", menu: "Menu", newRequest: "New connection request", newMessage: "New message",
      },
      score: { title: "Your Journey", body: "You have explored {{percent}}% of the world's nations." },
      hero: {
        eyebrow: "Many cultures · Many stories · One Humanity",
        titleMain: "One Earth. Many Stories.",
        titleAccent: "One Humanity.",
        subtitle: "Explore every culture, every people, every belief, and every perspective through a platform built for understanding, empathy, and truth.",
        ctaExplore: "Explore the World",
        ctaDiscover: "Discover Humanity",
        quote: "\"Every culture is a chapter in the story of humanity.\"",
      },
      footer: {
        tagline: "Many cultures. Many stories. One Humanity. A window into the history, culture, and shared humanity of every nation on Earth.",
        navigation: "Navigation", legal: "Legal", builtFor: "Built for explorers.", copyright: "© {{year}} huMANity.",
      },
      liveMap: {
        badge: "Live · Humanity is online",
        title: "Live Humanity Map",
        subtitle: "See humanity learning, connecting, and growing across Earth in real time.",
        layersTitle: "Activity Layers",
        layersSubtitle: "Toggle what the globe reveals",
        privacy: "Privacy-safe: markers show approximate regions only — never exact or street-level locations, and never private data.",
        layer: { active: "Active Users", new_member: "New Members", pledge: "Humanity Pledges", cultural: "Cultural Exchanges", dinner: "World Dinner Table" },
        layerDesc: { active: "Exploring nations right now", new_member: "Just joined humanity", pledge: "Signed the Humanity Pledge", cultural: "Sharing across cultures", dinner: "Answering this week's question" },
        stat: { active: "Active Humans Online", countries: "Countries Represented", languages: "Languages Spoken", pledges: "Humanity Pledges Signed", exchanges: "Cultural Exchanges" },
      },
    },
  },
  es: {
    translation: {
      common: { language: "Idioma" },
      nav: { home: "Inicio", explore: "Explorar", table: "Mesa", liveMap: "Mapa en Vivo", walk: "Caminar", timeline: "Cronología", compare: "Comparar", pledge: "Compromiso", signIn: "Iniciar Sesión", profile: "Perfil", connections: "Conexiones", messages: "Mensajes", menu: "Menu", newRequest: "Nueva solicitud de conexión", newMessage: "Nuevo mensaje" },
      score: { title: "Tu Viaje", body: "Has explorado el {{percent}}% de las naciones del mundo." },
      hero: {
        eyebrow: "Muchas culturas · Muchas historias · Una Humanidad",
        titleMain: "Una Tierra. Muchas Historias.",
        titleAccent: "Una Humanidad.",
        subtitle: "Explora cada cultura, cada pueblo, cada creencia y cada perspectiva a través de una plataforma creada para la comprensión, la empatía y la verdad.",
        ctaExplore: "Explora el Mundo", ctaDiscover: "Descubre la Humanidad",
        quote: "«Cada cultura es un capítulo en la historia de la humanidad.»",
      },
      footer: { tagline: "Muchas culturas. Muchas historias. Una Humanidad. Una ventana a la historia, la cultura y la humanidad compartida de cada nación de la Tierra.", navigation: "Navegación", legal: "Legal", builtFor: "Hecho para exploradores.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "En vivo · La humanidad está conectada",
        title: "Mapa de la Humanidad en Vivo",
        subtitle: "Observa a la humanidad aprender, conectarse y crecer por toda la Tierra en tiempo real.",
        layersTitle: "Capas de Actividad", layersSubtitle: "Elige qué revela el globo",
        privacy: "Privacidad protegida: los marcadores muestran solo regiones aproximadas, nunca ubicaciones exactas ni datos privados.",
        layer: { active: "Usuarios Activos", new_member: "Nuevos Miembros", pledge: "Compromisos de Humanidad", cultural: "Intercambios Culturales", dinner: "Mesa Mundial" },
        layerDesc: { active: "Explorando naciones ahora", new_member: "Recién unidos a la humanidad", pledge: "Firmaron el Compromiso", cultural: "Compartiendo entre culturas", dinner: "Respondiendo la pregunta de la semana" },
        stat: { active: "Humanos Activos en Línea", countries: "Países Representados", languages: "Idiomas Hablados", pledges: "Compromisos Firmados", exchanges: "Intercambios Culturales" },
      },
    },
  },
  fr: {
    translation: {
      common: { language: "Langue" },
      nav: { home: "Accueil", explore: "Explorer", table: "Table", liveMap: "Carte en Direct", walk: "Marcher", timeline: "Chronologie", compare: "Comparer", pledge: "Engagement", signIn: "Connexion", profile: "Profil", connections: "Connexions", messages: "Messages", menu: "Menu", newRequest: "Nouvelle demande de connexion", newMessage: "Nouveau message" },
      score: { title: "Votre Voyage", body: "Vous avez exploré {{percent}}% des nations du monde." },
      hero: {
        eyebrow: "Tant de cultures · Tant d'histoires · Une seule Humanité",
        titleMain: "Une Terre. Mille Histoires.",
        titleAccent: "Une Humanité.",
        subtitle: "Explorez chaque culture, chaque peuple, chaque croyance et chaque perspective à travers une plateforme conçue pour la compréhension, l'empathie et la vérité.",
        ctaExplore: "Explorer le Monde", ctaDiscover: "Découvrir l'Humanité",
        quote: "« Chaque culture est un chapitre de l'histoire de l'humanité. »",
      },
      footer: { tagline: "Tant de cultures. Tant d'histoires. Une seule Humanité. Une fenêtre sur l'histoire, la culture et l'humanité partagée de chaque nation de la Terre.", navigation: "Navigation", legal: "Mentions légales", builtFor: "Conçu pour les explorateurs.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "En direct · L'humanité est connectée",
        title: "Carte de l'Humanité en Direct",
        subtitle: "Voyez l'humanité apprendre, se connecter et grandir à travers la Terre en temps réel.",
        layersTitle: "Calques d'Activité", layersSubtitle: "Choisissez ce que le globe révèle",
        privacy: "Confidentialité préservée : les marqueurs n'indiquent que des régions approximatives, jamais de lieux précis ni de données privées.",
        layer: { active: "Utilisateurs Actifs", new_member: "Nouveaux Membres", pledge: "Engagements d'Humanité", cultural: "Échanges Culturels", dinner: "Table du Monde" },
        layerDesc: { active: "Explorent des nations en ce moment", new_member: "Viennent de rejoindre l'humanité", pledge: "Ont signé l'Engagement", cultural: "Partagent entre cultures", dinner: "Répondent à la question de la semaine" },
        stat: { active: "Humains Actifs en Ligne", countries: "Pays Représentés", languages: "Langues Parlées", pledges: "Engagements Signés", exchanges: "Échanges Culturels" },
      },
    },
  },
  de: {
    translation: {
      common: { language: "Sprache" },
      nav: { home: "Start", explore: "Entdecken", table: "Tisch", liveMap: "Live-Karte", walk: "Erleben", timeline: "Zeitleiste", compare: "Vergleichen", pledge: "Versprechen", signIn: "Anmelden", profile: "Profil", connections: "Verbindungen", messages: "Nachrichten", menu: "Menu", newRequest: "Neue Verbindungsanfrage", newMessage: "Neue Nachricht" },
      score: { title: "Deine Reise", body: "Du hast {{percent}}% der Nationen der Welt erkundet." },
      hero: {
        eyebrow: "Viele Kulturen · Viele Geschichten · Eine Menschheit",
        titleMain: "Eine Erde. Viele Geschichten.",
        titleAccent: "Eine Menschheit.",
        subtitle: "Entdecke jede Kultur, jedes Volk, jeden Glauben und jede Sichtweise auf einer Plattform für Verständnis, Empathie und Wahrheit.",
        ctaExplore: "Die Welt Entdecken", ctaDiscover: "Die Menschheit Entdecken",
        quote: "„Jede Kultur ist ein Kapitel in der Geschichte der Menschheit.“",
      },
      footer: { tagline: "Viele Kulturen. Viele Geschichten. Eine Menschheit. Ein Fenster zur Geschichte, Kultur und gemeinsamen Menschlichkeit jeder Nation der Erde.", navigation: "Navigation", legal: "Rechtliches", builtFor: "Für Entdecker gemacht.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "Live · Die Menschheit ist online",
        title: "Live-Karte der Menschheit",
        subtitle: "Sieh, wie die Menschheit in Echtzeit über die Erde lernt, sich verbindet und wächst.",
        layersTitle: "Aktivitätsebenen", layersSubtitle: "Wähle, was der Globus zeigt",
        privacy: "Datenschutzfreundlich: Markierungen zeigen nur ungefähre Regionen – niemals genaue Orte oder private Daten.",
        layer: { active: "Aktive Nutzer", new_member: "Neue Mitglieder", pledge: "Menschlichkeits-Versprechen", cultural: "Kultureller Austausch", dinner: "Welttisch" },
        layerDesc: { active: "Erkunden gerade Nationen", new_member: "Gerade beigetreten", pledge: "Haben das Versprechen unterzeichnet", cultural: "Teilen über Kulturen hinweg", dinner: "Beantworten die Frage der Woche" },
        stat: { active: "Aktive Menschen Online", countries: "Vertretene Länder", languages: "Gesprochene Sprachen", pledges: "Unterzeichnete Versprechen", exchanges: "Kultureller Austausch" },
      },
    },
  },
  pt: {
    translation: {
      common: { language: "Idioma" },
      nav: { home: "Início", explore: "Explorar", table: "Mesa", liveMap: "Mapa ao Vivo", walk: "Caminhar", timeline: "Linha do Tempo", compare: "Comparar", pledge: "Compromisso", signIn: "Entrar", profile: "Perfil", connections: "Conexões", messages: "Mensagens", menu: "Menu", newRequest: "Novo pedido de conexão", newMessage: "Nova mensagem" },
      score: { title: "Sua Jornada", body: "Você explorou {{percent}}% das nações do mundo." },
      hero: {
        eyebrow: "Muitas culturas · Muitas histórias · Uma Humanidade",
        titleMain: "Uma Terra. Muitas Histórias.",
        titleAccent: "Uma Humanidade.",
        subtitle: "Explore cada cultura, cada povo, cada crença e cada perspectiva através de uma plataforma criada para a compreensão, a empatia e a verdade.",
        ctaExplore: "Explorar o Mundo", ctaDiscover: "Descobrir a Humanidade",
        quote: "«Cada cultura é um capítulo na história da humanidade.»",
      },
      footer: { tagline: "Muitas culturas. Muitas histórias. Uma Humanidade. Uma janela para a história, a cultura e a humanidade compartilhada de cada nação da Terra.", navigation: "Navegação", legal: "Legal", builtFor: "Feito para exploradores.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "Ao vivo · A humanidade está online",
        title: "Mapa da Humanidade ao Vivo",
        subtitle: "Veja a humanidade aprender, conectar-se e crescer por toda a Terra em tempo real.",
        layersTitle: "Camadas de Atividade", layersSubtitle: "Escolha o que o globo revela",
        privacy: "Privacidade protegida: os marcadores mostram apenas regiões aproximadas — nunca locais exatos nem dados privados.",
        layer: { active: "Usuários Ativos", new_member: "Novos Membros", pledge: "Compromissos de Humanidade", cultural: "Intercâmbios Culturais", dinner: "Mesa Mundial" },
        layerDesc: { active: "Explorando nações agora", new_member: "Acabaram de se juntar", pledge: "Assinaram o Compromisso", cultural: "Compartilhando entre culturas", dinner: "Respondendo à pergunta da semana" },
        stat: { active: "Humanos Ativos Online", countries: "Países Representados", languages: "Idiomas Falados", pledges: "Compromissos Assinados", exchanges: "Intercâmbios Culturais" },
      },
    },
  },
  ru: {
    translation: {
      common: { language: "Язык" },
      nav: { home: "Главная", explore: "Обзор", table: "Стол", liveMap: "Живая карта", walk: "Прожить день", timeline: "Хронология", compare: "Сравнить", pledge: "Обещание", signIn: "Войти", profile: "Профиль", connections: "Связи", messages: "Сообщения", menu: "Меню", newRequest: "Новый запрос на связь", newMessage: "Новое сообщение" },
      score: { title: "Ваш путь", body: "Вы исследовали {{percent}}% стран мира." },
      hero: {
        eyebrow: "Множество культур · Множество историй · Одно человечество",
        titleMain: "Одна Земля. Множество историй.",
        titleAccent: "Одно человечество.",
        subtitle: "Исследуйте каждую культуру, каждый народ, каждую веру и каждый взгляд на платформе, созданной ради понимания, сочувствия и правды.",
        ctaExplore: "Исследовать мир", ctaDiscover: "Открыть человечество",
        quote: "«Каждая культура — это глава в истории человечества.»",
      },
      footer: { tagline: "Множество культур. Множество историй. Одно человечество. Окно в историю, культуру и общую человечность каждой страны на Земле.", navigation: "Навигация", legal: "Правовая информация", builtFor: "Создано для исследователей.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "В эфире · Человечество онлайн",
        title: "Живая карта человечества",
        subtitle: "Наблюдайте, как человечество учится, объединяется и растёт по всей Земле в реальном времени.",
        layersTitle: "Слои активности", layersSubtitle: "Выберите, что показывает глобус",
        privacy: "Безопасно для приватности: метки показывают только приблизительные регионы — никогда точные места или личные данные.",
        layer: { active: "Активные пользователи", new_member: "Новые участники", pledge: "Обещания человечности", cultural: "Культурный обмен", dinner: "Всемирный стол" },
        layerDesc: { active: "Сейчас исследуют страны", new_member: "Только что присоединились", pledge: "Подписали обещание", cultural: "Делятся между культурами", dinner: "Отвечают на вопрос недели" },
        stat: { active: "Активных людей онлайн", countries: "Представлено стран", languages: "Языков в общении", pledges: "Подписано обещаний", exchanges: "Культурных обменов" },
      },
    },
  },
  zh: {
    translation: {
      common: { language: "语言" },
      nav: { home: "首页", explore: "探索", table: "餐桌", liveMap: "实时地图", walk: "体验一天", timeline: "时间线", compare: "比较", pledge: "承诺", signIn: "登录", profile: "个人资料", connections: "人际连接", messages: "私信", menu: "菜单", newRequest: "新的连接请求", newMessage: "新私信" },
      score: { title: "你的旅程", body: "你已探索了世界上 {{percent}}% 的国家。" },
      hero: {
        eyebrow: "多元文化 · 万千故事 · 同一人类",
        titleMain: "同一个地球。万千故事。",
        titleAccent: "同一个人类。",
        subtitle: "通过一个为理解、共情与真相而打造的平台，探索每一种文化、每一个民族、每一种信仰和每一种视角。",
        ctaExplore: "探索世界", ctaDiscover: "发现人类",
        quote: "「每一种文化都是人类故事中的一章。」",
      },
      footer: { tagline: "多元文化。万千故事。同一人类。一扇通往地球上每个国家的历史、文化与共同人性的窗口。", navigation: "导航", legal: "法律", builtFor: "为探索者而造。", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "实时 · 人类正在线上",
        title: "人类实时地图",
        subtitle: "实时见证人类在地球各处学习、连接与成长。",
        layersTitle: "活动图层", layersSubtitle: "选择地球展示的内容",
        privacy: "保护隐私：标记仅显示大致区域——绝不显示精确位置或私人数据。",
        layer: { active: "活跃用户", new_member: "新成员", pledge: "人类承诺", cultural: "文化交流", dinner: "世界餐桌" },
        layerDesc: { active: "正在探索各国", new_member: "刚刚加入人类", pledge: "已签署承诺", cultural: "跨文化分享", dinner: "回答本周问题" },
        stat: { active: "在线活跃人类", countries: "涵盖国家", languages: "使用语言", pledges: "已签署承诺", exchanges: "文化交流" },
      },
    },
  },
  hi: {
    translation: {
      common: { language: "भाषा" },
      nav: { home: "मुख्य", explore: "खोजें", table: "मेज़", liveMap: "लाइव मानचित्र", walk: "एक दिन जिएँ", timeline: "समयरेखा", compare: "तुलना", pledge: "संकल्प", signIn: "साइन इन", profile: "प्रोफ़ाइल", connections: "संबंध", messages: "संदेश", menu: "मेन्यू", newRequest: "नया कनेक्शन अनुरोध", newMessage: "नया संदेश" },
      score: { title: "आपकी यात्रा", body: "आपने दुनिया के {{percent}}% देशों को देखा है।" },
      hero: {
        eyebrow: "अनेक संस्कृतियाँ · अनेक कहानियाँ · एक मानवता",
        titleMain: "एक पृथ्वी। अनेक कहानियाँ।",
        titleAccent: "एक मानवता।",
        subtitle: "समझ, सहानुभूति और सच्चाई के लिए बने एक मंच के माध्यम से हर संस्कृति, हर समुदाय, हर आस्था और हर दृष्टिकोण को जानें।",
        ctaExplore: "दुनिया देखें", ctaDiscover: "मानवता को जानें",
        quote: "«हर संस्कृति मानवता की कहानी का एक अध्याय है।»",
      },
      footer: { tagline: "अनेक संस्कृतियाँ। अनेक कहानियाँ। एक मानवता। पृथ्वी के हर राष्ट्र के इतिहास, संस्कृति और साझा मानवता की एक खिड़की।", navigation: "नेविगेशन", legal: "कानूनी", builtFor: "खोजकर्ताओं के लिए बना।", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "लाइव · मानवता ऑनलाइन है",
        title: "लाइव मानवता मानचित्र",
        subtitle: "मानवता को पूरी पृथ्वी पर वास्तविक समय में सीखते, जुड़ते और बढ़ते देखें।",
        layersTitle: "गतिविधि परतें", layersSubtitle: "चुनें कि ग्लोब क्या दिखाए",
        privacy: "गोपनीयता-सुरक्षित: मार्कर केवल अनुमानित क्षेत्र दिखाते हैं — कभी सटीक स्थान या निजी डेटा नहीं।",
        layer: { active: "सक्रिय उपयोगकर्ता", new_member: "नए सदस्य", pledge: "मानवता संकल्प", cultural: "सांस्कृतिक आदान-प्रदान", dinner: "विश्व भोज मेज़" },
        layerDesc: { active: "अभी देशों को देख रहे हैं", new_member: "अभी-अभी जुड़े", pledge: "संकल्प पर हस्ताक्षर किए", cultural: "संस्कृतियों के बीच साझा कर रहे हैं", dinner: "इस सप्ताह के प्रश्न का उत्तर दे रहे हैं" },
        stat: { active: "ऑनलाइन सक्रिय मानव", countries: "प्रतिनिधित्व वाले देश", languages: "बोली जाने वाली भाषाएँ", pledges: "हस्ताक्षरित संकल्प", exchanges: "सांस्कृतिक आदान-प्रदान" },
      },
    },
  },
  ja: {
    translation: {
      common: { language: "言語" },
      nav: { home: "ホーム", explore: "探索", table: "食卓", liveMap: "ライブマップ", walk: "一日を体験", timeline: "年表", compare: "比較", pledge: "誓い", signIn: "サインイン", profile: "プロフィール", connections: "つながり", messages: "メッセージ", menu: "メニュー", newRequest: "新しいつながりリクエスト", newMessage: "新しいメッセージ" },
      score: { title: "あなたの旅", body: "世界の国々の{{percent}}%を探索しました。" },
      hero: {
        eyebrow: "多くの文化 · 多くの物語 · ひとつの人類",
        titleMain: "ひとつの地球。多くの物語。",
        titleAccent: "ひとつの人類。",
        subtitle: "理解と共感、そして真実のために作られたプラットフォームを通して、あらゆる文化、人々、信仰、視点を探索しましょう。",
        ctaExplore: "世界を探索", ctaDiscover: "人類を知る",
        quote: "「すべての文化は人類の物語の一章である。」",
      },
      footer: { tagline: "多くの文化。多くの物語。ひとつの人類。地球上のすべての国の歴史、文化、そして共有された人間性への窓。", navigation: "ナビゲーション", legal: "法的情報", builtFor: "探索者のために。", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "ライブ · 人類はオンライン",
        title: "ライブ人類マップ",
        subtitle: "人類が地球中で学び、つながり、成長する姿をリアルタイムで見守りましょう。",
        layersTitle: "アクティビティレイヤー", layersSubtitle: "地球儀が見せる内容を選択",
        privacy: "プライバシー保護：マーカーはおおよその地域のみを表示し、正確な位置や個人データは決して表示しません。",
        layer: { active: "アクティブユーザー", new_member: "新しいメンバー", pledge: "人類への誓い", cultural: "文化交流", dinner: "世界の食卓" },
        layerDesc: { active: "今、国々を探索中", new_member: "人類に加わったばかり", pledge: "誓いに署名済み", cultural: "文化を越えて共有中", dinner: "今週の質問に回答中" },
        stat: { active: "オンラインの人類", countries: "参加国数", languages: "話されている言語", pledges: "署名された誓い", exchanges: "文化交流" },
      },
    },
  },
  ar: {
    translation: {
      common: { language: "اللغة" },
      nav: { home: "الرئيسية", explore: "استكشاف", table: "المائدة", liveMap: "الخريطة الحية", walk: "عِش يومًا", timeline: "الخط الزمني", compare: "مقارنة", pledge: "التعهّد", signIn: "تسجيل الدخول", profile: "الملف الشخصي", connections: "روابط إنسانية", messages: "الرسائل", menu: "القائمة", newRequest: "طلب تواصل جديد", newMessage: "رسالة جديدة" },
      score: { title: "رحلتك", body: "لقد استكشفت {{percent}}٪ من دول العالم." },
      hero: {
        eyebrow: "ثقافات كثيرة · قصص كثيرة · إنسانية واحدة",
        titleMain: "أرض واحدة. قصص كثيرة.",
        titleAccent: "إنسانية واحدة.",
        subtitle: "استكشف كل ثقافة وكل شعب وكل معتقد وكل وجهة نظر عبر منصّة بُنيت من أجل الفهم والتعاطف والحقيقة.",
        ctaExplore: "استكشف العالم", ctaDiscover: "اكتشف الإنسانية",
        quote: "«كل ثقافة فصل في قصة الإنسانية.»",
      },
      footer: { tagline: "ثقافات كثيرة. قصص كثيرة. إنسانية واحدة. نافذة على تاريخ وثقافة كل أمة على الأرض وإنسانيتها المشتركة.", navigation: "التنقّل", legal: "قانوني", builtFor: "صُمِّم للمستكشفين.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "مباشر · الإنسانية متصلة الآن",
        title: "خريطة الإنسانية الحية",
        subtitle: "شاهد الإنسانية تتعلّم وتتواصل وتنمو عبر الأرض في الوقت الفعلي.",
        layersTitle: "طبقات النشاط", layersSubtitle: "اختر ما تكشفه الكرة الأرضية",
        privacy: "يحترم الخصوصية: تُظهر العلامات مناطق تقريبية فقط — لا مواقع دقيقة ولا بيانات خاصة أبدًا.",
        layer: { active: "مستخدمون نشطون", new_member: "أعضاء جدد", pledge: "تعهّدات الإنسانية", cultural: "تبادلات ثقافية", dinner: "مائدة العالم" },
        layerDesc: { active: "يستكشفون الدول الآن", new_member: "انضمّوا للتو", pledge: "وقّعوا التعهّد", cultural: "يتشاركون بين الثقافات", dinner: "يجيبون عن سؤال الأسبوع" },
        stat: { active: "بشر نشطون متصلون", countries: "الدول الممثَّلة", languages: "اللغات المنطوقة", pledges: "التعهّدات الموقّعة", exchanges: "التبادلات الثقافية" },
      },
    },
  },
  he: {
    translation: {
      common: { language: "שפה" },
      nav: { home: "בית", explore: "חקרו", table: "השולחן", liveMap: "מפה חיה", walk: "חוו יום", timeline: "ציר הזמן", compare: "השוואה", pledge: "התחייבות", signIn: "התחברות", profile: "פרופיל", connections: "קשרים", messages: "הודעות", menu: "תפריט", newRequest: "בקשת קשר חדשה", newMessage: "הודעה חדשה" },
      score: { title: "המסע שלך", body: "חקרת {{percent}}% מאומות העולם." },
      hero: {
        eyebrow: "תרבויות רבות · סיפורים רבים · אנושות אחת",
        titleMain: "כדור ארץ אחד. סיפורים רבים.",
        titleAccent: "אנושות אחת.",
        subtitle: "גלו כל תרבות, כל עם, כל אמונה וכל נקודת מבט דרך פלטפורמה שנבנתה למען הבנה, אמפתיה ואמת.",
        ctaExplore: "גלו את העולם", ctaDiscover: "גלו את האנושות",
        quote: "«כל תרבות היא פרק בסיפור האנושות.»",
      },
      footer: { tagline: "תרבויות רבות. סיפורים רבים. אנושות אחת. חלון אל ההיסטוריה, התרבות והאנושיות המשותפת של כל אומה עלי אדמות.", navigation: "ניווט", legal: "מידע משפטי", builtFor: "נבנה עבור חוקרים.", copyright: "© {{year}} huMANity." },
      liveMap: {
        badge: "בשידור חי · האנושות מחוברת",
        title: "מפת האנושות החיה",
        subtitle: "צפו באנושות לומדת, מתחברת וצומחת ברחבי כדור הארץ בזמן אמת.",
        layersTitle: "שכבות פעילות", layersSubtitle: "בחרו מה הגלובוס חושף",
        privacy: "שומר על פרטיות: הסמנים מציגים אזורים משוערים בלבד — לעולם לא מיקומים מדויקים או מידע פרטי.",
        layer: { active: "משתמשים פעילים", new_member: "חברים חדשים", pledge: "התחייבויות אנושיות", cultural: "חילופי תרבות", dinner: "שולחן העולם" },
        layerDesc: { active: "חוקרים אומות כעת", new_member: "הצטרפו זה עתה", pledge: "חתמו על ההתחייבות", cultural: "חולקים בין תרבויות", dinner: "עונים על שאלת השבוע" },
        stat: { active: "בני אדם פעילים מחוברים", countries: "מדינות מיוצגות", languages: "שפות מדוברות", pledges: "התחייבויות שנחתמו", exchanges: "חילופי תרבות" },
      },
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: LANGUAGES.map((l) => l.code),
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "humanity_lang",
    },
  });

function applyDir(lng: string) {
  const dir = isRtl(lng) ? "rtl" : "ltr";
  if (typeof document !== "undefined") {
    document.documentElement.dir = dir;
    document.documentElement.lang = lng.split("-")[0];
  }
}

applyDir(i18n.resolvedLanguage || "en");
i18n.on("languageChanged", applyDir);

export default i18n;
