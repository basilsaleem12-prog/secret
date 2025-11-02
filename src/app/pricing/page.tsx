import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { PricingClient } from './PricingClient'

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PricingClient user={user} />
    </div>
  )
}





