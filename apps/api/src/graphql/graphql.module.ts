import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import type { Request } from 'express';

import { AvailabilityModule } from '../modules/availability/availability.module';
import { BookingsModule } from '../modules/bookings/bookings.module';
import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { PublicModule } from '../modules/public/public.module';

import { PublicResolver } from './public.resolver';
import { ViewerResolver } from './viewer.resolver';

/**
 * Code-first GraphQL API served at `/api/graphql`. Schema is generated in
 * memory from the resolver/type decorators. Reuses the same domain services
 * as the REST layer, so business rules stay single-sourced.
 */
@Module({
  imports: [
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      path: '/api/graphql',
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    PublicModule,
    AvailabilityModule,
    BookingsModule,
    OrganizationsModule,
  ],
  providers: [PublicResolver, ViewerResolver],
})
export class GraphqlModule {}
