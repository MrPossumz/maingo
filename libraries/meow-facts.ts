import Library from "@/library.ts";
import type { ResponseJson } from "@/types.ts";

export class MeowFacts extends Library {
  public Config = {
    connector: "REST",
    hostname: "https://meowfacts.herokuapp.com",
    auth: "none",
  } as const;

  public Catalog!: {
    "/": {
      get: {
        request: { params: { count?: number } };
        response: ResponseJson<{ data: string[] }>;
        errors: Record<string, never>;
      };
    };
  };
}
