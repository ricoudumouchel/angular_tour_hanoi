import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app-tourhanoi';
  
  disque_par_defaut = 3 ; // nombre de disques par défaut 
  frequence_par_defaut = 1000 ; // fréquence par défaut des déplacements de disques en milli secondes 

}
