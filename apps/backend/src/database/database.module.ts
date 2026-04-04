import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Injection token — use this symbol to inject the DB client in services
export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDb = PostgresJsDatabase<typeof schema>;

@Global() // database is available everywhere without re-importing DatabaseModule
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): DrizzleDb => {
        const url = config.getOrThrow<string>('DATABASE_URL');

        // postgres.js handles connection pooling internally.
        // max: 10 is safe for Supabase's free/pro tier connection limits.
        const connection = postgres(url, {
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10,
          ssl: 'require', // Supabase requires TLS
        });

        return drizzle(connection, { schema, logger: false });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
