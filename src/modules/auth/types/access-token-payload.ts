import type { BaseTokenPayload } from "./base-token-payload";

export type AccessTokenPayload = BaseTokenPayload & {
    email: string
    tokenVersion: number
}