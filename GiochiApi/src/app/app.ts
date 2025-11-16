import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { GamesCatalogComponent } from './components/games-catalog/games-catalog.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { PanelService } from './services/panel.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, AsyncPipe, GamesCatalogComponent, FavoritesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  panelOpen$: Observable<boolean>;

  constructor(private panelService: PanelService) {
    this.panelOpen$ = this.panelService.panelOpen$;
  }

  toggleFavoritesPanel(): void {
    this.panelService.toggle();
  }

  closeFavoritesPanel(): void {
    this.panelService.close();
  }
}


