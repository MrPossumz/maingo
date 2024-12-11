import type { ResponseJson } from "@/types.ts";
import Library from "@/library.ts";

export const CatFacts = Library<{
  "/facts": {
    get: {
      response: ResponseJson<{
        status: { verified: boolean; sentCount: number; feedback?: string };
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
    };
  };
}>()({
  connector: "REST",
  hostname: "https://cat-fact.herokuapp.com",
  auth: "none",
});
