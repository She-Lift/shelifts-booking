import { HttpError, HttpStatus } from '@src/services/http-service';
import { WorkoutsService } from '@src/services/workout-service';
import { redirect } from 'react-router';

export default async function adminLoader() {
  try {
    const workouts = await WorkoutsService.getAll();
    return { workouts };
  } catch (err) {
    if (err instanceof HttpError && (err.status === HttpStatus.Unauthorized || err.status === HttpStatus.Forbidden)) {
      throw redirect('/login');
    }
    throw err;
  }
}

export type AdminLoaderData = Awaited<ReturnType<typeof adminLoader>>;
