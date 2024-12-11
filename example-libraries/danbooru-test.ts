import { Danbooru } from "./danbooru.ts";

export const DanbooruTest = Danbooru.extend({
  connector: "REST" as const,
  hostname: "https://testbooru.donmai.us",
  auth: "none",
});
