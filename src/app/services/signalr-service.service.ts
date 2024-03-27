import { Injectable } from '@angular/core';
import * as signalr from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { UserMessage } from '../models/usermessage.model';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalr.HubConnection;

  constructor() {
    this.hubConnection = new signalr.HubConnectionBuilder()
      .withUrl('https://localhost:44315/chathub', {
        skipNegotiation: true,
        transport: signalr.HttpTransportType.WebSockets
      })
      .build();
  }

  startConnection(): Observable<void> {
    return new Observable<void>((observer) => {
      this.hubConnection
        .start()
        .then(() => {
          console.log('Connection established with SignalR Hub');
          observer.next();
          observer.complete();
        })
        .catch((error: any) => {
          console.error('Error connecting to SignalR hub :', error);
          observer.error(error);
        });
    });
  }

  receiveMessage(): Observable<UserMessage> {
    return new Observable<UserMessage>((observer) => {
      this.hubConnection.on('ReceiveMessage', (userMessage: UserMessage) => {
        console.log("User - Message:", userMessage.user, userMessage.message);
        observer.next(userMessage);
      })
    })
  }

  public async sendMessage(userMessage: UserMessage) {
    this.hubConnection.invoke('SendMessage', userMessage);
  }
}
