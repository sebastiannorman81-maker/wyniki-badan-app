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

## 📥 Dokładne Ścieżki do Pobrania i Uruchomienia Plików

### 📱 1. Wersja na Android (Plik instalacyjny APK)
* **Ścieżka pliku na Pulpicie**: `C:\Users\JA\Desktop\Wyniki-Badan-Android.apk`
* **Ścieżka wewnątrz projektu (po wygenerowaniu Gradle)**: `C:\Users\JA\Desktop\LOS\wyniki-badan-app\android\app\build\outputs\apk\release\app-release.apk`
* **Jak uruchomić**: Skopiuj plik `Wyniki-Badan-Android.apk` na swój smartfon/tablet z systemem Android i kliknij go, aby zainstalować aplikację.

### 💻 2. Wersja na Windows (Program desktopowy .exe)
* **Ścieżka archiwum ZIP (Pulpit)**: `C:\Users\JA\Desktop\Wyniki-Badan-Windows.zip`
* **Ścieżka bezpośrednia do pliku .exe**: `C:\Users\JA\Desktop\LOS\wyniki-badan-release\Wyniki-Badan-win32-x64\Wyniki-Badan.exe`
* **Jak uruchomić**: Rozpakuj plik `Wyniki-Badan-Windows.zip` na Pulpicie i kliknij dwukrotnie w `Wyniki-Badan.exe`, aby uruchomić program bez konieczności instalowania przeglądarek czy serwerów.

### 🌐 3. Wersja Web Offline (Strona HTML)
* **Ścieżka archiwum Web (Pulpit/LOS)**: `C:\Users\JA\Desktop\LOS\wyniki-badan-app-web.zip`
* **Ścieżka pliku startowego HTML**: `C:\Users\JA\Desktop\LOS\wyniki-badan-app\dist\index.html`
* **Jak uruchomić**: Otwórz plik `index.html` w dowolnej przeglądarce (Chrome, Edge, Firefox, Safari).

### 🍏 4. Wersja na iOS (Projekt Xcode dla komputerów Mac)
* **Ścieżka pliku projektu Xcode**: `C:\Users\JA\Desktop\LOS\wyniki-badan-app\ios\wynikibadanapp.xcworkspace`
* **Jak uruchomić**: Otwórz folder `ios/` na komputerze Mac w programie **Xcode**, otwórz plik `.xcworkspace` i kliknij **Build & Run** (cmd + R).

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
