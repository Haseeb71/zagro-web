'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './Dropdown.module.scss';

const Dropdown = ({ 
  options = [], 
  defaultOption = "Default option", 
  onSelect = () => {},
  className = ""
}) => {
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle positioning when dropdown opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200; // max-height from CSS
      
      // If dropdown would go off screen, position it above
      if (rect.bottom + dropdownHeight > viewportHeight) {
        dropdownRef.current.classList.add(styles.dropdownUp);
      } else {
        dropdownRef.current.classList.remove(styles.dropdownUp);
      }
    }
  }, [isOpen]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className={`${styles.dropdown} ${className}`} ref={dropdownRef}>
      <input 
        type="checkbox" 
        className={styles.dropdown__switch} 
        checked={isOpen}
        onChange={() => setIsOpen(!isOpen)}
        hidden 
      />
      <label className={styles.dropdown__optionsFilter}>
        <ul 
          className={styles.dropdown__filter} 
          role="listbox" 
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <li className={styles.dropdown__filterSelected} aria-selected="true">
            {selectedOption}
          </li>
          <li>
            <ul className={`${styles.dropdown__select} ${isOpen ? styles.open : ''}`}>
              {options.map((option, index) => (
                <li 
                  key={index}
                  className={styles.dropdown__selectOption} 
                  role="option"
                  onClick={() => handleOptionClick(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOptionClick(option);
                    }
                  }}
                  tabIndex={0}
                >
                  {option}
                </li>
              ))}
            </ul>
          </li>
        </ul>			
      </label>
    </div>
  );
};

export default Dropdown;