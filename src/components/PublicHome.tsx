"use client"

import React, { useState } from 'react'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import Footer from './Footer'

function PublicHome() {
  return (
    <>
      <HeroSection />
      <VehicleSlider />
      <Footer />
    </>
  )
}

export default PublicHome
