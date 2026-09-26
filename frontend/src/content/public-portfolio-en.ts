import { portfolio, type PortfolioProject } from "./public-portfolio";

const projectCopy: Record<string, Pick<PortfolioProject, "title" | "summary" | "role" | "caseStudy">> = {
  "vishbox-v2": {
    title: "VishBox v2", summary: "A research system that tracks both criminal tactics and victim state during voice phishing simulations.", role: "Main Agent, its tools, and MCP Dialogue Agent design and implementation",
    caseStudy: { problem: "Overall realism alone does not explain how tactics and victim state change at each turn.", goal: "Generate procedural conversations and record state changes so researchers can inspect each stage.", implementation: "Designed and built the Main Agent and the tools it calls, and split the MCP Dialogue Agent into attacker planning, utterance generation, and victim response. Mapped eight emotion labels to four HMM inputs, used emotion values in the Guidance Tool, and extracted emotion-based vulnerabilities in the round judgment tool. Reduced the state payload sent to the agent after JSON output failures.", limitations: "The research uses synthetic conversations in a specific impersonation scenario; evaluation results describe the team system.", reflection: "A final transcript is less useful without the stages and state transitions that produced it." },
  },
  "legal-translation-review": {
    title: "Legal Document Translation and Review", summary: "A research workflow for extraction, contextual translation, and side-by-side review of legal documents.", role: "Entire frontend, translation model selection and integration, and GPU job management",
    caseStudy: { problem: "PDF extraction errors, missing context between blocks, and shared GPU contention all affected translation.", goal: "Connect extraction, translation review, job status, and retries in one workflow.", implementation: "Replaced Marker-pdf with MinerU after document structure and header/footer issues. Built the entire frontend, including PDF–extraction–translation block comparison, merge and split controls, live progress, and retries. Selected and integrated TranslateGemma, queued GPU jobs during contention, and displayed reservation and model status.", limitations: "Quantitative translation quality and throughput have not been publicly verified; the entire system should not be described as fully offline.", reflection: "Extraction quality, review, and resource scheduling matter as much as the translation model." },
  },
  "public-audit-ai-viewer": {
    title: "Public Audit AI Classification and Viewer", summary: "A search and analytics system built around roughly 15,000 public audit records.", role: "Three-level classification prompts, FastAPI viewer, AWS deployment, and handover with the audit agency",
    caseStudy: { problem: "Overwriting source labels with AI predictions would make classification decisions hard to audit.", goal: "Connect collection, hierarchical classification, search, statistics, and source document access while preserving reviewer decisions.", implementation: "Designed prompts for category, task, and subtask classification; built FastAPI search and aggregation endpoints; deployed on AWS and coordinated handover with the audit agency.", limitations: "Classification agreement was evaluated on 136 selected records, not all roughly 15,000. Ambiguous subtask boundaries contributed to lower subtask agreement.", reflection: "Separating predictions from review decisions makes later rule changes and comparisons possible." },
  },
  "auth-security-audit": {
    title: "AUTH", summary: "A multi-agent internal information security self-audit app with consent, evidence review, and appeals.", role: "Team lead and presenter; three-database ETL and agent system architecture",
    caseStudy: { problem: "Security analysis had to support employee consent, inspectable evidence, and a path to contest errors.", goal: "Make analysis steps and evidence reviewable and connect them to appeals and administrator review.", implementation: "Built ETL from a provided CTF C-drive image into PostgreSQL, Qdrant, and Neo4j; designed the agent system and implemented baseline, behavior, and counter-evidence agents. Created three VM-based validation scenarios. Led the team, prepared the presentation materials, and delivered the presentation.", limitations: "Risk-level agreement was 3/3 in three simulated scenarios in a virtual environment, not a broad accuracy study. Some AI processing uses external APIs.", reflection: "A useful audit product includes evidence review and appeals alongside the risk result." },
  },
  "vishbox": {
    title: "VishBox v1", summary: "A synthetic voice phishing dialogue system whose realism was evaluated by human reviewers.", role: "Agent and MCP tools, SSE streaming, and simulation research",
    caseStudy: { problem: "Real call recordings are difficult to use safely for research.", goal: "Generate synthetic conversations conditioned on victim profiles and connect them to human realism evaluation.", implementation: "Implemented Manager Agent tool calls and MCP dialogue integration, then connected the FastAPI SSE stream to the UI's event handling for live simulation progress.", limitations: "This synthetic dialogue study does not measure real-world prevention outcomes; evaluation results describe the team system.", reflection: "The work led to a follow-up study that records tactics and victim state at each stage." },
  },
  polystep: {
    title: "POLYSTEP", summary: "A policy discovery service that connects eligibility search to the original announcement.", role: "Team lead; backend, policy verification pipeline, presentation materials and delivery",
    caseStudy: { problem: "Policy announcements can change or expire, so search results alone cannot establish eligibility.", goal: "Let users inspect the source announcement and verification status from each search result.", implementation: "Designed and built the policy processing and verification backend. Used Playwright and browser-use to visit and compare original announcements, recording verification states and failure reasons. As team lead, prepared the presentation materials and delivered the presentation.", limitations: "A successful source check does not guarantee individual eligibility. Collection counts and current operation require further verification.", reflection: "The route from search result to official source defined the product scope." },
  },
};

const previewCopy: Record<string, PortfolioProject["preview"]> = {
  "vishbox-v2": { kind: "image", src: "/projects/VP2/fig1-architecture.png", alt: "VishBox v2 multi-agent system architecture" },
  "legal-translation-review": { kind: "flow", steps: ["MinerU", "Gemma4", "TranslateGemma"], caption: "PDF extraction → context → translation" },
  "public-audit-ai-viewer": { kind: "image", src: "/projects/AUDIT/audit-home.png", alt: "Home screen of the public audit results viewer", caption: "Service screen reproduced with a separate dataset" },
  "auth-security-audit": { kind: "image", src: "/projects/AUTH/system-flow.svg", alt: "AUTH flow from evidence ingestion to agent analysis and appeals", caption: "3/3 VM scenarios matched · Agent analysis 8 min → 2–3 min (measured)" },
  vishbox: { kind: "image", src: "/projects/VP/fig1-architecture.png", alt: "VishBox v1 multi-agent system architecture" },
  polystep: { kind: "image", src: "/projects/POLYSTEP/fig3-home.png", alt: "POLYSTEP policy search home screen" },
};

export const portfolioEn = {
  profile: {
    ...portfolio.profile,
    name: "Yoonmo Yang",
    headline: "I find workflow bottlenecks and build AI services people can use.",
    shortBio: "At LIT LAB, I research multi-agent systems and have worked on data processing, APIs, and deployment for public audit search and legal document translation. I design workflows where people can review and correct AI results.",
    longBio: "I find workflow bottlenecks and build AI services people can use. At LIT LAB, I research multi-agent systems and have worked on data processing, APIs, and deployment for public audit search and legal document translation. I design workflows where people can review the evidence and correct AI results. As an AX Engineer, I connect problem definition to implementation, validation, and handover.",
  },
  projects: portfolio.projects.map((project) => ({ ...project, ...projectCopy[project.slug], preview: previewCopy[project.slug] })),
  experiences: [{ organization: "LIT LAB (Intelligent Decision Systems Lab), Hallym University", title: "Undergraduate Researcher", period: "Jul 2025–Present", description: "Research and development in multi-agent systems, data processing, backend services, and deployment." }],
  educations: [{ institution: "Hallym University", program: "Big Data, double major in Smart IoT", period: "Mar 2020–Feb 2027 (expected graduation)" }],
  publications: portfolio.publications,
  awards: [
    { title: "Special Award, Poster Presentation, 2026 Gangwon AI·SW Festival", issuer: "Gangwon AI·SW Festival", date: "Sep 17, 2026" },
    { title: "Semester Honors, Spring 2026", issuer: "Hallym University", date: "Spring 2026" },
    { title: "Bronze Prize, Spring 2026 SW Capstone Design Competition", issuer: "Hallym University SW-Centered University Project", date: "Jun 5, 2026" },
    { title: "Popularity Award, Excellent Works Competition, 2025 SW Talent Festival", issuer: "2025 SW Talent Festival", date: "Nov 28, 2025" },
    { title: "Semester Honors, Fall 2025", issuer: "Hallym University", date: "Fall 2025" },
    { title: "Overall Excellence Award, 2025 Gangwon SW-Centered University Prompthon", issuer: "Hallym University SW-Centered University Project", date: "Aug 27, 2025" },
  ],
  skillGroups: portfolio.skillGroups,
};
