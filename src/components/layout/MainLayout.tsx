import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
