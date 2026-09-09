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
import BlogTeaser from '@/sections/BlogTeaser'
import FinalCTA from '@/sections/FinalCTA'
import Footer from '@/sections/Footer'
import WhatsAppFloat from '@/sections/WhatsAppFloat'
import ChatWidget from '@/sections/ChatWidget'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Products />
      <Benefits />
      <SistemaFuXion />
      <Trust />
      <Advisor />
      <LeadForm />
      <HowToBuy />
      <FuXionRewards />
      <BlogTeaser />
      <FinalCTA />
      <Gift />
      <Footer />
      <WhatsAppFloat />
      <ChatWidget />
    </div>
  )
}
