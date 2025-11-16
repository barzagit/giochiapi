import { Routes } from '@angular/router';
import { GamesCatalogComponent } from './components/games-catalog/games-catalog.component';
import { FavoritesComponent } from './components/favorites/favorites.component';

export const routes: Routes = [
	{ path: '', component: GamesCatalogComponent },
	{ path: 'favorites', component: FavoritesComponent }
];
