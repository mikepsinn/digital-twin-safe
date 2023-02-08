import classNames from 'classnames/bind'
import { ReactElement } from 'react'

import styles from './index.module.scss'

const cx = classNames.bind(styles)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Pre = ({ children, ...props }): ReactElement => (
  <pre className={cx(styles.pre)} {...props}>
    {children}
  </pre>
)

export default Pre
