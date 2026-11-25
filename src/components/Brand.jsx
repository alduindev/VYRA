import { Icon } from './Icon'

function Brand({ light = false }) { return <div className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark"><Icon name="logo" size={21} strokeWidth={2.2} /></span><strong>VYRA</strong></div> }

export { Brand }
