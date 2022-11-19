export type CreateUserDetails = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type ValidateUsertDetails = {
  email: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
}>;
