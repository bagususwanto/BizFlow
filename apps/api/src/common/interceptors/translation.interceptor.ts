import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@bizflow/types';

@Injectable()
export class TranslationInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly i18n: I18nService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // Only process standard API responses
        if (response && typeof response === 'object' && response.success) {
          const i18nContext = I18nContext.current();

          if (
            i18nContext &&
            response.data &&
            typeof response.data === 'object'
          ) {
            // If response data has a `message` property and it matches a translation key format, translate it.
            if (
              'message' in response.data &&
              typeof response.data.message === 'string'
            ) {
              const parts = response.data.message.split('|');
              let messageKey = response.data.message;
              let parsedArgs: Record<string, unknown> = {};

              // We allow passing args using | as a delimiter. Example: 'messages.success.deleted|{"name": "Supplier A"}'
              if (parts.length > 1) {
                messageKey = parts[0];
                try {
                  parsedArgs = JSON.parse(parts[1]);
                } catch (e) {
                  // ignore parse error and use empty args
                }
              }

              // We try translating. If it exactly returns the key back, it means translation wasn't found,
              // so we just keep the raw string to maintain backward compatibility.
              const translated = i18nContext.t(messageKey, {
                args: parsedArgs,
              }) as string;
              if (translated !== messageKey) {
                response.data.message = translated;
              }
            }

            // Check standard paginated bulk responses with dynamic counts
            if ('hardDeleteCount' in response.data) {
              // If it's a bulk delete response, we don't automatically guess since it's highly dynamic.
              // We leave it to the service manually constructing a translation object, or we add specialized
              // translation mapping here if needed.
            }
          }
        }
        return response;
      }),
    );
  }
}
