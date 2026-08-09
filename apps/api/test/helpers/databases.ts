export const TEMPLATE_DB = 'loopra_test_template';
export const TEST_WORKERS = 4;

export const workerDbName = (id: number) => `loopra_test_w${id}`;

export const withDatabase = (url: string, database: string) => {
  const parsed = new URL(url);
  parsed.pathname = `/${database}`;
  return parsed.toString();
};
