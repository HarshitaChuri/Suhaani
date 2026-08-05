// Curated PCOS knowledge base for retrieval-augmented generation.
// Each entry is a self-contained chunk the retrieval step can match against
// and hand to Gemini as grounding context. Keep entries factual, general,
// and clearly non-diagnostic -- this supplements a doctor, never replaces one.

const knowledgeBase = [
  {
    id: "kb001",
    topic: "What is PCOS",
    keywords: ["what is pcos", "pcos meaning", "polycystic ovary syndrome", "definition"],
    content:
      "PCOS (Polycystic Ovary Syndrome) is a common hormonal condition affecting people with ovaries, typically during reproductive years. It involves an imbalance of reproductive hormones that can affect ovulation, metabolism, and appearance. It's diagnosed when at least 2 of 3 criteria are met: irregular or absent ovulation, signs of excess androgens (like acne or excess hair growth), and/or polycystic-appearing ovaries on ultrasound.",
  },
  {
    id: "kb002",
    topic: "Irregular periods",
    keywords: ["irregular periods", "missed period", "cycle length", "late period", "no period"],
    content:
      "Irregular periods in PCOS usually happen because ovulation doesn't occur consistently. Cycles may be longer than 35 days, shorter than 21 days, or unpredictable in timing. Tracking cycle length over a few months helps identify patterns -- this app's cycle tracker can help spot irregularity worth discussing with a doctor.",
  },
  {
    id: "kb003",
    topic: "Weight and PCOS",
    keywords: ["weight gain", "lose weight", "weight loss", "obesity", "bmi"],
    content:
      "Many people with PCOS experience weight gain or difficulty losing weight, often linked to insulin resistance. Even a modest weight reduction (5-10% of body weight) has been shown in research to improve ovulation and hormone levels for some people. This isn't about strict dieting -- sustainable, gradual changes tend to work better long-term than extreme restriction.",
  },
  {
    id: "kb004",
    topic: "Insulin resistance",
    keywords: ["insulin resistance", "blood sugar", "diabetes risk", "glucose"],
    content:
      "Insulin resistance is common in PCOS -- the body needs more insulin than usual to manage blood sugar, which can worsen hormone imbalances and weight gain. Diets that avoid large blood-sugar spikes (lower glycemic-index foods, balanced meals with protein and fiber) are often recommended alongside regular movement.",
  },
  {
    id: "kb005",
    topic: "Hair growth and hair loss",
    keywords: ["hirsutism", "facial hair", "excess hair", "hair loss", "thinning hair"],
    content:
      "Excess hair growth (face, chest, back) and scalp hair thinning can both occur in PCOS, driven by elevated androgen hormones. These symptoms are cosmetic concerns but also useful diagnostic signals -- they're worth mentioning to a doctor even if they feel embarrassing to bring up.",
  },
  {
    id: "kb006",
    topic: "Acne and skin",
    keywords: ["acne", "pimples", "oily skin", "skin darkening", "acanthosis"],
    content:
      "Hormonal acne (often along the jawline and chin) is common in PCOS due to androgen levels. Skin darkening in body folds (neck, underarms) -- called acanthosis nigricans -- can be a visible sign of insulin resistance and is worth flagging to a doctor.",
  },
  {
    id: "kb007",
    topic: "Fertility and pregnancy",
    keywords: ["fertility", "trying to conceive", "pregnant", "infertility", "ovulation"],
    content:
      "PCOS is one of the most common causes of ovulation-related infertility, but many people with PCOS do conceive, sometimes with support like ovulation-inducing medication or lifestyle changes. If you've been trying to conceive for 6-12 months without success, it's worth seeing a fertility specialist or gynecologist.",
  },
  {
    id: "kb008",
    topic: "Mental health and PCOS",
    keywords: ["anxiety", "anxious", "depression", "depressed", "mental health", "mood", "stress", "stressed", "overwhelmed", "sad"],
    content:
      "PCOS is associated with higher rates of anxiety and depression, likely from a combination of hormonal effects and the emotional weight of visible symptoms (acne, hair changes, weight). This is a real and valid part of the condition -- talking to a therapist alongside medical treatment can help, and it's not something to just push through alone.",
  },
  {
    id: "kb009",
    topic: "Exercise and PCOS",
    keywords: ["exercise", "workout", "physical activity", "cardio", "strength training"],
    content:
      "Regular movement helps with insulin sensitivity, mood, and weight management in PCOS. Both cardio and strength training are beneficial -- strength training in particular helps build muscle, which improves how the body uses insulin. Consistency matters more than intensity; even brisk walking most days helps.",
  },
  {
    id: "kb010",
    topic: "Diagnosis and tests",
    keywords: ["diagnosis", "how is pcos diagnosed", "tests", "blood test", "ultrasound"],
    content:
      "Diagnosing PCOS typically involves a combination of a symptom history, blood tests (hormone levels like LH, FSH, AMH, testosterone), and a pelvic ultrasound to check the ovaries. No single test confirms PCOS alone -- it's a pattern-based diagnosis, which is why symptom tracking (like in this app) is genuinely useful context for a doctor.",
  },
  {
    id: "kb011",
    topic: "Treatment options",
    keywords: ["treatment", "medication", "birth control", "metformin", "how to treat pcos"],
    content:
      "There's no single cure for PCOS, but symptoms are manageable. Common approaches include hormonal birth control (regulates cycles, reduces acne/hair growth), metformin (improves insulin sensitivity), lifestyle changes (diet, exercise), and targeted treatments for specific symptoms like hirsutism or fertility. Treatment is personalized -- what works depends on your specific symptoms and goals (e.g. trying to conceive vs. not).",
  },
  {
    id: "kb012",
    topic: "Diet basics for PCOS",
    keywords: ["diet", "food", "what to eat", "nutrition", "meal plan"],
    content:
      "There's no single 'PCOS diet,' but common helpful patterns include: balanced meals with protein and fiber to reduce blood-sugar spikes, minimizing heavily processed/sugary foods, and including anti-inflammatory foods (leafy greens, fatty fish, nuts, berries). Crash diets tend to backfire -- sustainable patterns work better than extreme restriction.",
  },
  {
    id: "kb013",
    topic: "What causes PCOS",
    keywords: ["what causes pcos", "cause", "causes", "why do i have pcos", "reason for pcos"],
    content:
      "The exact cause of PCOS isn't fully understood, but it's believed to involve a combination of genetics (it often runs in families), insulin resistance, and excess androgen production by the ovaries. It's not caused by anything the person did -- diet or lifestyle don't cause PCOS, though they can affect how symptoms show up and how manageable they are.",
  },
  {
    id: "kb014",
    topic: "How common is PCOS",
    keywords: ["how common", "prevalence", "how many people", "statistics"],
    content:
      "PCOS is one of the most common hormonal conditions in people with ovaries, affecting roughly 8-13% of women of reproductive age worldwide, according to the World Health Organization. Many cases go undiagnosed because symptoms vary widely and diagnosis requires ruling out other conditions.",
  },
  {
    id: "kb015",
    topic: "Is PCOS curable",
    keywords: ["curable", "cure", "does pcos go away", "will it go away", "permanent"],
    content:
      "There's currently no cure for PCOS, but it's very manageable. Symptoms often respond well to treatment (lifestyle changes, medication, or both), and some symptoms can improve significantly over time, especially with sustained management of weight and insulin sensitivity. It's a chronic condition to manage long-term, not something that's 'fixed' once and done.",
  },
  {
    id: "kb016",
    topic: "Rotterdam criteria and diagnosis",
    keywords: ["rotterdam criteria", "rotterdam", "diagnostic criteria"],
    content:
      "The Rotterdam criteria is the most widely used framework doctors use to diagnose PCOS. It requires meeting at least 2 of these 3: irregular or absent ovulation, clinical or blood-test signs of excess androgens (like acne, excess hair growth, or elevated testosterone), and polycystic-appearing ovaries on ultrasound. Meeting just 1 of these isn't enough for a PCOS diagnosis -- other conditions need to be ruled out too.",
  },
  {
    id: "kb017",
    topic: "PCOS long-term health risks",
    keywords: ["complications", "long term risk", "health risks", "diabetes risk", "heart disease", "endometrial cancer"],
    content:
      "Beyond the day-to-day symptoms, PCOS is linked to higher long-term risk of type 2 diabetes, high blood pressure, high cholesterol, and endometrial cancer (from prolonged irregular periods without ovulation). This is why ongoing monitoring matters even when day-to-day symptoms feel manageable -- regular checkups can catch these risks early.",
  },
  {
    id: "kb018",
    topic: "Common PCOS myths",
    keywords: ["myth", "misconception", "is it true"],
    content:
      "A few common myths worth clearing up: PCOS doesn't mean you can't get pregnant (many people with PCOS conceive, sometimes with support). Having ovarian cysts on an ultrasound doesn't automatically mean PCOS, and PCOS doesn't require visible cysts at all -- the name is a bit misleading. PCOS also isn't caused by being overweight; the relationship goes both ways, and plenty of people with PCOS are not overweight.",
  },
  {
    id: "kb019",
    topic: "PCOS and birth control",
    keywords: ["birth control", "contraceptive pill", "oral contraceptive"],
    content:
      "Combined hormonal birth control pills are one of the most common PCOS treatments -- they regulate cycles, reduce acne, and lessen excess hair growth by balancing hormone levels. They don't cure PCOS or address insulin resistance, so they're often combined with other treatments depending on someone's specific symptoms and goals (like whether they're trying to conceive).",
  },
  {
    id: "kb020",
    topic: "PCOS types and presentation",
    keywords: ["types of pcos", "lean pcos", "different kinds"],
    content:
      "PCOS doesn't look the same for everyone. Some people have the classic combination of irregular periods, weight gain, and excess hair growth; others (sometimes called 'lean PCOS') have normal or low body weight but still have hormonal imbalances, irregular ovulation, and insulin resistance. Symptom severity and combination vary widely from person to person.",
  },
];

export default knowledgeBase;
