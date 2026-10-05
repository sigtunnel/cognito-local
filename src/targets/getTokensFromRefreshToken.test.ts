import { beforeEach, describe, expect, it, type MockedObject } from "vitest";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockMessages } from "../__tests__/mockMessages";
import { newMockTokenGenerator } from "../__tests__/mockTokenGenerator";
import { newMockTriggers } from "../__tests__/mockTriggers";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import * as TDB from "../__tests__/testDataBuilder";
import { NotAuthorizedError } from "../errors";
import type { UserPoolService } from "../services";
import type { TokenGenerator } from "../services/tokenGenerator";
import {
  GetTokensFromRefreshToken,
  type GetTokensFromRefreshTokenTarget,
} from "./getTokensFromRefreshToken";

describe("GetTokensFromRefreshToken target", () => {
  let getTokensFromRefreshToken: GetTokensFromRefreshTokenTarget;
  let mockUserPoolService: MockedObject<UserPoolService>;
  let mockTokenGenerator: MockedObject<TokenGenerator>;
  const userPoolClient = TDB.appClient();

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService({
      Id: userPoolClient.UserPoolId,
    });
    mockTokenGenerator = newMockTokenGenerator();

    const mockCognitoService = newMockCognitoService(mockUserPoolService);
    mockCognitoService.getAppClient.mockResolvedValue(userPoolClient);

    getTokensFromRefreshToken = GetTokensFromRefreshToken({
      cognito: mockCognitoService,
      messages: newMockMessages(),
      otp: () => "123456",
      triggers: newMockTriggers(),
      tokenGenerator: mockTokenGenerator,
    });
  });

  it("returns new tokens for a known refresh token", async () => {
    mockTokenGenerator.generate.mockResolvedValue({
      AccessToken: "access",
      IdToken: "id",
      RefreshToken: "refresh",
    });

    const existingUser = TDB.user({ RefreshTokens: ["refresh token"] });
    mockUserPoolService.getUserByRefreshToken.mockResolvedValue(existingUser);
    mockUserPoolService.listUserGroupMembership.mockResolvedValue([]);

    const response = await getTokensFromRefreshToken(TestContext, {
      ClientId: userPoolClient.ClientId,
      RefreshToken: "refresh token",
    });

    expect(response.AuthenticationResult?.AccessToken).toEqual("access");
    expect(response.AuthenticationResult?.IdToken).toEqual("id");
    // No rotation: the client keeps the refresh token it sent.
    expect(response.AuthenticationResult?.RefreshToken).not.toBeDefined();
    expect(mockUserPoolService.getUserByRefreshToken).toHaveBeenCalledWith(
      TestContext,
      "refresh token",
    );
  });

  it("rejects an unknown refresh token", async () => {
    mockUserPoolService.getUserByRefreshToken.mockResolvedValue(null);

    await expect(
      getTokensFromRefreshToken(TestContext, {
        ClientId: userPoolClient.ClientId,
        RefreshToken: "unknown",
      }),
    ).rejects.toEqual(new NotAuthorizedError());
  });
});
