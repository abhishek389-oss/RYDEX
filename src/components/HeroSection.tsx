"use client"

import { motion } from "motion/react"
import { Bike, Bus, Car, Truck } from 'lucide-react'
import AuthModel from './AuthModel'
import { useAppSelector } from '@/redux/hooks'
import { useRouter } from 'next/navigation'

function HeroSection() {


  const userdata = useAppSelector((state) => state.user.userData)
  const router = useRouter()

 

  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
      <div className='absolute inset-0 bg-cover bg-center'
        style={{ backgroundImage: "url('/heroImage.jpg')" }} />
      <div className='absolute inset-0 bg-black/80' />
      <div className='relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center'>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className='text-white font-extrabold text-4xl sm:text-5xl md:text-7xl'
        >
          Book Any Vehicle
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mt-4 max-w-xl text-gray-300'
        >
          From daily rides to heavy transport - all in one platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='mt-8 flex gap-8 text-gray-300'
        >
          <Bike size={30} />
          <Car size={30} />
          <Bus size={30} />
          <Truck size={30} />
        </motion.div>

        {userdata ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='mt-12 px-10 py-4 bg-white text-black rounded-full font-semibold shadow-xl cursor-pointer'
            onClick={() => router.push('/user/book')}
          >
            Book Now
          </motion.div>
        ) : (
          <AuthModel>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='mt-12 px-10 py-4 bg-white text-black rounded-full font-semibold shadow-xl cursor-pointer'
              onClick={() => { }}
            >
              Book Now
            </motion.div>
          </AuthModel>
        )}
      </div>
    </div>
  )
}

export default HeroSection
