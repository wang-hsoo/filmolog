import { bootstrapTasks } from './tasks';
import type { AppBootstrapResult } from './types';

export async function runAppBootstrap(): Promise<AppBootstrapResult> {
  const completedTasks: string[] = [];

  for (const task of bootstrapTasks) {
    await task.run();
    completedTasks.push(task.name);
  }

  return { completedTasks };
}
