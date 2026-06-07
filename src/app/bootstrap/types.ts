export type BootstrapTask = {
  name: string;
  run: () => Promise<void>;
};

export type AppBootstrapResult = {
  completedTasks: string[];
};
