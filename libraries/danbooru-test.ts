import { Danbooru } from "./danbooru.ts";

export class DanbooruTest extends Danbooru {
  public override Config = {
    connector: "REST" as const,
    hostname: "https://testbooru.donmai.us",
    auth: "none" as const,
  };
}
