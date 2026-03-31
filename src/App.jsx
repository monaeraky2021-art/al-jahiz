import { useState, useMemo } from "react";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const LESSONS_AR = [
  "الله ربي","سورة الفاتحة","الصدق طريق الجنة","أركان الإسلام","سورة الإخلاص","مولد الرسول محمد ﷺ",
  "الله الرَّحمن","سورة الفيل","دعاء النوم","أبو هريرة رضي الله عنه","الوضوء","الرَّحمة بالحيوان",
  "سورة العلق","أركان الإيمان","آداب النظافة في الإسلام","المسلم عون لأخيه","أحب أسرتي","رسولنا محمد ﷺ في رعاية جده وعمه",
  "الله الخالق العظيم","سورة الناس","صلاتي نور حياتي","البر حسن الخلق","سورة قريش",
  "أحب مخلوقات ربي","سورة الكوثر","أسماء بنت أبي بكر الصديق رضي الله عنها","من آداب الطعام","الرحمة",
  "التسامح","أحب الزراعة","خيركم من تعلم القرآن وعلمه","سورة النصر",
  "سورة البروج","آداب دخول المنزل والخروج منه","أصدق القول","فضل الصلاة على النبي ﷺ","ثمرات العبادة","فضل تلاوة القرآن الكريم",
  "الله الرزاق","سورة التين","آداب السفر","الهجرة إلى الحبشة","صلاة التطوع","سورة الأعلى",
  "سورة العاديات","الإيمان بالرسل والأنبياء عليهم السلام","الرفق بالحيوان","خديجة بنت خويلد رضي الله عنها","صلاة الوتر","سورة الزلزلة",
  "سورة الشرح","الإيمان بالكتب السماوية","فضل إماطة الأذى عن الطريق","إسلام أهل المدينة - بيعة العقبة","صلاة الجماعة","سورة الضحى",
  "سورة القارعة","المسئولية تجاه المجتمع","التعاون","الهجرة إلى المدينة المنورة","صلاة الجمعة","سورة القدر",
  "سورة البينة","العمل عبادة","الأمانة","بناء المسجد النبوي والمؤاخاة","سنن الصلاة","سورة التكاثر",
  "آداب الطريق","بيعة العقبة","خلق التعاون","خلق الأمانة",
  "سورة النبأ (1-16)","الإيمان باليوم الآخر","أحكام النون الساكنة والتنوين - الإظهار الحلقي","من أخلاق النبي ﷺ: الصدق والأمانة","أدعية الاستفتاح والركوع والسجود",
  "سورة النبأ (17-40)","سورة النازعات","الرفق في التعامل مع الكائنات","رحلة الرسول ﷺ إلى الطائف","صلاة المسافر",
  "سورة عبس","الإيمان بالقدر","أحكام النون الساكنة والتنوين - الإدغام","الصبر واليقين: قصة أصحاب الأخدود","صلاة المريض",
  "سورة التكوير","البيئة أمانة","أحكام النون الساكنة والتنوين - الإقلاب","الإسراء والمعراج","صلاة العيدين",
  "سورة الانفطار","العمل الصالح: مفهومه وأنواعه","أحكام النون الساكنة والتنوين - الإخفاء الحقيقي","إسلام الأنصار: بيعة العقبة","أحكام الميم الساكنة",
  "سورة المطففين","التراحم والتعاطف","التوكل على الله",
  "سورة السجدة (1-12)","أحكام المد: المد الطبيعي","بشارات الخير في السنة النبوية","صلاة التطوع: السنن الرواتب",
  "سورة السجدة (13-30)","التفكر في خلق الله","أحكام المد: المد الفرعي بسبب الهمز","رحمة النبي ﷺ","أحكام الإمامة في الصلاة",
  "سورة الملك (1-14)","الإيمان بالقدر: الرضا بقضاء الله","أحكام المد: المد الفرعي بسبب السكون","أهمية العمل في الإسلام","صلاة المريض والمسافر",
  "سورة الملك (15-30)","أحكام المد: مد الصلة","صلاة الجمعة والعيدين",
  "سورة الواقعة (1-56)","العمل الصالح: مفهومه وأثره","التعاون: قوة المجتمع","بناء المجتمع في المدينة المنورة","آداب المجلس",
  "سورة الواقعة (57-96)",
  "سورة يس (1-12)","الاستقصاء العلمي","أحكام المد: المد اللازم","أخلاق الرسول ﷺ: التواضع واللين",
  "سورة يس (13-27)","اليوم الآخر: حقيقة البعث والنشور","أحكام المد: المد العارض للسكون","شجاعة النبي ﷺ","أحكام الصيام",
  "سورة يس (28-54)","آداب الطعام والشراب في الإسلام","السيدة فاطمة الزهراء رضي الله عنها",
  "سورة يس (55-83)","العدل في الإسلام","غزوة بدر الكبرى","صلاة الكسوف والخسوف والاستسقاء",
  "سورة القلم (1-33)","أهمية العلم والعمل في الإسلام","غزوة أحد: الدروس والعبر","أحكام الزكاة ومصارفها",
  "سورة القلم (34-52)","المحافظة على البيئة في الإسلام","صلح الحديبية ونتائجه","آداب الحديث والمجالس",
  "سورة الفرقان (1-20)","الإيمان باليوم الآخر: الحساب والجزاء","أحكام التجويد: مخارج الحروف - الجوف والحلق","من أخلاق الرسول ﷺ: الأمانة والوفاء","صلاة الجماعة وأحكامها",
  "سورة الفرقان (21-44)","أحكام التجويد: مخارج الحروف - اللسان","ثبات النبي ﷺ وصبره","أحكام الزكاة: زكاة الأنعام والزروع",
  "سورة الفرقان (45-62)","الإيمان بالرسل عليهم السلام","أحكام التجويد: مخارج الحروف - الشفتان والخيشوم","السيدة عائشة أم المؤمنين رضي الله عنها","أحكام الحج وعمرة",
  "سورة الفرقان (63-77)","الاعتدال في الإنفاق","الشورى في الإسلام","غزوة خيبر","أحكام الأضحية والعقيقة",
  "سورة القصص (1-21)","الحياء في الإسلام","أهمية الوقت في حياة المسلم","فتح مكة: النصر المبين","أحكام المواريث",
  "سورة القصص (22-43)","التراحم والتعاطف الاجتماعي","المسؤولية تجاه الوطن","غزوة حنين","آداب الاستئذان والبيوت",
  "سورة الحجرات (1-10)","المنهج العلمي في الإسلام: التثبت والتبين","أحكام التجويد: صفات الحروف - الصفات التي لها ضد","من أخلاق النبي ﷺ: الحكمة والموعظة الحسنة",
  "سورة الحجرات (11-18)","اليوم الآخر: الجنة والنار","أحكام التجويد: صفات الحروف - الصفات التي ليس لها ضد","ثبات النبي ﷺ وصبره في الدعوة","أحكام الزكاة: زكاة النقدين وعروض التجارة",
  "سورة الكهف (1-16)","الإيمان بالملائكة عليهم السلام","السيدة خديجة بنت خويلد رضي الله عنها",
  "سورة الكهف (17-31)","التوازن والاعتدال في الإسلام","المسؤولية تجاه المجتمع والوطن","غزوة تبوك",
  "سورة الكهف (32-53)","الحياء والعفة في الإسلام","أهمية العمل والإنتاج في بناء الحضارة","حجة الوداع ووفاة النبي ﷺ","أحكام المعاملات المالية في الإسلام",
  "سورة الكهف (54-82)","المواطنة الإيجابية","خلفاء الرسول ﷺ: أبو بكر الصديق وعمر بن الخطاب",
  "سورة الكهف (83-110)","المنهج العلمي في القرآن الكريم","فقه الصلاة: صلاة الجماعة وأحكام الإمامة",
  "سورة الأحزاب (1-27)","عالم الغيب: الملائكة والجن","أحكام الزكاة: المصارف والغايات",
  "سورة الأحزاب (28-48)","الإيمان بالكتب السماوية: الهداية الإلهية","أم المؤمنين السيدة عائشة رضي الله عنها","أحكام الحج والعمرة",
  "سورة الأحزاب (49-73)","العفة والحياء في الإسلام","المسؤولية المجتمعية والعمل التطوعي","فتح مكة: منهج العفو والتسامح","فقه المعاملات: البيوع المحرمة",
  "سورة يوسف (1-21)","أهمية الوقت والعمل الصالح","أحكام النكاح في الإسلام",
  "سورة يوسف (22-53)","المواطنة الصالحة والولاء للوطن","الخلفاء الراشدون: عثمان بن عفان وعلي بن أبي طالب","آداب الاستئذان والعلاقات الأسرية",
];

const LESSONS_EN = [
  "Allah is my Lord","Surah Al-Fatiha","Truthfulness: The Path to Paradise","The Five Pillars of Islam","Surah Al-Ikhlas","The Birth of Prophet Muhammad ﷺ",
  "Allah is Al-Rahman","Surah Al-Fil","Supplication Before Sleep","Abu Hurairah (May Allah be pleased with him)","Wudu (Ablution)","Mercy Towards Animals",
  "Surah Al-Alaq","The Six Pillars of Faith","Islamic Hygiene Etiquettes","A Muslim Helps His Brother","I Love My Family","Prophet Muhammad ﷺ Under the Care of His Grandfather and Uncle",
  "Allah: The Great Creator","Surah An-Nas","My Prayer is the Light of My Life","Righteousness is Good Character","Surah Quraysh",
  "I Love Allah's Creatures","Surah Al-Kawthar","Asma bint Abi Bakr","Etiquettes of Eating","Mercy","Tolerance","I Love Farming","The Best of You Learns the Quran and Teaches It","Surah An-Nasr",
  "Surah Al-Buruj","Etiquettes of Entering and Leaving Home","Truthfulness","The Virtue of Sending Blessings upon the Prophet ﷺ","The Fruits of Worship","The Virtue of Reciting the Quran",
  "Allah is Al-Razzaq","Surah At-Tin","Etiquettes of Travel","Migration to Abyssinia","Voluntary Prayer","Surah Al-Ala",
  "Surah Al-Adiyat","Belief in Prophets and Messengers","Kindness to Animals","Khadijah bint Khuwaylid","Witr Prayer","Surah Az-Zalzalah",
  "Surah Ash-Sharh","Belief in the Holy Books","Removing Harm from the Road","The Pledge of Aqabah","Congregational Prayer","Surah Ad-Duha",
  "Surah Al-Qari'ah","Responsibility Towards Society","Cooperation","Migration to Madinah","Friday Prayer","Surah Al-Qadr",
  "Surah Al-Bayyinah","Work is Worship","Trustworthiness","Building the Prophet's Mosque and Brotherhood","Sunnah Acts of Prayer","Surah At-Takathur",
  "Surah An-Naba (1-16)","Belief in the Day of Judgment","Noon Saakinah: Ith-har","The Prophet's Character: Honesty and Trustworthiness","Supplications in Prayer",
  "Surah An-Naba (17-40)","Surah An-Nazi'at","Gentleness with All Creatures","The Prophet's Journey to Ta'if","Prayer While Travelling",
  "Surah Abasa","Belief in Divine Decree","Noon Saakinah: Idgham","Patience and Certainty: The People of the Trench","Prayer for the Sick",
  "Surah At-Takwir","The Environment is a Trust","Noon Saakinah: Iqlab","Al-Isra' and Al-Mi'raj","Friday Prayer",
  "Surah Al-Infitar","Good Deeds: Types and Concept","Noon Saakinah: Ikhfa'","The Ansar Accept Islam","Eid Prayer",
  "Surah Al-Mutaffifin","Compassion and Empathy","Reliance on Allah (Tawakkul)",
  "Surah As-Sajdah (1-12)","Belief in the Day of Judgment: Resurrection","Natural Madd","Voluntary Prayer: Sunnah Prayers",
  "Surah As-Sajdah (13-30)","Reflecting on Allah's Creation","Madd due to Hamzah","The Prophet's Mercy","Rules of Leading Prayer",
  "Surah Al-Mulk (1-14)","Belief in Divine Decree","Madd due to Sukoon","The Importance of Work in Islam","Prayer for the Sick and Traveller",
  "Surah Al-Mulk (15-30)","Silah Madd","Friday and Eid Prayers",
  "Surah Al-Waqi'ah (1-56)","Good Deeds: Concept and Impact","Cooperation: The Strength of Society","Building Society in Madinah","Etiquettes of Gatherings",
  "Surah Al-Waqi'ah (57-96)",
  "Surah Ya-Sin (1-12)","Scientific Inquiry","Obligatory Madd","The Prophet's Character: Humility and Gentleness","Congregational and Friday Prayer",
  "Surah Ya-Sin (13-27)","The Day of Judgment","Arid Lil-Sukoon Madd","The Prophet's Courage in Truth","Rules of Fasting",
  "Surah Ya-Sin (28-54)","Etiquettes of Food and Drink","Fatimah Az-Zahra",
  "Surah Ya-Sin (55-83)","Justice in Islam","Battle of Badr","Eclipse and Rain Prayers",
  "Surah Al-Qalam (1-33)","The Importance of Knowledge and Work","Battle of Uhud","Zakat and its Recipients",
  "Surah Al-Qalam (34-52)","Environmental Conservation in Islam","Treaty of Hudaybiyyah","Etiquettes of Speech and Gatherings",
  "Surah Al-Furqan (1-20)","Belief in the Day of Judgment: Reckoning","Tajweed: Articulation Points - Throat","The Prophet's Character: Honesty and Loyalty","Congregational Prayer Rules",
  "Surah Al-Furqan (21-44)","Tajweed: Articulation Points - Tongue","The Prophet's Steadfastness","Zakat on Livestock and Crops",
  "Surah Al-Furqan (45-62)","Belief in the Messengers","Tajweed: Articulation Points - Lips and Nose","Aisha (Mother of the Believers)","Hajj and Umrah",
  "Surah Al-Furqan (63-77)","Moderation in Spending","Shura in Islam","Battle of Khaybar","Udhiyah and Aqiqah",
  "Surah Al-Qasas (1-21)","Modesty in Islam","The Importance of Time","The Conquest of Makkah","Inheritance: General Principles",
  "Surah Al-Qasas (22-43)","Social Compassion","Responsibility Towards the Nation","Battle of Hunayn","Etiquettes of Seeking Permission",
  "Surah Al-Hujurat (1-10)","Scientific Method in Islam: Verification","Letter Characteristics - With Opposites","The Prophet's Wisdom","Eclipse and Rain Prayers",
  "Surah Al-Hujurat (11-18)","Paradise and Hellfire","Letter Characteristics - Without Opposites","The Prophet's Steadfastness in Calling to Islam","Zakat on Gold, Silver and Trade",
  "Surah Al-Kahf (1-16)","Belief in Angels","Khadijah bint Khuwaylid",
  "Surah Al-Kahf (17-31)","Balance and Moderation in Islam","Responsibility Towards Society and Nation","Battle of Tabuk","Udhiyah and Aqiqah",
  "Surah Al-Kahf (32-53)","Modesty and Chastity in Islam","The Importance of Work and Production","The Farewell Pilgrimage","Financial Transactions in Islam",
  "Surah Al-Kahf (54-82)","Human Compassion","Positive Citizenship","The Rightly-Guided Caliphs: Abu Bakr and Umar",
  "Surah Al-Kahf (83-110)","Scientific Method in the Quran","Congregational Prayer and Imamate",
  "Surah Al-Ahzab (1-27)","The Unseen World: Angels and Jinn","Zakat: Distribution and Purposes",
  "Surah Al-Ahzab (28-48)","Belief in the Holy Books","Aisha (Mother of the Believers)","Hajj and Umrah",
  "Surah Al-Ahzab (49-73)","Chastity and Modesty in Islam","Community Responsibility and Volunteering","The Conquest of Makkah: Forgiveness","Prohibited Trade Transactions",
  "Surah Yusuf (1-21)","The Importance of Time and Good Deeds","Marriage in Islam",
  "Surah Yusuf (22-53)","Patriotism and Loyalty","The Rightly-Guided Caliphs: Uthman and Ali","Etiquettes of Seeking Permission",
];

function markdownToHTML(md) {
  if (!md) return '';
  let html = md
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

  html = html.replace(/(\|.+\|\n?)+/g, function (table) {
    const rows = table.trim().split('\n');
    let out = '<table>';
    rows.forEach((row, i) => {
      if (row.match(/^\|[-| ]+\|$/)) return;
      const cells = row.split('|').filter((_, j, a) => j > 0 && j < a.length - 1);
      const tag = i === 0 ? 'th' : 'td';
      out += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    });
    return out + '</table>';
  });

  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  html = html.split('\n\n').map(block => {
    if (block.match(/^<(h[1-4]|ul|ol|table|hr|blockquote)/)) return block;
    if (block.trim() === '') return '';
    return `<p>${block.replace(/\n/g, ' ')}</p>`;
  }).join('');

  return html;
}

export default function AlJahiz() {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stored, setStored] = useState({ plan: '', worksheet: null, assessment: '', individual: '' });
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEn = subject === 'Islamic Education';

  const lessonsList = isEn ? LESSONS_EN : LESSONS_AR;
  const suggestions = useMemo(() => {
    if (!search.trim() || !subject) return [];
    return lessonsList.filter(l => l.toLowerCase().includes(search.toLowerCase())).slice(0, 8);
  }, [search, subject, isEn]);

  // Check if we're in student/worksheet view mode
  const urlParams = new URLSearchParams(window.location.search);
  const wsParam = urlParams.get('ws');
  const studentWorksheet = wsParam ? (() => { try { return JSON.parse(decodeURIComponent(wsParam)); } catch { return null; } })() : null;

  function shareWorksheet() {
    if (!stored.worksheet) return;
    const encoded = encodeURIComponent(JSON.stringify(stored.worksheet));
    const url = `${window.location.origin}${window.location.pathname}?ws=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  async function callAPI(prompt, system) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  async function callJSON(prompt, system) {
    const text = await callAPI(prompt, system + '\nأجب فقط بـ JSON صحيح بدون أي نص إضافي أو backticks.');
    try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch { return null; }
  }

  async function generate() {
    if (!subject || !topic.trim()) return alert('يرجى إكمال جميع الحقول');
    setLoading(true); setGenerated(false); setAnswers({}); setFeedback({});

    const sys = isEn
      ? 'You are an expert UAE teacher. Write professionally in English using Markdown: # for headings, ** for bold, - for lists, | for tables.'
      : 'أنت معلم خبير في الإمارات. اكتب بأسلوب احترافي باللغة العربية مع Markdown: # للعناوين، ** للغامق، - للقوائم، | للجداول.';

    const planP = isEn
      ? `Create a complete lesson plan for "${subject}" on "${topic}". Include: # General Objective, ## Bloom's Taxonomy Outcomes (table), ## New Learning Steps, ## Assessment for Learning, ## Critical Thinking Questions, ## UAE Cultural Connection, ## Cross-curricular Links, ## Creative Closure, ## Project (if applicable), ## Exit Ticket, ## Homework.`
      : `أنشئ خطة درس متكاملة لمادة "${subject}" عن "${topic}". اشمل: # الهدف العام, ## مخرجات التعلم حسب بلوم (جدول), ## التعلم الجديد, ## التقييم من أجل التعلم, ## أسئلة التفكير الناقد, ## الربط بالثقافة الإماراتية, ## الربط بالمواد الأخرى, ## الخاتمة المميزة, ## المشروع (إن وجد), ## تذكرة الخروج, ## الواجب المنزلي`;

    const wsP = isEn
      ? `Create 5 questions for "${subject}" on "${topic}". JSON only: {"title":"...","questions":[{"id":1,"type":"mcq","question":"...","options":["A","B","C","D"],"correct":0},{"id":2,"type":"fill","question":"Complete: ___ is ...","correct":"answer"},{"id":3,"type":"truefalse","question":"...","correct":true},{"id":4,"type":"mcq","question":"...","options":["A","B","C","D"],"correct":2},{"id":5,"type":"open","question":"..."}]}`
      : `أنشئ 5 أسئلة لمادة "${subject}" عن "${topic}". JSON فقط: {"title":"...","questions":[{"id":1,"type":"mcq","question":"...","options":["أ","ب","ج","د"],"correct":0},{"id":2,"type":"fill","question":"أكمل: ___ هو ...","correct":"إجابة"},{"id":3,"type":"truefalse","question":"...","correct":true},{"id":4,"type":"mcq","question":"...","options":["أ","ب","ج","د"],"correct":2},{"id":5,"type":"open","question":"..."}]}`;

    const assP = isEn
      ? `Create a diverse assessment for "${subject}" on "${topic}" for all levels. Use markdown.`
      : `أنشئ تقييماً متنوعاً لمادة "${subject}" عن "${topic}" لجميع المستويات. استخدم Markdown.`;

    const indP = isEn
      ? `Create individual plans for "${subject}" on "${topic}" for: Beginner, Intermediate, Advanced, Language weakness, Learning difficulties, ADHD. Styles: Visual, Auditory, Kinesthetic. For each: individual + group activity. Use markdown.`
      : `أنشئ خططاً فردية لمادة "${subject}" عن "${topic}" لكل: مبتدئ، متوسط، متميز، ضعف لغوي، صعوبات تعلم، فرط حركة. أنماط: بصري، سمعي، حركي. لكل فئة: نشاط فردي + جماعي. استخدم Markdown.`;

    try {
      const [plan, worksheet, assessment, individual] = await Promise.all([
        callAPI(planP, sys),
        callJSON(wsP, sys),
        callAPI(assP, sys),
        callAPI(indP, sys),
      ]);
      setStored({ plan, worksheet, assessment, individual });
      setGenerated(true); setActiveTab(0);
    } catch (e) {
      alert('حدث خطأ: ' + e.message);
    }
    setLoading(false);
  }

  function toggleSpeak(text) {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA'; u.rate = 0.9; u.pitch = 1;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function answerMCQ(id, ans, correct) {
    setAnswers(p => ({ ...p, [id]: ans }));
    setFeedback(p => ({ ...p, [id]: ans === correct }));
  }
  function answerTF(id, ans, correct) {
    setAnswers(p => ({ ...p, [id]: ans }));
    setFeedback(p => ({ ...p, [id]: ans === correct }));
  }
  function answerFill(id, val, correct) {
    setAnswers(p => ({ ...p, [id]: val }));
    setFeedback(p => ({ ...p, [id]: val.trim().toLowerCase() === correct.trim().toLowerCase() }));
  }

  const tabs = ['📋 خطة الدرس', '📝 ورقة العمل', '✅ التقييم', '🎯 الخطط الفردية'];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Tajawal',sans-serif;background:#faf8f2;color:#1a1a2e;direction:rtl}
    .md-content{line-height:1.9;font-size:15px;color:#333}
    .md-content h1{font-size:21px;font-weight:900;color:#1a1a2e;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid #c9a84c}
    .md-content h2{font-size:17px;font-weight:800;color:#1b4965;margin:20px 0 10px}
    .md-content h3{font-size:15px;font-weight:700;color:#2d6a4f;margin:16px 0 8px}
    .md-content h4{font-size:14px;font-weight:700;color:#c9a84c;margin:12px 0 6px}
    .md-content p{margin-bottom:10px}
    .md-content strong{font-weight:800;color:#1a1a2e}
    .md-content ul{padding-right:20px;margin-bottom:12px}
    .md-content li{margin-bottom:6px;line-height:1.7}
    .md-content table{width:100%;border-collapse:collapse;margin:16px 0;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
    .md-content th{background:#1a1a2e;color:#fff;padding:12px 16px;font-size:13px;font-weight:700;text-align:right}
    .md-content td{padding:11px 16px;border-bottom:1px solid #f0ece0;font-size:14px}
    .md-content tr:nth-child(even) td{background:#faf8f2}
    .md-content tr:last-child td{border-bottom:none}
    .md-content hr{border:none;height:2px;background:linear-gradient(90deg,#c9a84c,transparent);margin:20px 0}
    .md-content blockquote{border-right:4px solid #c9a84c;background:rgba(201,168,76,0.06);padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0}
  `;

  // STUDENT WORKSHEET VIEW
  if (studentWorksheet) {
    return <StudentView ws={studentWorksheet} />;
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: '#faf8f2', fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>

        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#2d2d5e 60%,#1b4965 100%)', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(201,168,76,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>الجاهز <span style={{ color: '#c9a84c' }}>⚡</span></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, letterSpacing: 1 }}>حزمة الدرس الكاملة في ثوانٍ</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'left', lineHeight: 1.6 }}>© Mona Eraky<br />دفتر المعلم</div>
          </div>
        </div>
        <div style={{ height: 3, background: 'linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c)' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>

          {/* INPUT CARD */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 8px 32px rgba(26,26,46,0.10)', marginBottom: 24, border: '1px solid rgba(201,168,76,0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: 'linear-gradient(180deg,#c9a84c,#f0d080)' }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#c9a84c', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              بيانات الدرس
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, opacity: 0.7 }}>{isEn ? 'Subject' : 'المادة الدراسية'}</label>
              <select value={subject} onChange={e => { setSubject(e.target.value); setSearch(''); setTopic(''); setGenerated(false); }} style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #e8e4d9', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: 15, fontWeight: 500, color: '#1a1a2e', background: '#faf8f2', outline: 'none' }}>
                <option value="">اختر المادة</option>
                <option>اللغة العربية</option>
                <option>التربية الإسلامية</option>
                <option>Islamic Education</option>
              </select>
            </div>
            <div style={{ marginBottom: 20, position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, opacity: 0.7 }}>
                {isEn ? 'Search for a Lesson' : 'ابحث عن درس'}
              </label>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setTopic(e.target.value); setShowSuggestions(true); setGenerated(false); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={!subject ? (isEn ? 'Choose a subject first...' : 'اختر المادة أولاً...') : (isEn ? 'Type lesson name...' : 'اكتب اسم الدرس...')}
                disabled={!subject}
                style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #e8e4d9', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: 15, color: '#1a1a2e', background: !subject ? '#f5f5f5' : '#faf8f2', outline: 'none' }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(26,26,46,0.15)', zIndex: 100, marginTop: 4, overflow: 'hidden', border: '1px solid #e8e4d9' }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => { setSearch(s); setTopic(s); setShowSuggestions(false); }}
                      style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.target.style.background = '#faf8f2'}
                      onMouseLeave={e => e.target.style.background = '#fff'}>
                      🔍 {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={generate} disabled={!subject || !topic.trim() || loading}
              style={{ width: '100%', padding: 16, background: (!subject || !topic.trim() || loading) ? '#ccc' : 'linear-gradient(135deg,#1a1a2e,#2d2d5e)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: "'Tajawal',sans-serif", fontSize: 17, fontWeight: 800, cursor: (!subject || !topic.trim() || loading) ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
              {loading ? '⏳ جاري الإنشاء...' : '⚡ أنشئ الحزمة الكاملة'}
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(26,26,46,0.10)', textAlign: 'center' }}>
              <div style={{ color: '#c9a84c', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🔄 جاري إنشاء حزمتك التعليمية...</div>
              {[90, 75, 85, 60, 80].map((w, i) => (
                <div key={i} style={{ height: 14, borderRadius: 8, marginBottom: 10, width: `${w}%`, background: 'linear-gradient(90deg,#f0ece0 25%,#e8e4d4 50%,#f0ece0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ))}
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          )}

          {/* OUTPUT */}
          {generated && !loading && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {tabs.map((tab, i) => (
                  <button key={i} onClick={() => setActiveTab(i)}
                    style={{ padding: '10px 20px', borderRadius: 50, fontFamily: "'Tajawal',sans-serif", fontSize: 14, fontWeight: 700, border: activeTab === i ? 'none' : '2px solid #e8e4d9', background: activeTab === i ? 'linear-gradient(135deg,#1a1a2e,#2d2d5e)' : '#fff', color: activeTab === i ? '#fff' : '#888', cursor: 'pointer', boxShadow: activeTab === i ? '0 4px 20px rgba(26,26,46,0.25)' : 'none' }}>
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 8px 32px rgba(26,26,46,0.10)', border: '1px solid rgba(201,168,76,0.12)' }}>

                {/* TAB HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #faf8f2' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{tabs[activeTab]}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {activeTab === 1 && stored.worksheet && (
                      <button onClick={shareWorksheet}
                        style={{ padding: '8px 18px', borderRadius: 50, border: 'none', background: copied ? '#2d6a4f' : '#c9a84c', color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>
                        {copied ? '✅ تم نسخ الرابط!' : '🔗 شارك ورقة العمل'}
                      </button>
                    )}
                    {activeTab !== 1 && (
                      <button onClick={() => toggleSpeak([stored.plan, '', stored.assessment, stored.individual][activeTab])}
                        style={{ padding: '8px 18px', borderRadius: 50, border: 'none', background: speaking ? '#c1440e' : '#faf8f2', color: speaking ? '#fff' : '#1a1a2e', fontFamily: "'Tajawal',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        {speaking ? '⏹ إيقاف' : '🔊 استمع'}
                      </button>
                    )}
                  </div>
                </div>

                {/* TAB 0: PLAN */}
                {activeTab === 0 && <div className="md-content" dangerouslySetInnerHTML={{ __html: markdownToHTML(stored.plan) }} />}

                {/* TAB 1: WORKSHEET */}
                {activeTab === 1 && stored.worksheet && (
                  <>
                    {stored.worksheet.questions?.map((q, i) => {
                      const fb = feedback[q.id];
                      const hasAns = answers[q.id] !== undefined;
                      const borderColor = hasAns ? (fb === true ? '#52b788' : fb === false ? '#e76f51' : '#f0ece0') : '#f0ece0';
                      const bgColor = hasAns ? (fb === true ? '#f0fff8' : fb === false ? '#fff5f0' : '#fff') : '#fff';
                      return (
                        <div key={q.id} style={{ marginBottom: 14, borderRadius: 14, padding: 20, border: `2px solid ${borderColor}`, background: bgColor, transition: 'all 0.3s' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1a2e,#2d2d5e)', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.7, flex: 1 }}>{q.question}</div>
                          </div>

                          {q.type === 'mcq' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {q.options.map((o, idx) => {
                                const isSel = answers[q.id] === idx;
                                let bg = '#faf8f2', col = '#1a1a2e', border = '#e8e4d9';
                                if (isSel && fb === true) { bg = '#52b788'; col = '#fff'; border = '#52b788'; }
                                if (isSel && fb === false) { bg = '#e76f51'; col = '#fff'; border = '#e76f51'; }
                                return <button key={idx} disabled={hasAns} onClick={() => answerMCQ(q.id, idx, q.correct)} style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${border}`, background: bg, color: col, cursor: hasAns ? 'default' : 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: 14, fontWeight: 500, textAlign: 'right' }}>{o}</button>;
                              })}
                            </div>
                          )}

                          {q.type === 'truefalse' && (
                            <div style={{ display: 'flex', gap: 10 }}>
                              {[true, false].map(v => {
                                const isSel = answers[q.id] === v;
                                let bg = '#faf8f2', col = '#1a1a2e', border = '#e8e4d9';
                                if (isSel && fb === true) { bg = '#52b788'; col = '#fff'; border = '#52b788'; }
                                if (isSel && fb === false) { bg = '#e76f51'; col = '#fff'; border = '#e76f51'; }
                                return <button key={String(v)} disabled={hasAns} onClick={() => answerTF(q.id, v, q.correct)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `2px solid ${border}`, background: bg, color: col, cursor: hasAns ? 'default' : 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: 15, fontWeight: 700 }}>{v ? '✓ صح' : '✗ خطأ'}</button>;
                              })}
                            </div>
                          )}

                          {q.type === 'fill' && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                              <input id={`fill_${q.id}`} disabled={hasAns} placeholder="اكتب إجابتك..." style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e8e4d9', borderRadius: 10, fontFamily: "'Tajawal',sans-serif", fontSize: 14, background: '#faf8f2', outline: 'none' }} />
                              {!hasAns && <button onClick={() => { const v = document.getElementById(`fill_${q.id}`)?.value || ''; answerFill(q.id, v, q.correct); }} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#1a1a2e', color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>تحقق</button>}
                            </div>
                          )}

                          {q.type === 'open' && (
                            <textarea rows={3} placeholder="اكتب إجابتك هنا..." style={{ width: '100%', padding: 12, border: '1.5px solid #e8e4d9', borderRadius: 10, fontFamily: "'Tajawal',sans-serif", fontSize: 14, resize: 'vertical', background: '#faf8f2', marginTop: 4, outline: 'none' }} />
                          )}

                          {hasAns && fb !== undefined && (
                            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 14, color: fb ? '#2d6a4f' : '#c1440e' }}>
                              {fb ? '✅ أحسنت!' : `❌ الإجابة: ${q.type === 'truefalse' ? (q.correct ? 'صح' : 'خطأ') : q.type === 'mcq' ? q.options[q.correct] : q.correct}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {Object.keys(feedback).length > 0 && (
                      <div style={{ textAlign: 'center', padding: 20, background: 'linear-gradient(135deg,#1a1a2e,#2d2d5e)', borderRadius: 14, color: '#fff' }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#c9a84c' }}>{Object.values(feedback).filter(Boolean).length}/{Object.keys(feedback).length}</div>
                        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>إجاباتك الصحيحة</div>
                      </div>
                    )}
                  </>
                )}

                {/* TAB 2: ASSESSMENT */}
                {activeTab === 2 && <div className="md-content" dangerouslySetInnerHTML={{ __html: markdownToHTML(stored.assessment) }} />}

                {/* TAB 3: INDIVIDUAL */}
                {activeTab === 3 && (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {['مبتدئ 🟢', 'متوسط 🟡', 'متميز 🔵', 'ضعف لغوي 🟠', 'صعوبات تعلم 🔴', 'فرط حركة ⚡'].map(l => <span key={l} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, border: '1.5px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.08)', color: '#1a1a2e' }}>{l}</span>)}
                      {['بصري 👁', 'سمعي 👂', 'حركي 🤸'].map(l => <span key={l} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, border: '1.5px solid rgba(27,73,101,0.3)', background: 'rgba(27,73,101,0.06)', color: '#1b4965' }}>{l}</span>)}
                    </div>
                    <div className="md-content" dangerouslySetInnerHTML={{ __html: markdownToHTML(stored.individual) }} />
                  </>
                )}

              </div>
            </>
          )}

        </div>
        <div style={{ textAlign: 'center', color: '#bbb', fontSize: 11, padding: 24, letterSpacing: 1 }}>© Mona Eraky — دفتر المعلم 2026 | الجاهز ⚡</div>
      </div>
    </>
  );
}

// STUDENT WORKSHEET COMPONENT
function StudentView({ ws }) {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState(false);

  function toggleSpeak(text) {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA'; u.rate = 0.9; u.pitch = 1.1;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function answerMCQ(id, ans, correct) { setAnswers(p => ({ ...p, [id]: ans })); setFeedback(p => ({ ...p, [id]: ans === correct })); }
  function answerTF(id, ans, correct) { setAnswers(p => ({ ...p, [id]: ans })); setFeedback(p => ({ ...p, [id]: ans === correct })); }
  function answerFill(id, val, correct) { setAnswers(p => ({ ...p, [id]: val })); setFeedback(p => ({ ...p, [id]: val.trim().toLowerCase() === correct.trim().toLowerCase() })); }

  const score = Object.values(feedback).filter(Boolean).length;
  const total = Object.keys(feedback).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Tajawal',sans-serif;background:#faf8f2;direction:rtl}
      `}</style>
      <div style={{ minHeight: '100vh', background: '#faf8f2', fontFamily: "'Tajawal',sans-serif", direction: 'rtl' }}>

        {/* STUDENT HEADER */}
        <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2d5e)', padding: '20px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>ورقة عمل تفاعلية</div>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{ws.title}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => toggleSpeak(ws.questions?.map(q => q.question).join('. '))}
                style={{ padding: '8px 16px', borderRadius: 50, border: 'none', background: speaking ? '#c1440e' : 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {speaking ? '⏹' : '🔊 استمع'}
              </button>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'left' }}>© Mona Eraky<br />دفتر المعلم</div>
            </div>
          </div>
        </div>
        <div style={{ height: 3, background: 'linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c)' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

          {ws.questions?.map((q, i) => {
            const fb = feedback[q.id];
            const hasAns = answers[q.id] !== undefined;
            const borderColor = hasAns ? (fb === true ? '#52b788' : fb === false ? '#e76f51' : '#f0ece0') : '#f0ece0';
            const bgColor = hasAns ? (fb === true ? '#f0fff8' : fb === false ? '#fff5f0' : '#fff') : '#fff';

            return (
              <div key={q.id} style={{ marginBottom: 16, borderRadius: 16, padding: 22, border: `2px solid ${borderColor}`, background: bgColor, boxShadow: '0 4px 16px rgba(26,26,46,0.06)', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#f0d080)', color: '#1a1a2e', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.7, flex: 1, color: '#1a1a2e' }}>{q.question}</div>
                </div>

                {q.type === 'mcq' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {q.options.map((o, idx) => {
                      const isSel = answers[q.id] === idx;
                      let bg = '#faf8f2', col = '#1a1a2e', border = '#e8e4d9';
                      if (isSel && fb === true) { bg = '#52b788'; col = '#fff'; border = '#52b788'; }
                      if (isSel && fb === false) { bg = '#e76f51'; col = '#fff'; border = '#e76f51'; }
                      return <button key={idx} disabled={hasAns} onClick={() => answerMCQ(q.id, idx, q.correct)} style={{ padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color: col, cursor: hasAns ? 'default' : 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: 15, fontWeight: 600, textAlign: 'right', transition: 'all 0.2s' }}>{o}</button>;
                    })}
                  </div>
                )}

                {q.type === 'truefalse' && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[true, false].map(v => {
                      const isSel = answers[q.id] === v;
                      let bg = '#faf8f2', col = '#1a1a2e', border = '#e8e4d9';
                      if (isSel && fb === true) { bg = '#52b788'; col = '#fff'; border = '#52b788'; }
                      if (isSel && fb === false) { bg = '#e76f51'; col = '#fff'; border = '#e76f51'; }
                      return <button key={String(v)} disabled={hasAns} onClick={() => answerTF(q.id, v, q.correct)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `2px solid ${border}`, background: bg, color: col, cursor: hasAns ? 'default' : 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: 16, fontWeight: 800, transition: 'all 0.2s' }}>{v ? '✓ صح' : '✗ خطأ'}</button>;
                    })}
                  </div>
                )}

                {q.type === 'fill' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <input id={`s_fill_${q.id}`} disabled={hasAns} placeholder="اكتب إجابتك هنا..." style={{ flex: 1, padding: '12px 16px', border: '2px solid #e8e4d9', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: 15, background: '#fff', outline: 'none' }} />
                    {!hasAns && <button onClick={() => { const v = document.getElementById(`s_fill_${q.id}`)?.value || ''; answerFill(q.id, v, q.correct); }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: '#1a1a2e', color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>تحقق</button>}
                  </div>
                )}

                {q.type === 'open' && (
                  <textarea rows={3} placeholder="اكتب إجابتك هنا..." style={{ width: '100%', padding: 14, border: '2px solid #e8e4d9', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: 15, resize: 'vertical', background: '#fff', marginTop: 4, outline: 'none' }} />
                )}

                {hasAns && fb !== undefined && (
                  <div style={{ marginTop: 12, fontWeight: 800, fontSize: 15, color: fb ? '#2d6a4f' : '#c1440e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {fb ? '✅ أحسنت! إجابة صحيحة' : `❌ الإجابة الصحيحة: ${q.type === 'truefalse' ? (q.correct ? 'صح' : 'خطأ') : q.type === 'mcq' ? q.options[q.correct] : q.correct}`}
                  </div>
                )}
              </div>
            );
          })}

          {/* SCORE */}
          {total > 0 && (
            <div style={{ textAlign: 'center', padding: 28, background: 'linear-gradient(135deg,#1a1a2e,#2d2d5e)', borderRadius: 20, color: '#fff', marginTop: 8 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#c9a84c' }}>{score}/{total}</div>
              <div style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>
                {score === total ? '🌟 ممتاز! أجبت على جميع الأسئلة بشكل صحيح!' : score >= total / 2 ? '👍 جيد! استمر في المحاولة' : '💪 حاول مرة أخرى!'}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', color: '#ccc', fontSize: 11, padding: '20px 0', letterSpacing: 1 }}>© Mona Eraky — دفتر المعلم 2026 | الجاهز ⚡</div>
        </div>
      </div>
    </>
  );
}
