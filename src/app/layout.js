//layouts.js
'use client';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; 
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "./auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <Navbar />
          <main>{children}</main>
          <Footer /> {}
        </AuthContextProvider>
      </body>
    </html>
  );
}
