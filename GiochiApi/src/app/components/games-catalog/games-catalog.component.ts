import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService, Game } from '../../services/games.service';
import { FavoritesService } from '../../services/favorites.service';
import { PanelService } from '../../services/panel.service';

@Component({
  selector: 'app-games-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games-catalog.component.html',
  styleUrl: './games-catalog.component.css'
})
export class GamesCatalogComponent implements OnInit {
  allGames: Game[] = [];
  filteredGames: Game[] = [];
  searchQuery: string = '';
  selectedPlatform: 'all' | 'pc' | 'browser' = 'all';
  loading: boolean = true;
  error: string | null = null;

  constructor(private gamesService: GamesService, private favService: FavoritesService, public panelService: PanelService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gamesService.getAllGames().subscribe({
      next: (games) => {
        this.allGames = games;
        this.filteredGames = games;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dei giochi. Riprova più tardi.';
        this.loading = false;
        console.error('Error loading games:', err);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  setPlatform(platform: 'all' | 'pc' | 'browser'): void {
    this.selectedPlatform = platform;
    this.applyFilters();
  }

  // Favorites helpers
  isFavorite(game: Game): boolean {
    return this.favService.isFavorite(game.id);
  }

  toggleFavorite(game: Game): void {
    this.favService.toggleFavorite(game);
  }

  private applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredGames = this.allGames.filter((game) => {
      // Search filter
      const matchesQuery = query === '' || game.title.toLowerCase().includes(query);

      // Platform filter
      const plat = (game.platform || '').toLowerCase();
      let matchesPlatform = true;
      if (this.selectedPlatform === 'pc') {
        matchesPlatform = plat.includes('pc');
      } else if (this.selectedPlatform === 'browser') {
        matchesPlatform = plat.includes('web') || plat.includes('browser');
      }

      return matchesQuery && matchesPlatform;
    });
  }
}
