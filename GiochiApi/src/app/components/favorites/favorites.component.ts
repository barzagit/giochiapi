import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { Game } from '../../services/games.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  favorites: Game[] = [];

  constructor(private favService: FavoritesService) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.favService.favorites$.subscribe(list => this.favorites = list);
  }

  loadFavorites(): void {
    this.favorites = this.favService.getFavorites();
  }

  remove(game: Game): void {
    this.favService.removeFavorite(game.id);
  }
}
