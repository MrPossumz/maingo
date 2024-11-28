import { extend } from "guardis";

export const Is = extend({
  Blob: (v) => v instanceof Blob ? v : null,
  FormData: (v) => v instanceof FormData ? v : null,
  URLSearchParams: (v) => v instanceof URLSearchParams ? v : null,
  ReadableStream: (v) => v instanceof ReadableStream ? v : null,
  ArrayBuffer: (v) => v instanceof ArrayBuffer ? v : null,
  ArrayBufferView: (v) => ArrayBuffer.isView(v) ? v : null,
});