# Licznik siłownia

Aplikacja webowa do śledzenia treningów siłowych: licznik powtórzeń, graficzny wybór obciążenia (talerze, gryfy, hantle, stosy maszyn), kreator planów, wykresy postępów, profil z historią masy ciała.

- Front: jeden plik `index.html` (vanilla JS, bez budowania)
- Backend: Supabase (logowanie e-mail + hasło, Postgres z RLS)
- Hosting: GitHub Pages

## Baza danych (Supabase)

| Tabela | Zawartość |
|---|---|
| `profiles` | nick, awatar, wzrost, data urodzenia, płeć (tworzony automatycznie przy rejestracji) |
| `body_weights` | pomiary masy ciała (jeden na dzień) |
| `app_state` | konfiguracja: sprzęt, ćwiczenia, plany, trwający trening (JSON) |
| `workouts` | zakończone treningi (JSON) |

Każda tabela ma RLS – użytkownik widzi i zmienia tylko swoje dane. Klucz w `index.html` to publiczny klucz `publishable`, bezpieczny do umieszczenia w kodzie.

Bez konta aplikacja działa w trybie lokalnym (dane w przeglądarce); po założeniu konta dane są przenoszone.
