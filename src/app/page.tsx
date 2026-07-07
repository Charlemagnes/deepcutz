import { getCurrentUser } from "@/lib/auth/current-user"
import { MarketingLanding } from "@/components/marketing/landing-page"
import { HomeFeed } from "@/components/home/home-feed"

export default async function RootPage() {
  const user = await getCurrentUser()
  return user ? <HomeFeed /> : <MarketingLanding />
}
