import type { AuthenticationResultType } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { InitiateAuth } from "./initiateAuth";
import type { Target } from "./Target";

// Not in the aws-sdk v2 typings this project uses.
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_GetTokensFromRefreshToken.html
export interface GetTokensFromRefreshTokenRequest {
  RefreshToken: string;
  ClientId: string;
  ClientSecret?: string;
  DeviceKey?: string;
  ClientMetadata?: Record<string, string>;
}

export interface GetTokensFromRefreshTokenResponse {
  AuthenticationResult?: AuthenticationResultType;
}

export type GetTokensFromRefreshTokenTarget = Target<
  GetTokensFromRefreshTokenRequest,
  GetTokensFromRefreshTokenResponse
>;

type GetTokensFromRefreshTokenServices = Parameters<typeof InitiateAuth>[0];

/**
 * Amplify JS 6.15+ refreshes sessions with GetTokensFromRefreshToken instead
 * of InitiateAuth's REFRESH_TOKEN_AUTH flow. Without refresh token rotation the
 * two return the same tokens, so this delegates to that flow.
 */
export const GetTokensFromRefreshToken =
  (
    services: GetTokensFromRefreshTokenServices,
  ): GetTokensFromRefreshTokenTarget =>
  async (ctx, req) => {
    const { AuthenticationResult } = await InitiateAuth(services)(ctx, {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: req.ClientId,
      AuthParameters: { REFRESH_TOKEN: req.RefreshToken },
      ClientMetadata: req.ClientMetadata,
    });

    return { AuthenticationResult };
  };
