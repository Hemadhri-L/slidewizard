// app/api/generate-slides/route.js

import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { topic, slideCount, tone } = await req.json();

    if (!topic || !slideCount || !tone) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: topic, slideCount, tone",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // ═══════════════════════════════════════════════════════════
    // STEP 1: Generate Slides
    // ═══════════════════════════════════════════════════════════

    const prompt = `
Create a professional presentation about "${topic}".
Tone: ${tone}.
Generate exactly ${slideCount} slides.

Each slide must include:
- A strong clear title
- 4-6 detailed bullet points (1-2 lines each)

Return ONLY valid JSON array:
[
  {
    "title": "Slide title",
    "content": "• Bullet 1\\n• Bullet 2\\n• Bullet 3\\n• Bullet 4"
  }
]
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a presentation generator. Return ONLY valid JSON arrays. No markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let slides;
    try {
      slides = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(slides) || slides.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid slide data generated. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    slides = slides.map((slide, index) => ({
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || "Content not generated",
      imageUrl: null,
    }));

    // ═══════════════════════════════════════════════════════════
    // STEP 2: AI generates VISUAL image queries
    // ═══════════════════════════════════════════════════════════

    const imageQueries = await generateSmartImageQueries(groq, topic, slides);
    console.log("\n🖼️ AI Image Queries:", JSON.stringify(imageQueries, null, 2));

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Multi-source image fetching with guaranteed results
    // ═══════════════════════════════════════════════════════════

    const pixabayKey = process.env.PIXABAY_API_KEY;
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    const pexelsKey = process.env.PEXELS_API_KEY;

    const usedImageUrls = new Set();

    for (let i = 0; i < slides.length; i++) {
      try {
        const queries = imageQueries[i] || {};

        // Build query chain from most specific to broadest
        const queryChain = buildQueryChain(
          queries,
          slides[i].title,
          topic,
          i
        );

        console.log(`\n[Slide ${i + 1}] "${slides[i].title}"`);
        console.log(`  Query chain: ${queryChain.map((q) => `"${q}"`).join(" → ")}`);

        let imageUrl = null;

        // Try each query through multiple image sources
        for (const query of queryChain) {
          if (imageUrl) break;

          // Source 1: Pixabay
          if (pixabayKey && !imageUrl) {
            imageUrl = await fetchPixabayImage(query, pixabayKey, usedImageUrls);
            if (imageUrl) {
              console.log(`  ✅ Pixabay: "${query}"`);
              break;
            }
          }

          // Source 2: Unsplash
          if (unsplashKey && !imageUrl) {
            imageUrl = await fetchUnsplashImage(query, unsplashKey, usedImageUrls);
            if (imageUrl) {
              console.log(`  ✅ Unsplash: "${query}"`);
              break;
            }
          }

          // Source 3: Pexels
          if (pexelsKey && !imageUrl) {
            imageUrl = await fetchPexelsImage(query, pexelsKey, usedImageUrls);
            if (imageUrl) {
              console.log(`  ✅ Pexels: "${query}"`);
              break;
            }
          }
        }

        // Source 4: Pollinations AI (generated image — always works)
        if (!imageUrl) {
          const visualPrompt = queries.visualPrompt || 
            simplifyToVisualPrompt(slides[i].title, topic);
          imageUrl = await fetchPollinationsImage(visualPrompt, i);
          if (imageUrl) {
            console.log(`  ✅ Pollinations AI generated`);
          }
        }

        // Source 5: Guaranteed category fallback (hardcoded URLs)
        if (!imageUrl) {
          imageUrl = getCategoryFallbackUrl(topic, i);
          console.log(`  ⚠️ Category fallback`);
        }

        if (imageUrl) {
          slides[i].imageUrl = imageUrl;
          usedImageUrls.add(imageUrl);
        }

        // Rate limiting delay
        if (i < slides.length - 1) {
          await delay(300);
        }
      } catch (imgError) {
        console.warn(`[Slide ${i + 1}] Image error:`, imgError.message);
        // Still try fallback
        slides[i].imageUrl = getCategoryFallbackUrl(topic, i);
      }
    }

    console.log(
      "\n📊 Final Results:",
      slides.map((s, i) => ({
        slide: i + 1,
        title: s.title.substring(0, 40),
        hasImage: !!s.imageUrl,
        source: s.imageUrl ? (
          s.imageUrl.includes("pixabay") ? "pixabay" :
          s.imageUrl.includes("unsplash") ? "unsplash" :
          s.imageUrl.includes("pexels") ? "pexels" :
          s.imageUrl.includes("pollinations") ? "ai-generated" : "fallback"
        ) : "none",
      }))
    );

    return new Response(JSON.stringify(slides), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ERROR:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// 🤖 SMART IMAGE QUERY GENERATOR
// The key fix: forces AI to think in VISUAL/PHOTOGRAPHABLE terms
// ═══════════════════════════════════════════════════════════════

async function generateSmartImageQueries(groq, topic, slides) {
  try {
    const slideSummaries = slides
      .map(
        (s, i) =>
          `Slide ${i}: "${s.title}" — ${s.content.substring(0, 150)}`
      )
      .join("\n");

    const queryPrompt = `
You are a stock photo search expert. You ONLY think in terms of real, photographable scenes and objects.

Presentation topic: "${topic}"

Slides:
${slideSummaries}

For EACH slide, generate search queries that will find REAL PHOTOS on stock sites.

CRITICAL RULES:
1. Every query must describe something a camera can photograph
2. Use CONCRETE NOUNS: objects, places, people, animals, scenes
3. NEVER use abstract words like: concept, strategy, overview, analysis, methodology, framework, implementation, optimization, understanding, comprehensive, significant
4. If the slide is about an abstract idea, translate it to a VISUAL METAPHOR
5. Each slide must have COMPLETELY different queries
6. 2-3 words per query maximum

TRANSLATION EXAMPLES:
- "Digital Transformation Strategy" → primary: "office computer screens", secondary: "team laptop meeting", tertiary: "server room"
- "Revenue Growth Analysis" → primary: "stock market chart", secondary: "businessman celebration", tertiary: "money coins stack"
- "Machine Learning Algorithms" → primary: "robot arm factory", secondary: "neural network brain", tertiary: "computer code screen"
- "Environmental Sustainability" → primary: "solar panel field", secondary: "green forest river", tertiary: "wind turbine farm"
- "Customer Experience Design" → primary: "happy customer shopping", secondary: "phone app interface", tertiary: "support headset agent"
- "Supply Chain Management" → primary: "warehouse shipping boxes", secondary: "cargo ship port", tertiary: "delivery truck highway"
- "Quantum Computing Future" → primary: "quantum computer lab", secondary: "circuit board closeup", tertiary: "scientist laboratory"
- "Cricket Match History" → primary: "cricket bat ball", secondary: "cricket stadium crowd", tertiary: "cricket player batting"
- "Indian Cuisine Culture" → primary: "indian spices colorful", secondary: "naan bread curry", tertiary: "street food vendor"
- "Blockchain Technology" → primary: "cryptocurrency bitcoin", secondary: "digital network chain", tertiary: "secure lock data"

Also generate a "visualPrompt" — a 10-15 word description of an ideal image for this slide, written as if describing a photograph.

Return ONLY valid JSON array:
[
  {
    "slideIndex": 0,
    "primary": "concrete visual query",
    "secondary": "different angle query",
    "tertiary": "broader visual query",
    "visualPrompt": "A professional photograph showing [specific visual scene]"
  }
]
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a stock photography search expert. You ONLY use concrete, photographable nouns. NEVER use abstract business/academic words. Return ONLY valid JSON. Every query must describe something a real camera could capture.",
        },
        { role: "user", content: queryPrompt },
      ],
      temperature: 0.4,
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];

    const queries = JSON.parse(text);

    const queryMap = {};
    queries.forEach((q) => {
      const idx = q.slideIndex;
      if (idx !== undefined && idx < slides.length) {
        queryMap[idx] = {
          primary: sanitizeQuery(q.primary),
          secondary: sanitizeQuery(q.secondary),
          tertiary: sanitizeQuery(q.tertiary),
          visualPrompt: q.visualPrompt || "",
        };
      }
    });

    // Fill any missing slides
    slides.forEach((slide, i) => {
      if (!queryMap[i]) {
        queryMap[i] = buildFallbackQueries(slide.title, topic, i);
      }
    });

    return queryMap;
  } catch (err) {
    console.warn("⚠️ AI query generation failed:", err.message);
    // Build intelligent fallback queries for every slide
    const fallbackMap = {};
    slides.forEach((slide, i) => {
      fallbackMap[i] = buildFallbackQueries(slide.title, topic, i);
    });
    return fallbackMap;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🧹 QUERY SANITIZATION — removes abstract words aggressively
// ═══════════════════════════════════════════════════════════════

function sanitizeQuery(text) {
  if (!text) return "";

  // Words that NEVER appear in good stock photo searches
  const abstractWords = [
    "the", "a", "an", "is", "are", "was", "were", "of", "in", "on", "at",
    "to", "for", "and", "or", "with", "by", "from", "that", "this", "it",
    "how", "what", "why", "when", "where", "can", "will", "should", "would",
    "could", "has", "have", "had", "do", "does", "did", "not", "but", "if",
    "then", "so", "just", "also", "very", "more", "most", "all", "each",
    "every", "into", "about", "between", "through", "its", "your", "our",
    "their", "slide", "introduction", "conclusion", "overview", "summary",
    "key", "main", "important", "benefits", "advantages", "understanding",
    "concept", "strategy", "analysis", "methodology", "framework",
    "implementation", "optimization", "comprehensive", "significant",
    "demonstrates", "characteristics", "approximately", "infrastructure",
    "revolutionizing", "transformation", "considerations", "prerequisites",
    "fundamental", "essential", "critical", "various", "specific", "general",
    "overall", "particular", "relevant", "potential", "effective", "efficient",
    "innovative", "advanced", "emerging", "leading", "major", "primary",
    "core", "basic", "detailed", "complete", "full", "total", "entire",
    "whole", "approach", "process", "system", "model", "method", "technique",
    "aspect", "factor", "element", "component", "feature", "function",
    "role", "impact", "effect", "result", "outcome", "trend", "pattern",
    "challenge", "opportunity", "solution", "problem", "issue", "matter",
    "case", "example", "instance", "point", "level", "degree", "extent",
    "scope", "range", "area", "field", "domain", "sector", "industry",
    "market", "growth", "development", "progress", "evolution", "future",
    "current", "modern", "new", "recent", "latest", "today", "now",
  ];

  const cleaned = text
    .replace(/[•\-\*:,\.;!?'"()\[\]{}#@&\/\\0-9]/g, " ")
    .replace(new RegExp(`\\b(${abstractWords.join("|")})\\b`, "gi"), " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 3)
    .join(" ")
    .trim()
    .toLowerCase();

  return cleaned;
}

// ═══════════════════════════════════════════════════════════════
// 🔗 BUILD QUERY CHAIN — ordered from specific to broad
// ═══════════════════════════════════════════════════════════════

function buildQueryChain(queries, slideTitle, topic, slideIndex) {
  const chain = [];

  // Add AI-generated queries (most specific)
  if (queries.primary) chain.push(queries.primary);
  if (queries.secondary) chain.push(queries.secondary);
  if (queries.tertiary) chain.push(queries.tertiary);

  // Add extracted visual nouns from title
  const visualNouns = extractVisualNouns(slideTitle);
  if (visualNouns) chain.push(visualNouns);

  // Add extracted visual nouns from topic
  const topicNouns = extractVisualNouns(topic);
  if (topicNouns && !chain.includes(topicNouns)) chain.push(topicNouns);

  // Add single strongest word from title
  const strongWord = getStrongestNoun(slideTitle);
  if (strongWord && !chain.some((q) => q.includes(strongWord))) {
    chain.push(strongWord);
  }

  // Add category-based query as last resort
  const categoryQuery = getCategoryQuery(topic, slideTitle);
  if (categoryQuery && !chain.includes(categoryQuery)) {
    chain.push(categoryQuery);
  }

  // Add generic rotating fallback
  const genericFallbacks = [
    "business presentation office",
    "technology digital screen",
    "teamwork collaboration meeting",
    "creative workspace design",
    "data chart analytics",
    "professional corporate office",
    "innovation lightbulb idea",
    "education classroom learning",
    "success achievement trophy",
    "communication network global",
    "planning strategy whiteboard",
    "development coding laptop",
  ];
  chain.push(genericFallbacks[slideIndex % genericFallbacks.length]);

  // Remove duplicates and empty entries
  return [...new Set(chain.filter(Boolean))];
}

// ═══════════════════════════════════════════════════════════════
// 🔍 EXTRACT VISUAL NOUNS — finds photographable words in text
// ═══════════════════════════════════════════════════════════════

function extractVisualNouns(text) {
  if (!text) return "";

  const visualWords = text.match(
    /\b(city|cities|ocean|sea|forest|mountain|mountains|technology|computer|computers|robot|robots|brain|chart|charts|team|teams|office|building|buildings|car|cars|phone|phones|rocket|globe|earth|sun|moon|stars?|flowers?|animals?|food|medicine|school|factory|satellite|network|cloud|clouds|money|heart|eyes?|hands?|books?|light|lights|water|fire|energy|space|design|art|music|health|sport|sports|science|nature|weather|climate|machine|code|digital|drone|solar|wind|electric|bridge|road|river|lake|garden|farm|ship|plane|train|bicycle|camera|microscope|telescope|painting|sculpture|guitar|piano|coffee|restaurant|hospital|library|museum|stadium|airport|beach|desert|island|volcano|waterfall|rainbow|sunset|sunrise|laptop|tablet|keyboard|screen|monitor|printer|headphones|microphone|speaker|battery|circuit|chip|wire|cable|antenna|satellite|radar|laser|telescope|flask|beaker|test\s?tube|dna|cell|atom|molecule|pill|syringe|stethoscope|xray|scan|wheelchair|ambulance|firetruck|police|helmet|shield|sword|crown|flag|medal|trophy|clock|watch|compass|map|globe|puzzle|chess|dice|cards|ball|racket|goal|basket|net|ring|stage|curtain|spotlight|ticket|popcorn|bicycle|skateboard|surfboard|snowboard|parachute|balloon|kite|tent|campfire|backpack|boots|umbrella|sunglasses|hat|dress|suit|tie|shoes|jewelry|diamond|gold|silver|crystal|pearl|coin|wallet|briefcase|suitcase|passport|stamp|envelope|newspaper|magazine|pencil|pen|brush|palette|canvas|frame|mirror|window|door|stairs|elevator|bridge|tunnel|fountain|statue|monument|tower|castle|temple|church|mosque|pyramid|arch|dome|column|fence|gate|bench|swing|slide|pool|fountain|aquarium|cage|nest|web|hive|shell|coral|seaweed|mushroom|cactus|bamboo|vine|leaf|leaves|branch|trunk|root|seed|fruit|vegetable|grain|wheat|rice|corn|tea|spice|honey|chocolate|cheese|bread|pasta|pizza|burger|sushi|cake|pie|ice\s?cream|candy|wine|beer|cocktail|juice|smoothie|salad|soup|steak|chicken|fish|shrimp|lobster|egg|butter|oil|sugar|salt|pepper)\b/gi
  );

  if (visualWords && visualWords.length > 0) {
    const unique = [...new Set(visualWords.map((w) => w.toLowerCase()))];
    return unique.slice(0, 3).join(" ");
  }

  return "";
}

// ═══════════════════════════════════════════════════════════════
// 💪 GET STRONGEST NOUN — finds the most "photographable" word
// ═══════════════════════════════════════════════════════════════

function getStrongestNoun(text) {
  if (!text) return "";

  const visualNouns = extractVisualNouns(text);
  if (visualNouns) return visualNouns.split(" ")[0];

  // If no visual noun found, clean and take first meaningful word
  const cleaned = sanitizeQuery(text);
  if (cleaned) return cleaned.split(" ")[0];

  return "";
}

// ═══════════════════════════════════════════════════════════════
// 📂 CATEGORY DETECTION — maps any topic to a visual category
// ═══════════════════════════════════════════════════════════════

function getCategoryQuery(topic, slideTitle) {
  const text = `${topic} ${slideTitle}`.toLowerCase();

  const categoryMap = [
    { regex: /ai\b|artificial intelligence|machine learn|deep learn|neural|nlp|chatbot|gpt/i, query: "robot artificial intelligence" },
    { regex: /blockchain|crypto|bitcoin|ethereum|defi|nft|web3/i, query: "cryptocurrency blockchain digital" },
    { regex: /cloud|aws|azure|devops|kubernetes|docker|microservice/i, query: "cloud computing server" },
    { regex: /cyber|security|hack|encrypt|firewall|malware|phishing/i, query: "cybersecurity lock shield" },
    { regex: /mobile|android|ios|swift|flutter|react native|app\s/i, query: "smartphone mobile app" },
    { regex: /web|frontend|backend|javascript|react|node|api|html|css/i, query: "web development coding" },
    { regex: /data|analytics|big data|sql|database|warehouse|pipeline/i, query: "data analytics dashboard" },
    { regex: /robot|automat|rpa|industrial|manufactur/i, query: "robot automation factory" },
    { regex: /space|nasa|mars|rocket|satellite|astronaut|orbit/i, query: "space rocket launch" },
    { regex: /climate|global warm|carbon|emission|greenhouse|renewable/i, query: "climate change earth" },
    { regex: /solar|wind energy|renewable|green energy|sustainable energy/i, query: "solar panel renewable" },
    { regex: /ocean|marine|sea life|coral|underwater|fish|whale/i, query: "ocean underwater coral" },
    { regex: /forest|deforest|rainforest|jungle|wildlife|biodiversity/i, query: "forest nature wildlife" },
    { regex: /electric car|ev\b|tesla|autonomous|self.driving/i, query: "electric car charging" },
    { regex: /drone|uav|aerial|unmanned/i, query: "drone flying aerial" },
    { regex: /3d print|additive manufactur/i, query: "3d printer printing" },
    { regex: /vr\b|virtual reality|ar\b|augmented reality|metaverse|immersive/i, query: "virtual reality headset" },
    { regex: /iot|internet of things|smart home|smart device|sensor|wearable/i, query: "smart home devices" },
    { regex: /5g|telecom|wireless|antenna|bandwidth|connectivity/i, query: "5g tower antenna" },
    { regex: /quantum|qubit|superposition/i, query: "quantum computer lab" },
    { regex: /biotech|genetic|genome|crispr|dna|gene therapy/i, query: "dna genetics laboratory" },
    { regex: /pharma|drug|vaccine|clinical trial|medicine|therapeutic/i, query: "medicine pharmacy pills" },
    { regex: /hospital|surgery|doctor|patient|diagnos|medical device/i, query: "doctor hospital medical" },
    { regex: /mental health|psychology|therapy|mindful|meditation|stress/i, query: "meditation mindfulness peace" },
    { regex: /fitness|exercise|gym|workout|yoga|running|athlete/i, query: "fitness gym workout" },
    { regex: /nutrition|diet|vitamin|protein|healthy food|organic/i, query: "healthy food nutrition" },
    { regex: /covid|pandemic|virus|corona|infection|outbreak/i, query: "virus pandemic medical" },
    { regex: /cricket|batting|bowling|wicket|ipl|test match/i, query: "cricket bat ball" },
    { regex: /football|soccer|goal|fifa|premier league/i, query: "football soccer stadium" },
    { regex: /basketball|nba|court|dunk|three.pointer/i, query: "basketball court game" },
    { regex: /tennis|racket|wimbledon|grand slam/i, query: "tennis racket court" },
    { regex: /olymp|medal|athlete|champion|competition/i, query: "olympic athlete medal" },
    { regex: /cook|recipe|kitchen|chef|culinary|baking/i, query: "chef cooking kitchen" },
    { regex: /indian|india|hindu|bollywood|delhi|mumbai|curry|spice/i, query: "india culture colorful" },
    { regex: /chinese|china|beijing|shanghai|mandarin|dragon/i, query: "china traditional culture" },
    { regex: /japanese|japan|tokyo|samurai|anime|sushi|zen/i, query: "japan temple traditional" },
    { regex: /african|africa|safari|savanna|tribe|continent/i, query: "africa safari wildlife" },
    { regex: /european|europe|paris|london|rome|castle|medieval/i, query: "europe architecture city" },
    { regex: /american|usa|america|new york|washington|liberty/i, query: "american city skyline" },
    { regex: /travel|tourism|vacation|holiday|adventure|explore|backpack/i, query: "travel adventure landscape" },
    { regex: /hotel|resort|hospitality|accommodation|booking/i, query: "luxury hotel resort" },
    { regex: /fashion|cloth|style|wear|textile|garment|trend/i, query: "fashion clothing style" },
    { regex: /music|song|concert|instrument|band|singer|album/i, query: "music concert performance" },
    { regex: /film|movie|cinema|director|actor|hollywood|oscar/i, query: "cinema film camera" },
    { regex: /paint|sculpture|gallery|museum|artist|exhibition/i, query: "art gallery painting" },
    { regex: /photograph|camera|lens|portrait|landscape photo/i, query: "camera photography lens" },
    { regex: /architect|building|skyscraper|construct|blueprint/i, query: "architecture modern building" },
    { regex: /interior|furniture|decor|living room|bedroom|kitchen design/i, query: "interior design modern" },
    { regex: /garden|landscape|plant|flower|botanical|horticulture/i, query: "garden flowers botanical" },
    { regex: /farm|agriculture|crop|harvest|irrigation|livestock/i, query: "farm agriculture field" },
    { regex: /educat|school|university|college|student|teacher|classroom/i, query: "classroom education students" },
    { regex: /child|kid|baby|toddler|infant|parenting|playground/i, query: "children playing happy" },
    { regex: /elder|aging|senior|retirement|pension|geriatric/i, query: "senior elderly happy" },
    { regex: /wedding|marriage|bride|groom|ceremony|celebration/i, query: "wedding celebration flowers" },
    { regex: /real estate|property|house|apartment|mortgage|rent/i, query: "house real estate" },
    { regex: /stock|invest|trading|portfolio|dividend|bull|bear/i, query: "stock market trading" },
    { regex: /bank|finance|loan|credit|payment|transaction|fintech/i, query: "banking finance money" },
    { regex: /insurance|policy|coverage|premium|claim|risk/i, query: "insurance protection shield" },
    { regex: /tax|accounting|audit|bookkeep|revenue|fiscal/i, query: "accounting calculator documents" },
    { regex: /startup|entrepreneur|venture|founder|pitch|incubator/i, query: "startup office team" },
    { regex: /market|brand|advertis|campaign|promotion|social media/i, query: "marketing social media" },
    { regex: /sales|customer|client|deal|negotiate|pipeline/i, query: "business handshake deal" },
    { regex: /hr\b|human resource|recruit|hiring|employee|talent/i, query: "job interview hiring" },
    { regex: /leader|management|ceo|executive|corporate|governance/i, query: "leadership corporate meeting" },
    { regex: /team|collaborat|cooperat|partner|group work/i, query: "teamwork collaboration office" },
    { regex: /remote|work from home|hybrid|telecommut|zoom|virtual office/i, query: "remote work laptop home" },
    { regex: /present|speech|keynote|conference|seminar|workshop/i, query: "presentation conference speaker" },
    { regex: /project|agile|scrum|kanban|milestone|deadline/i, query: "project planning whiteboard" },
    { regex: /innovat|disrupt|creative|ideation|brainstorm/i, query: "innovation lightbulb creative" },
    { regex: /sustain|esg|green|eco.friendly|circular economy/i, query: "sustainability green nature" },
    { regex: /supply chain|logistics|shipping|warehouse|inventory/i, query: "warehouse shipping logistics" },
    { regex: /ecommerce|online shop|retail|amazon|shopify/i, query: "ecommerce online shopping" },
    { regex: /food delivery|uber eats|doordash|restaurant tech/i, query: "food delivery restaurant" },
    { regex: /transport|uber|lyft|ride.sharing|mobility/i, query: "transportation city traffic" },
    { regex: /electric|battery|lithium|charging station|power grid/i, query: "electric battery energy" },
    { regex: /nuclear|fusion|fission|reactor|uranium/i, query: "nuclear power plant" },
    { regex: /water|sanitation|clean water|filtration|desalination/i, query: "clean water nature" },
    { regex: /waste|recycl|garbage|landfill|composting|zero waste/i, query: "recycling environment green" },
    { regex: /pollu|smog|emission|toxin|contamination/i, query: "pollution city smoke" },
    { regex: /earthquake|tsunami|volcano|hurricane|tornado|disaster/i, query: "natural disaster storm" },
    { regex: /war|military|defense|army|weapon|conflict|peace/i, query: "peace dove military" },
    { regex: /law|legal|court|judge|attorney|justice|constitution/i, query: "law justice court" },
    { regex: /politic|government|election|democracy|vote|parliament/i, query: "democracy voting election" },
    { regex: /history|ancient|civilization|century|dynasty|empire/i, query: "ancient history ruins" },
    { regex: /philosophy|ethics|moral|existential|consciousness/i, query: "thinking philosophy books" },
    { regex: /language|linguistic|grammar|translation|bilingual/i, query: "languages books globe" },
    { regex: /math|algebra|calculus|geometry|equation|statistics/i, query: "mathematics equations blackboard" },
    { regex: /physics|gravity|relativity|particle|quantum mechanics/i, query: "physics laboratory experiment" },
    { regex: /chemistry|chemical|periodic|reaction|compound/i, query: "chemistry lab experiment" },
    { regex: /biology|evolution|ecosystem|organism|species/i, query: "biology nature ecosystem" },
    { regex: /astronomy|planet|galaxy|telescope|constellation|nebula/i, query: "galaxy stars astronomy" },
    { regex: /geography|continent|country|map|terrain|topography/i, query: "world map geography" },
  ];

  for (const { regex, query } of categoryMap) {
    if (regex.test(text)) {
      return query;
    }
  }

  return "professional business modern";
}

// ═══════════════════════════════════════════════════════════════
// 🛟 FALLBACK QUERY BUILDER — when AI query generation fails
// ═══════════════════════════════════════════════════════════════

function buildFallbackQueries(slideTitle, topic, index) {
  const visualNouns = extractVisualNouns(slideTitle);
  const topicNouns = extractVisualNouns(topic);
  const categoryQuery = getCategoryQuery(topic, slideTitle);

  return {
    primary: visualNouns || sanitizeQuery(slideTitle) || categoryQuery,
    secondary: topicNouns || sanitizeQuery(topic) || "professional office",
    tertiary: categoryQuery,
    visualPrompt: simplifyToVisualPrompt(slideTitle, topic),
  };
}

// ═══════════════════════════════════════════════════════════════
// 🎨 VISUAL PROMPT SIMPLIFIER — for AI image generation
// ═══════════════════════════════════════════════════════════════

function simplifyToVisualPrompt(slideTitle, topic) {
  const visualNouns = extractVisualNouns(`${slideTitle} ${topic}`);

  if (visualNouns) {
    return `Professional photograph of ${visualNouns}, modern clean style, high quality, well lit`;
  }

  const categoryQuery = getCategoryQuery(topic, slideTitle);
  return `Professional photograph of ${categoryQuery}, modern style, high quality`;
}

// ═══════════════════════════════════════════════════════════════
// 📸 IMAGE SOURCE: PIXABAY
// ═══════════════════════════════════════════════════════════════

async function fetchPixabayImage(query, apiKey, usedUrls) {
  if (!query || !apiKey) return null;

  try {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=15&safesearch=true&min_width=800`;

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 429) {
        await delay(2000);
        const retryRes = await fetch(url);
        if (retryRes.ok) {
          const data = await retryRes.json();
          return pickUniqueImage(data.hits, usedUrls, "pixabay");
        }
      }
      return null;
    }

    const data = await res.json();
    return pickUniqueImage(data.hits || [], usedUrls, "pixabay");
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 📸 IMAGE SOURCE: UNSPLASH
// ═══════════════════════════════════════════════════════════════

async function fetchUnsplashImage(query, apiKey, usedUrls) {
  if (!query || !apiKey) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${apiKey}` } }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      for (const photo of data.results) {
        const url = photo.urls?.regular;
        if (url && !usedUrls.has(url)) return url;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 📸 IMAGE SOURCE: PEXELS
// ═══════════════════════════════════════════════════════════════

async function fetchPexelsImage(query, apiKey, usedUrls) {
  if (!query || !apiKey) return null;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.photos && data.photos.length > 0) {
      for (const photo of data.photos) {
        const url = photo.src?.large;
        if (url && !usedUrls.has(url)) return url;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 📸 IMAGE SOURCE: POLLINATIONS AI (free, no key needed)
// ═══════════════════════════════════════════════════════════════

async function fetchPollinationsImage(prompt, slideIndex) {
  try {
    const cleanPrompt = encodeURIComponent(
      prompt.slice(0, 200).replace(/[^\w\s,.-]/g, "")
    );
    const seed = slideIndex * 1000 + Math.floor(Math.random() * 999);
    const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=500&seed=${seed}&nologo=true`;

    // Verify the image actually loads
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    if (res.ok) return url;
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🛟 GUARANTEED CATEGORY FALLBACK — hardcoded URLs that always work
// ═══════════════════════════════════════════════════════════════

function getCategoryFallbackUrl(topic, slideIndex) {
  const text = topic.toLowerCase();

  const categories = {
    technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
    ],
    business: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    ],
    science: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
      "https://images.unsplash.com/photo-1530026405186-ed1f139313bb?w=800&q=80",
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80",
    ],
    education: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    ],
    nature: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    ],
    health: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    ],
    food: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    ],
    sports: [
      "https://images.unsplash.com/photo-1461896836934-bd45ba8fcb79?w=800&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
    ],
    default: [
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    ],
  };

  let category = "default";
  if (/tech|software|ai\b|machine|data|code|digital|cyber|computer|program|web|app|cloud/i.test(text)) category = "technology";
  else if (/business|market|finance|startup|economy|corporate|company|invest/i.test(text)) category = "business";
  else if (/science|research|lab|experiment|physics|chemistry|biology/i.test(text)) category = "science";
  else if (/educat|school|university|learn|student|teach|academic/i.test(text)) category = "education";
  else if (/nature|environment|climate|eco|forest|ocean|animal|plant/i.test(text)) category = "nature";
  else if (/health|medical|hospital|doctor|medicine|wellness|fitness/i.test(text)) category = "health";
  else if (/food|cook|recipe|cuisine|restaurant|nutrition|diet/i.test(text)) category = "food";
  else if (/sport|cricket|football|basketball|tennis|athlete|olympic|game/i.test(text)) category = "sports";

  const urls = categories[category];
  return urls[slideIndex % urls.length];
}

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITIES
// ═══════════════════════════════════════════════════════════════

function pickUniqueImage(hits, usedUrls, source) {
  if (!hits || hits.length === 0) return null;

  const sorted = [...hits].sort((a, b) => {
    const scoreA = (a.likes || 0) * 5 + (a.imageWidth || a.width || 0);
    const scoreB = (b.likes || 0) * 5 + (b.imageWidth || b.width || 0);
    return scoreB - scoreA;
  });

  for (const hit of sorted) {
    const url = hit.largeImageURL || hit.webformatURL;
    if (url && !usedUrls.has(url)) return url;
  }

  for (const hit of sorted) {
    const url = hit.webformatURL || hit.previewURL;
    if (url && !usedUrls.has(url)) return url;
  }

  return null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}