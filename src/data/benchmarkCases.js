export const benchmarkCases = [
  {
    id: "case-01",
    title: "WHO Official Global Pandemic Readiness Protocol 2026",
    type: "text",
    category: "health",
    domain: "Health / Global Safety",
    input: "The World Health Organization (WHO) has updated its International Health Regulations (IHR 2024 Amendments) to streamline early disease outbreak notification without overriding national sovereignty.",
    expectedVerdict: "Safe to Share",
    expectedCredibility: 94,
    expectedConfidence: 96,
    expectedRisk: "Low",
    scenario: "verified-true-claim",
    claims: [
      { text: "WHO updated International Health Regulations amendments in 2024", verified: true, source: "WHO Official Press Release (who.int)" },
      { text: "Amendments focus on early outbreak notification", verified: true, source: "CDC Public Health Digest" },
      { text: "Amendments preserve member state national sovereignty", verified: true, source: "UN Legal Affairs Treaty Series" }
    ],
    sources: [
      { name: "World Health Organization", url: "https://www.who.int/news/item/ihr-amendments-2024", reliability: 98, type: "Official Health Body" },
      { name: "CDC Global Health", url: "https://www.cdc.gov/globalhealth", reliability: 96, type: "Government Authority" }
    ],
    explanation: "Claims are fully corroborated by recent WHO official press releases, UN Treaty documents, and CDC digests. National sovereignty preservation is explicitly stated in Article 3.",
    isHighImpact: true
  },
  {
    id: "case-02",
    title: "Miracle Cancer Cure Pill Miracle Plant Extract",
    type: "text",
    category: "health",
    domain: "Health / Medical Misinformation",
    input: "Drinking boiled dandelion root extract cures Stage 4 metastatic lung cancer in 48 hours according to hidden FDA studies.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 8,
    expectedConfidence: 95,
    expectedRisk: "High",
    scenario: "false-claim",
    claims: [
      { text: "Dandelion root cures Stage 4 cancer in 48 hours", verified: false, contradiction: "Contradicted by National Cancer Institute (NCI) and PubMed clinical literature." },
      { text: "FDA has hidden clinical studies proving this", verified: false, contradiction: "FDA open database reveals zero approved oncology trials for raw extract." }
    ],
    sources: [
      { name: "National Cancer Institute", url: "https://www.cancer.gov/about-cancer/treatment/cam", reliability: 99, type: "Government Medical Institute" },
      { name: "FactCheck.org Health", url: "https://www.factcheck.org/health-claims", reliability: 95, type: "Fact Check DB" }
    ],
    explanation: "Fabricated medical claim with extreme risk. No scientific evidence supports 48-hour oncology cures with herbal teas. Directly contradicted by NCI and PubMed literature.",
    isHighImpact: true
  },
  {
    id: "case-03",
    title: "Central Bank Digital Currency Mandate Myth",
    type: "text",
    category: "finance",
    domain: "Finance / Currency",
    input: "The Federal Reserve will outlaw physical cash currency completely by November 2026 and force all citizen bank accounts into CBDC digital wallets with individual spending caps.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 12,
    expectedConfidence: 92,
    expectedRisk: "High",
    scenario: "false-claim",
    claims: [
      { text: "Federal Reserve outlawing physical paper cash in Nov 2026", verified: false, contradiction: "Federal Reserve Act Section 16 mandates physical legal tender." },
      { text: "Forced CBDC conversion with spending caps", verified: false, contradiction: "Federal Reserve Board policy confirms any future CBDC requires Congressional authorization." }
    ],
    sources: [
      { name: "Federal Reserve Board", url: "https://www.federalreserve.gov/cbdc-faqs.htm", reliability: 98, type: "Central Bank Authority" },
      { name: "Reuters Financial Fact Check", url: "https://www.reuters.com/fact-check", reliability: 94, type: "News Fact-Check" }
    ],
    explanation: "False financial rumor. Federal Reserve Chair testimonies and official Federal Reserve FAQs confirm cash remains legal tender and no CBDC exists without an Act of Congress.",
    isHighImpact: true
  },
  {
    id: "case-04",
    title: "NASA Webb Telescope Detects City Lights on Proxima b",
    type: "text",
    category: "misleading",
    domain: "Science / Astronomy",
    input: "NASA's James Webb Space Telescope has captured definitive high-resolution photographs showing artificial city lights on exoplanet Proxima Centauri b.",
    expectedVerdict: "Share with Caution",
    expectedCredibility: 35,
    expectedConfidence: 88,
    expectedRisk: "Medium",
    scenario: "misleading-claim",
    claims: [
      { text: "JWST observed Proxima Centauri b", verified: true, source: "NASA Astrophysics Data System" },
      { text: "Captured high-res photographs of artificial city lights", verified: false, contradiction: "JWST atmospheric spectroscopy study measured thermal emission, not optical photos of artificial illumination." }
    ],
    sources: [
      { name: "NASA JPL Exoplanet Exploration", url: "https://exoplanets.nasa.gov", reliability: 99, type: "Government Science Agency" },
      { name: "Astrophysical Journal Letters", url: "https://iopscience.iop.org/journal/2041-8205", reliability: 97, type: "Peer-Reviewed Journal" }
    ],
    explanation: "Misleading headline distortion. Webb performed transit spectroscopy on the system, but no spatial photographs or artificial lights were detected. Theoretical biosignature papers were sensationalized.",
    isHighImpact: false
  },
  {
    id: "case-05",
    title: "Unverified Rumor of Secret Tech CEO Resignation",
    type: "text",
    category: "insufficient-evidence",
    domain: "Business / Corporate",
    input: "Unconfirmed reports on social media claim the CEO of a major semiconductor company secretly tendered resignation during a midnight emergency board meeting.",
    expectedVerdict: "Requires Expert Review",
    expectedCredibility: 42,
    expectedConfidence: 45,
    expectedRisk: "Medium",
    scenario: "insufficient-evidence",
    claims: [
      { text: "CEO tendered secret resignation at midnight board meeting", verified: null, contradiction: "No SEC Form 8-K filing or corporate press release available." }
    ],
    sources: [
      { name: "SEC EDGAR Filings", url: "https://www.sec.gov/edgar", reliability: 99, type: "Regulatory Database" }
    ],
    explanation: "Insufficient Evidence. No SEC Form 8-K disclosure, press release, or authoritative news outlet has corroborated this anonymous social media post. Confidence is low.",
    isHighImpact: false
  },
  {
    id: "case-06",
    title: "Photorealistic AI Deepfake of Pentagon Explosion",
    type: "image",
    category: "ai-generated",
    domain: "Public Safety / Media Authenticity",
    input: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600",
    imageCaption: "Dramatic photo showing black smoke column rising outside the Pentagon building with emergency sirens.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 15,
    expectedConfidence: 94,
    expectedRisk: "High",
    scenario: "ai-generated-image",
    forensics: {
      aiProbability: 96,
      diffusionArtifacts: "Consistent synthetic noise patterns in smoke boundaries & repeated window motifs",
      exifCameraData: "Missing (Stripped synthetic render)",
      elaAnalysis: "Error Level Analysis shows non-uniform compression inconsistent with raw sensor"
    },
    sources: [
      { name: "Department of Defense Public Affairs", url: "https://www.defense.gov", reliability: 99, type: "Government Defense Body" },
      { name: "Arlington Fire Dept Official Feed", url: "https://twitter.com/ArlingtonVaFD", reliability: 96, type: "First Responders" }
    ],
    explanation: "Synthetically generated image. AI detector analysis identified 96% probability of diffusion model synthesis (Stable Diffusion/Midjourney artifacts). Arlington Fire Dept confirmed zero incidents.",
    isHighImpact: true
  },
  {
    id: "case-07",
    title: "Manipulated Historical Photo of Election Rally",
    type: "image",
    category: "manipulated",
    domain: "Elections / Political",
    input: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600",
    imageCaption: "Aerial photo showing millions packed into city square during yesterday's political rally.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 22,
    expectedConfidence: 91,
    expectedRisk: "High",
    scenario: "manipulated-image",
    forensics: {
      aiProbability: 25,
      manipulationDetected: true,
      reverseImageResult: "Identical crowd image was originally taken during 2014 World Cup celebration in Buenos Aires.",
      contextMisleading: true
    },
    sources: [
      { name: "AFP Fact Check Photo Archive", url: "https://factcheck.afp.com", reliability: 97, type: "Fact Check Archive" },
      { name: "Reuters Pictures Provenance", url: "https://www.reuters.com/pictures", reliability: 98, type: "Press Photo Agency" }
    ],
    explanation: "Out-of-context image manipulation. Reverse image search traces this exact photograph to the 2014 FIFA World Cup victory parade in Argentina, falsely repurposed as a recent political rally.",
    isHighImpact: true
  },
  {
    id: "case-08",
    title: "Phishing Scam URL masquerading as National Tax Portal",
    type: "url",
    category: "scam-url",
    domain: "Cybersecurity / Scam Prevention",
    input: "http://verify-tax-refund-gov-portal-login.secure-update-account89.xyz/auth",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 4,
    expectedConfidence: 98,
    expectedRisk: "High",
    scenario: "scam-url",
    urlMetrics: {
      domainAgeDays: 3,
      sslCertificate: "Self-signed untrusted",
      phishingScore: 99,
      typosquattingTarget: "irs.gov / official tax portal"
    },
    sources: [
      { name: "Google Safe Browsing API", url: "https://safebrowsing.google.com", reliability: 99, type: "Security Database" },
      { name: "US-CERT Phishing Advisory", url: "https://www.cisa.gov", reliability: 99, type: "Cybersecurity Agency" }
    ],
    explanation: "Malicious credential phishing URL. Domain registered 3 days ago on low-reputation TLD (.xyz) using deceptive keywords. High risk of identity and financial fraud.",
    isHighImpact: true
  },
  {
    id: "case-09",
    title: "Conflicting Early Reports on Regional Power Grid Glitch",
    type: "text",
    category: "conflicting",
    domain: "Infrastructure / Breaking News",
    input: "Initial local news outlets report cyberattack caused Midwest power outage while utility operator claims bird strike on main sub-station transformer.",
    expectedVerdict: "Requires Expert Review",
    expectedCredibility: 48,
    expectedConfidence: 52,
    expectedRisk: "Medium",
    scenario: "conflicting-sources",
    claims: [
      { text: "Cyberattack caused power outage", verified: null, source: "Local Gazette breaking feed" },
      { text: "Substation transformer physical fault caused outage", verified: null, source: "Regional Power Grid Transmission Co. Press Office" }
    ],
    sources: [
      { name: "North American Electric Reliability Corp (NERC)", url: "https://www.nerc.com", reliability: 96, type: "Grid Regulator" },
      { name: "Department of Energy Incident Log", url: "https://www.energy.gov", reliability: 98, type: "Government Agency" }
    ],
    explanation: "Conflicting evidence between preliminary news reporting and official utility statements. Investigation ongoing; confidence reduced. Awaiting official NERC assessment report.",
    isHighImpact: true
  },
  {
    id: "case-10",
    title: "Satirical Onion Article on AI Voting for Citizens",
    type: "text",
    category: "satire",
    domain: "Media Literacy / Satire",
    input: "Congress passes emergency bill allowing artificial intelligence chatbots to cast official ballots on behalf of busy citizens who skip voting.",
    expectedVerdict: "Share with Caution",
    expectedCredibility: 28,
    expectedConfidence: 95,
    expectedRisk: "Medium",
    scenario: "satire-or-parody",
    claims: [
      { text: "Congress passed law allowing AI to vote for citizens", verified: false, contradiction: "U.S. Constitution Article I & 15th/19th/26th Amendments limit voting to eligible human citizens." }
    ],
    sources: [
      { name: "The Onion Satire Register", url: "https://www.theonion.com", reliability: 90, type: "Satirical Publication" },
      { name: "US House of Representatives Records", url: "https://www.house.gov", reliability: 99, type: "Legislative Database" }
    ],
    explanation: "Recognized satirical humor piece originating from parody publication. Contains no factual basis in Congressional legislation, but is intended as social commentary.",
    isHighImpact: true
  },
  {
    id: "case-11",
    title: "Outdated 2020 Travel Mask Mandate Rules Shared in 2026",
    type: "text",
    category: "outdated",
    domain: "Travel / Public Policy",
    input: "FAA requires all domestic airline passengers to wear N95 face masks at all times during flight under federal order penalties.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 30,
    expectedConfidence: 94,
    expectedRisk: "Medium",
    scenario: "outdated-information",
    claims: [
      { text: "FAA currently mandates domestic flight mask wearing", verified: false, contradiction: "Federal mask mandate for public transportation expired in April 2022 following federal court ruling." }
    ],
    sources: [
      { name: "Federal Aviation Administration (FAA)", url: "https://www.faa.gov/newsroom", reliability: 99, type: "Government Travel Authority" },
      { name: "TSA Official Press Room", url: "https://www.tsa.gov/news", reliability: 98, type: "Transportation Security" }
    ],
    explanation: "Outdated information. The federal transportation mask mandate was struck down and rescinded in 2022. Sharing 2020 regulatory orders in 2026 creates false travel compliance expectations.",
    isHighImpact: false
  },
  {
    id: "case-12",
    title: "PolitiFact Verified Fact: State Tax Exemption on Solar",
    type: "text",
    category: "text",
    domain: "Finance / Tax Policy",
    input: "Residential solar energy installation receives a 30% Federal Clean Energy Investment Tax Credit (ITC) under current U.S. tax code Section 25D.",
    expectedVerdict: "Safe to Share",
    expectedCredibility: 96,
    expectedConfidence: 97,
    expectedRisk: "Low",
    scenario: "verified-true-claim",
    claims: [
      { text: "Residential solar qualifies for 30% federal tax credit under Section 25D", verified: true, source: "Internal Revenue Service (IRS.gov)" }
    ],
    sources: [
      { name: "Internal Revenue Service", url: "https://www.irs.gov/credits-deductions/residential-clean-energy-credit", reliability: 99, type: "Government Tax Authority" },
      { name: "Department of Energy Solar Office", url: "https://www.energy.gov/eere/solar", reliability: 98, type: "Energy Department" }
    ],
    explanation: "Fully verified tax claim. Section 25D of the U.S. Internal Revenue Code explicitly authorizes the 30% Residential Clean Energy Credit.",
    isHighImpact: true
  },
  {
    id: "case-13",
    title: "AI Voice Deepfake Scam Impersonating Family Emergency",
    type: "video",
    category: "ai-generated",
    domain: "Consumer Security / Deepfake Audio",
    input: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
    videoCaption: "Short phone video clip of relative crying asking for instant wire transfer to bail out of foreign detention center.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 6,
    expectedConfidence: 96,
    expectedRisk: "High",
    scenario: "ai-generated-image",
    forensics: {
      aiProbability: 98,
      audioSpectralAnomaly: "Synthetic pitch trajectory, robotic spectral phase coherence, 0ms natural breathing pauses.",
      forensicConclusion: "Generative voice cloning attack using 3-second sample."
    },
    sources: [
      { name: "Federal Trade Commission Consumer Sentinel", url: "https://www.ftc.gov/news-events/topics/identity-theft", reliability: 99, type: "Consumer Protection" },
      { name: "FBI Cyber Division Alert", url: "https://www.ic3.gov", reliability: 99, type: "Federal Law Enforcement" }
    ],
    explanation: "AI voice cloning audio deepfake scam. Spectral acoustic analysis shows 98% probability of neural audio synthesis. Do not transfer funds; contact relative directly via known secondary channel.",
    isHighImpact: true
  },
  {
    id: "case-14",
    title: "Claim of New Renewable Energy Battery Discovery",
    type: "text",
    category: "science",
    domain: "Technology / Green Energy",
    input: "MIT researchers published a breakthrough sodium-ion battery design reaching 95% theoretical capacity retention over 5,000 rapid charge cycles in Nature Energy journal.",
    expectedVerdict: "Safe to Share",
    expectedCredibility: 92,
    expectedConfidence: 94,
    expectedRisk: "Low",
    scenario: "verified-true-claim",
    claims: [
      { text: "MIT team published sodium-ion battery research in Nature Energy", verified: true, source: "Nature Energy (DOI: 10.1038/s41560-2025-0142)" },
      { text: "Demonstrated 95% capacity retention over 5,000 cycles", verified: true, source: "MIT News Office Release" }
    ],
    sources: [
      { name: "Nature Energy Journal", url: "https://www.nature.com/natenergy", reliability: 99, type: "Peer-Reviewed Scientific Journal" },
      { name: "MIT News", url: "https://news.mit.edu", reliability: 97, type: "Academic Institution" }
    ],
    explanation: "Accurate science reporting. The study was peer-reviewed and published in Nature Energy. Methodology and metric disclosures align with the paper's abstract.",
    isHighImpact: false
  },
  {
    id: "case-15",
    title: "Fake Official Election Rules Changes on Ballot Signatures",
    type: "text",
    category: "elections",
    domain: "Elections / Voting Integrity",
    input: "State Election Board passed a emergency directive declaring that mail-in ballots signed with blue ink instead of black ink will be discarded.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 10,
    expectedConfidence: 96,
    expectedRisk: "High",
    scenario: "false-claim",
    claims: [
      { text: "Blue ink mail-in ballots will be discarded", verified: false, contradiction: "State Election Code permits any dark blue or black ink pen; official guidelines explicitly clarify ink color flexibility." }
    ],
    sources: [
      { name: "State Board of Elections Official Guidance", url: "https://www.elections.gov", reliability: 99, type: "State Election Authority" },
      { name: "Nonpartisan Election Protection Hotline", url: "https://866ourvote.org", reliability: 96, type: "Voter Rights Org" }
    ],
    explanation: "Voter suppression misinformation. State election regulations accept both dark blue and black ink on mail ballots. Intended to create voter confusion.",
    isHighImpact: true
  },
  {
    id: "case-16",
    title: "Document Leak Claim on New Import Tariff Rates",
    type: "document",
    category: "finance",
    domain: "Trade / Economics",
    input: "PDF Document titled 'Executive_Order_Draft_Tariffs_2026.pdf' claiming immediate 45% tariff on all imported electronic components.",
    expectedVerdict: "Share with Caution",
    expectedCredibility: 55,
    expectedConfidence: 72,
    expectedRisk: "Medium",
    scenario: "insufficient-evidence",
    claims: [
      { text: "Draft Executive Order specifies 45% tariff on imported electronics", verified: false, contradiction: "Document contains unverified header typography; no Federal Register notice published." }
    ],
    sources: [
      { name: "Federal Register Public Inspection", url: "https://www.federalregister.gov", reliability: 99, type: "Official Government Register" },
      { name: "US Trade Representative Press Office", url: "https://ustr.gov", reliability: 98, type: "Trade Policy Office" }
    ],
    explanation: "Unverified policy draft leak. No official Federal Register publication or USTR press briefing confirms execution of this policy. Exercise caution before making business decisions.",
    isHighImpact: true
  },
  {
    id: "case-17",
    title: "Verified WHO Polio Eradication Statistics",
    type: "text",
    category: "health",
    domain: "Health / Global Epidemiology",
    input: "Wild poliovirus type 1 transmission remains endemic in only two countries globally as of 2025/2026 tracking data.",
    expectedVerdict: "Safe to Share",
    expectedCredibility: 95,
    expectedConfidence: 98,
    expectedRisk: "Low",
    scenario: "verified-true-claim",
    claims: [
      { text: "Wild poliovirus type 1 endemic in only two countries", verified: true, source: "Global Polio Eradication Initiative (GPEI)" }
    ],
    sources: [
      { name: "Global Polio Eradication Initiative", url: "https://polioeradication.org", reliability: 99, type: "International Public Health Body" },
      { name: "World Health Organization Weekly Epidemiological Record", url: "https://www.who.int/wer", reliability: 99, type: "Epidemiological Journal" }
    ],
    explanation: "Fully verified epidemiology statistic. Corroborated by WHO Weekly Epidemiological Record and GPEI surveillance data.",
    isHighImpact: true
  },
  {
    id: "case-18",
    title: "AI Generated Photo of Vatican Snowfall in July",
    type: "image",
    category: "ai-generated",
    domain: "Media Authenticity / Weather",
    input: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600",
    imageCaption: "Unbelievable photo of St. Peter's Square covered in 3 feet of fresh snow in July 2026 during heatwave.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 10,
    expectedConfidence: 97,
    expectedRisk: "Medium",
    scenario: "ai-generated-image",
    forensics: {
      aiProbability: 95,
      weatherStationRecord: "Rome meteorological station logged +34°C (+93°F) dry sunny conditions on cited date.",
      forensicConclusion: "Diffusion image synthesis combined with impossible meteorological metrics."
    },
    sources: [
      { name: "Servizio Meteorologico Aeronautica Militare", url: "https://www.meteoam.it", reliability: 99, type: "National Weather Agency" }
    ],
    explanation: "AI-generated image with impossible environmental conditions. Weather station records in Rome registered +34°C. Forensic analysis confirms synthetic rendering.",
    isHighImpact: false
  },
  {
    id: "case-19",
    title: "Legitimate CDC Seasonal Influenza Vaccination Advisory",
    type: "text",
    category: "health",
    domain: "Health / Vaccination",
    input: "CDC recommends annual influenza vaccination for everyone 6 months of age and older who does not have contraindications.",
    expectedVerdict: "Safe to Share",
    expectedCredibility: 98,
    expectedConfidence: 99,
    expectedRisk: "Low",
    scenario: "verified-true-claim",
    claims: [
      { text: "CDC recommends annual flu vaccine for everyone 6 months+", verified: true, source: "CDC Advisory Committee on Immunization Practices (ACIP)" }
    ],
    sources: [
      { name: "CDC Immunization Schedules", url: "https://www.cdc.gov/vaccines/schedules", reliability: 99, type: "Government Public Health" },
      { name: "American Academy of Pediatrics", url: "https://www.aap.org", reliability: 98, type: "Medical Association" }
    ],
    explanation: "Standard public health guidance backed by decades of clinical trial data and CDC ACIP guidelines.",
    isHighImpact: true
  },
  {
    id: "case-20",
    title: "Scam Investment URL Guaranteeing 500% Daily Crypto Returns",
    type: "url",
    category: "scam-url",
    domain: "Finance / Cyber Scam",
    input: "https://guaranteed-crypto-profit-matrix.ai-trade-bot77.click/signup",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 2,
    expectedConfidence: 99,
    expectedRisk: "High",
    scenario: "scam-url",
    urlMetrics: {
      domainAgeDays: 1,
      phishingScore: 100,
      ponziIndicator: "Promises 500% guaranteed risk-free daily return"
    },
    sources: [
      { name: "SEC Cyber Enforcement Division", url: "https://www.sec.gov/spotlight/cybersecurity", reliability: 99, type: "Financial Regulator" },
      { name: "FTC Scam Alert Network", url: "https://consumer.ftc.gov/scams", reliability: 99, type: "Consumer Protection" }
    ],
    explanation: "Financial fraud & phishing scam. Promising guaranteed 500% daily returns is a classic Ponzi scheme indicator. Domain active for less than 24 hours.",
    isHighImpact: true
  },
  {
    id: "case-21",
    title: "AI Audio Deepfake Impersonating Bank Fraud Representative",
    type: "audio",
    category: "ai-generated",
    domain: "Cybersecurity / Audio Deepfake",
    input: "[Audio File: urgent_bank_security_alert_voice.wav (3.2 MB)]",
    audioCaption: "Urgent voice message from 'Chief Fraud Officer' demanding immediate 2FA verification pin bypass.",
    expectedVerdict: "Do Not Share",
    expectedCredibility: 5,
    expectedConfidence: 97,
    expectedRisk: "High",
    scenario: "ai-generated-audio",
    forensics: {
      aiProbability: 97,
      audioSpectralAnomaly: "ElevenLabs V2 vocoder phase artifacts, zero ambient room acoustics, synthetic spectral cadence.",
      forensicConclusion: "Neural voice cloning spoof targeting high-net-worth customer."
    },
    sources: [
      { name: "Financial Services Information Sharing Center", url: "https://www.fsisac.com", reliability: 98, type: "Cyber Threat Intel" },
      { name: "FBI Cyber Division Advisory", url: "https://www.ic3.gov", reliability: 99, type: "Federal Law Enforcement" }
    ],
    explanation: "Synthetic AI audio deepfake. Spectral acoustic analysis confirmed neural TTS vocoder synthesis. Do not share 2FA OTP codes or verify financial credentials over unverified audio calls.",
    isHighImpact: true
  },
  {
    id: "case-22",
    title: "Authentic Official Press Briefing Audio Recording",
    type: "audio",
    category: "audio",
    domain: "Government / Official News",
    input: "[Audio File: WhiteHouse_Press_Briefing_Excerpt_2026.mp3 (4.8 MB)]",
    audioCaption: "Official audio recording of press secretary responding to infrastructure bill query.",
    expectedVerdict: "Safe to Share",
    expectedCredibility: 96,
    expectedConfidence: 98,
    expectedRisk: "Low",
    scenario: "verified-true-audio",
    forensics: {
      aiProbability: 2,
      audioSpectralAnomaly: "Natural room reverberation, realistic vocal tract resonance, valid microphone noise floor.",
      forensicConclusion: "Unedited authentic human vocal recording matching C-SPAN broadcast."
    },
    sources: [
      { name: "C-SPAN Audio Archives", url: "https://www.c-span.org", reliability: 99, type: "Public Affairs Network" },
      { name: "White House Press Office", url: "https://www.whitehouse.gov/briefing-room", reliability: 99, type: "Official Press Room" }
    ],
    explanation: "Authentic audio clip. Micro-acoustic spectral analysis matches physical room acoustics and C-SPAN broadcast archive feeds.",
    isHighImpact: false
  }
];

