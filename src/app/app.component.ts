import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder
} from '@angular/forms';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messagesRef: AngularFireList<any>;
  usersRef: AngularFireList<any>;
  roomsRef: AngularFireList<any>;
  messages: Observable<any>;
  users: Observable<any>;
  rooms: Observable<any>;
  loginForm: FormGroup;
  chatForm: FormGroup;
  showTop: boolean;
  showLogin: boolean;
  showChat: boolean;
  currentUserID: string;
  currentRoom: object;
  currentUser: object;
  conversationId: string;
  currentRoomID: string

  constructor(public db: AngularFireDatabase, private fb: FormBuilder) {
    this.usersRef = db.list('/users');
    this.roomsRef = db.list('/rooms');
    this.messagesRef = db.list('/messages');
    this.showTop = false;
    this.showLogin = true;
    this.showChat = false;
    this.currentUserID = null;
    this.currentUser = null;
    const urlParams = new URLSearchParams(window.location.search);
    this.conversationId = urlParams.get('id');
    this.currentRoomID = urlParams.get('roomId');
    this.createLoginForm();
    this.createChatForm();

    this.messages = this.messagesRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.users = this.usersRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.rooms = this.roomsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.getUsers();
    this.getRooms();
    // this.getMessages();
  }
  getUsers() {
    this.users.subscribe(users => {
      if (this.currentUserID) {
        this.currentUser = users.filter(user => user.key === this.currentUserID)[0];
      } else {
        this.currentUser = users[users.length - 1]
      }
    });
  }
  getRooms() {
    this.rooms.subscribe(rooms => {
      this.currentRoom = rooms.filter(room => room.key === this.currentRoomID)[0];
      if (this.currentRoom && Object.keys(this.currentRoom.join).length > 1) {
        this.showChat = true;
      }
    });
  }
  getMessages() {    
  }
  createLoginForm() {
    this.loginForm = this.fb.group({
      name: ['', Validators.required ]
    });
  }
  createChatForm() {
    this.chatForm = this.fb.group({
      message: ['', Validators.required ]
    });
  }
  login() {
    this.usersRef.push({
      name: this.loginForm.value.name,
      isActive: true,
      isAdmin: !this.conversationId,
      created_at: moment().format('LLLL')
    }).then((user) => {
      this.currentUserID = user.key;
      if (!this.currentRoom) {
        this.roomsRef.push({ join: {[user.key]: this.loginForm.value.name}, createdAt: moment().format('LLLL') })
        .then((room) => {
          this.currentRoomID = room.key
        });
      } else {
        this.currentRoom.join[user.key] = this.loginForm.value.name;
        this.roomsRef.update(this.currentRoomID, { join: this.currentRoom.join });
        this.showChat = true;
      }
    });
    this.showTop = true;
    this.showLogin = false;
  }
  send() {
    this.messagesRef.push({
      message: this.chatForm.value.message,
      roomID: this.currentRoomID,
      userID: this.currentUserID,
      name: this.currentUser.name,
      createdAt: moment().format('LLLL')
    });
  }
  addItem(newName: string) {
    this.messagesRef.push({ text: newName });
  }
  updateItem(key: string, newText: string) {
    this.messagesRef.update(key, { text: newText });
  }
  deleteItem(key: string) {
    this.messagesRef.remove(key);
  }
  deleteEverything() {
    this.messagesRef.remove();
  }
}
