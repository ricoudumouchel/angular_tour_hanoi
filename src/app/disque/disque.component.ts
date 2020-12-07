import { Component, Input, OnInit } from '@angular/core';
import { Cdisque } from '../jeu/jeu.component';

@Component({
  selector: 'app-disque',
  templateUrl: './disque.component.html',
  styleUrls: ['./disque.component.css']
})
export class DisqueComponent implements OnInit {

  @Input()
  un_disque : Cdisque ;

 
  constructor() {
    
    this.un_disque = new Cdisque(0,"black","0px",false) ; // init bidon comme d'hab

  }

  ngOnInit(): void {
       
  }

  dragstart(ev : DragEvent)
  { 
    if (ev.dataTransfer != null) // Remarque typescript colle un warning sinon sur la nullité possible de l'élément ... 
    {
      console.log(`dragstart un_disque.valeur = ${this.un_disque.valeur}`);
      ev.dataTransfer.setData("text",this.un_disque.valeur.toString());    
    }
    //ev.preventDefault();      
  } 
}
