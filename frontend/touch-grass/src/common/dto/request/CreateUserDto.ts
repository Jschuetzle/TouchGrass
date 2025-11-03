export class CreateUserRequestDto {
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;

  constructor(init?: Partial<CreateUserRequestDto>) {
    Object.assign(this, init);
  }
};
