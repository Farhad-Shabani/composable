import { render, screen } from "@/tests/utils/base";
import { composeStories } from "@storybook/testing-react";
import * as stories from "@ui-picasso/storybook/stories/templates/stats.stories";
import { useConnector } from "@integrations-lib/core";

const { StatsPage } = composeStories(stories);

test("renders Stats page with default args", () => {
  render(<StatsPage />);
  expect(useConnector).toBeCalled();
  expect(
    screen.getByText("You will be able to check on your positons here.")
  ).toBeInTheDocument();
  expect(screen.getByText("Telemetry")).toBeInTheDocument();
});
