import { Component, ElementRef, ViewChild } from '@angular/core';
import { SignalrService } from '../services/signalr-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserMessage } from '../models/usermessage.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-chat-app',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat-app.component.html',
    styleUrl: './chat-app.component.scss'
})
export class ChatAppComponent {

    @ViewChild('chatMessages')
    private chatMessages!: ElementRef;

    isJoined: boolean = false;
    isRoomSelected: boolean = false;

    userMessages: UserMessage[] = []; // Array to store chat messages
    newMessage: string = ''; // Variable to store new message input
    currentUser: string = 'You'; // Placeholder for current user (you can replace it with actual user name)

    constructor(private signalRService: SignalrService) {

    }

    public joinChat(userName: string): void {
        if (!userName.trim()) return; // Check if user entered a name
        this.currentUser = userName;

        this.startSignalRConnection().subscribe({
            next: () => {
                console.log('SignalR connection established');
                this.isJoined = true;
                this.sendNewUserMessage(); // Trigger sending new user message
                this.signalRService.receiveMessage().subscribe((userMessage) => {
                    this.userMessages.push(userMessage);
                });
            },
            error: (error: any) => {
                console.error('Error connecting to SignalR hub:', error);
            }
        });
    }

    private startSignalRConnection(): Observable<void> {
        return new Observable<void>((observer) => {
            this.signalRService.startConnection().subscribe({
                next: () => {
                    observer.next(); // Signal that connection is established
                    observer.complete();
                },
                error: (error: any) => {
                    observer.error(error);
                }
            });
        });
    }

    public sendMessage(): void {
        if (this.newMessage.trim() === '') return; // Don't send empty messages

        const userMessage: UserMessage = { user: this.currentUser, message: this.newMessage };
        this.userMessages.push(userMessage); // Add the new message to the array

        this.signalRService.sendMessage(userMessage);

        this.newMessage = ''; // Clear the message input field
        // Scroll to the bottom of the chat messages container
        this.scrollToBottom();
    }

    private sendNewUserMessage(): void {
        if (this.currentUser.trim() === '') return; // Don't send empty messages
        var message = this.currentUser + ' has joined chat';
        const userMessage: UserMessage = { user: '', message: message };
        this.userMessages.push(userMessage);
        this.scrollToBottom(); // Scroll to the bottom of the chat messages container
        this.signalRService.sendMessage(userMessage);
    }

    // Scroll to the bottom of the chat messages container
    private scrollToBottom(): void {
        try {
            this.chatMessages.nativeElement.scrollTop = this.chatMessages?.nativeElement.scrollHeight;
        } catch (err) { }
    }
}


