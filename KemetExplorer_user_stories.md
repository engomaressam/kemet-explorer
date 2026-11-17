# KemetExplorer User Story

Kemet Explorer is a mobile guide to twelve of Egypt's great ancient sites, from the pyramids of Giza to Abu Simbel. Users create an account, browse and search the sites, open a detail page for each one, save favourites, mark the sites they have visited, check live conditions at every site before they go, and get a daily discovery reminder.

## Personas

| Persona | Who they are | What they need |
|---|---|---|
| **Traveller (Nour, 29)** | Visiting Egypt for ten days with a tight plan | Quick facts on each site, the weather there today, and a list of the sites she still wants to see |
| **Student (Karim, 21)** | Egyptology student revising for exams | Reliable summaries, eras and highlights, with a link to read more |
| **Local explorer (Mona, 45)** | Lives in Cairo and visits a site on weekends | A reminder that suggests somewhere new, and a record of the places she has been |
| **App admin** | Maintains the app and its content | Activity that is kept over time, and control over which settings and notices users get |

---

## 1. Registration

**User story:** As a new user, I want to register with a **username**, **email** and **password** and then tap **Sign Up**, so that I get my own account for favourites, visits and settings.

- Example: Nour types `nour_travels`, `nour@example.com` and a password, taps **Sign Up** and lands on the home screen, already signed in.
- Why: A personal account keeps each traveller's saved sites and preferences separate on a shared device.

**Acceptance criteria**
- The sign-up screen has Username, Email and Password fields, a **Sign Up** button and a **Log in** link for existing users.
- Tapping **Sign Up** with every field empty shows: "Please fill in your username, email and password to sign up."
- Invalid input is rejected with a message for each field: username 3-20 letters, numbers or underscores; a valid email address; a password of at least 8 characters with a letter and a number. The fields in error are outlined in red.
- An email or username that is already registered is refused with a clear message.
- A valid registration is saved in local storage (the password is stored as a salted SHA-256 hash, never as plain text), the user is signed in and the home screen opens.

## 2. Login

**User story:** As a returning user, I want to log in with my **email** and **password** using the **Log In** button, so that I can get back to my saved sites.

- Example: Karim enters his email and password, taps **Log In** and sees "Hello, karim" on the home screen.
- Why: Signing in restores everything the user saved on the device.

**Acceptance criteria**
- The login screen has Email and Password fields (with a show or hide toggle), a **Log In** button, a **Sign Up** button and a "Don't have an account? Sign up" link.
- Tapping **Log In** with empty fields shows: "Please enter your email and password to log in."
- A wrong email or password shows: "Login failed: incorrect email or password. Please try again."
- A successful login saves the session in local storage, so the user stays signed in after restarting the app until they log out.

## 3. Home screen

**User stories**
- As a user, I want an overview on the home screen so that I can see my progress at a glance.
  - Example: The home screen greets "Hello, nour_travels" and shows cards for 12 sites, 4 favourites and 2 visited.
  - Why: Seeing progress keeps users motivated to explore.
- As a new user, I want a featured "Site of the day" on the home screen so that I always have a suggestion of where to start.
  - Example: The home screen features the Step Pyramid of Djoser with its photo, era, a short summary and an **Explore** button.
  - Why: A daily suggestion helps new users discover the app's content.
- As a user, I want to search and filter the list of sites from the home screen so that I can reach what I need in one or two taps.
  - Example: Mona types "Luxor" in the search box, or taps the **Temples** chip, and the list updates at once.
  - Why: Fewer taps for common actions improves the experience.

**Acceptance criteria**
- The app header shows the Kemet Explorer logo and a settings icon.
- The home screen shows the greeting, the three statistic cards, a search box, category chips (All, Pyramids, Temples, Tombs), the site of the day and the list of all sites.
- Each site card shows a photo, name, city, category, a favourite (heart) toggle and a navigation icon that opens the detail screen.
- A "Surprise me" button opens a random site.

## 4. Detail screen

**User stories**
- As a user, I want detailed information on a selected site so that I can decide whether to visit it.
  - Example: The Abu Simbel page shows a photo, the location and region, the era, a summary, highlights and the live weather there.
  - Why: Rich detail helps users plan their visit.
- As a user, I want to save, mark as visited or share a site from the detail screen so that I can keep track of it or send it to a friend.
  - Example: Nour taps **Add to favourites** and **Mark visited**; both change state at once and are kept after a restart.
  - Why: Saving and sharing encourage repeat use.
- As a user, I want to see related sites on the detail screen so that I can explore more options nearby.
  - Example: The Karnak page lists Luxor Temple, the Valley of the Kings and the Temple of Hatshepsut, each opening its own detail page.
  - Why: Contextual suggestions extend a visit.

**Acceptance criteria**
- The navigation icon on each home card opens `/site/<id>` for that site.
- The detail screen shows the title, location, category and era, the Favourite, Visited and Share actions, live weather, About, Highlights, a Wikipedia summary with a "Read the full article" link, related sites and a **Back to all sites** button.

## 5. Persistent data

**User stories**
- As a user, I want my login state to persist across sessions so that I do not need to sign in every time.
  - Example: Mona closes the app on Friday and opens it on Saturday still signed in, until she taps **Log out**.
  - Why: Saves time and gives seamless access.
- As a user, I want my favourites, visited sites and preferences such as dark mode saved so that the app remembers them.
  - Example: Karim turns on dark mode and Fahrenheit, saves three favourites, and finds all of them unchanged the next day.
  - Why: Improves comfort and satisfaction.
- As an admin, I want user activity to persist so that trends can be analysed over time.
  - Example: Each sign-up, login, site view, favourite and visit is appended to an activity log with a timestamp.
  - Why: Enables later analysis of which sites people explore most.

**Acceptance criteria**
- Data is stored with AsyncStorage (the browser's localStorage on the web) under these keys: `kemet:users`, `kemet:session`, `kemet:favorites:<userId>`, `kemet:visited:<userId>`, `kemet:settings:<userId>`, `kemet:notifications:<userId>`, `kemet:activity:<userId>`, plus `kemet:cache:weather` and `kemet:cache:wiki` for API responses.
- The **Privacy & stored data** screen lists every stored key with its size and a preview, and can clear the cached API data.

## 6. External API

**User stories**
- As a traveller, I want live weather at each site so that I can plan when to go.
  - Example: The **Live** tab calls the Open-Meteo API and shows the temperature, feels-like, humidity, wind, today's range and sunset for all 12 sites, with the warmest and coolest site and a visit tip.
  - Why: Real-time conditions add value that static content cannot.
- As a student, I want an up-to-date summary and photo of each site so that I can learn more without leaving the app.
  - Example: The detail screen loads the Wikipedia REST API summary and photo for the site, with a link to the full article.
  - Why: Reliable external content keeps the guide current.
- As a user with favourites, I want an alert when one of my saved sites gets very hot so that I can visit early.
  - Example: When a favourite site reaches 38°C, the app sends a heat alert, at most once a day per site.
  - Why: Turns external data into a timely, personal action.

**Acceptance criteria**
- The app shows a loading state while it fetches, an error message when the network fails (the **Refresh** button retries), and the last cached data, marked "from saved data", when it is offline.
- The **Refresh** button fetches new data; weather is cached for 15 minutes and Wikipedia summaries for 7 days.

## 7. Settings menu

**User stories**
- As a user, I want to open a settings menu from any main screen so that I can adjust preferences when I need to.
  - Example: The gear icon at the top right of Home, Live, Favourites and each detail screen opens Settings.
  - Why: Easy access encourages users to personalise the app.
- As a user, I want the settings menu grouped into sections so that I can find options quickly.
  - Example: Account (Profile & account), Preferences (Appearance & preferences, Notifications & reminders), Privacy & support (Privacy & stored data, About), then Log out.
  - Why: Logical grouping reduces effort.
- As an admin, I want to enable or disable certain settings for users so that the app stays secure and compliant. (Backlog: not in version 1.)
  - Example: A remote configuration flag could hide the promotional-messages option.
  - Why: Keeps settings in line with policy.

**Acceptance criteria**
- The menu shows a personalised header ("Hello, <username>!", email, member since) and each row has an icon, a title and a short description of its current state.
- **Log out** clears the session and returns to the login screen.

## 8. Settings screen

**User stories**
- As a user, I want to enable dark mode so that the app is easier on my eyes at night.
  - Example: The **Dark mode** switch under Appearance changes every screen at once.
  - Why: Improves accessibility and comfort.
- As a user, I want to choose units, text size, the default category, the sort order and whether photos load so that the app fits how I use it.
  - Example: Nour picks Fahrenheit, large text, the Temples category and "Oldest first", and turns photos off to save mobile data.
  - Why: Personal settings make the app easier to use.
- As a user, I want to update my username, email and password so that I can keep my account secure.
  - Example: The **Profile & account** screen validates and saves new details, and changing the password requires the current one.
  - Why: Ensures security and user satisfaction.

**Acceptance criteria**
- Every change is applied immediately across the app, confirmed with a short "saved" message and stored per user in local storage.
- **Reset to defaults** restores the default preferences.

## 9. Notifications

**User stories**
- As a user, I want a daily discovery reminder at a time I choose so that I keep exploring.
  - Example: Mona sets the reminder to 07:00; each morning she is told about the site of the day.
  - Why: Encourages regular use.
- As a user, I want to send a test notification so that I can check notifications work on my device.
  - Example: **Send test notification** delivers "Kemet Explorer test notification" five seconds later, both as a system notification and as a banner inside the app.
  - Why: Builds trust that reminders will arrive.
- As a user, I want to turn off promotional notifications while keeping reminders and alerts so that I only get what matters to me.
  - Example: "News and feature tips" is off by default and has its own switch, separate from the reminder and heat alerts.
  - Why: Reduces annoyance and keeps trust.
- As an admin, I want to send notifications to specific user groups so that I can target relevant information. (Backlog: needs a push-notification server, not in version 1.)
  - Example: Notify users who favourited Luxor sites about a new Luxor guide.
  - Why: Targeted communication increases engagement.

**Acceptance criteria**
- The Notifications screen shows the permission state with an **Allow** button, a master switch, switches for the daily reminder, heat alerts and news, preset and custom reminder times (HH:MM, validated), the next scheduled time and a **Send test notification** button.
- Notifications are scheduled with expo-notifications on iOS and Android (a daily trigger and a time-interval trigger); on the web the browser Notification API is used while the app is open.
- Each delivered notification is recorded in "Recent notifications", which is stored per user.
