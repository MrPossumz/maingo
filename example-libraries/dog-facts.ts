import type { ResponseJson } from "@/types.ts";
import Library from "@/library.ts";

export const DogFacts = Library<{
  "/api/facts": {
    get: {
      request: {
        params: { number?: number } | undefined;
      };
      response: ResponseJson<{ facts: string[]; success: boolean }>;
    };
  };
}>()({
  connector: "REST",
  hostname: "http://dog-api.kinduff.com",
  auth: "none",
});
