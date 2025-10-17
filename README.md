
# 🧠 AI-Powered Blog App

A full-stack blog application that automatically summarizes user-submitted content using OpenAI and stores both the original and summarized content in MongoDB. Built with modern technologies for an intelligent and efficient blogging experience...

## 🚀 Features

* 📝 User-submitted blog content
* 🤖 Automatic content summarization with OpenAI API
* 💾 MongoDB storage for both original and summarized versions
* 🧭 RESTful API with CRUD operations
* 🌐 Fully responsive frontend (React)
* 🔐 User authentication (optional: JWT / OAuth)
* 📈 Dashboard for viewing and managing posts

## 🛠️ Tech Stack

**Frontend:**

* React.js
* Axios
* Tailwind CSS / Bootstrap (isteğe bağlı)

**Backend:**

* Node.js
* Express.js
* OpenAI API
* MongoDB & Mongoose

**Other Tools:**

* dotenv for environment config
* nodemon for development
* Postman for testing APIs

## 🧠 AI Integration

We use the [OpenAI GPT model](https://platform.openai.com/docs/) to summarize user-submitted blog content. Once a user submits a blog post, the backend sends the content to the OpenAI API and receives a concise summary, which is then saved to MongoDB.

Example Prompt to OpenAI:

```
"Summarize the following blog content in 3-4 sentences:\n\n<user_input>"
```

## 🧪 How It Works

1. User submits a blog post via frontend.
2. Backend receives the content and sends it to OpenAI API.
3. OpenAI returns a summarized version.
4. Both original and summarized versions are saved to MongoDB.
5. Frontend displays both versions on the UI.

## 🧰 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-blog-app.git
cd ai-blog-app
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

Make sure to update API endpoints in your frontend (e.g. `/api/posts`) if needed.

## 📦 API Endpoints

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| POST   | `/api/posts`     | Create a new blog post |
| GET    | `/api/posts`     | Get all blog posts     |
| GET    | `/api/posts/:id` | Get a single blog post |
| PUT    | `/api/posts/:id` | Update a blog post     |
| DELETE | `/api/posts/:id` | Delete a blog post     |

## 📸 Screenshots

> *\[Ekle: Örnek ekran görüntüleri]*
>
> * Form submission
> * Blog list
> * Summarized view

## 📌 To-Do

* [ ] Rich text editor support
* [ ] Deployment (Vercel + Render/Heroku)


## ✅ Requirements

* Node.js
* MongoDB Atlas or local instance
* OpenAI API Key
* Basic understanding of React and Express

## 📤 Deployment

* Frontend → Vercel / Netlify
* Backend → Render / Railway / Heroku
* MongoDB → MongoDB Atlas

## 📄 License

This project is licensed under the MIT License.


