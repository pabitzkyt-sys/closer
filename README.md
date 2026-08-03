# Closer

Closer is an installable web app that shows the live distance between two people who choose to share their locations.

## Live app

Once GitHub Pages finishes deploying:

**https://pabitzkyt-sys.github.io/closer/**

The preview works immediately. Live two-phone pairing requires a free Firebase project.

## Firebase setup

1. Create a Firebase project.
2. Add a Web App in Firebase Project Settings.
3. Enable **Authentication → Anonymous**.
4. Create a **Cloud Firestore** database.
5. Paste the contents of `firestore.rules` into Firestore Rules and publish them.
6. Open Closer, choose **Configure Firebase**, and paste the Firebase web configuration JSON on each phone.
7. One person creates a pairing code; the other joins it. Both tap **Start sharing my location**.

## Install on a phone

Open the live app in Safari or Chrome, then use **Add to Home Screen**. The current version is a PWA. A true iPhone Lock Screen widget or Live Activity will require a native iOS app target in the next phase.

## Privacy notes

- Location sharing starts only after the user taps the sharing button.
- Sharing can be stopped from the app at any time.
- Pairing codes are intentionally simple for the MVP. Before public release, add expiring invitations, stronger access controls, deletion, and abuse protections.
