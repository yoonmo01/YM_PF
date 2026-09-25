import { portfolio } from "@/content/public-portfolio";

describe("public portfolio content", () => {
  it("contains six uniquely identified projects with four featured projects", () => {
    expect(portfolio.projects).toHaveLength(6);
    expect(new Set(portfolio.projects.map(({ slug }) => slug)).size).toBe(6);
    expect(portfolio.projects.filter(({ featured }) => featured)).toHaveLength(4);
  });

  it("includes the minimum case-study copy and confirmed public GitHub links", () => {
    for (const project of portfolio.projects) {
      expect(project.summary.trim()).not.toBe("");
      expect(project.caseStudy.problem.trim()).not.toBe("");
      expect(project.caseStudy.implementation.trim()).not.toBe("");
      expect(project.caseStudy.limitations.trim()).not.toBe("");
      expect(project.links?.github).toMatch(/^https:\/\/github\.com\/yoonmo01\//);
      expect(JSON.stringify(project.links ?? {})).not.toMatch(/localhost|127\.0\.0\.1|internal|admin/i);
    }
  });

  it("provides reviewed awards, research activity, education, and the official paper link", () => {
    expect(portfolio.awards.map(({ title }) => title)).toEqual([
      "2026년 1학기 SW캡스톤디자인 경진대회 동상",
      "2025 강원 SW중심대학 프롬프톤 대회 종합우수상",
    ]);
    expect(portfolio.experiences[0].organization).toBe("한림대학교 지능형 의사결정시스템 연구실");
    expect(portfolio.educations[0].institution).toBe("한림대학교");
    expect(portfolio.publications[0].url).toBe("https://aclanthology.org/2026.acl-industry.145/");
  });

  it("gives each project an approved visual or evidence preview", () => {
    expect(portfolio.projects.map(({ preview }) => preview?.kind)).toEqual([
      "image", "flow", "metric", "metric", "image", "image",
    ]);
  });
});
