import { createTypeGuard, extend, Is as _Is } from "guardis";
import type { Stringable } from "@/types.ts";

export const Is = extend({
  Blob: (v) => v instanceof Blob ? v : null,
  FormData: (v) => v instanceof FormData ? v : null,
  URLSearchParams: (v) => v instanceof URLSearchParams ? v : null,
  ReadableStream: (v) => v instanceof ReadableStream ? v : null,
  ArrayBuffer: (v) => v instanceof ArrayBuffer ? v : null,
  ArrayBufferView: (v) => ArrayBuffer.isView(v) ? v : null,
  Stringable: (v) =>
    !_Is.Nil(v) &&
      // @ts-ignore Everything's an object in JavaScript, even if
      // TS tries to hide that fact.
      v?.toString && typeof v.toString === "function"
      ? v as Stringable
      : null,
});

export { createTypeGuard };
