import { hash, compare } from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await hash(password, saltRounds);
};

export const comparePasswords = async (password: string, hash: string) => {
  return await compare(password, hash);
};
