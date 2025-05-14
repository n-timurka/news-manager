export default function Footer() {
  return (
    <footer className="border-t py-6 bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} NewsHub. All rights reserved.
        </p>
        <div className="flex gap-4">
          Created By <a href="#" className="underline">Mykola Timurka</a>
        </div>
      </div>
    </footer>
  );
}