import { hash, compare } from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await hash(password, saltRounds);
};

export const comparePasswords = async (password: string, hash: string) => {
  return await compare(password, hash);
};

export const getStartAndEndOfDay = (daysFromNow: number) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysFromNow);
  targetDate.setHours(0, 0, 0, 0);
  const startOfDay = new Date(targetDate);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};
