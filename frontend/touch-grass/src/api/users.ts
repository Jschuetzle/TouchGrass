import { BASE_URL } from "@/common/constants/api";
import { CreateUserRequestDto } from "@/common/dto/request/CreateUserDto";
import { secureFetch } from "@/services/api";
import { StatusCodes } from 'http-status-codes';
import { ApiError } from "@/api/common/api-error";
import { plainToInstance } from "class-transformer";
import { UploadProfilePhotoResponseDto } from "@/common/dto/response/UploadProfilePhotoResponseDto";
import { JsonPatchDto } from "@/common/dto/request/JsonPatchDto";
import { UserResponseDto } from "@/common/dto/response/UserReponseDto";
import { SearchUserResponseDto } from "@/common/dto/response/SearchUserResponseDto";

/**
 * Calls POST /users
 *
 * @param dto DTO with required identity fields per API
 * @returns DTO representing newly created user entity
 * @throws 409 Conflict if username is already taken
 * @throws 400 Bad Request if account with UID already exists
**/
export async function createUser(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const response = await secureFetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });

    if (!response.ok) {
        const errorText = await response.text();

        if (response.status === StatusCodes.CONFLICT) {
            throw new ApiError(StatusCodes.CONFLICT, "Username already taken");
        }

        console.error("Failed to create user. Response:", errorText);
        throw new Error(`Failed to create user: ${response.status}`);
    }

    // convert JSON body to CreateUserReponseDto
    const json = await response.json();
    return plainToInstance(UserResponseDto, json, { excludeExtraneousValues: true });
}


export async function updateUser(dto: JsonPatchDto): Promise<UserResponseDto> {
  const response = await secureFetch(`${BASE_URL}/users`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json-patch+json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to update user. Response:', errorText);
    throw new Error(`Failed to update user: ${response.status}`);
  }

  const json = await response.json();
  return plainToInstance(UserResponseDto, json, { excludeExtraneousValues: true });
}


export async function uploadProfilePic(form: FormData): Promise<UploadProfilePhotoResponseDto> {
  const response = await secureFetch(`${BASE_URL}/users/profile-pic`, {
    method: 'PUT',
    body: form,
  });

  if (!response?.ok) {
    const errorText = await response?.text();
    console.error('Failed to upload profile photo. Response:', errorText);
  }

  const json = await response.json();
  return plainToInstance(UploadProfilePhotoResponseDto, json);
}

export async function getUserByUsername(
  username: string
): Promise<SearchUserResponseDto | null> {
  const trimmed = username.trim();
  if (!trimmed) return null;

  const res = await secureFetch(
    `${BASE_URL}/users/search?query=${encodeURIComponent(trimmed)}&page=1&limit=1`,
    { method: "GET" }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Search failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return plainToInstance(SearchUserResponseDto, json, { excludeExtraneousValues: true });
}


