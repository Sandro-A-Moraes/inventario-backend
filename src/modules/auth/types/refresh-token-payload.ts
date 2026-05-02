import type { BaseTokenPayload } from "./base-token-payload";

export type RefreshTokenPayload = BaseTokenPayload & {
    jti: string
}
