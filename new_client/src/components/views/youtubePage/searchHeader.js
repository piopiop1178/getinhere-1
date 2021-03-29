import styles from './searchHeader.module.css'
import React, { memo, useRef } from 'react';

const SerchHeader = memo(({ onSearch }) => {
    const inputRef = useRef();
    const handleSearch = () => {
      const value = inputRef.current.value;
      onSearch(value);
    };
    const onClick = () => {
      handleSearch();
    };
  
    const onKeyPress = event => {
      if (event.key === 'Enter') {
        console.log(window.getSelection());
        handleSearch();
      }
    };
    return (
      <header className={styles.header}>
        <div className={styles.logo}>
          <img className={styles.img} src="/images/logo.png" alt="logo" />
          <h1 className={styles.title}>Youtube</h1>
        </div>
        <input
          ref={inputRef}
          className={styles.input}
          type="search"
          placeholder="Search"
          onKeyPress={onKeyPress}
          id="search"
        />
        <button className={styles.button} type="submit" onClick={onClick}>
          <img
            className={styles.buttonImg}
            src="/images/search.png"
            alt="search"
          />
        </button>
      </header>
    );
  });

export default SerchHeader;