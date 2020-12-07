import { Component, OnInit ,Input, Output, EventEmitter} from '@angular/core';
import { Cdisque } from '../jeu/jeu.component';

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.css']
})
export class TourComponent implements OnInit {

  @Input()
  tourX : Cdisque [] ;

  @Input()
  max : number ; // nb de disques max

  @Input()
  idTour : number ; // pour les besoin du drag and drop 0==TourA , 1==TourB, 2==TourC

  @Output() // la tour (element "fils" de jeu) déclenchera un appel (vers le père ) suite à un drag and drop autorisé d'un disque d'une autre tour sur cette tourX
  dropTriggered : EventEmitter<InfoDrop> = new EventEmitter<InfoDrop>() ;

  constructor() { // init bidon pour ne pas avoir d'erreur à la compilation, mais les valeurs en input sont dispo dans ngOnInit() ...
    this.max = 0 ;
    this.tourX = [] ;
    this.idTour = -1 ;
  }

  ngOnInit(): void { 
      
  }

  drop(ev : DragEvent)
  {
      
   if (ev.dataTransfer != null) 
   {  
     let ret : any = ev.dataTransfer.getData("text") ;
     console.log(`drop donnée récupérée = ${ret}`);
     
    // préparer un objet InfoDrop qui contient toutes les infos pour réaliser un déplacement de disque correspondant au drag and drop capté
     let numero_de_disque_droppe = Number(ret) ;
     let infodrop = new InfoDrop(numero_de_disque_droppe,this.idTour) ;
     
     // Autoriser le drop si la tour est vide ou si le disque droppé est plus petit que le dernier élément de tourX
     if ((this.tourX.length == 0 ) || (this.tourX[this.tourX.length-1].valeur > numero_de_disque_droppe))
      {
        // drop autorisé
        this.dropTriggered.emit(infodrop); // on déclenche l'évènement drag and drop vers le père (composant jeu) 
      }
   }
     
  }

  allowDrop(ev : DragEvent)
  {

  ev.preventDefault();
  
  }
}

export class InfoDrop 
{
  numero_de_disque_droppe : number ; // on pourra retrouver la tour source
  id_tour_destination : number ;  //  0 == tourA, 1 == tourB, 2 == tourC

  constructor(numero_de_disque_droppe : number,id_tour_destination : number)
  {
    this.id_tour_destination = id_tour_destination ;
    this.numero_de_disque_droppe = numero_de_disque_droppe;
  }
}
