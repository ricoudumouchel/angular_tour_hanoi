import { Time } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { InfoDrop } from '../tour/tour.component';



export class Cdisque
{
  valeur : number ;
  color : string ;
  draggable : boolean ;
  size : string ;
   

  constructor(valeur : number,couleur : string , size:string , draggable : boolean)
  {    
    this.valeur = valeur ;
    this.draggable = draggable ;
    this.color = couleur ; 
    this.size = size ;
  }
}

@Component({
  selector: 'app-jeu',
  templateUrl: './jeu.component.html',
  styleUrls: ['./jeu.component.css']
})
export class JeuComponent implements OnInit {
    
  @Input()
  disques : number  ;

  @Input()
  frequence : number ;
 
  max_disque : number  = 10 ;
  min_disque : number  = 3 ;

  tourA : Cdisque []  ; // tour de gauche
  tourB : Cdisque []  ; // tour du milieu
  tourC : Cdisque []  ; // tour de droite

  // Données pour le style 
  tab_color : string [] ; // couleur de fond du disque
  tab_size : string [] ;  // largeur du disque en pixel

  liste_disques : number [] ; // liste choix formulaire nombre de disque

  // Données pour le drag and drop
  drag_and_drop_commencé : boolean ;

  // Données pour la solution
  date_depart : any ; 
  duree_milli : any ;
  deplacement_min : number ; // déplacement minimum pour la solution
  deplacement_en_cours : number ; // pour compter les déplacements
  nb_deplacement_par_milli : number ; // pour faire un déplacement périodique visible pour l'utilisateur 
  id_setimeout : any ;
  deplacer_petit_oui : boolean ;
  tour_petit : number ; // le numéro de tour 0 pour TourA, 1 pour TourB , 2 pour TourC dans laquelle on a le petit disque
  pourcentage : number ; // pourcentage avancement ds solution()
  reset_pending : boolean ;
  pause_pending : boolean ;
  start_en_cours : boolean ;

  // Pour rappel  : le constructeur est appelé avant ngOnInit() et toutes les variables d'input ne sont pas encore initialisées
    constructor() {

    
    this.disques = 0 ;
    this.frequence = 0 ;
    this.tourA = [] ; 
    this.tourB = [] ;
    this.tourC = [] ;
    this.tour_petit = 0 ;
    
    this.drag_and_drop_commencé = false ;

    this.deplacement_min = 0 ;
    this.deplacement_en_cours = 0 ;
    this.nb_deplacement_par_milli = 300 ;
    this.deplacer_petit_oui = true ;
    this.pourcentage = 0 ;
    this.date_depart = Date.now();
    this.duree_milli = "" ;
    this.reset_pending = false ;
    this.start_en_cours = false ;

    console.log(`constructor : start_en_cours = ${this.start_en_cours}`) ;

    this.pause_pending = false ;
    // On crée une liste de choix pour le nombre de disques { 3,4,..10}
    this.liste_disques = [] ;
    let i : number = this.min_disque ;
    while (i<=this.max_disque) {
      this.liste_disques.push(i++) ;
    } 


    // 10 couleurs en dures pour nos disques 

    this.tab_color=[] ;
    this.tab_color.push("Red") ;
    this.tab_color.push("Goldenrod") ;
    this.tab_color.push("DarkGoldenrod") ;
    this.tab_color.push("Peru") ;
    this.tab_color.push("Chocolate") ;
    this.tab_color.push("SaddleBrown") ;
    this.tab_color.push("Sienna") ;
    this.tab_color.push("Salmon") ;
    this.tab_color.push("Maroon") ;
    this.tab_color.push("#424949") ;
    
    this.tab_size=[] ;
    i=0 ; 
    let taille_depart = 20 ; // pour le petit disque (indice 0)
    let delta = 20 ;
    while(i<this.max_disque)
    {
      let taille=taille_depart+i*delta ;
      this.tab_size[i] = `${taille}px`;
      i++;
    } 

   }

  ngOnInit(): void {
    
    // on vérifie le nombre de disque :
     if (this.disques > this.max_disque) this.disques = this.max_disque ;
     else if (this.disques < this.min_disque) this.disques = this.min_disque ;
    
     // une tour par tableau
     let i : number = 0;
     this.tourA = [] ; // clean
     this.tourB = [] ;
     this.tourC = [] ;
     while (i < this.disques  )
     {      
       // Initialisation de la tourA (Première tour de gauche) petit disque == 1 grand disque == nb_disque
       let draggable : boolean = i == this.disques-1 ? true : false ;
       let color : string = i == this.disques-1 ? "red" : this.tab_color[this.disques-1-i] ;
       let size = this.tab_size[this.disques-1-i] ;
       let cd = new Cdisque(this.disques-i,color,size,draggable) ;
       this.tourA.push(cd) ;  
       i++;  
     }
     this.tour_petit = 0 ; 
     this.pourcentage = 0 ;
     this.date_depart = Date.now() ;
     this.duree_milli = 0 ;
     this.reset_pending = false ;
     this.start_en_cours = false ;
     this.deplacement_en_cours = 0 ;
     this.drag_and_drop_commencé = false ;
     this.pause_pending = false ;
  }

  //
  // le drad and drop est validé il faut déclencher un déplacement en fct d'infoprop
  //
  drag_and_drop(infodrop : InfoDrop)
  {
      
      let numero_tour_pop = this.findBonneTour(infodrop.numero_de_disque_droppe) ;
      let disque : any ;

      // le pop sur la bonne tour

      switch (numero_tour_pop)
      {
        default :
        case -1 : return ;

        case 0 : 
        {
          disque = this.tourA.pop() ;       
          break ;
        }
        case 1 :
          {
            disque = this.tourB.pop() ;
            break ;
          }
        case 2 :
          {
            disque = this.tourC.pop() ;
            break ;
          }            
  
      }

      // le push sur la bonne tour
      switch (infodrop.id_tour_destination)
      {
        case 0 :
          this.tourA.push(disque);
          break ;
        case 1 :
          this.tourB.push(disque);
          break ;
        case 2 :
          this.tourC.push(disque);
          break ;
        default :
          console.log(`info drop incorrecte id_tour_destination = ${infodrop.id_tour_destination}`)
      }

      // remettre à jour la propiété "draggable des derniers disques"
      this.majDraggable() ;

      this.deplacement_en_cours++ ;
      this.drag_and_drop_commencé = true ;
      
      // si derrière on appuie sur solution ça permet éventuellement de terminer le déplacement commencé par l'utilisateur ? A tester ???
      if (infodrop.numero_de_disque_droppe == 1)
      {
        this.tour_petit = infodrop.id_tour_destination ;
        this.deplacer_petit_oui = false ;
      }
      else
      {
        this.deplacer_petit_oui = true ;
      }

      this.maj_durée() ;

      // testé si l'utilisateur a terminé
      if (this.jeuTerminé())
      {
        setTimeout(()=>{this.fini();},1000);
      }

    }
  
  //
  // Le drag and drop a débuté, il faut remettre a jour les propriétés "draggable" des disques
  //
  majDraggable()
  {

    let les3Tour : any [] = [this.tourA,this.tourB,this.tourC] ;

    for (let t of les3Tour)
    {
      let dernier_indice : number = t.length -1 ; // -1 si vide
      let i : number = 0 ;
      for (let d of t)
      {        
        if (i==dernier_indice) d.draggable = true ;
        else d.draggable = false ; 
        i++;
      }
    }     
  }

  //
  // Quand on lance la solution on désactive le drag and drop
  //
  razDraggable()
  {
    let les3Tour : any [] = [this.tourA,this.tourB,this.tourC] ;
    for (let t of les3Tour)
    {
       for (let d of t)
      {                
        d.draggable = false ;         
      }
    }
  }

  //
  // Retrouver la tour qui a le disque_valeur
  //
  findBonneTour( disque_valeur : number) : number
  {
    for (let d  of this.tourA) 
    {
      if (d.valeur == disque_valeur)
      {
        return 0 ;   //tourA
      }
    }
    for (let d  of this.tourB) 
    {
      if (d.valeur == disque_valeur)
      {
        return 1 ;  //tourB      
      }
    }
    for (let d  of this.tourC) 
    {
      if (d.valeur == disque_valeur)
      {
        return 2 ; //tourC  
      }
    }
    console.log (`disque ${disque_valeur} non trouvé !!! `);

    return -1 ;

  }

  //
  // L'utilisateur a modifié le nombre de disque
  //
  changementNbDisque() : void
  {
    this.ngOnInit();
  }

  //
  // On a appuyé sur le bouton reset
  //
  reset() : void
  {
    this.reset_pending = true ;
    if (this.id_setimeout) clearTimeout(this.id_setimeout) ;
    this.ngOnInit() ;
    this.reset_pending = true ;
  }

  // Mettre la solution en pause
  pause() : void
  {
    if (this.start_en_cours)
    {
      this.drag_and_drop_commencé = true ; // on fait comme si l'utilisateur avait commencé les déplacements correctement !
      this.pause_pending = true ;
    }  
  }

  //
  // On a appuyer sur le bouton solution : on déroule la solution avec un déplacement toutes les nb_deplacement_par_milli * milli secondes
  //
  solution() : void
  {
     
    this.reset_pending = false ;
    this.pause_pending = false ;

    if (this.id_setimeout)
    {
      clearTimeout(this.id_setimeout) ;
      this.id_setimeout = null ;
    }

    // si le drag and drop a commencé, on essaye de terminer la solution ?! en l'état :
    // OU si l'utilisateur avait appuyé sur pause () (ce qui fait monter le flag drag_and_drop_commencé)
    if (!this.drag_and_drop_commencé)
    {
      this.ngOnInit();
      this.deplacement_en_cours = 0 ;
      this.deplacer_petit_oui = true ;    
      this.start_en_cours = true ;
    }

    this.deplacement_min = Math.pow(2,this.disques)-1 ; // Un peu de math : le nb de déplacements min pour résoudre les tours de hanoi si n disque == 2^n -1  (deux puissance n moins un)
    
    this.id_setimeout = setTimeout(()=>{this.deplacement();},this.nb_deplacement_par_milli);
  }

  //
  // Effectuer un nouveau déplacement selon l'algo des tours de hanoï
  //
  deplacement() : void
  {
    if (this.reset_pending)
    {
      this.ngOnInit();
      return ;
    }
    
    if (this.pause_pending)
    {
      this.pause_pending = false ;
      return ;
    }

    if (this.deplacer_petit_oui)
    {
      this.deplacer_petit() ;
    }
    else
    {
      // déplacer un disque qui n'est pas le plus petit ! (le petit étant sur une tour, il ne reste qu'une solution pour déplacer un disque sur les 2 autres ...)
        this.deplacer_autre() ;
    }
    this.deplacer_petit_oui = !this.deplacer_petit_oui ; // un coup sur 2 on déplace le petit
    this.deplacement_en_cours++ ;

    this.pourcentage = Math.round((100 * this.deplacement_en_cours) / this.deplacement_min) ;
   
    this.maj_durée() ;
    
    if (this.jeuTerminé())
    {
      clearTimeout(this.id_setimeout) ;
      setTimeout(()=>{this.fini();},1000);
    }
    else
    {
      setTimeout(()=>{this.deplacement();},this.nb_deplacement_par_milli);
    }
  }

  maj_durée()
  {
    let date_fin = Date.now() ;
    let duree_milli_decimal : number = date_fin-this.date_depart ;
    this.duree_milli = this.formatHMS(duree_milli_decimal) ;
  }

  //
  // Tester si le jeu est terminé
  //
  jeuTerminé () : boolean
  {
    return (this.tourC.length == this.disques) ;
  }

  fini () :void
  {
    alert("C'est fini !") ;
    this.ngOnInit();
  }

  //
  // Déplacer le petit disque
  //
  deplacer_petit() : void
  {
 
    let pair = this.disques % 2 == 0 ;
    // sortir le petit disque de son tableau et le déplacer :
    // déplacement du petit un coup sur 2 dans le sens TourA -> TourB -> TourC -> TourA ...
    // déplacement du petit un coup sur 2 dans le sens TourA -> TourC -> TourB -> TourA ...

    let petit : any ;
    
    if (this.tour_petit == 0) // petit ds tourA ?
    {
      petit = this.tourA.pop() ;
      if (pair) {this.tourB.push(petit) ;this.tour_petit=1} 
      else { this.tourC.push(petit);this.tour_petit=2 }
    }
    else if (this.tour_petit == 1) // petit ds tourB ?
    {
      petit = this.tourB.pop() ;
      if (pair) {this.tourC.push(petit) ;this.tour_petit=2}
      else {this.tourA.push(petit);this.tour_petit=0}
    }
    else
    {
      petit = this.tourC.pop() ; // petit dans tourC
      if (pair) {this.tourA.push(petit) ;this.tour_petit=0}
      else { this.tourB.push(petit);this.tour_petit=1}
    }
   
  }

  //
  // Déplacer un disque qui n'est pas le petit disque
  //
  deplacer_autre() : void 
    {
      //console.log(`deplacer_autre ...petit dans tour indice ${this.tour_petit}`)
      // on cherche le disque le plus petit parmi les autres disques 
      let disque_a_deplacer : any ;
   
      // on récupère les 3 disques du haut (ou disque_vide si tour vide)
      let disque_vide : Cdisque = new Cdisque(this.max_disque+1,"black","0px",false) ; // pour ne pas mettre null ds a,b,c
      let a : Cdisque = this.tourA.length != 0 ? this.tourA[this.tourA.length-1] : disque_vide;
      let b : Cdisque = this.tourB.length != 0 ? this.tourB[this.tourB.length-1] : disque_vide ;
      let c : Cdisque = this.tourC.length != 0 ? this.tourC[this.tourC.length-1] : disque_vide ;

      
      if (this.tour_petit == 0) // petit ds tourA ?
      {          
          if ( b.valeur > c.valeur)
          {   
            this.tourC.pop();
            this.tourB.push(c) ;
            //console.log("deplacer c vers b") ;
          }
          else 
          {
            this.tourB.pop() ;
            this.tourC.push(b);
            //console.log("deplacer b vers c") ;
          }
      }
      else if (this.tour_petit == 1) // petit ds tourB ?
      {
        if (a.valeur > c.valeur)
        {   
          this.tourC.pop();
          this.tourA.push(c) ;
          //console.log("deplacer c vers a") ;
        }
        else
        {
          this.tourA.pop() ;
          this.tourC.push(a);
          //console.log("deplacer a vers c") ;
         }
      }
      else  // petit dans tourC
      {
        if (a.valeur > b.valeur )
        {   
          this.tourB.pop();
          this.tourA.push(b) ;
          //console.log("deplacer b vers a") ;
         }
        else
        {
          this.tourA.pop() ;
          this.tourB.push(a);
          //console.log("deplacer a vers b") ;
         }
      }
    }

    formatHMS(timeInMiliseconds : number) : string
    {
      let h,m,s;
      h = Math.floor(timeInMiliseconds/1000/60/60);
      m = Math.floor((timeInMiliseconds/1000/60/60 - h)*60);
      s = Math.floor(((timeInMiliseconds/1000/60/60 - h)*60 - m)*60);
     
      // to get time format 00:00:00      
      s < 10 ? s = `0${s}`: s = `${s}`
      m < 10 ? m = `0${m}`: m = `${m}`
      h < 10 ? h = `0${h}`: h = `${h}`
            
      return `${h}:${m}:${s}` ;
    }

}
