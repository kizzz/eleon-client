import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatRoomDto } from '@eleon/collaboration-proxy';
import { ISignalRConnector, ISignalRService } from '@eleon/angular-sdk.lib';
import { extractApiBase } from '@eleon/angular-sdk.lib';

const CONFIG = {
  ROUTE: "/hubs/chat/chat-hub",
  METHODS: {
    PushMessage: "PushMessage",
  },

	getRoute(){
		return extractApiBase('eleonsoft') + CONFIG.ROUTE;
	}
};

export interface ChatPushMessage {
  message: ChatMessageDto;
  chatRoom: ChatRoomDto;
}

@Injectable({
  providedIn: "root",
})
export class ChatHubService {
  private messageReceivedSubject = new Subject<ChatPushMessage>();
  public messageReceived$ = this.messageReceivedSubject.asObservable();

  private connector: ISignalRConnector;

  constructor(private signalRService: ISignalRService) {
    this.initConnection();
  }

  private initConnection() {
    const connector = this.signalRService.startConnection(CONFIG.getRoute());

    connector.addMessageListener(CONFIG.METHODS.PushMessage, (msg) => {
      this.messageReceivedSubject.next(msg);
    });
  }
}
