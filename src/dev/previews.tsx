// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { ReactElement } from 'react'
import { Previews } from '@react-buddy/ide-toolbox'
import { PaletteTree } from './palette'

const ComponentPreviews = (): ReactElement => {
  return <Previews palette={<PaletteTree />} />
}

export default ComponentPreviews
