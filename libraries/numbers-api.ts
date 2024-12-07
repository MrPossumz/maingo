import Library from "@/library.ts";

export class NumbersApi extends Library {
  public Config = {
    connector: "REST",
    hostname: "http://numbersapi.com",
    auth: "none",
  } as const;

  public Catalog!: {
    "/random/trivia": {
      get: {
        response: string;
        errors: Record<string, never>;
      };
    };
    "/random/date": {
      get: {
        response: string;
        errors: Record<string, never>;
      };
    };
    "/random/year": {
      get: {
        response: string;
        errors: Record<string, never>;
      };
    };
    "/random/math": {
      get: {
        response: string;
        errors: Record<string, never>;
      };
    };
    [endpoint: `/${number}/trivia`]: {
      get: {
        // request: {};
        response: string;
        errors: Record<string, never>;
      };
    };
  };
}
