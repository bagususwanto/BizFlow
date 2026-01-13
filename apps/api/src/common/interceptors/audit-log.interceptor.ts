import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { JwtPayload } from '../../modules/core/auth/strategies/jwt.strategy';
import { AuditLogService } from '../../modules/core/audit-log/audit-log.service';
import {
  AUDIT_LOG_KEY,
  AuditLogOptions,
} from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logAudit(context, data).catch((err) => {
            this.logger.error('Failed to log audit', err);
          });
        },
      }),
    );
  }

  private async logAudit(context: ExecutionContext, data: any) {
    const options = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!options) {
      return;
    }

    const request = context.switchToHttp().getRequest<Request>();
    let userId = ((request as any).user as JwtPayload)?.sub;

    // If no user in request (public route like login), try to find user in response
    if (!userId && data) {
      if (data.data?.user?.id) {
        userId = data.data.user.id;
      } else if (data.data?.id) {
        // Case where response data IS the user (e.g. some create endpoints)
        // But for login it's usually data.user
        userId = data.data.id;
      }
    }

    if (!userId) {
      // If still no userId, we can't log this as a user action.
      // Maybe log as 'system' or 'anonymous' or just skip.
      // For now, consistent with previous behavior, we skip.
      this.logger.warn(
        `Audit log skipped: No user found in request or response for ${options.action} on ${options.module}`,
      );
      return;
    }

    // Attempt to find entityId from response data
    let entityId: string | undefined;

    // Check if data has standard ApiResponse structure with data.id
    if (data && typeof data === 'object') {
      if (data.data && data.data.id) {
        entityId = data.data.id;
      } else if (data.id) {
        entityId = data.id;
      }
    }

    const newValue = data ? JSON.stringify(data) : undefined;

    // Only log if we have payload to log (or delete action might not have payload but has ID from params)
    // For delete, usually the response is success message. We might need ID from params if response doesn't have it.
    if (!entityId && request.params && request.params.id) {
      entityId = request.params.id;
    }

    await this.auditLogService.create({
      userId,
      action: options.action,
      module: options.module,
      entityType: options.entityType,
      entityId,
      newValue: newValue,
      ipAddress: request.ip || request.socket.remoteAddress,
      userAgent: request.get('User-Agent'),
    });
  }
}
