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
});
