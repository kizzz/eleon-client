import { EventService } from './event-management-module/http-api/controllers/event.service';
import { QueueService } from './event-management-module/http-api/controllers/queue.service';

export const PROXY_SERVICES = [EventService, QueueService];