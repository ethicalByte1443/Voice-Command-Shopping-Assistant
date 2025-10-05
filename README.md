# 🛒 Voice Command Shopping Assistant

A next-gen **AI-powered shopping assistant** built with **FastAPI**, **Groq LLMs**, and **AssemblyAI speech recognition**.
Users can add or remove products from their wishlist **just by speaking**, and the system recommends new items based on **semantic embeddings** (Sentence Transformers + FAISS).

---

## 🚀 Features

* **🎤 Voice to Wishlist**

  * Speak commands like *"Add 2 liters of milk"* or *"Remove apples"*
  * Converts speech → text (AssemblyAI) → structured JSON (Groq AI).

* **🧠 AI-Driven Command Parsing**

  * LLM extracts product, quantity, category, action.
  * Schema validation ensures clean + safe DB updates.

* **📦 Smart Wishlist Management**

  * Wishlist + History stored in MongoDB (`user_collection`).
  * Supports **add, remove, delete** actions.

* **🤖 ML-Based Recommendations**

  * Uses **SentenceTransformers (`all-MiniLM-L6-v2`)** for embeddings.
  * FAISS vector search finds **related products** from `store_collection`.

* **⚡ Tech Stack**

  * **Backend:** FastAPI + Uvicorn
  * **Database:** MongoDB
  * **Speech Recognition:** AssemblyAI
  * **LLM Processing:** Groq API (`llama-3.3-70b-versatile`)
  * **Recommendation Engine:** Sentence Transformers + FAISS

---

## 📂 Project Structure

```
voice-shopping-assistant/
│── frontend_1/              # basic html js app
|
│── vox-cart-dash/           # npm run dev
│
│── .env                     # API keys (Groq, AssemblyAI, MongoDB URI)
│── app.py                   # uvicorn app:app --reloaad
│── db.py                   
│── helper_function.py       # functions used by main:app
│── prompt.py                # prompt
│── seed_store.py            # Dummy Data for DB
│── requirements.txt         # pip install -r requirement.txt
│── testing.html             # html page for just testing API
│── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/your-username/voice-shopping-assistant.git
cd voice-shopping-assistant/backend
```

### 2️⃣ Setup Environment

Create `.env` file:

```ini
GROQ_API_KEY=your_groq_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
MONGO_URI=mongodb://localhost:27017
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run Backend

```bash
uvicorn main:app --reload
```

Backend will start at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🎤 Example Flow

1. User says:

   > "Add 2 apples to my wishlist"

2. **AssemblyAI** → converts voice → `"Add 2 apples"`

3. **Groq AI** → parses →

   ```json
   {
     "product": "apple",
     "quantity": 2,
     "category": "fruit",
     "action": "add",
     "status": "ai_generated"
   }
   ```

4. **FastAPI** → stores in MongoDB (`wishlist`, `historylist`).

5. **FAISS** → recommends: bananas, oranges, grapes.

---

## 🧠 Recommendation Engine

* Every product in `store_collection` is embedded using `SentenceTransformer(all-MiniLM-L6-v2)`.
* User’s wishlist embeddings are compared using **FAISS vector search**.
* Top-K similar products are recommended, filtered by store availability.

---

## 🛠️ Future Enhancements

* ✅ Multi-user support with login/auth.
* ✅ Frontend React Dashboard (Wishlist / Store / History).
* 🔮 Personalized recommendations using **collaborative filtering**.
* 🔮 Real-time streaming speech recognition (AssemblyAI live).

---

## 🤝 Contributing

PRs welcome! If you’d like to extend with UI/UX, additional ML models, or cloud deployment (Docker + Vercel + Mongo Atlas), feel free to fork.

---

## 📜 License

MIT © 2025 – Built for smart shopping

