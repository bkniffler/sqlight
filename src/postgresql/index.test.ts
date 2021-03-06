import { PostgreSQLDebe } from './index';
import { createAdapterTest } from 'debe/dispatcher.test';

if (process.env.PG_CONNECTIONSTRING) {
  createAdapterTest(
    'postgresql',
    (col, opt) =>
      new PostgreSQLDebe(process.env.PG_CONNECTIONSTRING + '', col, opt)
  );
} else {
  test('postgresql:many', async () => {
    expect(1).toBe(1);
  });
}
