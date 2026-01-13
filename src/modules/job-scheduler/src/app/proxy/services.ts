import { ActionService } from './job-scheduler/module/controllers/action.service';
import { TaskService } from './job-scheduler/module/controllers/task.service';
import { TriggerService } from './job-scheduler/module/controllers/trigger.service';

export const PROXY_SERVICES = [ActionService, TaskService, TriggerService];