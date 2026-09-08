import { customAlphabet } from "nanoid";
import { getSiteUrl } from "@/lib/constants";

const createId = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  12,
);

export function createShareId() {
  return createId();
}

export function createShareUrl(shareId: string) {
  const baseUrl = getSiteUrl();
  return `${baseUrl.replace(/\/$/, "")}/reports/${shareId}`;
}
