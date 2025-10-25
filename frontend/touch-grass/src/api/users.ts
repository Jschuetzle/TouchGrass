import { BASE_URL } from "@/common/constants/api";
import { CreateUserDto } from "@/common/dto/users/CreateUserDto";
import { secureFetch } from "@/services/api";
import { StatusCodes } from 'http-status-codes';
import { ApiError } from "@/api/common/api-error";
import { UserResponseDto } from "@/common/dto/users/UserResponseDto";
import { UpdateUserDto } from "@/common/dto/users/UpdateUserDto";

/**
 * Calls POST /users
 *
 * @param dto DTO with required identity fields per API
 * @returns DTO representing newly created user entity
 * @throws 409 Conflict if username is already taken
 * @throws 400 Bad Request if account with UID already exists
**/
export async function createUser(dto: CreateUserDto): Promise<UserResponseDto> {
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

    return await response.json() as UserResponseDto;
}


export async function updateUser(dto: UpdateUserDto): Promise<UserResponseDto> {
  const response = await secureFetch(`${BASE_URL}/users`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to update user. Response:', errorText);
    throw new Error(`Failed to update user: ${response.status}`);
  }

  return await response.json();
}