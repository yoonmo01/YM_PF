import { portfolio, type PortfolioProject } from "./public-portfolio";

const projectCopy: Record<string, Pick<PortfolioProject, "title" | "summary" | "role" | "caseStudy">> = {
  "vishbox-v2": {
    title: "VishBox v2", summary: "A research system that tracks both criminal tactics and victim state during voice phishing simulations.", role: "Multi-agent simulation research, development, and paper writing",
    caseStudy: { problem: "Overall realism alone does not explain how tactics and victim state change at each turn.", goal: "Generate procedural conversations and record state changes so researchers can inspect each stage.", implementation: "Separated conversation generation and analysis into agent roles, then recorded dialogue and analysis by round.", limitations: "The research uses synthetic conversations in a specific impersonation scenario; evaluation and individual contribution claims require source review.", reflection: "A final transcript is less useful without the stages and state transitions that produced it." },
  },
  "legal-translation-review": {
    title: "Legal Document Translation and Review", summary: "A research workflow for extraction, contextual translation, and side-by-side review of legal documents.", role: "Backend, data pipeline, model integration, and deployment",
    caseStudy: { problem: "PDF extraction errors, missing context between blocks, and shared GPU contention all affected translation.", goal: "Connect extraction, translation review, job status, and retries in one workflow.", implementation: "MinerU extracts the PDF, Gemma4 builds document context, and TranslateGemma translates it. The service tracks jobs and aligns source and translated text for review.", limitations: "Quantitative translation quality and throughput have not been publicly verified; the entire system should not be described as fully offline.", reflection: "Extraction quality, review, and resource scheduling matter as much as the translation model." },
  },
  "public-audit-ai-viewer": {
    title: "Public Audit AI Classification and Viewer", summary: "A search and analytics system built around roughly 15,000 public audit records.", role: "Backend, collection and classification pipeline, and deployment",
    caseStudy: { problem: "Overwriting source labels with AI predictions would make classification decisions hard to audit.", goal: "Connect collection, hierarchical classification, search, statistics, and source document access while preserving reviewer decisions.", implementation: "Deduplicated collected documents and stored original labels separately from AI predictions. Search and aggregation APIs link to documents in object storage.", limitations: "Classification agreement was evaluated on a selected sample of 136 records. Subcategory boundaries were ambiguous; figures in the original report need final reconciliation.", reflection: "Separating predictions from review decisions makes later rule changes and comparisons possible." },
  },
  "auth-security-audit": {
    title: "AUTH", summary: "A multi-agent internal information security self-audit app with consent, evidence review, and appeals.", role: "Team lead, architecture, multi-agent analysis, and ETL",
    caseStudy: { problem: "Security analysis had to support employee consent, inspectable evidence, and a path to contest errors.", goal: "Make analysis steps and evidence reviewable and connect them to appeals and administrator review.", implementation: "LangGraph coordinates analysis stages; relational, vector, and graph stores serve distinct data needs.", limitations: "Risk-level agreement was 3/3 in three simulated scenarios in a virtual environment, not a broad accuracy study. Some AI processing uses external APIs.", reflection: "A useful audit product includes evidence review and appeals alongside the risk result." },
  },
  "vishbox": {
    title: "VishBox v1", summary: "A synthetic voice phishing dialogue system whose realism was evaluated by human reviewers.", role: "Simulation research, development, and paper writing",
    caseStudy: { problem: "Real call recordings are difficult to use safely for research.", goal: "Generate synthetic conversations conditioned on victim profiles and connect them to human realism evaluation.", implementation: "Multiple agent roles coordinate dialogue generation and analysis, then store profile-specific conversations and results.", limitations: "This synthetic dialogue study does not measure real-world prevention outcomes. Individual contributions require source review.", reflection: "The work led to a follow-up study that records tactics and victim state at each stage." },
  },
  polystep: {
    title: "POLYSTEP", summary: "A policy discovery service that connects eligibility search to the original announcement.", role: "Team lead, policy verification pipeline, and backend integration",
    caseStudy: { problem: "Policy announcements can change or expire, so search results alone cannot establish eligibility.", goal: "Let users inspect the source announcement and verification status from each search result.", implementation: "Connected policy search to source visits and comparisons, exposing success, pending, and failure states with reasons.", limitations: "A successful source check does not guarantee individual eligibility. Collection counts and current operation require further verification.", reflection: "The route from search result to official source defined the product scope." },
  },
};

const previewCopy: Record<string, PortfolioProject["preview"]> = {
  "vishbox-v2": { kind: "image", src: "/projects/VP2/fig1-architecture.png", alt: "VishBox v2 multi-agent system architecture" },
  "legal-translation-review": { kind: "flow", steps: ["MinerU", "Gemma4", "TranslateGemma"], caption: "PDF extraction → context → translation" },
  "public-audit-ai-viewer": { kind: "metric", value: "~15,000", label: "Public audit records in the system", detail: "Agreement was separately evaluated on 136 selected records" },
  "auth-security-audit": { kind: "metric", value: "3/3", label: "Expected risk levels matched in virtual simulated scenarios", detail: "Agent analysis: ~8 min → 2–3 min (measured)" },
  vishbox: { kind: "image", src: "/projects/VP/fig1-architecture.png", alt: "VishBox v1 multi-agent system architecture" },
  polystep: { kind: "image", src: "/projects/POLYSTEP/fig3-home.png", alt: "POLYSTEP policy search home screen" },
};

export const portfolioEn = {
  profile: {
    ...portfolio.profile,
    name: "Yoonmo Yang",
    headline: "I turn AI agent decisions into services people can inspect and trust.",
    shortBio: "I research multi-agent systems and build AI service backends. My work connects data pipelines, agent execution, and verification.",
    longBio: "I care about systems that help people understand and review AI outputs. I have built data pipelines and backend services for conversation simulation, document classification and translation, and internal security audits. I aim to connect research, validation, and deployment as an AI Agent and Backend Engineer.",
  },
  projects: portfolio.projects.map((project) => ({ ...project, ...projectCopy[project.slug], preview: previewCopy[project.slug] })),
  experiences: [{ organization: "Intelligent Decision Systems Lab, Hallym University", title: "Undergraduate Researcher", period: "Jul 2025–Present", description: "Research and development in multi-agent systems, data processing, backend services, and deployment." }],
  educations: [{ institution: "Hallym University", program: "Big Data, double major in Smart IoT", period: "Mar 2020–Feb 2027 (expected graduation)" }],
  publications: portfolio.publications,
  awards: [
    { title: "Special Award, Poster Presentation, 2026 Gangwon AI·SW Festival", issuer: "Gangwon AI·SW Festival", date: "Sep 17, 2026" },
    { title: "Semester Honors, Spring 2026", issuer: "Hallym University", date: "Spring 2026" },
    { title: "Bronze Prize, Spring 2026 SW Capstone Design Competition", issuer: "Hallym University SW-Centered University Project", date: "Jun 5, 2026" },
    { title: "Popularity Award, Excellent Works Competition, 2025 SW Talent Festival", issuer: "2025 SW Talent Festival", date: "2025" },
    { title: "Semester Honors, Fall 2025", issuer: "Hallym University", date: "Fall 2025" },
    { title: "Overall Excellence Award, 2025 Gangwon SW-Centered University Prompthon", issuer: "Hallym University SW-Centered University Project", date: "Aug 27, 2025" },
  ],
  skillGroups: portfolio.skillGroups,
};
