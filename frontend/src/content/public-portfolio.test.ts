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

  it("provides the confirmed awards, education, and both official paper links", () => {
    expect(portfolio.awards).toHaveLength(6);
    expect(portfolio.awards.map(({ title }) => title)).toContain("2026 강원권 AI·SW 페스티벌 포스터 발표 특별상");
    expect(portfolio.awards.map(({ title }) => title)).toContain("2025 SW인재페스티벌 우수작품경진대회 인기상");
    expect(portfolio.awards.map(({ title }) => title)).toContain("2025-2학기 학기우등");
    expect(portfolio.awards.map(({ title }) => title)).toContain("2026-1학기 학기우등");
    expect(portfolio.experiences[0].organization).toBe("한림대학교 지능형 의사결정시스템 연구실");
    expect(portfolio.educations[0].institution).toBe("한림대학교");
    expect(portfolio.educations[0].period).toContain("2027.02 (졸업 예정)");
    expect(portfolio.publications.map(({ url }) => url)).toEqual(expect.arrayContaining([
      "https://doi.org/10.1109/ACCESS.2026.3667823",
      "https://aclanthology.org/2026.acl-industry.145/",
    ]));
  });

  it("gives each project an approved visual or evidence preview", () => {
    expect(portfolio.projects.map(({ preview }) => preview?.kind)).toEqual([
      "image", "flow", "metric", "metric", "image", "image",
    ]);
  });
});
