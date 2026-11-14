import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import connectDB from "@/lib/db";
import User from "@/models/user.model";


export const instant = false

export default async function Home() {
  const session = await auth()

  await connectDB()
  const user = await User.findOne({ email: session?.user.email })

  return (
    <div className="w-full min-h-screen bg-white">
    <GeoUpdater userId={user?._id ? user._id.toString() : ""} />
      {user?.role == "partner"
        ?
        <>
          <Nav />
          <PartnerDashboard />
        </>
        :
        (user?.role == "admin" ? <AdminDashboard />
          :
          <>
            <Nav />
            <PublicHome />
          </>
        )
      }
      <Footer />

    </div>
  );
}
