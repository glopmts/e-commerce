"use client";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background/50 px-4 py-6 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} MyCompany. All rights reserved.
    </footer>
  );
};

export default Footer;
