# 📋 Wyniki Badań — Osobisty Dziennik Zdrowia

Nowoczesna, w pełni offline'owa aplikacja medyczna do monitorowania wyników badań laboratoryjnych, śledzenia zmian w czasie na interaktywnych wykresach oraz generowania profesjonalnych raportów PDF dla lekarza prowadzącego.

Zbudowana na bazie **React Native / Expo**, działa wieloplatformowo na systemach **Windows**, **Android**, **iOS** oraz **Web**.

---

## 🚀 SZYBKIE POBIERANIE (Pliki Instalacyjne z Repozytorium)

Możesz pobrać gotowe pliki instalacyjne bezpośrednio z repozytorium GitHub:

| Platforma | Plik do Pobrania | Wygląd & Opis |
|---|---|---|
| 📱 **Android** | 📥 **[Wyniki-Badan-Android.apk](./downloads/Wyniki-Badan-Android.apk)** | **Gotowy plik `.apk` (80 MB)** do zainstalowania bezpośrednio na telefonie/tablecie z systemem Android |
| 🖥️ **Windows** | 📥 **[Wyniki-Badan-Windows.zip](file:///C:/Users/JA/Desktop/Wyniki-Badan-Windows.zip)** | Samodzielny program `.exe` dla Windowsa (dostępny lokalnie na Pulpicie oraz z pliku `./electron/main.js`) |
| 🌐 **Web Offline** | 📥 **[Wyniki-Badan-Web.zip](./downloads/Wyniki-Badan-Web.zip)** | Wygenerowana paczka HTML do otwarcia w dowolnej przeglądarce |

---

## 📂 Ścieżki do Plików w Repozytorium GitHub

Dokładna struktura katalogów w repozytorium do wszystkich modułów:

* 📱 **Android (Aplikacja APK & Projekt Android Studio)**:  
  └─ 📥 Gotowy plik APK: `./downloads/Wyniki-Badan-Android.apk`  
  └─ 📁 Natywny projekt Android Studio: `./android`  
* 🖥️ **Windows (Program Desktopowy Electron)**:  
  └─ 📁 Plik uruchomieniowy Electron: `./electron/main.js`  
  └─ 📄 Konfiguracja budowania .exe: `./electron-package.json`  
* 🍏 **iOS (Natywny projekt Xcode)**:  
  └─ 📁 Przestrzeń robocza Xcode: `./ios/wynikibadanapp.xcworkspace`  
* 🌐 **Web (Wersja produkcyjna HTML)**:  
  └─ 📥 Paczka ZIP: `./downloads/Wyniki-Badan-Web.zip`  
  └─ 📁 Pliki statyczne HTML/JS: `./dist/index.html`  

---

## ✨ Główne Funkcje Aplikacji

* 📊 **Interaktywne Wykresy & Trend**: Podgląd zmian wskaźników w czasie, wykrywanie trendów rosnących/malejących (% zmiana w porównaniu do poprzedniego wyniku).
* 📄 **Generowanie Raportów PDF**: Wybór zakresu dat oraz parametrów, opcjonalne dane pacjenta i generowanie profesjonalnego zestawienia medycznego dla lekarza.
* 📲 **Wieloplatformowość**: Natywne aplikacje dla Windows (.exe), Android (.apk), iOS (Xcode) oraz przeglądarki Web.
* 🔒 **100% Offline & Prywatność**: Dane przechowywane wyłącznie lokalnie na urządzeniu użytkownika (`AsyncStorage`).
* 🏷️ **Kategorie & Tagi**: Porządkowanie wskaźników według kategorii (Krew, Tarczyca, Lipidy, Witaminy itd.) oraz własnych tagów.
* 📱 **Kod QR & Udostępnianie**: Szybki eksport i import wyników poprzez kody QR lub zwięzłe kody tekstowe.
* 📷 **Skaner OCR**: Opcja odczytu wyników ze zdjęć dokumentów laboratoryjnych.

---

## 🛠️ Uruchomienie Programistyczne (Lokalnie w kodzie)

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
