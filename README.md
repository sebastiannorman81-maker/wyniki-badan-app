# 📋 Wyniki Badań — Osobisty Dziennik Zdrowia

Nowoczesna, w pełni offline'owa aplikacja medyczna do monitorowania wyników badań laboratoryjnych, śledzenia zmian w czasie na interaktywnych wykresach oraz generowania profesjonalnych raportów PDF dla lekarza prowadzącego.

Zbudowana na bazie **React Native / Expo**, działa wieloplatformowo na systemach **Windows**, **Android**, **iOS** oraz **Web**.

---

## 📥 POBIERZ GOTOWE PLIKIALBO INSTALATORY Z GITHUBA

Dla Twojej wygody pliki instalacyjne i uruchomieniowe są dostępne bezpośrednio w tym repozytorium:

| Platforma | Plik do pobrania (Kliknij, aby pobrać) | Opis |
| :--- | :--- | :--- |
| 📱 **Android** | [⬇️ **Pobierz Wyniki-Badan-Android.apk**](https://github.com/sebastiannorman81-maker/wyniki-badan-app/raw/main/downloads/Wyniki-Badan-Android.apk) | Gotowa aplikacja instalacyjna APK na telefony i tablety z systemem Android |
| 🌐 **Web / Windows** | [⬇️ **Pobierz Wyniki-Badan-Web-Offline.zip**](https://github.com/sebastiannorman81-maker/wyniki-badan-app/raw/main/downloads/Wyniki-Badan-Web-Offline.zip) | Samodzielna paczka HTML/JS do uruchomienia offline na komputerze z systemem Windows |

---

## 📂 DOKŁADNE ŚCIEŻKI DO PLIKÓW W REPOZYTORIUM GITHUB

Jeśli przeglądasz pliki bezpośrednio na GitHubie, poniżej znajdują się ścieżki do poszczególnych wersji projektu:

### 📱 1. Plik instalacyjny Android (.apk)
* **Ścieżka na GitHubie**: [`downloads/Wyniki-Badan-Android.apk`](downloads/Wyniki-Badan-Android.apk)
* **Projekt źródłowy Android Studio**: [`android/`](android/)

### 💻 2. Wersja na Windows / Electron (.exe launcher)
* **Program uruchomieniowy Electron**: [`electron/main.js`](electron/main.js)
* **Strona startowa aplikacji Web**: [`dist/index.html`](dist/index.html)
* **Paczka offline w repozytorium**: [`downloads/Wyniki-Badan-Web-Offline.zip`](downloads/Wyniki-Badan-Web-Offline.zip)

### 🍏 3. Wersja na iOS (iPhone / iPad)
* **Projekt natywny Xcode**: [`ios/wynikibadanapp.xcworkspace`](ios/)

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
