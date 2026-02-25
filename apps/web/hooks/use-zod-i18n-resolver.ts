import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

export function useZodI18nResolver(schema: any) {
  // Use global translations object for full dot-notation keys
  const t = useTranslations();

  return useMemo(() => {
    return async (values: any, context: any, options: any) => {
      const resolver = zodResolver(schema);
      const result = await resolver(values, context, options);

      if (result.errors) {
        // Deep map to translate dot-notation error messages
        const translateErrors = (errors: any) => {
          for (const key in errors) {
            if (
              errors[key]?.message &&
              typeof errors[key].message === 'string'
            ) {
              // Only translate if message looks like a translation key (contains dot)
              if (errors[key].message.includes('.')) {
                try {
                  errors[key].message = t(errors[key].message);
                } catch (err) {
                  // Fallback to original key if translation fails
                }
              }
            }
            // Recurse strictly for arrays or nested objects like variants.name
            if (
              errors[key] &&
              typeof errors[key] === 'object' &&
              !(
                'message' in errors[key] &&
                Object.keys(errors[key]).length === 2
              )
            ) {
              // Avoid endless recursion on react hook form objects
              if (key !== 'ref' && key !== 'types') {
                translateErrors(errors[key]);
              }
            }
          }
        };

        translateErrors(result.errors);
      }

      return result;
    };
  }, [schema, t]);
}
