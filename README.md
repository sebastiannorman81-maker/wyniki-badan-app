# 📋 Wyniki Badań — Osobisty Dziennik Zdrowia

Nowoczesna, w pełni offline'owa aplikacja medyczna do monitorowania wyników badań laboratoryjnych, śledzenia zmian w czasie na interaktywnych wykresach oraz generowania profesjonalnych raportów PDF dla lekarza prowadzącego.

Zbudowana na bazie **React Native / Expo**, działa wieloplatformowo na systemach **Windows**, **Android**, **iOS** oraz **Web**.

---

## ✨ Główne Funkcje

* 📊 **Interaktywne Wykresy & Trend**: Podgląd zmian wskaźników w czasie, wykrywanie trendów rosnących/malejących (% zmiana w porównaniu do poprzedniego wyniku).
* 📄 **Generowanie Raportów PDF**: Wybór zakresu dat oraz parametrów, opcjonalne dane pacjenta i generowanie profesjonalnego zestawienia medycznego dla lekarza.
* 📲 **Wieloplatformowość**: Natywne aplikacje dla Windows (.exe), Android (.apk), iOS (Xcode) oraz przeglądarki Web.
* 🔒 **100% Offline & Prywatność**: Dane przechowywane wyłącznie lokalnie na urządzeniu użytkownika (`AsyncStorage`).
* 🏷️ **Kategorie & Tagi**: Porządkowanie wskaźników według kategorii (Krew, Tarczyca, Lipidy, Witaminy itd.) oraz własnych tagów.
* 📱 **Kod QR & Udostępnianie**: Szybki eksport i import wyników poprzez kody QR lub zwięzłe kody tekstowe.
* 📷 **Skaner OCR**: Opcja odczytu wyników ze zdjęć dokumentów laboratoryjnych.

---

## 📥 Instrukcja Pobierania i Uruchomienia

### 💻 1. Wersja na Windows (Desktop)
1. Pobierz spakowaną paczkę aplikacji: [wyniki-badan-app-web.zip](./wyniki-badan-app-web.zip)
2. Rozpakuj plik zip w dowolnym folderze.
3. Otwórz plik `dist/index.html` w swojej przeglądarce lub uruchom skrypt desktopowy Electron (`npm run electron`).

### 📱 2. Wersja na Android (.apk)
1. Projekt natywny dla Android Studio znajduje się w katalogu `./android`.
2. Aby zbudować plik instalacyjny APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. Gotowy plik `.apk` pojawi się w `android/app/build/outputs/apk/release/app-release.apk`.

### 🍏 3. Wersja na iOS (iPhone / iPad)
1. Projekt natywny Xcode znajduje się w katalogu `./ios`.
2. Otwórz plik `ios/wynikibadanapp.xcworkspace` na komputerze Mac w programie **Xcode** i kliknij **Build & Run**.

---

## 🛠️ Uruchomienie Programistyczne (Lokalnie)

Wymagane środowisko: **Node.js (v18+)** oraz **npm**.

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/sebastiannorman81-maker/wyniki-badan-app.git
cd wyniki-badan-app

# 2. Instalacja zależności
npm install

# 3. Uruchomienie serwera deweloperskiego Expo
npm run web
# lub
npx expo start
```

---

## 📄 Licencja

Projekt udostępniony na licencji open-source MIT. Dane medyczne wprowadzane w aplikacji są przechowywane wyłącznie na urządzeniu użytkownika.
