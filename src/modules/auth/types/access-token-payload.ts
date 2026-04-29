import type { BaseTokenPayload } from "./base-token-payload.js";

export type AccessTokenPayload = BaseTokenPayload & {
    email: string
}