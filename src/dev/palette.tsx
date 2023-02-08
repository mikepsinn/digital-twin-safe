// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { ReactElement } from 'react'
import { Category, Component, Variant, Palette } from '@react-buddy/ide-toolbox'

export const PaletteTree = (): ReactElement => (
  <Palette>
    <Category name="HTML">
      <Component name="a">
        <Variant requiredParams={['href']}>
          <a>Link</a>
        </Variant>
      </Component>
      <Component name="button">
        <Variant>
          <button>Button</button>
        </Variant>
      </Component>
    </Category>
  </Palette>
)
