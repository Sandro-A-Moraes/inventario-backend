function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  JWT_SECRET_KEY: getEnv('JWT_SECRET_KEY'),
  JWT_REFRESH_SECRET_KEY: getEnv('JWT_REFRESH_SECRET_KEY'),
};
