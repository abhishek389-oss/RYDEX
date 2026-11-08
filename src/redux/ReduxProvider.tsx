"use client"

import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import UserSync from "./UserSync"

function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <UserSync />
      {children}
    </Provider>
  )
}

export default ReduxProvider
