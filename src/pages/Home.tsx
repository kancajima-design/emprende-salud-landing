import Navbar from '@/sections/Navbar'
import Hero from '@/sections/Hero'
import Benefits from '@/sections/Benefits'
import SistemaFuXion from '@/sections/SistemaFuXion'
import Gift from '@/sections/Gift'
import Trust from '@/sections/Trust'
import Advisor from '@/sections/Advisor'
import LeadForm from '@/sections/LeadForm'
import Products from '@/sections/Products'
import HowToBuy from '@/sections/HowToBuy'
import FuXionRewards from '@/sections/FuXionRewards'
import News from '@/sections/News'
import FinalCTA from '@/sections/FinalCTA'
import Footer from '@/sections/Footer'
import WhatsAppFloat from '@/sections/WhatsAppFloat'
import ExitIntent from '@/sections/ExitIntent'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Benefits />
      <SistemaFuXion />
      <Gift />
      <Trust />
      <Advisor />
      <LeadForm />
      <Products />
      <HowToBuy />
      <FuXionRewards />
      <News />
      <News />
      <FinalCTA />
      <Footer />
      <WhatsAppFloat />
      <ExitIntent />
    </div>
  )
}
