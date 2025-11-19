# GiochiAPI - Catalogo di Giochi Gratuiti

Un'applicazione Angular moderna che visualizza un catalogo di giochi gratuiti, permettendo agli utenti di cercare, filtrare e salvare i loro preferiti. L'app utilizza l'API pubblica di **FreeToGame** per recuperare i dati dei giochi.

---

## 📋 Sommario

- [Panoramica dell'Architettura](#panoramica-dellarchitettura)
- [Struttura del Progetto](#struttura-del-progetto)
- [Componenti](#componenti)
- [Servizi](#servizi)
- [Routing](#routing)
- [Come Funziona](#come-funziona)
- [Guida all'Installazione](#guida-allinstallazione)
- [Uso dell'Applicazione](#uso-dellapplicazione)

---

## 🏗️ Panoramica dell'Architettura

GiochiAPI è costruita su **Angular 20** con architettura moderna **standalone components**. L'applicazione è divisa in componenti riutilizzabili, servizi centralizatti e uno stato condiviso gestito tramite RxJS.

### Stack Tecnologico
- **Framework**: Angular 20
- **Linguaggio**: TypeScript
- **Gestione dello Stato**: RxJS (BehaviorSubject, Observable)
- **Stile**: CSS3 con responsive design
- **API Backend**: FreeToGame (https://www.freetogame.com/api)
- **Storage Locale**: Browser LocalStorage

---

## 📁 Struttura del Progetto

```
GiochiApi/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── games-catalog/              # Componente principale del catalogo
│   │   │   │   ├── games-catalog.component.ts
│   │   │   │   ├── games-catalog.component.html
│   │   │   │   └── games-catalog.component.css
│   │   │   │
│   │   │   └── favorites/                  # Componente per i preferiti
│   │   │       ├── favorites.component.ts
│   │   │       ├── favorites.component.html
│   │   │       └── favorites.component.css
│   │   │
│   │   ├── services/
│   │   │   ├── games.service.ts            # Recupera i dati dei giochi
│   │   │   ├── favorites.service.ts        # Gestisce i preferiti
│   │   │   └── panel.service.ts            # Gestisce il pannello laterale
│   │   │
│   │   ├── app.ts                          # Componente root
│   │   ├── app.html                        # Template root
│   │   ├── app.css                         # Stili globali root
│   │   ├── app.routes.ts                   # Configurazione routing
│   │   ├── app.config.ts                   # Configurazione applicazione
│   │   │
│   ├── main.ts                             # Entry point
│   ├── index.html                          # HTML principale
│   └── styles.css                          # Stili globali
│
├── proxy.conf.json                         # Configurazione proxy CORS (dev)
├── angular.json                            # Configurazione Angular CLI
├── package.json                            # Dipendenze e script
└── tsconfig.json                           # Configurazione TypeScript
```

---

## 🧩 Componenti

### 1. **GamesCatalogComponent**
Componente principale che visualizza il catalogo di giochi.

#### TypeScript (`games-catalog.component.ts`)
```typescript
export class GamesCatalogComponent implements OnInit {
  allGames: Game[] = [];           // Lista completa di tutti i giochi
  filteredGames: Game[] = [];      // Lista filtrata in base a ricerca/filtri
  searchQuery: string = '';        // Testo della ricerca
  selectedPlatform: 'all' | 'pc' | 'browser' = 'all';  // Filtro piattaforma
  loading: boolean = true;         // Stato di caricamento
  error: string | null = null;     // Messaggio di errore
}
```

#### Funzionalità Principali:

**`loadGames()`** - Carica tutti i giochi all'avvio
- Chiama `GamesService.getAllGames()`
- Salva i giochi in `allGames`
- Imposta `loading = false` al termine

**`applyFilters()`** - Filtra i giochi per ricerca e piattaforma
- **Filtro Ricerca**: Cerca il testo inserito nel titolo (case-insensitive)
- **Filtro Piattaforma**: 
  - `'all'`: mostra tutti i giochi
  - `'pc'`: mostra solo giochi che contengono "pc" nella piattaforma
  - `'browser'`: mostra solo giochi web/browser

**`toggleFavorite(game)`** - Aggiunge/rimuove gioco dai preferiti
- Delega al `FavoritesService`

**`isFavorite(game)`** - Controlla se un gioco è nei preferiti
- Restituisce true/false

#### HTML (`games-catalog.component.html`)
```html
<!-- Pulsanti filtro per piattaforma -->
<button (click)="setPlatform('all')">Tutti i giochi</button>
<button (click)="setPlatform('pc')">Giochi PC</button>
<button (click)="setPlatform('browser')">Giochi Browser</button>

<!-- Barra di ricerca con binding bidirezionale -->
<input [(ngModel)]="searchQuery" (input)="onSearch()" />

<!-- Griglia di giochi -->
<div class="games-grid">
  <div *ngFor="let game of filteredGames" class="game-card">
    <img [src]="game.thumbnail" />
    <h3>{{ game.title }}</h3>
    <p>{{ game.genre }}</p>
    <p>{{ game.platform }}</p>
    <p>{{ game.short_description }}</p>
    <button (click)="toggleFavorite(game)">
      ♡ Aggiungi ai preferiti / ♥ Nei preferiti
    </button>
    <a [href]="game.game_url" target="_blank">Scopri di più</a>
  </div>
</div>
```

**Direttive Angular Utilizzate:**
- `*ngIf` - Mostra/nascondi elementi condizionalmente
- `*ngFor` - Itera su array di giochi
- `[(ngModel)]` - Binding bidirezionale per la ricerca
- `(click)`, `(input)` - Event binding
- `[src]`, `[href]` - Property binding
- `{{ }}` - Interpolation per visualizzare dati

---

### 2. **FavoritesComponent**
Componente che visualizza i giochi aggiunti ai preferiti.

#### TypeScript (`favorites.component.ts`)
```typescript
export class FavoritesComponent implements OnInit {
  favorites: Game[] = [];  // Lista dei giochi preferiti
}
```

#### Funzionalità:
**`ngOnInit()`** - Al caricamento del componente:
- Carica i preferiti da localStorage tramite `FavoritesService`
- Si iscrive all'Observable `favorites$` per aggiornamenti in tempo reale

**`remove(game)`** - Rimuove un gioco dai preferiti
- Chiama `FavoritesService.removeFavorite()`

#### HTML (`favorites.component.html`)
```html
<!-- Messaggio se nessun preferito -->
<div *ngIf="favorites.length === 0">
  Non hai ancora giochi nei preferiti.
</div>

<!-- Griglia preferiti -->
<div class="favorites-grid" *ngIf="favorites.length > 0">
  <div *ngFor="let game of favorites" class="fav-card">
    <img [src]="game.thumbnail" />
    <h3>{{ game.title }}</h3>
    <p>{{ game.genre }}</p>
    <a [href]="game.game_url" target="_blank">Apri</a>
    <button (click)="remove(game)">Rimuovi</button>
  </div>
</div>
```

---

### 3. **App Component (Root)**
Componente principale che organizza l'intera applicazione.

#### TypeScript (`app.ts`)
```typescript
export class App {
  panelOpen$: Observable<boolean>;  // Observable che indica se il pannello è aperto

  constructor(private panelService: PanelService) {
    this.panelOpen$ = this.panelService.panelOpen$;
  }

  toggleFavoritesPanel(): void {
    this.panelService.toggle();  // Apri/chiudi il pannello
  }

  closeFavoritesPanel(): void {
    this.panelService.close();   // Chiudi il pannello
  }
}
```

#### HTML (`app.html`)
```html
<!-- Outlet per il routing -->
<router-outlet></router-outlet>

<!-- Overlay quando il pannello è aperto -->
<div class="panel-overlay" *ngIf="(panelOpen$ | async)" 
     (click)="closeFavoritesPanel()"></div>

<!-- Pannello laterale scorrevole per i preferiti -->
<aside class="favorites-panel" [class.open]="(panelOpen$ | async)">
  <h3>I tuoi preferiti</h3>
  <button (click)="closeFavoritesPanel()">✕</button>
  <app-favorites></app-favorites>
</aside>

<!-- Footer -->
<footer class="app-footer">
  <p>&copy; 2025 GiochiAPI. Powered by FreeToGame</p>
</footer>
```

**Concetti Chiave:**
- `| async` - Pipe di Angular che si iscrive automaticamente all'Observable
- `[class.open]` - Class binding dinamico basato su stato

---

## 🔧 Servizi

### 1. **GamesService**
Gestisce il recupero dei dati dei giochi dall'API FreeToGame.

```typescript
@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly ENDPOINTS = [
    'https://www.freetogame.com/api/games',
    'https://thingproxy.freeboard.io/fetch/https://www.freetogame.com/api/games',
    'https://api.allorigins.win/raw?url=https://www.freetogame.com/api/games',
    'https://cors.bridged.cc/https://www.freetogame.com/api/games',
    'https://cors-anywhere.herokuapp.com/https://www.freetogame.com/api/games'
  ];

  getAllGames(): Observable<Game[]> {
    return from(this.ENDPOINTS).pipe(
      concatMap((url) =>
        this.http.get<Game[]>(url).pipe(
          catchError((err) => {
            console.warn(`[GamesService] endpoint failed: ${url}`, err?.status || err);
            return EMPTY;  // Continua con l'endpoint successivo
          })
        )
      ),
      first(),  // Prendi il primo risultato riuscito
      catchError(() => throwError(() => new Error('All game endpoints failed')))
    );
  }
}
```

#### Spiegazione della Logica:

**Problema CORS**: Il browser blocca le richieste dirette a freetogame.com a causa della CORS policy.

**Soluzione**: L'app tenta più endpoint CORS-friendly in sequenza:
1. **API Diretta** (potrebbe fallire per CORS)
2. **thingproxy.freeboard.io** (proxy pubblico)
3. **api.allorigins.win** (proxy pubblico)
4. **cors.bridged.cc** (proxy pubblico)
5. **cors-anywhere.herokuapp.com** (proxy pubblico)

**Operatori RxJS Utilizzati:**
- `from()` - Crea un Observable dalla lista di endpoint
- `concatMap()` - Esegue le richieste in sequenza (non in parallelo)
- `catchError()` - Cattura errori e continua
- `EMPTY` - Restituisce Observable vuoto (salta all'endpoint successivo)
- `first()` - Prende il primo valore che arriva correttamente
- `throwError()` - Genera un errore se tutti gli endpoint falliscono

#### Interfaccia Game:
```typescript
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
```

---

### 2. **FavoritesService**
Gestisce i giochi preferiti utilizzando localStorage del browser.

```typescript
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<Game[]>(this.readFromStorage());
  favorites$ = this.favoritesSubject.asObservable();

  // Legge i preferiti da localStorage
  private readFromStorage(): Game[] {
    try {
      const raw = localStorage.getItem('favoriteGames');
      if (!raw) return [];
      return JSON.parse(raw) as Game[];
    } catch (e) {
      console.error('Failed to read favorites from localStorage', e);
      return [];
    }
  }

  // Scrive i preferiti in localStorage
  private writeToStorage(items: Game[]) {
    try {
      localStorage.setItem('favoriteGames', JSON.stringify(items));
      this.favoritesSubject.next(items);  // Notifica i subscriber
    } catch (e) {
      console.error('Failed to write favorites to localStorage', e);
    }
  }

  // Metodi Pubblici:

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
```

#### Spiegazione:

**BehaviorSubject**: Observable speciale che:
- Emette il valore attuale subito al primo subscriber
- Mantiene l'ultimo valore emesso
- Consente di notificare tutti i subscriber quando i dati cambiano

**Flusso di Dati:**
1. Al caricamento, legge i preferiti da localStorage
2. Li memorizza in `favoritesSubject`
3. Quando l'utente aggiunge/rimuove un preferito:
   - Aggiorna l'array
   - Lo salva in localStorage
   - Notifica tutti i componenti iscritti tramite `next()`

**Vantaggi:**
- I dati persistono tra i ricaricamenti della pagina
- Tutti i componenti rimangono sincronizzati in tempo reale

---

### 3. **PanelService**
Gestisce lo stato del pannello laterale dei preferiti.

```typescript
@Injectable({ providedIn: 'root' })
export class PanelService {
  private openSubject = new BehaviorSubject<boolean>(false);
  panelOpen$ = this.openSubject.asObservable();

  toggle(): void {
    this.openSubject.next(!this.openSubject.getValue());
  }

  open(): void {
    this.openSubject.next(true);
  }

  close(): void {
    this.openSubject.next(false);
  }
}
```

#### Utilizzo:
- **`toggle()`**: Inverte lo stato (apri se chiuso, chiudi se aperto)
- **`open()`**: Apre il pannello
- **`close()`**: Chiude il pannello
- **`panelOpen$`**: Observable che i componenti possono osservare

---

## 🛣️ Routing

Il routing è configurato in `app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: '', component: GamesCatalogComponent },           // Rotta di default: catalogo
  { path: 'favorites', component: FavoritesComponent }      // Rotta favorites (non usata attualmente)
];
```

**Nota**: Attualmente `FavoritesComponent` non viene navigato tramite routing, ma è inserito in un pannello laterale nel componente root.

---

## ⚙️ Configurazione

### `app.config.ts` - Configurazione Applicazione

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),              // Gestisce errori globali del browser
    provideZoneChangeDetection({ eventCoalescing: true }),  // Ottimizza rilevamento cambiamenti
    provideRouter(routes),                             // Abilita il routing
    provideHttpClient(
      withXsrfConfiguration({                          // Protezione CSRF
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    )
  ]
};
```

---

## 🔄 Come Funziona

### Flusso di Caricamento dei Dati:

1. **Avvio Applicazione**
   - `main.ts` bootstrappa il componente `App`
   - `app.config.ts` fornisce i servizi e configurazioni

2. **GamesCatalogComponent Caricamento**
   - `ngOnInit()` chiama `loadGames()`
   - `loading = true` mostra "Caricamento giochi..."

3. **GamesService.getAllGames()**
   - Tenta il primo endpoint dell'API
   - Se fallisce, tenta l'endpoint successivo
   - Continua finché uno ha successo o tutti falliscono

4. **Dati Ricevuti**
   - `allGames` viene riempito con i dati
   - `filteredGames` inizialmente uguale a `allGames`
   - `loading = false` e la griglia si visualizza

5. **Interazione Utente**
   - Digita nella ricerca → `applyFilters()` filtra i titoli
   - Clicca su un filtro → `setPlatform()` e `applyFilters()`
   - Clicca "Aggiungi ai preferiti" → `FavoritesService.toggleFavorite()`
   - I preferiti si salvano in localStorage e il componente si aggiorna

### Flusso dei Preferiti:

```
GamesCatalogComponent
      ↓
  toggleFavorite(game)
      ↓
FavoritesService.toggleFavorite(game)
      ↓
   localStorage.setItem('favoriteGames', JSON.stringify(items))
      ↓
   favoritesSubject.next(items)  ← Notifica subscriber
      ↓
FavoritesComponent
  favorites$ (Observable)
      ↓
  Aggiornamento automatico della lista
```

---

## 🚀 Guida all'Installazione

### Prerequisiti:
- Node.js 18+ e npm
- Angular CLI 20+

### Passi:

1. **Clona il repository**
```bash
git clone https://github.com/barzagit/giochiapi.git
cd giochiapi/GiochiApi
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Avvio server di sviluppo**
```bash
npm start
# oppure
ng serve
```

4. **Apri il browser**
```
http://localhost:4200
```

5. **Build per produzione**
```bash
npm run build
# oppure
ng build --configuration production
```

---

## 📱 Uso dell'Applicazione

### 1. Sfogliare il Catalogo
- Visualizza automaticamente tutti i giochi disponibili al caricamento
- Ogni carta mostra: immagine, titolo, genere, piattaforma, descrizione

### 2. Cercare Giochi
- Digita il nome di un gioco nella barra di ricerca
- La ricerca è case-insensitive e in tempo reale
- I risultati si aggiornano mentre digiti

### 3. Filtrare per Piattaforma
- **Tutti i giochi**: Mostra il catalogo completo
- **Giochi PC**: Solo giochi disponibili per PC
- **Giochi Browser**: Solo giochi web/browser

### 4. Gestire i Preferiti
- Clicca **♡ Aggiungi ai preferiti** per salvare un gioco
- Il bottone diventa **♥ Nei preferiti** (rosso)
- Clicca **Preferiti** in alto a destra per aprire il pannello
- Nel pannello puoi visualizzare tutti i preferiti e rimuoverli

### 5. Accedere ai Giochi
- Clicca **Scopri di più** per visitare il gioco su FreeToGame
- Si apre in una nuova scheda

---

## 📊 Stato dell'Applicazione

L'app mantiene tre livelli di stato:

### 1. **Componente (Locale)**
```typescript
allGames: Game[] = [];         // Tutti i giochi
filteredGames: Game[] = [];    // Giochi filtrati
searchQuery: string = '';      // Testo di ricerca
selectedPlatform = 'all';      // Filtro selezionato
loading: boolean = true;       // Stato caricamento
error: string | null = null;   // Messaggi d'errore
```

### 2. **Servizio (Condiviso con Observable)**
```typescript
// FavoritesService
favorites$ = Observable<Game[]>  // Observable dei preferiti

// PanelService
panelOpen$ = Observable<boolean> // Observable dello stato del pannello
```

### 3. **Browser Storage (Persistente)**
```javascript
// localStorage
localStorage.getItem('favoriteGames')  // Legge i preferiti salvati
localStorage.setItem('favoriteGames', JSON.stringify(games))  // Salva i preferiti
```

---

## 🎨 Styling

L'app utilizza CSS3 moderno con:
- **Grid Layout** per la griglia di giochi
- **Flexbox** per l'allineamento
- **Media Queries** per responsive design
- **Transizioni fluide** per animazioni
- **Variabili CSS** per tema coerente

### Classi Principali:
- `.catalog-container` - Contenitore principale
- `.games-grid` - Griglia dei giochi
- `.game-card` - Singola carta di gioco
- `.favorites-panel` - Pannello laterale
- `.filter-btn` - Pulsanti filtro
- `.fav-btn` - Pulsante preferito

---

## 🐛 Gestione Errori

### Errori Comuni e Soluzioni:

**Errore CORS**
- Causa: Blocco del browser alle richieste cross-origin
- Soluzione: L'app tenta automaticamente più proxy pubblici

**LocalStorage Non Disponibile**
- Causa: Quando il browser non permette l'accesso (modalità privata)
- Soluzione: `try/catch` nel service, i preferiti non persistono ma l'app continua a funzionare

**API Non Raggiungibile**
- Causa: Tutti gli endpoint sono down
- Soluzione: Messaggio di errore all'utente: "Errore nel caricamento dei giochi. Riprova più tardi."

---

## 📚 Concetti Chiave Spiegati

### **RxJS Observables**
Un Observable è un flusso di dati nel tempo. Puoi:
- **Creare**: `new Observable(subscriber => {...})`
- **Trasformare**: `.pipe(map(...), filter(...))`
- **Sottoscrivere**: `.subscribe(value => {...})`
- **Cancellare**: `.unsubscribe()`

### **BehaviorSubject**
Un Observable che mantiene l'ultimo valore e lo emette immediatamente ai nuovi subscriber.

```typescript
const subject = new BehaviorSubject<number>(0);
subject.next(1);              // Emette 1 a tutti
subject.subscribe(val => {    // Riceve immediatamente 1
  console.log(val);
});
```

### **Pipe Async**
Pipe di Angular che automaticamente:
- Si iscrive all'Observable
- Gestisce il lifecycle
- Si disiscrive al distruzione del componente

```html
<div>{{ observable$ | async }}</div>
```

### **Standalone Components**
Componenti Angular moderni che:
- Dichiarano le loro dipendenze localmente
- Non hanno bisogno di NgModule
- Sono più semplici da testare e riutilizzare

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MyComponent {}
```

---

## 🔗 Risorse Esterne

- **API FreeToGame**: https://www.freetogame.com/api
- **Angular Docs**: https://angular.io/docs
- **RxJS Docs**: https://rxjs.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/

---

## 📝 Licenza

Questo progetto è open source e disponibile sotto licenza MIT.

---

## 👨‍💻 Autore

Sviluppato come progetto didattico su Angular, RxJS e web technologies.

**Contatti:**
- GitHub: [@barzagit](https://github.com/barzagit)
- Repository: [giochiapi](https://github.com/barzagit/giochiapi)