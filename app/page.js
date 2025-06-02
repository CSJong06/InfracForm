import LoginForm from './components/LoginForm';
import Banner from './components/Banner';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-slate-100 to-blue-50">
      <Banner />
      <div className="flex-1 flex items-center justify-center p-4 mt-32 mb-24">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
