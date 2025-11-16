import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, EMPTY, throwError } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';

export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  // Try direct endpoint first, then a list of public CORS proxies as fallback.
  // Note: public proxies may be unreliable; consider running your own proxy for production.
  private readonly ENDPOINTS = [
    'https://www.freetogame.com/api/games',
    'https://thingproxy.freeboard.io/fetch/https://www.freetogame.com/api/games',
    'https://api.allorigins.win/raw?url=https://www.freetogame.com/api/games',
    'https://cors.bridged.cc/https://www.freetogame.com/api/games',
    'https://cors-anywhere.herokuapp.com/https://www.freetogame.com/api/games'
  ];

  constructor(private http: HttpClient) {}

  getAllGames(): Observable<Game[]> {
    // Attempt each endpoint in order; emit the first successful response.
    return from(this.ENDPOINTS).pipe(
      concatMap((url) =>
        this.http.get<Game[]>(url).pipe(
          catchError((err) => {
            console.warn(`[GamesService] endpoint failed: ${url}`, err?.status || err);
            // swallow error and continue with next endpoint
            return EMPTY;
          })
        )
      ),
      first(),
      catchError(() => throwError(() => new Error('All game endpoints failed')))
    );
  }
}
