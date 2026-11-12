import Navbar from '@/sections/Navbar'
import Hero from '@/sections/Hero'
import Advisor from '@/sections/Advisor'
import LeadForm from '@/sections/LeadForm'
import Products from '@/sections/Products'
import HowToBuy from '@/sections/HowToBuy'
import FuXionRewards from '@/sections/FuXionRewards'
import BlogTeaser from '@/sections/BlogTeaser'
import FinalCTA from '@/sections/FinalCTA'
import FAQ from '@/sections/FAQ'
import Footer from '@/sections/Footer'
import WhatsAppFloat from '@/sections/WhatsAppFloat'
import ChatWidget from '@/sections/ChatWidget'
import BarraMovil from '@/sections/BarraMovil'
import { useRevela } from '@/hooks/useRevela'

// 11/11/2026: portada general (todo el catálogo); fuera el video, los 3 momentos y los ingredientes Sport.
// Combos Sport de la campaña de Meta (buscador «¿Qué entrenas?» y planes) quitados el 11/11/2026.
// Orden según el estudio de webs top de nutrición deportiva (ver DESIGN.md §6):
// resultado → 3 momentos → ingredientes → catálogo → quién asesora → cómo comprar
// → regalos → FAQ → guía gratis + formulario → blog → cierre (Trust y Gift quedaron dentro de Advisor y LeadForm)
export default function Home() {
  useRevela()
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      <Hero />
      <Products />
      <Advisor />
      <HowToBuy />
      <FuXionRewards />
      <FAQ />
      <LeadForm />
      <BlogTeaser />
      <FinalCTA />
      <Footer />
      <WhatsAppFloat />
      <ChatWidget clasePosicion="bottom-24 right-4 md:bottom-5 md:left-5 md:right-auto" />
      <BarraMovil />
    </div>
  )
}
