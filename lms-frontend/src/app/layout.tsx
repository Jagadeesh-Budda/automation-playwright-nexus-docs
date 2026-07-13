import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AppInitializer from "../components/AppInitializer";
import PageWrapper from "../components/PageWrapper";
import MainWrapper from "../components/MainWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Automation Nexus Academy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppInitializer>
          <Sidebar />
          <MainWrapper>
            <Header />
            <PageWrapper>
              {children}
            </PageWrapper>
          </MainWrapper>
        </AppInitializer>
      </body>
    </html>
  );
}
