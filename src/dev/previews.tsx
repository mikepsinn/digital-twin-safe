// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import { Previews } from '@react-buddy/ide-toolbox'
import { PaletteTree } from './palette'

const ComponentPreviews = () => {
  return <Previews palette={<PaletteTree />} />
}

export default ComponentPreviews
