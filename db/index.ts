import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// TODO: Replace with your Turso connection URL and Auth Token from environment variables
const tursoClient = createClient({
  url: "libsql://friday-manfrexistence.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDg5MzQ5ODcsImlkIjoiODVkM2I4ZGItODk0Ny00NWRkLTk0YmUtOThhNGVhZDQzZTg5IiwicmlkIjoiOTY4NzUwODUtMTRjMy00NDllLWE1MmQtZGM1ZGU3ZWVmMjZlIn0.XsWUi3IFsOOOGuZC29EvTXUsNHBIxlK5eJj3nrRNghZQv--XEUuo8458Yceqg_zJgr6275FJQ1HIfuz7dh2EBw",
});

export const db = drizzle(tursoClient, { schema });
