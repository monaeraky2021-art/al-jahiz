import { useState } from "react";

const COLORS = {
  grade2_4: {
    primary: "#FF6B6B", secondary: "#FFD93D", accent: "#6BCB77",
    bg: "#FFF9F0", text: "#2D2D2D"
  },
  grade5_8: {
    primary: "#4D96FF", secondary: "#FF922B", accent: "#51CF66",
    bg: "#F0F4FF", text: "#1A1A2E"
  },
  grade9_12: {
    primary: "#2C3E6B", secondary: "#C0963C", accent: "#4A9B6F",
    bg: "#F5F5F0", text: "#1A1A1A"
  }
};

const SOUNDS = {
  grade2_4: { rate: 0.85, pitch: 1.3 },
  grade5_8: { rate: 0.9, pitch: 1.1 },
  grade9_12: { rate: 0.95, pitch: 1.0 }
};

function getAgeGroup(grade) {
  const g = parseInt(grade);
  if (g <= 4) return "grade2_4";
  if (g <= 8) return "grade5_8";
  return "grade9_12";
}

function speak(text, ageGroup, setSpeaking) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const s = SOUNDS[ageGroup];
  utterance.lang = "ar-SA";
  utterance.rate = s.rate;
  utterance.pitch = s.pitch;
  utterance.onend = () => setSpeaking(false);
  window.speechSynthesis.speak(utterance);
}

const SUBJECTS = ["اللغة العربية", "التربية الإسلامية", "Islamic Education"];
const isEnglish = (subject) => subject === "Islamic Education";

const TABS_AR = ["📋 خطة الدرس", "📝 ورقة العمل", "✅ التقييم", "🎯 الخطط الفردية"];
const TABS_EN = ["📋 Lesson Plan", "📝 Worksheet", "✅ Assessment", "🎯 Individual Plans"];

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function AlJahiz() {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [content, setContent] = useState({ plan: "", worksheet: null, assessment: "", individual: "" });
  const [speaking, setSpeaking] = useState(false);
  const [worksheetAnswers, setWorksheetAnswers] = useState({});
  const [worksheetFeedback, setWorksheetFeedback] = useState({});

  const ageGroup = grade ? getAgeGroup(grade) : "grade5_8";
  const c = COLORS[ageGroup];
  const lang = isEnglish(subject) ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const tabs = lang === "ar" ? TABS_AR : TABS_EN;

  const callAPI = async (prompt, systemPrompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "";
  };

  const callAPIJSON = async (prompt, systemPrompt) => {
    const text = await callAPI(prompt, systemPrompt);
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!grade || !subject || !topic.trim()) return;
    setLoading(true);
    setGenerated(false);
    setWorksheetAnswers({});
    setWorksheetFeedback({});

    const isAr = lang === "ar";
    const planSystem = isAr
      ? "أنت معلم محترف متخصص في التربية الإسلامية واللغة العربية في الإمارات. اكتب بأسلوب احترافي وعملي."
      : "You are a professional teacher specializing in Islamic Education in UAE schools. Write professionally.";

    const planPrompt = isAr
      ? `أنشئ خطة درس متكاملة لمادة "${subject}" الصف ${grade} عن موضوع "${topic}".
تشمل:
1. الهدف العام
2. مخرجات التعلم حسب تاكسونومي بلوم
3. التعلم الجديد (خطوات الشرح)
4. التقييم من أجل التعلم
5. أسئلة التفكير الناقد وحل المشكلات
6. الربط بالثقافة الإماراتية
7. الربط بالمواد الأخرى (إن وجد)
8. الخاتمة المميزة
9. المشروع (إن استدعى الدرس)
10. تذكرة الخروج
11. الواجب المنزلي`
      : `Create a complete lesson plan for "${subject}" Grade ${grade} on "${topic}".
Include: General Objective, Bloom's Taxonomy Outcomes, New Learning Steps, Assessment for Learning, Critical Thinking Questions, UAE Cultural Connection, Cross-curricular Links, Creative Closure, Project (if applicable), Exit Ticket, Homework.`;

    const worksheetSystem = isAr
      ? "أنت معلم خبير. أجب فقط بـ JSON صحيح بدون أي نص إضافي أو backticks."
      : "You are an expert teacher. Respond ONLY with valid JSON, no extra text or backticks.";

    const worksheetPrompt = isAr
      ? `أنشئ ورقة عمل تفاعلية لمادة "${subject}" الصف ${grade} عن "${topic}".
أرجع JSON بهذا الشكل بالضبط:
{"title":"عنوان ورقة العمل","questions":[
{"id":1,"type":"mcq","question":"نص السؤال","options":["أ","ب","ج","د"],"correct":0},
{"id":2,"type":"fill","question":"أكمل الفراغ: ___ هو ...","correct":"الإجابة"},
{"id":3,"type":"truefalse","question":"نص العبارة","correct":true},
{"id":4,"type":"mcq","question":"نص السؤال","options":["أ","ب","ج","د"],"correct":2},
{"id":5,"type":"open","question":"سؤال مفتوح للتفكير"}
]}`
      : `Create an interactive worksheet for "${subject}" Grade ${grade} on "${topic}".
Return JSON exactly:
{"title":"Worksheet Title","questions":[
{"id":1,"type":"mcq","question":"Question","options":["A","B","C","D"],"correct":0},
{"id":2,"type":"fill","question":"Complete: ___ is ...","correct":"answer"},
{"id":3,"type":"truefalse","question":"Statement","correct":true},
{"id":4,"type":"mcq","question":"Question","options":["A","B","C","D"],"correct":2},
{"id":5,"type":"open","question":"Open-ended question"}
]}`;

    const assessPrompt = isAr
      ? `أنشئ تقييماً متنوعاً لمادة "${subject}" الصف ${grade} عن "${topic}" يناسب جميع المستويات (مبتدئ، متوسط، متميز). يشمل أسئلة موضوعية ومفتوحة ومهام أداء.`
      : `Create a diverse assessment for "${subject}" Grade ${grade} on "${topic}" for all levels. Include objective, open, and performance questions.`;

    const individualPrompt = isAr
      ? `أنشئ خططاً فردية لمادة "${subject}" الصف ${grade} عن "${topic}" لكل من:
المستويات: مبتدئ، متوسط، متميز، متوسط مع ضعف لغوي، صعوبات تعلم، فرط حركة
أنماط التعلم: بصري، سمعي، حركي
لكل فئة: نشاط فردي + نشاط جماعي مناسب.`
      : `Create individual plans for "${subject}" Grade ${grade} on "${topic}" for:
Levels: Beginner, Intermediate, Advanced, Intermediate with language weakness, Learning difficulties, ADHD
Styles: Visual, Auditory, Kinesthetic. For each: individual activity + group activity.`;

    try {
      const [plan, worksheetData, assessment, individual] = await Promise.all([
        callAPI(planPrompt, planSystem),
        callAPIJSON(worksheetPrompt, worksheetSystem),
        callAPI(assessPrompt, planSystem),
        callAPI(individualPrompt, planSystem),
      ]);
      setContent({ plan, worksheet: worksheetData, assessment, individual });
      setGenerated(true);
      setActiveTab(0);
    } catch (e) {
      console.error(e);
      alert(isAr ? "حدث خطأ، تحققي من الـ API key" : "Error occurred, check API key");
    }
    setLoading(false);
  };

  const handleSpeak = (text) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(text, ageGroup, setSpeaking);
    }
  };

  const handleAnswer = (qId, answer, correct, type) => {
    setWorksheetAnswers(prev => ({ ...prev, [qId]: answer }));
    if (type !== "open") {
      let isCorrect;
      if (type === "truefalse") isCorrect = answer === correct;
      else if (type === "mcq") isCorrect = answer === correct;
      else if (type === "fill") isCorrect = answer.trim().toLowerCase() === String(correct).trim().toLowerCase();
      setWorksheetFeedback(prev => ({ ...prev, [qId]: isCorrect }));
    }
  };

  return (
    <div dir={dir} style={{
      minHeight: "100vh",
      background: c.bg,
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      color: c.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Cairo:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 24px; margin-bottom: 16px; }
        .btn { cursor: pointer; border: none; border-radius: 12px; font-family: inherit; font-weight: 700; transition: all 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        select, input, textarea { font-family: inherit; border-radius: 10px; border: 2px solid #E0E0E0; padding: 12px 16px; font-size: 15px; width: 100%; outline: none; transition: border 0.2s; background: white; color: inherit; }
        select:focus, input:focus, textarea:focus { border-color: ${c.primary}; }
        .tab-btn { padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .tab-btn.active { background: ${c.primary}; color: white; }
        .tab-btn:not(.active) { background: white; color: ${c.text}; border-color: #E0E0E0; }
        .tab-btn:not(.active):hover { border-color: ${c.primary}; color: ${c.primary}; }
        .content-box { white-space: pre-wrap; line-height: 2; font-size: 15px; }
        .q-card { border-radius: 14px; padding: 18px; margin-bottom: 14px; border: 2px solid #F0F0F0; background: white; }
        .q-card.correct { border-color: #51CF66; background: #F0FFF4; }
        .q-card.wrong { border-color: #FF6B6B; background: #FFF0F0; }
        .opt-btn { display: block; width: 100%; text-align: ${dir === "rtl" ? "right" : "left"}; padding: 10px 16px; margin-top: 8px; border-radius: 10px; border: 2px solid #E0E0E0; background: white; cursor: pointer; font-family: inherit; font-size: 14px; transition: all 0.15s; }
        .opt-btn:hover:not(:disabled) { border-color: ${c.primary}; background: ${c.bg}; }
        .opt-btn.selected-correct { background: #51CF66 !important; color: white !important; border-color: #51CF66 !important; }
        .opt-btn.selected-wrong { background: #FF6B6B !important; color: white !important; border-color: #FF6B6B !important; }
        .opt-btn:disabled { cursor: default; }
        .tf-btn { padding: 10px 28px; border-radius: 10px; border: 2px solid #E0E0E0; background: white; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 600; transition: all 0.15s; margin: 4px; }
        .shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; height: 18px; margin-bottom: 10px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-inline-end: 6px; margin-bottom: 6px; }
        .section-title { font-size: 17px; font-weight: 800; color: ${c.primary}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid ${c.primary}20; }
        .watermark { text-align: center; color: #BBBBBB; font-size: 12px; padding: 20px; }
      `}</style>

      {/* Header */}
      <div style={{ background: c.primary, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "white", fontSize: 28, fontWeight: 800 }}>الجاهز ⚡</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>
            دفتر المعلم | حزمة الدرس الكاملة في ثوانٍ
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center" }}>
          <div>© Mona Eraky</div>
          <div>دفتر المعلم</div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>

        {/* Input Card */}
        <div className="card">
          <div className="section-title">بيانات الدرس</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 14 }}>الصف الدراسي</label>
              <select value={grade} onChange={e => { setGrade(e.target.value); setSubject(""); setGenerated(false); }}>
                <option value="">اختر الصف</option>
                {["2","3","4","5","6","7","8","9","10","11","12"].map(g => (
                  <option key={g} value={g}>الصف {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 14 }}>المادة</label>
              <select value={subject} onChange={e => { setSubject(e.target.value); setGenerated(false); }} disabled={!grade}>
                <option value="">اختر المادة</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 14 }}>موضوع الدرس</label>
            <input
              value={topic}
              onChange={e => { setTopic(e.target.value); setGenerated(false); }}
              placeholder={isEnglish(subject) ? "Type your lesson topic here..." : "اكتب موضوع الدرس هنا..."}
              dir={dir}
            />
          </div>
          <button
            className="btn"
            onClick={handleGenerate}
            disabled={!grade || !subject || !topic.trim() || loading}
            style={{
              width: "100%", padding: "14px", fontSize: 16,
              background: (!grade || !subject || !topic.trim() || loading) ? "#CCC" : c.primary,
              color: "white",
              cursor: (!grade || !subject || !topic.trim() || loading) ? "not-allowed" : "pointer"
            }}
          >
            {loading
              ? <span className="pulse">⏳ جاري الإنشاء...</span>
              : "⚡ أنشئ الحزمة الكاملة"
            }
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card">
            <div style={{ textAlign: "center", marginBottom: 16, fontWeight: 700, color: c.primary }}>
              🔄 جاري إنشاء الحزمة كاملة...
            </div>
            {[80, 90, 70, 85, 75].map((w, i) => (
              <div key={i} className="shimmer" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Tabs + Content */}
        {generated && !loading && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {tabs.map((tab, i) => (
                <button key={i} className={`tab-btn ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Lesson Plan */}
            {activeTab === 0 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>📋 خطة الدرس</div>
                  <button className="btn" onClick={() => handleSpeak(content.plan)}
                    style={{ padding: "8px 16px", background: speaking ? "#FF6B6B" : c.secondary, color: "white", fontSize: 13 }}>
                    {speaking ? "⏹ إيقاف" : "🔊 استمع"}
                  </button>
                </div>
                <div className="content-box">{content.plan}</div>
              </div>
            )}

            {/* Tab 2: Worksheet */}
            {activeTab === 1 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>
                    {content.worksheet?.title || "📝 ورقة العمل التفاعلية"}
                  </div>
                  <button className="btn" onClick={() => handleSpeak(content.worksheet?.questions?.map(q => q.question).join(". ") || "")}
                    style={{ padding: "8px 16px", background: speaking ? "#FF6B6B" : c.secondary, color: "white", fontSize: 13 }}>
                    {speaking ? "⏹ إيقاف" : "🔊 استمع"}
                  </button>
                </div>

                {content.worksheet?.questions?.map((q, idx) => {
                  const fb = worksheetFeedback[q.id];
                  const hasAnswer = worksheetAnswers[q.id] !== undefined;
                  return (
                    <div key={q.id} className={`q-card${hasAnswer && fb === true ? " correct" : hasAnswer && fb === false ? " wrong" : ""}`}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{
                          background: c.primary, color: "white", borderRadius: "50%",
                          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, flexShrink: 0
                        }}>{idx + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 10, lineHeight: 1.7 }}>{q.question}</div>

                          {q.type === "mcq" && q.options.map((opt, i) => {
                            const isSelected = worksheetAnswers[q.id] === i;
                            let cls = "opt-btn";
                            if (isSelected && fb === true) cls += " selected-correct";
                            else if (isSelected && fb === false) cls += " selected-wrong";
                            return (
                              <button key={i} className={cls}
                                onClick={() => handleAnswer(q.id, i, q.correct, "mcq")}
                                disabled={hasAnswer}>{opt}</button>
                            );
                          })}

                          {q.type === "truefalse" && (
                            <div>
                              {[true, false].map(val => {
                                const isSelected = worksheetAnswers[q.id] === val;
                                let bg = "white", col = c.text, border = "#E0E0E0";
                                if (isSelected && fb === true) { bg = "#51CF66"; col = "white"; border = "#51CF66"; }
                                if (isSelected && fb === false) { bg = "#FF6B6B"; col = "white"; border = "#FF6B6B"; }
                                return (
                                  <button key={String(val)} className="tf-btn"
                                    style={{ background: bg, color: col, borderColor: border }}
                                    onClick={() => handleAnswer(q.id, val, q.correct, "truefalse")}
                                    disabled={hasAnswer}>
                                    {val ? "✓ صح" : "✗ خطأ"}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "fill" && (
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <input
                                placeholder="اكتب إجابتك..."
                                value={worksheetAnswers[q.id] || ""}
                                onChange={e => setWorksheetAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && !hasAnswer && handleAnswer(q.id, worksheetAnswers[q.id] || "", q.correct, "fill")}
                                disabled={hasAnswer}
                                style={{ flex: 1 }}
                              />
                              {!hasAnswer && (
                                <button className="btn" onClick={() => handleAnswer(q.id, worksheetAnswers[q.id] || "", q.correct, "fill")}
                                  style={{ padding: "10px 16px", background: c.primary, color: "white", fontSize: 13, whiteSpace: "nowrap" }}>
                                  تحقق
                                </button>
                              )}
                            </div>
                          )}

                          {q.type === "open" && (
                            <textarea rows={3} placeholder="اكتب إجابتك هنا..."
                              value={worksheetAnswers[q.id] || ""}
                              onChange={e => setWorksheetAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              style={{ marginTop: 8, resize: "vertical" }} />
                          )}

                          {hasAnswer && fb !== undefined && (
                            <div style={{ marginTop: 8, fontWeight: 700, color: fb ? "#51CF66" : "#FF6B6B" }}>
                              {fb ? "✅ أحسنت!" : `❌ الإجابة الصحيحة: ${q.type === "truefalse" ? (q.correct ? "صح" : "خطأ") : q.type === "mcq" ? q.options[q.correct] : q.correct}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {Object.keys(worksheetFeedback).length > 0 && (
                  <div style={{ textAlign: "center", padding: 16, background: c.bg, borderRadius: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: c.primary }}>
                      {Object.values(worksheetFeedback).filter(Boolean).length} / {Object.keys(worksheetFeedback).length}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>إجاباتك الصحيحة</div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Assessment */}
            {activeTab === 2 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>✅ التقييم</div>
                  <button className="btn" onClick={() => handleSpeak(content.assessment)}
                    style={{ padding: "8px 16px", background: speaking ? "#FF6B6B" : c.secondary, color: "white", fontSize: 13 }}>
                    {speaking ? "⏹ إيقاف" : "🔊 استمع"}
                  </button>
                </div>
                <div className="content-box">{content.assessment}</div>
              </div>
            )}

            {/* Tab 4: Individual Plans */}
            {activeTab === 3 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>🎯 الخطط الفردية</div>
                  <button className="btn" onClick={() => handleSpeak(content.individual)}
                    style={{ padding: "8px 16px", background: speaking ? "#FF6B6B" : c.secondary, color: "white", fontSize: 13 }}>
                    {speaking ? "⏹ إيقاف" : "🔊 استمع"}
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {["مبتدئ 🟢", "متوسط 🟡", "متميز 🔵", "ضعف لغوي 🟠", "صعوبات تعلم 🔴", "فرط حركة ⚡"].map(l => (
                    <span key={l} className="badge" style={{ background: c.primary + "20", color: c.primary }}>{l}</span>
                  ))}
                  {["بصري 👁", "سمعي 👂", "حركي 🤸"].map(l => (
                    <span key={l} className="badge" style={{ background: c.secondary + "30", color: "#555" }}>{l}</span>
                  ))}
                </div>
                <div className="content-box">{content.individual}</div>
              </div>
            )}
          </>
        )}

        <div className="watermark">© Mona Eraky — دفتر المعلم 2026 | الجاهز ⚡</div>
      </div>
    </div>
  );
}
