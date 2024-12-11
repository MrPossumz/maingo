import type { ResponseJson } from "@/types.ts";
import Library from "@/library.ts";

export const MeowFacts = Library<{
  "/": {
    get: {
      request: { params: { count?: number } };
      response: ResponseJson<{ data: string[] }>;
    };
  };
}>()({
  connector: "REST",
  hostname: "https://meowfacts.herokuapp.com",
  auth: "none",
});
