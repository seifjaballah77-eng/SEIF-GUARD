# SEIF-GUARD

SEIF-GUARD is an Android privacy app foundation built with Kotlin and Jetpack Compose.

## First milestone
- Native Android application structure.
- Launcher identity picker: Calendar, Clock, and Files.
- Three icon variants for each identity (nine launcher choices).
- The selected launcher identity controls the displayed launcher label and icon through Android activity aliases.

## Build
Open this repository in a recent Android Studio version, allow Gradle sync, then run the `app` configuration on an Android device or emulator.

## Important platform limits
Changing the launcher alias changes the app's launcher entry only. It does not conceal the package from Android Settings, app-management screens, or Google Play. Android does not grant ordinary apps unrestricted control over other apps or their visibility.

## Status
Initial project foundation. Device testing and the remaining privacy features are not yet complete.
