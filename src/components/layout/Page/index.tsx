import classNames from 'classnames/bind'

import styles from './index.module.scss'

const cx = classNames.bind(styles)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Page = ({ align, children, overflow }: any) => (
  <main className={cx(styles.page, align, { overflow })}>{children}</main>
)

export default Page
