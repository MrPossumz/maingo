import Library from "@/library.ts";

export const NumbersApi = Library<{
  "/random/trivia": {
    get: { response: string };
  };
  "/random/date": {
    get: { response: string };
  };
  "/random/year": {
    get: { response: string };
  };
  "/random/math": {
    get: { response: string };
  };
  [endpoint: `/${number}/trivia`]: {
    get: { response: string };
  };
}>()({
  connector: "REST",
  hostname: "http://numbersapi.com",
});
