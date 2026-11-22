import { AuthService } from '@src/services/auth-service';
import { HttpError, HttpStatus } from '@src/services/http-service';

export default async function rootLoader() {
  try {
    const user = await AuthService.getSession();
    return { user };
  } catch (error) {
    if (error instanceof HttpError && error.status === HttpStatus.Unauthorized) {
      return { user: undefined };
    }
    throw error;
  }
}

export type RootLoaderData = Awaited<ReturnType<typeof rootLoader>>;
