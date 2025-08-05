![Home Page](.github/readme-images/home.png)

# <img src="https://media.tenor.com/7hiQYhUQY2QAAAAM/dis.gif" alt="ComicHive Logo" width="30"/> Finime

> **Finime** — Tempat asik buat streaming Anime & Manga gratis, dengan UI yang modern, tanpa iklan, tanpa ribet, dan pastinya open-source. Cocok buat kamu yang suka ngulik atau sekedar nonton santai! 🚀

---

# Screenshot
#### Home
![Home Page](.github/readme-images/home.png)
#### Anime
![Anime Page](.github/readme-images/anime.png)
#### Manga
![Manga Page](.github/readme-images/manga.png)
#### Profile
![Profile Page](.github/readme-images/profile.png)
#### Search
![Profile Page](.github/readme-images/search-mobile.png)
![Profile Page](.github/readme-images/search.png)
#### Istri gweh
![Profile Page](.github/readme-images/istri.png)

> [!NOTE]
> Website masih dalam tahap development, jadi ada kemungkin error selama kamu menggunakan website ini ( Error itu fitur 😅 ).

---

## 📋 Daftar Isi

1. [Tentang Finime](#tentang-finime)  
2. [Fitur Utama](#fitur-utama)  
3. [Stack & Library](#stack--library)  
4. [Struktur Proyek](#struktur-proyek)  
5. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Setup & Instalasi](#setup--instalasi)  
   - [Menjalankan Server](#menjalankan-server)  
6. [Environment Variables](#environment-variables)  
7. [Arsitektur & Alur Kerja](#arsitektur--alur-kerja)  
8. [Guidelines Kontribusi](#guidelines-kontribusi)  
9. [License](#license)  

---

## 🔍 Tentang Finime

Finime itu proyek open-source tempat streaming Anime & Manga, gratis, dan bebas gangguan. Dibangun full-stack: frontend pakai Svelte, backend pakai ElysiaJS + TypeScript. Kamu bisa ikut nimbrung, nambah fitur, benerin bug, atau sekedar ngasih ide. Pokoknya, makin rame makin seru!

---

## 🚀 Fitur Utama

- **User Authentication** (Login & Register)  
- **Dashboard Admin** (Buat ngatur konten & user)  
- **Search** Anime & Manga  
- **No Ads** (Beneran, nggak ada iklan!)  
- **Database**: MongoDB  
- **Open Source** & Super Gampang Dikembangin  

---

## 🛠 Stack & Library

### Frontend  
- **[Svelte](https://svelte.dev/)**  
- **@lucide/svelte** (Icon kece)  
- **js-cookie** (Buat ngatur cookies auth)  
- **Tailwind CSS** (Styling biar cakep)  
- **Axios** (HTTP client andalan)  

### Backend  
- **[Elysia JS](https://elysiajs.dev/)** (Web framework ringan)  
- **Prisma** (ORM yang aman & nyaman)  
- **bcrypt** (Biar password aman)  
- **NodeMailer** (Buat kirim email & notifikasi)  
- **Zod** (Validasi schema, anti typo!)  
- **@zanixongroup/uploader** (Media Uploader)  

### Database  
- **MongoDB**  

---

## 📂 Struktur Proyek

``` 
Finime
├ backend                
├─ prisma/
├─ src/
│  ├─ @types/
│  ├─ controllers/
│  ├─ databases/
│  ├─ lib/
│  ├─ middleware/
│  ├─ routes/
│  ├─ scrapers/
│  ├─ services/
│  ├─ validations/
│  ├─ env.ts/                  
│  └─ index.ts/                
├─ bun.lock                   
├─ package.json               
├─ README.md                  
├─ tsconfig.json              
├─ vercel.json
├
├ frontend                               
├─ src                                 
│  ├─ components/                     
│  │  ├─ elements/        
│  │  ├─ fragments/         
│  │  ├─ layouts/           
│  ├─ data/             
│  ├─ hooks/            
│  ├─ lib/
│  ├─ routes/      
│  │  ├─ 500/     
│  │  ├─ about/  
│  │  ├─ anime/
│  │  │  ├─ watch/ 
│  │  │  │  └─ [episode_id]/
│  │  │  ├─ [anime_slug]/      
│  │  ├─ auth/            
│  │  │  ├─ login/
│  │  │  ├─ logout/  
│  │  │  └─ register/
│  │  ├─ chapter/            
│  │  │  └─ [chapter_slug]/          
│  │  ├─ community/     
│  │  ├─ dashboard/      
│  │  ├─ genres/             
│  │  │  └─ [genres_slug]/       
│  │  ├─ manga/              
│  │  │  ├─ [manga_slug]/          
│  │  │  └─ +page.svelte               
│  │  ├─ map.xml/      
│  │  ├─ profile/      
│  │  ├─ robots.txt/            
│  │  ├─ sitemap.xml/           
│  │  ├─ u/                
│  │  │  └─ [username]/      
│  ├─ stores/           
│  ├─ types/             
│  ├─ utils/           
│  ├─ app.css                          
│  ├─ app.d.ts                         
│  ├─ app.html                         
│  └─ env.ts                           
├─ static/             
├─ bun.lock                            
├─ docker-compose.yml                  
├─ Dockerfile                          
├─ package-lock.json                   
├─ package.json                        
├─ README.md                           
├─ svelte.config.js                    
├─ tsconfig.json                       
├─ vite.config.ts                      
│
├── tmp/
└── README.md
```

<br>

---

## ⚙️ Getting Started

### Prasyarat

- Node.js v18+ & npm/yarn/bun
- MongoDB (boleh lokal, boleh Atlas)
- CLI Prisma (`bun install -g prisma`)

### Cara Setup & Instalasi

1. **Clone repo dulu**
   ```bash
   git clone https://github.com/SyntxFlow/finime.git
   cd finime
   ```

2. **Setup Backend**

   ```bash
   cd backend
   bun install
   cp .env.example .env
   # Edit .env sesuai selera & kebutuhanmu
   bunx prisma generate
   bunx prisma migrate dev
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Jangan lupa atur PUBLIC_API ke url backend kamu
   ```

### Menjalankan Server

* **Backend**

  ```bash
  cd backend
  bun run dev
  ```

* **Frontend**

  ```bash
  cd frontend
  bun run dev
  ```

---

## 🔑 Environment Variables

Bikin file `.env` di masing-masing folder, isinya kayak gini:

### Backend `.env`

```env
DATABASE_URL=mongodb://localhost:27017/finime
```

### Frontend `.env`

```env
PUBLIC_API=http://localhost:3000
```

---

## 🏗 Arsitektur & Alur Kerja

1. **Client (Svelte)** komunikasi ke backend (**ElysiaJS**) lewat **Axios**
2. Semua request dicek & divalidasi sama **Zod**, baru lanjut ke **Prisma** buat urusan database
3. Autentikasi & session pakai cookies (dengan `js-cookie`)
<!-- 4. Bagian Admin di frontend ada guard & role check
5. Notifikasi email buat daftar & reset password via **NodeMailer** -->

---

## 🤝 Guidelines Kontribusi

1. **Fork** repo ini dulu, ya.
2. **Bikin branch** baru buat fitur/bugfix:

   ```bash
   git checkout -b feature/nama-fitur
   ```
3. **Commit** dengan pesan yang jelas & singkat.
4. **Push** ke fork kamu, lalu bikin **Pull Request** ke `main`.
5. Tenang, nanti bakal direview & di-merge kalau udah oke!

---

## 📄 License

Proyek ini pakai MIT License. Cek [LICENSE](./LICENSE) buat detailnya.

---

## Contributor 

<a href="https://github.com/SyntxFlow/Finime/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SyntxFlow/Finime" />
</a>

---

**Selamat ngoding** 🚀
Punya ide fitur baru atau nemu bug? Langsung aja buka issue atau submit PR, jangan malu-malu!

![app icon](./.github/readme-images/logo.gif)
