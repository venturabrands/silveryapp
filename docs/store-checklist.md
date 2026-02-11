# App Store Submission Checklist

## Apple App Store (iOS)

### App Store Connect Listing
- [ ] App name: **Silvery Sleep Expert**
- [ ] Subtitle: "AI Sleep Coaching & Diary"
- [ ] Category: Health & Fitness
- [ ] Description (max 4000 chars): Explain the app's features — AI sleep guide, sleep diary, habit tracking
- [ ] Keywords: sleep, insomnia, sleep coaching, sleep diary, sleep hygiene, bedtime routine
- [ ] Screenshots: At least 3 screenshots for each required device size (iPhone 6.7", 6.5", 5.5")
- [ ] App icon: 1024x1024 PNG (no alpha, no rounded corners)
- [ ] Support URL: Link to `/support` page on your published app
- [ ] Privacy Policy URL: Link to `/privacy` page on your published app
- [ ] Age Rating: 4+ (no objectionable content)

### App Review Notes
Provide to Apple:
```
This app provides AI-powered sleep coaching tips and a sleep diary.
It is NOT a medical device and does not diagnose or treat conditions.
Login is required — use these test credentials:
  Email: [test account email]
  Password: [test account password]
Users can chat with an AI sleep guide for general sleep hygiene advice.
Chat history is stored for service improvement.
All users have free lifetime access — no in-app purchases.
```

### Privacy Details (App Privacy section)
- Data collected: Email, name, usage data, chat content
- Data linked to user: Yes (email, name, chat history)
- Data used for tracking: No
- Data shared with third parties: AI processing only (no training)

---

## Google Play Store (Android)

### Store Listing
- [ ] App name: **Silvery Sleep Expert**
- [ ] Short description (80 chars): "AI sleep coaching, sleep diary & personalised insights"
- [ ] Full description (4000 chars): Features, benefits, disclaimer
- [ ] Screenshots: At least 2 for phone, optional for tablet
- [ ] Feature graphic: 1024x500 PNG
- [ ] App icon: 512x512 PNG
- [ ] Category: Health & Fitness
- [ ] Content rating: Complete IARC questionnaire
- [ ] Privacy Policy URL: Link to `/privacy` page

### Data Safety Form
Answer these in Play Console:
- Does your app collect or share user data? **Yes**
- Types collected:
  - **Email address** (account management)
  - **Name** (account management)
  - **App interactions** (analytics)
  - **Other user-generated content** (chat messages — for service improvement)
- Is data encrypted in transit? **Yes**
- Can users request data deletion? **Yes** (via email to support@silvery.com)
- Data shared with third parties: **AI processing** (not for advertising)

### App Review Notes
```
This app provides AI sleep coaching. It does NOT provide medical advice.
Login required — test credentials:
  Email: [test account email]  
  Password: [test account password]
No in-app purchases. All features are free.
```

---

## Pre-Submission Checklist (Both Platforms)

### In-App Requirements
- [x] Privacy Policy page (`/privacy`)
- [x] Terms of Service page (`/terms`)
- [x] Medical disclaimer (in `/support` and system prompt)
- [x] Support/contact page (`/support`)
- [x] Delete conversation functionality
- [x] Delete account process documented (email-based)
- [x] Login/registration flow
- [x] No placeholder or lorem ipsum content

### Technical
- [ ] Remove `server.url` from `capacitor.config.ts` for production build
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify login flow works in native WebView
- [ ] Verify chat streaming works
- [ ] Verify offline state shows friendly error
- [ ] Test keyboard behavior on chat input
- [ ] Check safe-area rendering (notch, home indicator)

### Assets to Prepare
- [ ] App icon in all required sizes (use 512x512 source → generate with appicon.co)
- [ ] Screenshots for all required device sizes
- [ ] Feature graphic for Play Store (1024x500)
- [ ] Splash screen (already configured in Capacitor)
