import * as bcrypt from 'bcrypt';

export async function hashPassword(rawPassword: string) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  return hashedPassword;
}

export async function compareHash(rawPassword: string, hashedPassword: string) {
  return bcrypt.compare(rawPassword, hashedPassword);
}
