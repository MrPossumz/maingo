import Library from "@/library.ts";
import type { ResponseJson } from "@/types.ts";

export class CatFacts extends Library {
  public Config = {
    connector: "REST",
    hostname: "https://cat-fact.herokuapp.com",
    auth: "none",
  } as const;

  public Catalog!: {
    "/facts": {
      get: {
        response: ResponseJson<{
          status: { verified: boolean; sentCount: number, feedback?: string };
          _id: string;
          user: string;
          text: string;
          __v: number;
          source: string;
          type: string;
          updatedAt: string;
          createdAt: string;
          deleted: boolean;
          used: boolean;
        }[]>;
        errors: Record<string, never>;
      };
    };
  };
}
