# Testme.md

This file serves as a checklist and manual test script for all new functionalities added to the project. Whenever a new feature is implemented, please add a description and test steps here to ensure comprehensive testing.

---

## Test Checklist

### 1. Home Screen & Navigation
- [ ] App loads and displays the home screen with stage selection and progress view options.
- [ ] Navigation to each stage and back to home works as expected.

### 2. Stage 1: Single Digit ↔ Sound Practice
- [ ] User can select Stage 1 and practice digit-to-sound and sound-to-digit modes.
- [ ] Mixed mode randomly alternates between digit-to-sound and sound-to-digit.
- [ ] Score updates correctly after each answer.
- [ ] Feedback is shown for correct/incorrect answers.
- [ ] Stats are tracked and persisted in localStorage.

### 3. Progress Page
- [ ] User can view their weakest digits and sounds based on practice stats.
- [ ] User can restart progress and download their stats as a JSON file.

### 4. Stage 2: Two Digits ↔ Word (Word Management)
- [ ] User can select Stage 2 and view a grid of numbers (0-9, 00-99).
- [ ] User can click a number to edit/add/remove associated words.
- [ ] Words are validated against the Major System encoding.
- [ ] Duplicate words are not allowed (case-insensitive).
- [ ] Words are persisted in localStorage.
- [ ] User can download/upload their word list as JSON.

### 5. Stage 2 Practice: Number → Word
- [ ] User can practice recalling words for random numbers (0-9, 00-99).
- [ ] Strict mode (saved words only) can be toggled.
- [ ] New valid words can be added during practice (if not in strict mode).
- [ ] Score and feedback update correctly.

### 6. Notifications
- [ ] Success and error notifications appear and disappear as expected.

### 7. Mobile Responsiveness
- [ ] App layout adapts for mobile screens (≤600px width).

### 8. Stage 3: Person-Object-Action (POA) System
- [ ] User can select Stage 3 and view a grid of numbers (0-9, 00-99).
- [ ] User can click a number to add/edit Person-Object-Action associations.
- [ ] POA entries require all three fields (Person, Object, Action) to be filled.
- [ ] Duplicate POAs are not allowed (case-insensitive).
- [ ] POA data is persisted in localStorage.
- [ ] User can download/upload their POA data as JSON.
- [ ] User can practice POA recall in both directions (Number → POA and POA → Number).
- [ ] Practice mode includes strict mode toggle for saved POAs only.
- [ ] Score and feedback update correctly during POA practice.

---

(Add new functionality and its test steps below)

--- 