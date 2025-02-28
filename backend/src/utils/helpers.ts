import { hash } from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await hash(password, saltRounds);
};
