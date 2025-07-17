
# 🌐 CodeCraft Platform API

Welcome to the **CodeCraft Platform API** — a modern, secure, and intelligent backend solution for coding challenge platforms. Designed with developers in mind, it enables real-time code execution, user and challenge management, and seamless AI integration.

---

## ✨ Key Features

- 🔐 **JWT & Google OAuth Authentication**
- 🧩 **Full CRUD for Coding Problems & Challenges**
- ⚙️ **Real-Time Code Evaluation** with Judge0
- 🧑‍💼 **User Profiles, Stats & Leaderboard Ready**
- 🤖 **AI Chat Assistant** via Google Gemini
- 📘 **Interactive API Docs** (Swagger UI)
- 🛡️ **Built-In Security** with Helmet, CORS, and Validation
- 💓 **Health Monitoring** Endpoints

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Neon serverless)
- **Auth**: JWT, bcryptjs, Google OAuth
- **Code Execution**: Judge0 API
- **AI Assistant**: Google Generative AI
- **Docs**: Swagger UI
- **Security**: Helmet, CORS, Morgan

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd codecraft-platform-api
npm install
```

### 2. Environment Configuration

Create a `.env` file and configure the following:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=your_neon_db_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
JUDGE0_HOST=judge0-ce.p.rapidapi.com
JUDGE0_KEY=your_judge0_api_key
```

### 3. Launch the Server

```bash
npm run dev
```

### 4. Explore the API

- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) 📑  
- Health Check: [http://localhost:3000/health](http://localhost:3000/health) 🩺

---

## 📡 Core API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | `POST` | User registration |
| `/api/auth/login` | `POST` | User login with JWT |
| `/auth/google` | `POST` | Google OAuth login |
| `/api/problems` | `GET/POST/PUT/DELETE` | Problem management |
| `/api/submissions` | `POST` | Code execution |
| `/api/profile` | `GET/PUT` | Profile viewing/editing |
| `/api/chat` | `POST` | AI-based assistance |
| `/api-docs` | `GET` | Swagger documentation |
| `/health` | `GET` | API health status |

---

## 🔐 Security Practices

- Enforced **JWT-based route protection**
- **Password hashing** with bcryptjs
- **HTTP headers** hardened via Helmet
- **CORS policies** for cross-origin safety
- Full **input validation** on every endpoint

---

## 📁 Project Structure

```bash
codecraft-platform-api/
├── config/        # Swagger, app settings
├── middleware/    # Auth, error handling
├── routes/        # API endpoints
├── services/      # AI, OAuth, Judge0 handlers
├── utils/         # Helper functions
├── db.js          # DB connection
├── server.js      # App entry point
└── package.json   # Dependencies & scripts
```

---

## 🤝 Contributing

We ❤️ contributors!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Submit a pull request with details

---

## 🙋 Support

Need help?  
- Open an issue on GitHub  
- Use `/api/chat` for in-app questions  
- Check `/api-docs` for complete references

---

## ⚖️ License

This project is not licensed.  
Feel free to explore, modify, and build upon it!

---

<div align="center">
  Made with 💻, ☕, and 🔥 by the CodeCraft Team.
</div>
