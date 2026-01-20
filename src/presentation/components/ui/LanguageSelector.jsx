import PropTypes from 'prop-types'

/**
 * Language Selector Component
 * Presentational component for language selection
 */
const LanguageSelector = ({ language, onLanguageChange, languages }) => {
  return (
    <div className="language-selector">
      <span className="material-icons">language</span>
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-select"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}

LanguageSelector.propTypes = {
  language: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default LanguageSelector
