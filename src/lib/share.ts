import { customAlphabet } from "nanoid";

const createId = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  12,
);

export function createShareId() {
  return createId();
}

export function createShareUrl(shareId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/reports/${shareId}`;
}
