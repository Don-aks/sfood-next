import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
