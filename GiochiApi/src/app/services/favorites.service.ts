import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from './games.service';

const STORAGE_KEY = 'favoriteGames';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<Game[]>(this.readFromStorage());
  favorites$ = this.favoritesSubject.asObservable();

  private readFromStorage(): Game[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Game[];
    } catch (e) {
      console.error('Failed to read favorites from localStorage', e);
      return [];
    }
  }

  private writeToStorage(items: Game[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      this.favoritesSubject.next(items);
    } catch (e) {
      console.error('Failed to write favorites to localStorage', e);
    }
  }

  getFavorites(): Game[] {
    return this.favoritesSubject.getValue();
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().some(g => g.id === id);
  }

  addFavorite(game: Game): void {
    const list = this.getFavorites();
    if (!list.some(g => g.id === game.id)) {
      const next = [...list, game];
      this.writeToStorage(next);
    }
  }

  removeFavorite(id: number): void {
    const next = this.getFavorites().filter(g => g.id !== id);
    this.writeToStorage(next);
  }

  toggleFavorite(game: Game): void {
    if (this.isFavorite(game.id)) {
      this.removeFavorite(game.id);
    } else {
      this.addFavorite(game);
    }
  }
}
