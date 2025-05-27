# Next.js Blog Platform
A modern, full-stack blog platform built with Next.js, TypeScript, and Prisma. It supports user authentication, post creation and editing, a nested comment system, and role-based permissions, all styled with Tailwind CSS and shadcn-ui. Deployed on Vercel with a PostgreSQL backend, this project is ideal for content creators and developers looking for a scalable CMS solution.

## Features

- User Authentication: Secure login via GitHub OAuth using NextAuth.js.
- User Management: Admin panel to view and manage users (ADMIN, EDITOR, USER roles).
- Post Management: Create, edit, publish, and delete posts with rich text editing via TipTap.
- Comment System: Add, edit, delete, and reply to comments with up to 3 levels of nesting.
- Role-Based Permissions: Granular access control (e.g., edit own posts/comments, admin delete all).
- Responsive UI: Sleek, accessible design with shadcn-ui components and Tailwind CSS.
- Media Uploads: Store post images using Vercel Blob.
- Database: PostgreSQL with Prisma ORM for efficient data management.

## Tech Stack

**Frontend:** Next.js (App Router), TypeScript, React

**Backend:** Next.js API Routes, Prisma, PostgreSQL

**Authentication:** NextAuth.js (GitHub provider)

**Styling:** Tailwind CSS, shadcn-ui

**Storage:** Vercel Blob

**Deployment:** Vercel

**Validation:** Zod

**Utilities:** bcrypt (password hashing)

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- GitHub OAuth app (for authentication)
- Vercel account (for deployment and Blob storage)

## Setup Instructions

1. Clone the Repository:
```
git clone https://github.com/n-timurka/news-manager
cd nextjs-blog-platform
```

2. Install Dependencies:
```
npm install
```

3. Set Up Environment Variables:

Create a .env file in the root directory and add:
```
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

4. Generate NEXTAUTH_SECRET with openssl rand -base64 32.

5. Obtain GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from GitHub OAuth settings and GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from google auth system.
Get BLOB_READ_WRITE_TOKEN from Vercel Blob dashboard.

6. Set Up Database:
```
npx prisma db push
```

7. Start Development Server:
```
npm run dev
```

8. Open http://localhost:3000 in your browser.


## Deployment

1. Push to GitHub:
`git push origin main`

2. Deploy to Vercel:

Import the repository in Vercel.
Set environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.) in the Vercel dashboard.
Deploy the app.

3. Verify:

Visit https://your-vercel-app.vercel.app.
Test authentication, post creation, and commenting.

## Usage

**Users:** Sign in with GitHub or Google, create posts, comment, and reply (up to 3 levels).

**Editors:** Create and edit own posts/comments.

**Admins:** Manage users, edit/delete any post/comment.

**Posts:** Draft or publish posts with rich text and images.

**Comments:** Edit/delete own comments, reply to others, with nested replies.

## Contributing
Contributions are welcome! Please:

- Fork the repository.
- Create a feature branch (`git checkout -b feature/your-feature`).
- Commit changes (`git commit -m 'Add your feature'`).
- Push to the branch (git push origin feature/your-feature).
- Open a pull request.

## License
MIT License - feel free to use and modify this project.

## Contact
For issues or questions, open a GitHub issue or reach out to [timurka.nick@gmail.com].
