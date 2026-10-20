import { useId, useRef, useState } from 'react'
import styles from './SearchBar.module.css'

/* Combobox accesible genérico (patrón ARIA 1.2 combobox + listbox).
   - Recibe `suggestions`: array de { id, label, hint?, ...payload } por props.
   - `onQueryChange(query)` para que el padre actualice las sugerencias.
   - `onSelect(suggestion)` cuando el usuario elige una (click, Enter).
   - Navegación: ArrowUp/Down, Home/End, Escape, Enter. */
function SearchBar({
  placeholder = 'Search',
  ariaLabel,
  suggestions = [],
  onQueryChange,
  onSelect,
  renderSuggestion,
  minChars = 1,
  className = '',
}) {
  const inputId = useId()
  const listId = `${inputId}-list`
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)

  const open = query.length >= minChars && suggestions.length > 0 && isOpen

  const handleChange = (event) => {
    const value = event.target.value
    setQuery(value)
    setActiveIndex(-1)
    setIsOpen(true)
    onQueryChange?.(value)
  }

  const handleSelect = (suggestion) => {
    onSelect?.(suggestion)
    setQuery(suggestion.label)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (event) => {
    if (!open && event.key === 'ArrowDown' && suggestions.length) {
      setIsOpen(true)
      setActiveIndex(0)
      event.preventDefault()
      return
    }
    if (!open) return

    switch (event.key) {
      case 'ArrowDown':
        setActiveIndex(i => (i + 1) % suggestions.length)
        event.preventDefault()
        break
      case 'ArrowUp':
        setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1))
        event.preventDefault()
        break
      case 'Home':
        setActiveIndex(0)
        event.preventDefault()
        break
      case 'End':
        setActiveIndex(suggestions.length - 1)
        event.preventDefault()
        break
      case 'Enter':
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex])
          event.preventDefault()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
      default:
        break
    }
  }

  const activeId = open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        className={styles.input}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
      />

      {open && (
        <ul id={listId} role="listbox" className={styles.list}>
          {suggestions.map((suggestion, index) => {
            const isActive = index === activeIndex
            return (
              <li
                key={suggestion.id}
                id={`${listId}-opt-${index}`}
                role="option"
                aria-selected={isActive}
                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                /* mousedown en lugar de click: dispara antes del blur del input */
                onMouseDown={(e) => { e.preventDefault(); handleSelect(suggestion) }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {renderSuggestion
                  ? renderSuggestion(suggestion, { active: isActive })
                  : (
                    <>
                      <span className={styles.optionLabel}>{suggestion.label}</span>
                      {suggestion.hint && <span className={styles.optionHint}>{suggestion.hint}</span>}
                    </>
                  )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
