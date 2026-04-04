import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import { DRIZZLE, DrizzleDb } from "../../database/database.module";
import { stores } from "../../database/schema";
import type { AuthUser } from "../decorators/current-user.decorator";

/**
 * StoreAccessGuard — ensures the authenticated user owns the store
 * referenced by :storeId in the route params.
 *
 * Must run AFTER AuthGuard (relies on req.user being populated).
 * Apply to any route that is store-scoped.
 */
@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthUser; store: typeof stores.$inferSelect }>();

    const storeIdParam = request.params["storeId"];
    if (!storeIdParam) return true; // route doesn't require store context

    // params can be string | string[]; always use the scalar value
    const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;

    const [store] = await this.db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

    if (!store || store.deletedAt !== null) {
      throw new NotFoundException("Store not found");
    }

    if (store.ownerId !== request.user.id) {
      throw new ForbiddenException("You do not have access to this store");
    }

    // Attach store to request so services can use it without re-fetching
    request.store = store;
    return true;
  }
}
