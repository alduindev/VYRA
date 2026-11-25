import { Icon } from './Icon'

function PasswordRule({ valid, text }) {
  return <span className={valid ? 'password-rule valid' : 'password-rule'}><span className="rule-icon">{valid ? <Icon name="check" size={11} strokeWidth={2.6} /> : <span />}</span>{text}</span>
}

export { PasswordRule }
