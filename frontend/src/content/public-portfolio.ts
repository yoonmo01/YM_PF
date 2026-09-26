type ProjectPreview =
  | { kind: "image"; src: string; alt: string }
  | { kind: "flow"; steps: string[]; caption: string };

export type PortfolioProject = {
  slug: string;
  title: string;
  summary: string;
  featured: boolean;
  skills: string[];
  preview: ProjectPreview;
  caseStudy: {
    problem: string;
    goal: string;
    implementation: string;
    limitations: string;
    reflection: string;
  };
  role?: string;
  period?: string;
  teamSize?: number;
  technicalChoice?: string;
  personalWork?: string;
  verification?: string;
  links?: { github?: string; demo?: string };
  media?: Array<{ src: string; alt: string; caption?: string }>;
};

export const portfolio = {
  profile: {
    name: "양윤모",
    headline: "업무의 병목을 찾아 AI가 실제로 쓰이는 서비스로 만듭니다.",
    shortBio:
      "LIT LAB에서 Multi-Agent를 연구하고, 공공 감사 데이터 조회와 판결문 번역·검수 시스템의 데이터 처리·API·배포를 담당했습니다. AI 결과의 근거를 사람이 확인하고 수정할 수 있는 흐름을 설계합니다.",
    longBio:
      "업무의 병목을 찾아 AI가 실제로 쓰이는 서비스로 만듭니다. LIT LAB에서 Multi-Agent 시스템을 연구하고, 공공 감사 데이터 조회와 판결문 번역·검수 시스템의 데이터 처리·API·배포를 담당했습니다. 모델의 결과를 그대로 전달하기보다 근거를 사람이 확인하고 수정할 수 있는 흐름을 설계합니다. AX 엔지니어로서 문제 정의부터 구현, 검증과 인계까지 연결하고자 합니다.",
    email: "coolalex127@gmail.com",
    githubUrl: "https://github.com/yoonmo01",
    linkedinUrl: "https://www.linkedin.com/in/yoonmo-yang/",
  },
  projects: [
    {
      slug: "vishbox-v2",
      title: "VishBox v2",
      summary: "범죄 절차와 피해자 상태 변화를 함께 추적하는 보이스피싱 시뮬레이션 연구 시스템",
      featured: true,
      skills: ["FastAPI", "MCP", "ReAct", "HMM", "PostgreSQL"],
      preview: { kind: "image", src: "/projects/VP2/fig1-architecture.png", alt: "VishBox v2의 Multi-Agent 시스템 구조" },
      role: "Main Agent·호출 Tool 전반·MCP Dialogue Agent 설계·구현",
      caseStudy: {
        problem: "대화 전체의 현실성만으로는 각 대화 단계의 전략과 피해자 상태 변화가 어떻게 이어지는지 살펴보기 어려웠습니다.",
        goal: "절차에 따른 대화 생성과 단계별 상태 분석을 함께 기록해 연구자가 결과를 검토할 수 있도록 합니다.",
        implementation: "Main Agent와 호출 Tool 전반을 설계·구현하고, MCP Dialogue Agent를 공격 계획·발화·피해자 응답으로 분리했습니다. Emotion Tool에서 감정 8종을 HMM 입력 4종으로 매핑하고, Guidance Tool에 감정 값을 반영했으며 라운드 판정 Tool에서 감정 기반 취약점을 추출했습니다. Agent에 전달하는 상태 출력은 최종 값 중심으로 축약했습니다.",
        limitations: "특정 사칭 유형을 다룬 합성 대화 연구입니다. 평가 수치는 팀 전체 시스템의 결과이며 개인 구현 범위와 구분합니다.",
        reflection: "최종 대화뿐 아니라 어떤 단계와 상태를 거쳐 결과가 만들어졌는지 기록하는 것이 중요했습니다.",
      },
      links: { github: "https://github.com/yoonmo01/VP2" },
    },
    {
      slug: "legal-translation-review",
      title: "판결문 번역·검수 시스템",
      summary: "문서를 추출하고 문맥을 보강해 번역한 뒤 원문과 대조하는 연구용 시스템",
      featured: true,
      skills: ["FastAPI", "PostgreSQL", "MinerU", "Gemma4", "TranslateGemma", "Docker"],
      preview: { kind: "flow", steps: ["MinerU", "Gemma4", "TranslateGemma"], caption: "PDF 추출 → 문맥 생성 → 번역" },
      role: "프론트엔드 전체·번역 모델 선정과 연동·GPU 작업 관리",
      caseStudy: {
        problem: "PDF 추출 과정에서 생긴 오류와 블록 단위 번역의 문맥 단절, 공용 GPU 작업의 경합을 다뤄야 했습니다.",
        goal: "문서 추출부터 번역 결과 검수와 실패 작업 재시도까지 이어지는 흐름을 제공합니다.",
        implementation: "Marker-pdf의 문서 구조화 문제를 겪은 뒤 MinerU로 교체하고 블록 좌표로 원본 PDF·추출문·번역문 대조, 병합·분리 검수 화면을 구현했습니다. TranslateGemma를 번역 모델로 선정·연결하고 실시간 진행률 표시와 실패 작업 재시도를 구현했습니다. 연구실 GPU 작업 큐와 예약·모델 상태 표시도 구축했습니다.",
        limitations: "번역 정확도, 식별자 보존율과 처리 속도에 대한 정량 평가는 공개 자료에서 확인되지 않았습니다. 전체 시스템을 완전 오프라인으로 표현하지 않습니다.",
        reflection: "번역 모델뿐 아니라 추출 품질, 검수 흐름과 공유 자원의 관리가 결과에 영향을 줍니다.",
      },
      links: { github: "https://github.com/yoonmo01/translation" },
    },
    {
      slug: "public-audit-ai-viewer",
      title: "공공 감사 데이터 AI 분류·조회 시스템",
      summary: "공개 감사 결과 약 1만 5천 건을 AI로 분류하고 검색과 통계로 살펴보는 업무 지원 시스템",
      featured: false,
      skills: ["FastAPI", "PostgreSQL", "GPT-4.1-mini", "AWS S3", "React"],
      preview: { kind: "image", src: "/projects/AUDIT/audit-home.png", alt: "공공 감사 결과 조회 서비스 첫 화면" },
      role: "3단계 분류 프롬프트·FastAPI 조회 서비스·AWS 배포·기관 협의 및 인계",
      period: "2025.07–2026.01",
      teamSize: 3,
      caseStudy: {
        problem: "문서 분류 결과와 검수자의 판단을 구분해 보존하지 않으면 분류 기준을 검토하고 개선하기 어렵습니다.",
        goal: "문서 수집과 계층 분류, 검색·통계, 원문 열람을 연결하고 AI 결과와 검수 정보를 비교할 수 있게 합니다.",
        implementation: "분야·업무·세부업무 분류 프롬프트를 구성하고, FastAPI 검색·집계 API와 AWS 배포를 담당했습니다. 원본 라벨과 AI 결과를 분리해 저장하고 감사원 담당자와 협의해 시스템을 인계했습니다.",
        limitations: "분류 일치율은 선별된 136건 표본에 한정됩니다. 세부업무 기준의 모호성 등으로 세부업무 일치율이 낮았으며, 전체 약 1만 5천 건의 정확도를 뜻하지 않습니다.",
        reflection: "AI 결과와 검수 정보를 분리해 두면 운영 중 기준을 조정하고 이전 결과와 비교할 수 있습니다.",
      },
      links: { github: "https://github.com/yoonmo01/pap2025_viewer" },
    },
    {
      slug: "auth-security-audit",
      title: "AUTH",
      summary: "직원 동의·소명을 지원하는 Multi-Agent 내부정보 보안 자가점검 시스템",
      featured: true,
      skills: ["LangGraph", "FastAPI", "PostgreSQL", "Qdrant", "Neo4j", "Electron"],
      preview: { kind: "image", src: "/projects/AUTH/system-flow.svg", alt: "AUTH 증거 수집부터 에이전트 분석과 소명까지의 시스템 흐름" },
      role: "팀장·발표·3종 DB ETL·Agent 시스템 설계와 주요 분석 Agent 구현",
      period: "2026.03–2026.06",
      teamSize: 3,
      caseStudy: {
        problem: "다양한 파일을 분석하는 기능과 함께 직원 동의, 근거 확인, 잘못된 판단에 대한 소명 절차가 필요했습니다.",
        goal: "분석 과정과 근거를 살펴보고 소명 및 관리자 검토로 이어지는 흐름을 제공합니다.",
        implementation: "CTF C드라이브 데이터를 PostgreSQL·Qdrant·Neo4j로 적재하는 ETL과 Agent 전체 구조를 설계·구현했습니다. 기준선·행동 분석·반증 Agent를 구현하고 VM에서 모의 시나리오 3건을 구축해 검증했습니다. 팀장으로 발표 자료와 발표를 맡았습니다.",
        limitations: "위험 등급 일치는 가상환경에서 구성한 모의 시나리오 3개에 한정됩니다. 일부 AI 처리에는 외부 API가 사용됩니다.",
        reflection: "분석 결과 자체뿐 아니라 근거를 검토하고 이의를 제기할 수 있는 절차도 제품 흐름에 포함해야 합니다.",
      },
      links: { github: "https://github.com/yoonmo01/AUTH" },
    },
    {
      slug: "vishbox",
      title: "VishBox v1",
      summary: "피해자 특성을 반영한 합성 대화를 만들고 사람이 그 현실성을 평가한 연구 시스템",
      featured: false,
      skills: ["FastAPI", "MCP", "ReAct", "PostgreSQL", "React"],
      preview: { kind: "image", src: "/projects/VP/fig1-architecture.png", alt: "VishBox v1의 Multi-Agent 시스템 구조" },
      role: "Agent·MCP Tool과 SSE 스트리밍 구현, 시뮬레이션 연구 참여",
      caseStudy: {
        problem: "실제 통화 자료를 활용하기 어려워 위험 노출 없이 대화 상호작용을 연구할 수 있는 데이터가 필요했습니다.",
        goal: "피해자 특성에 따른 합성 대화 생성과 사람의 현실성 평가를 연결합니다.",
        implementation: "Manager Agent의 도구 호출과 MCP 대화 시뮬레이션 연동을 구현했습니다. FastAPI SSE 스트림과 화면의 이벤트 소비 흐름을 연결해 대화·분석 진행을 실시간으로 표시했습니다.",
        limitations: "합성 대화 연구이며 실제 예방 교육 효과를 평가한 결과로 볼 수 없습니다. 연구 평가 수치는 팀 전체 시스템의 결과입니다.",
        reflection: "전체 대화의 평가에서 나아가 대화 단계별 전략과 상태 변화를 기록하는 후속 연구로 이어졌습니다.",
      },
      links: { github: "https://github.com/yoonmo01/VP" },
    },
    {
      slug: "polystep",
      title: "POLYSTEP",
      summary: "조건에 맞는 정책을 찾고 공고 원문과 대조하는 웹서비스",
      featured: false,
      skills: ["FastAPI", "PostgreSQL", "Playwright", "Gemini", "React"],
      preview: { kind: "image", src: "/projects/POLYSTEP/fig3-home.png", alt: "POLYSTEP 정책 검색 서비스 첫 화면" },
      role: "팀장·백엔드·정책 검증 파이프라인·발표 자료·발표",
      period: "2025.09–2025.12",
      teamSize: 4,
      caseStudy: {
        problem: "여러 기관의 정책 공고는 변경되거나 종료될 수 있어 검색 결과만으로 신청 가능 여부를 확인하기 어려웠습니다.",
        goal: "사용자 조건 검색 결과에서 공고 원문과 검증 상태를 확인할 수 있도록 합니다.",
        implementation: "수집된 정책을 정규화·검증하는 파이프라인과 백엔드 시스템을 설계·구현했습니다. Playwright와 browser-use로 공고 원문을 방문·대조하고 검증 상태와 실패 사유를 제공했습니다. 팀장으로 발표 자료 제작과 발표를 맡았습니다.",
        limitations: "원문 검증 성공이 개인의 신청 자격을 확정하지 않습니다. 수집 건수와 운영 여부는 당시 자료를 추가 확인한 뒤 공개합니다.",
        reflection: "검색 결과에서 실제 신청 원문으로 이어지는 흐름을 기준으로 기능 범위를 정했습니다.",
      },
      links: { github: "https://github.com/yoonmo01/POLYSTEP" },
    },
  ] satisfies PortfolioProject[],
  experiences: [
    { organization: "한림대학교 지능형 의사결정시스템 연구실 (LIT LAB)", title: "학부연구생", period: "2025.07–현재", description: "Multi-Agent 연구에서 Agent·Tool을 설계하고, 판결문 번역·검수 프론트엔드와 GPU 작업 관리, 공공 감사 조회 API·배포를 구현했습니다." },
  ],
  educations: [
    { institution: "한림대학교", program: "빅데이터학과 · 스마트IoT 복수전공", period: "2020.03–2027.02 (졸업 예정)" },
  ],
  publications: [
    { title: "VishBox: An AI-Agent-Based Adaptive Voice Phishing Simulation Framework for Cybersecurity Education", venue: "IEEE Access, 14, 39672–39686", date: "2026", url: "https://doi.org/10.1109/ACCESS.2026.3667823" },
    { title: "VishBox v2: A Multi-Agent System for Adaptive Voice Phishing Simulation", venue: "ACL 2026 Industry Track", date: "2026.07", url: "https://aclanthology.org/2026.acl-industry.145/" },
  ],
  awards: [
    { title: "2026 강원권 AI·SW 페스티벌 포스터 발표 특별상", issuer: "강원권 AI·SW 페스티벌", date: "2026.09.17" },
    { title: "2026-1학기 학기우등", issuer: "한림대학교", date: "2026-1학기" },
    { title: "2026년 1학기 SW캡스톤디자인 경진대회 동상", issuer: "한림대학교 SW중심대학사업단", date: "2026.06.05" },
    { title: "2025 SW인재페스티벌 우수작품경진대회 인기상", issuer: "2025 SW인재페스티벌", date: "2025.11.28" },
    { title: "2025-2학기 학기우등", issuer: "한림대학교", date: "2025-2학기" },
    { title: "2025 강원 SW중심대학 프롬프톤 대회 종합우수상", issuer: "한림대학교 SW중심대학사업단", date: "2025.08.27" },
  ],
  skillGroups: [
    { name: "AI / Data", skills: ["LangGraph", "LangChain", "MCP", "ReAct", "MinerU"] },
    { name: "Backend", skills: ["Python", "FastAPI", "SQLAlchemy", "Pydantic"] },
    { name: "Frontend", skills: ["React", "TypeScript", "Electron"] },
    { name: "Database", skills: ["PostgreSQL", "Qdrant", "Neo4j"] },
    { name: "Infrastructure", skills: ["Docker", "AWS S3", "Git", "GitHub", "GitLab"] },
  ],
};
