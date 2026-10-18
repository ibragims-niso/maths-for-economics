# 10 — In-app guide: use your own AI key

Shown in Settings → AI → Use your own key. Keep the wording; update steps if Groq changes its console.

---

**Get a free Groq API key (about 2 minutes)**

The app gives everyone a small number of free AI questions per day. If you want more, you can use your own free key from Groq.

1. Open console.groq.com and sign up with your email or Google account. No card is needed for the free tier.
2. In the sidebar, open **API Keys** and tap **Create API Key**. Give it any name, for example "Maths for Economics".
3. Copy the key. It starts with `gsk_`. Groq shows it only once, so paste it somewhere safe.
4. Paste it below and tap **Verify**.

Your key stays on this device. It is never sent to our servers.

Good to know:
- Free keys have per-minute and per-day limits set by Groq. That is usually enough for one student.
- Never share your key or post it online. If you think it leaked, delete it in the Groq console and create a new one.
- To stop using it, tap **Remove key**. The app goes back to the shared daily questions.

---

Implementation notes: Verify calls the provider's list-models endpoint. Show plain messages: "Key works", "This key isn't valid. Check you copied all of it", "Groq is not reachable. Check your internet connection".
