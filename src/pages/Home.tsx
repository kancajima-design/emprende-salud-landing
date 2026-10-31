import Navbar from '@/sections/Navbar'
import Hero from '@/sections/Hero'
import Momentos from '@/sections/Momentos'
import Encuentra from '@/sections/Encuentra'
import Gift from '@/sections/Gift'
import Trust from '@/sections/Trust'
import Advisor from '@/sections/Advisor'
import LeadForm from '@/sections/LeadForm'
import Products from '@/sections/Products'
import Planes from '@/sections/Planes'
import HowToBuy from '@/sections/HowToBuy'
import FuXionRewards from '@/sections/FuXionRewards'
import BlogTeaser from '@/sections/BlogTeaser'
import FinalCTA from '@/sections/FinalCTA'
import FAQ from '@/sections/FAQ'
import Footer from '@/sections/Footer'
import WhatsAppFloat from '@/sections/WhatsAppFloat'
import ChatWidget from '@/sections/ChatWidget'
import BarraMovil from '@/sections/BarraMovil'

// Orden según el estudio de webs top de nutrición deportiva (ver DESIGN.md §6):
// resultado → 3 momentos → buscador → planes → catálogo → quién asesora → cómo comprar → FAQ → cierre
export default function Home() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      <Hero />
      <Momentos />
      <Encuentra />
      <Planes />
      <Products />
      <Advisor />
      <Trust />
      <HowToBuy />
      <FuXionRewards />
      <FAQ />
      <Gift />
      <LeadForm />
      <FinalCTA />
      <BlogTeaser />
      <Footer />
      <WhatsAppFloat />
      <ChatWidget clasePosicion="bottom-24 left-4 md:bottom-5 md:left-5" />
      <BarraMovil />
    </div>
  )
}
