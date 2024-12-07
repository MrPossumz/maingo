import Library from "@/library.ts";
import type { ResponseJson } from "@/types.ts";

export class DogFacts extends Library {
  public Config = {
    connector: "REST",
    hostname: "http://dog-api.kinduff.com",
    auth: "none",
  } as const;

  public Catalog!: {
    "/api/facts": {
      get: {
        request: {
          params: { number?: number } | undefined;
        };
        response: ResponseJson<{ facts: string[]; success: boolean }>;
        errors: Record<string, never>;
      };
    };
  };
}
