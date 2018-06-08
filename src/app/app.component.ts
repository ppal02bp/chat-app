import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messagesRef: AngularFireList<any>;
  messages: Observable<any>;

  constructor(public db: AngularFireDatabase) {
    this.messagesRef = db.list('/messages');
    this.messages = this.messagesRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.messages.subscribe(x => console.log(x))
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
