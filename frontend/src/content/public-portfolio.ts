export type PortfolioProject = {
  slug: string;
  title: string;
  summary: string;
  featured: boolean;
  skills: string[];
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
    headline: "AI Agent의 판단을 검증 가능한 서비스로 연결합니다.",
    shortBio:
      "LLM Multi-Agent 연구와 AI 서비스 백엔드를 개발합니다. 데이터 처리, Agent 실행과 검증 절차를 연결해 연구용 시스템을 서비스로 구현합니다.",
    longBio:
      "AI가 내놓은 답을 사용자가 이해하고 검토할 수 있는 시스템에 관심이 있습니다. 대화 시뮬레이션, 문서 분류와 번역, 내부정보 보안 점검 프로젝트에서 데이터 파이프라인과 백엔드 기능을 구현했습니다. 문제 정의부터 검증과 배포까지 이어지는 AI Agent · Backend Engineer를 지향합니다.",
    email: "coolalex127@gmail.com",
    githubUrl: "https://github.com/yoonmo01",
  },
  projects: [
    {
      slug: "vishbox-v2",
      title: "VishBox v2",
      summary: "범죄 절차와 피해자 상태 변화를 함께 추적하는 보이스피싱 시뮬레이션 연구 시스템",
      featured: true,
      skills: ["FastAPI", "MCP", "ReAct", "HMM", "PostgreSQL"],
      role: "Multi-Agent 시뮬레이션 연구·개발 및 논문 작성 참여",
      caseStudy: {
        problem: "대화 전체의 현실성만으로는 각 대화 단계의 전략과 피해자 상태 변화가 어떻게 이어지는지 살펴보기 어려웠습니다.",
        goal: "절차에 따른 대화 생성과 단계별 상태 분석을 함께 기록해 연구자가 결과를 검토할 수 있도록 합니다.",
        implementation: "대화 생성과 분석을 여러 Agent 역할로 나누고, 라운드별 대화와 분석 결과를 기록하는 구조를 구성했습니다.",
        limitations: "특정 사칭 유형을 다룬 합성 대화 연구입니다. 평가 수치와 개인별 기여는 원문 근거를 확인한 뒤 공개합니다.",
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
      role: "백엔드·데이터 파이프라인, 모델 연동 및 배포",
      caseStudy: {
        problem: "PDF 추출 과정에서 생긴 오류와 블록 단위 번역의 문맥 단절, 공용 GPU 작업의 경합을 다뤄야 했습니다.",
        goal: "문서 추출부터 번역 결과 검수와 실패 작업 재시도까지 이어지는 흐름을 제공합니다.",
        implementation: "MinerU로 PDF 텍스트를 추출하고 Gemma4로 문맥을 만든 뒤 TranslateGemma로 번역하는 파이프라인을 연결했습니다. 작업 상태와 원문·번역 대조를 관리합니다.",
        limitations: "번역 정확도, 식별자 보존율과 처리 속도에 대한 정량 평가는 공개 자료에서 확인되지 않았습니다. 전체 시스템을 완전 오프라인으로 표현하지 않습니다.",
        reflection: "번역 모델뿐 아니라 추출 품질, 검수 흐름과 공유 자원의 관리가 결과에 영향을 줍니다.",
      },
      links: { github: "https://github.com/yoonmo01/translation" },
    },
    {
      slug: "public-audit-ai-viewer",
      title: "공공 감사 데이터 AI 분류·조회 시스템",
      summary: "공개 감사 결과 약 1만 5천 건을 AI로 분류하고 검색과 통계로 살펴보는 업무 지원 시스템",
      featured: true,
      skills: ["FastAPI", "PostgreSQL", "GPT-4.1-mini", "AWS S3", "React"],
      role: "백엔드·수집 및 분류 파이프라인·배포",
      period: "2025.07–2026.01",
      teamSize: 3,
      caseStudy: {
        problem: "문서 분류 결과와 검수자의 판단을 구분해 보존하지 않으면 분류 기준을 검토하고 개선하기 어렵습니다.",
        goal: "문서 수집과 계층 분류, 검색·통계, 원문 열람을 연결하고 AI 결과와 검수 정보를 비교할 수 있게 합니다.",
        implementation: "수집 문서의 중복을 처리하고 원본 라벨과 AI 분류 결과를 분리해 저장했습니다. 검색·집계 API와 객체 저장소의 문서를 조회 화면에 연결했습니다.",
        limitations: "정확도 평가는 조건에 따라 선별된 136건 표본에 한정됩니다. 세부업무 일치율과 보고서 내 백분율 표기의 차이는 추가 확인이 필요합니다.",
        reflection: "AI 결과와 검수 정보를 분리해 두면 운영 중 기준을 조정하고 이전 결과와 비교할 수 있습니다.",
      },
      links: { github: "https://github.com/yoonmo01/pap2025_viewer" },
    },
    {
      slug: "auth-security-audit",
      title: "AUTH",
      summary: "직원 동의와 소명 절차를 포함한 Multi-Agent 기반 내부정보 보안 자가점검 앱",
      featured: true,
      skills: ["LangGraph", "FastAPI", "PostgreSQL", "Qdrant", "Neo4j", "Electron"],
      role: "팀 대표·아키텍처·Multi-Agent 분석·ETL",
      period: "2026.03–2026.06",
      teamSize: 3,
      caseStudy: {
        problem: "다양한 파일을 분석하는 기능과 함께 직원 동의, 근거 확인, 잘못된 판단에 대한 소명 절차가 필요했습니다.",
        goal: "분석 과정과 근거를 살펴보고 소명 및 관리자 검토로 이어지는 흐름을 제공합니다.",
        implementation: "LangGraph로 분석 단계를 조율하고 관계형 데이터베이스, 벡터 검색과 그래프 저장소를 각각의 데이터 용도에 맞춰 연결했습니다.",
        limitations: "평가 시나리오가 제한적이며 일부 AI 처리에는 외부 API가 사용됩니다. 시간 비교와 설치 파일 공개 여부는 추가 근거 확인이 필요합니다.",
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
      role: "시뮬레이션 연구·개발 및 논문 작성 참여",
      caseStudy: {
        problem: "실제 통화 자료를 활용하기 어려워 위험 노출 없이 대화 상호작용을 연구할 수 있는 데이터가 필요했습니다.",
        goal: "피해자 특성에 따른 합성 대화 생성과 사람의 현실성 평가를 연결합니다.",
        implementation: "여러 Agent 역할을 이용해 대화 생성과 분석을 조율하고, 프로파일에 따른 대화와 분석 결과를 관리합니다.",
        limitations: "합성 대화 연구이며 실제 예방 교육 효과를 평가한 결과로 볼 수 없습니다. 개인별 기여와 논문 정보는 원문 대조 후 공개합니다.",
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
      role: "팀장·정책 검증 파이프라인·백엔드 연계",
      period: "2025.09–2025.12",
      teamSize: 4,
      caseStudy: {
        problem: "여러 기관의 정책 공고는 변경되거나 종료될 수 있어 검색 결과만으로 신청 가능 여부를 확인하기 어려웠습니다.",
        goal: "사용자 조건 검색 결과에서 공고 원문과 검증 상태를 확인할 수 있도록 합니다.",
        implementation: "정책 조건 검색에 원문 방문·대조 과정을 연결하고 성공·실패·대기 상태와 실패 사유를 화면에 표시했습니다.",
        limitations: "원문 검증 성공이 개인의 신청 자격을 확정하지 않습니다. 수집 건수와 운영 여부는 당시 자료를 추가 확인한 뒤 공개합니다.",
        reflection: "검색 결과에서 실제 신청 원문으로 이어지는 흐름을 기준으로 기능 범위를 정했습니다.",
      },
      links: { github: "https://github.com/yoonmo01/POLYSTEP" },
    },
  ] satisfies PortfolioProject[],
  experiences: [],
  educations: [],
  publications: [],
  awards: [],
  skills: ["AI Agent", "Backend", "Data Pipeline", "Document Processing", "LLM"],
};
