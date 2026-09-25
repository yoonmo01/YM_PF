import { fireEvent, render, screen } from "@testing-library/react";

import { ProjectFilter } from "./public-project-filter";

it("filters pre-rendered project content by selected technology", () => {
  render(<ProjectFilter items={[
    { slug: "alpha", skills: ["Python"], card: <article>Alpha project</article> },
    { slug: "beta", skills: ["React"], card: <article>Beta project</article> },
  ]} />);

  expect(screen.getByText("Alpha project")).toBeInTheDocument();
  expect(screen.getByText("Beta project")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("사용 기술"), { target: { value: "Python" } });
  expect(screen.getByText("Alpha project")).toBeInTheDocument();
  expect(screen.queryByText("Beta project")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("1개 프로젝트");
});
